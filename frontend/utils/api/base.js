// Category API utilities
// Uses NEXT_PUBLIC_API_BASE as base (fallback http://localhost:5000)
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';


export async function api(path, { method='GET', body, headers } = {}) {
  let serverResponse = await fetch(API_BASE + path, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(headers||{})
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store'
  });
  try { serverResponse = await serverResponse.json(); } catch(e){ /* ignore */ }
  return serverResponse;
};

export const generateQuery = (params={}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key,value])=> value && query.append(key,String(value)));
  return query.toString();
};