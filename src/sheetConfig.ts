export const SHEET_URL_STORAGE_KEY = 'passport_guard_sheet_url';

export const DEFAULT_SHEET_WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbwoGnJNVk_EJ8e2fXEwf8DuuYCeHVwLhCddILijyEf-O5GOlFjzNKsZXyoat3ULXQE_/exec';

export function getSheetWebAppUrl() {
  if (typeof window === 'undefined') {
    return DEFAULT_SHEET_WEB_APP_URL;
  }

  const savedUrl = localStorage.getItem(SHEET_URL_STORAGE_KEY)?.trim();
  return savedUrl || DEFAULT_SHEET_WEB_APP_URL;
}

export function persistSheetWebAppUrl(url?: string) {
  const finalUrl = (url || '').trim() || DEFAULT_SHEET_WEB_APP_URL;

  if (typeof window !== 'undefined') {
    localStorage.setItem(SHEET_URL_STORAGE_KEY, finalUrl);
  }

  return finalUrl;
}
