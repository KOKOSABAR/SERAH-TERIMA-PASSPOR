/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Parsers for POST requests
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API 1: Healthcheck
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // API 2: Google Sheets Proxy to bypass browser CORS restrictions
  app.post('/api/proxy-sheet', async (req, res) => {
    const { url, payload } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        success: false, 
        message: 'Google Web App URL is required' 
      });
    }

    try {
      console.log(`[Proxy] Forwarding request to: ${url}`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Google Apps Script responded with HTTP status ${response.status}`);
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { success: true, raw: text };
      }

      res.json(data);
    } catch (error: any) {
      console.error('[Proxy Error]', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Gagal terhubung ke Google Apps Script dari server backend.' 
      });
    }
  });

  // Vite middleware configuration for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Dev] Vite middleware loaded.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[Prod] Serving static files from dist.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
