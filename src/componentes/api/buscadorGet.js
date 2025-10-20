import { urlApi } from './url.js'

async function request(pathOrUrl) {
  // acepta '/api/...' (relativo) o URL absoluta
  const url = /^https?:\/\//i.test(pathOrUrl)
    ? pathOrUrl
    : `${urlApi.replace(/\/$/, '')}/${String(pathOrUrl).replace(/^\/+/, '')}`;

  const res = await fetch(url, { credentials: 'same-origin' }); 
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getBuscadorConfig() {
  try {
    const json = await request('/api/notas/buscar'); // ahora se resuelve con urlApi
    return Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
  } catch (err) {
    console.error('getBuscadorConfig error', err);
    return [];
  }
}

export async function buscar(keywords, limit = 6) {
  try {
    const q = Array.isArray(keywords) ? keywords.join(',') : String(keywords || '');
    const url = `/api/notas/buscar?keywords=${encodeURIComponent(q)}&limit=${encodeURIComponent(limit)}`;
    const json = await request(url);
    return Array.isArray(json) ? json : (json.data || []);
  } catch (err) {
    console.error('buscar error', err);
    return [];
  }
}

export async function buscarGroup(keywordsArray = [], limit = 6) {
  try {
    const q = Array.isArray(keywordsArray) ? keywordsArray.join(',') : String(keywordsArray || '');
    const url = `/api/notas/buscar?keywords=${encodeURIComponent(q)}&group=true&limit=${encodeURIComponent(limit)}`;
    const json = await request(url);
    return json || {};
  } catch (err) {
    console.error('buscarGroup error', err);
    return {};
  }
}
