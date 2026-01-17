// Category API utilities
// Uses NEXT_PUBLIC_API_URL as base (fallback http://localhost:3001)
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';


export async function api(path, { method='GET', body, headers={}, json=true } = {}) {
  json && (headers['Content-Type'] = 'application/json');
  let serverResponse = await fetch(API_BASE + path, {
    method,
    credentials: 'include',
    headers: headers,
    body: body ? (json ? JSON.stringify(body) : body) : undefined,
    cache: 'no-store'
  });
  try { serverResponse = await serverResponse.json(); } catch(e){ /* do nothing */ }
  return serverResponse;
};

export const generateQuery = (params={}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key,value])=> value && query.append(key,String(value)));
  return query.toString();
};

export const generateFormData = (data={}) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
};