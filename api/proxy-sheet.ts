export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  const { url, payload } = req.body || {};

  if (!url || typeof url !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Google Web App URL is required',
    });
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(payload ?? {}),
    });

    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: text || `Google Apps Script responded with HTTP status ${response.status}`,
      });
    }

    try {
      return res.status(200).json(JSON.parse(text));
    } catch {
      return res.status(200).json({
        success: true,
        raw: text,
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error?.message || 'Gagal terhubung ke Google Apps Script dari server backend.',
    });
  }
}
