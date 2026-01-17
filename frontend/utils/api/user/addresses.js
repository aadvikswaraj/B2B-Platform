const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function getAddresses() {
  const res = await fetch(`${API_BASE}/user/address`, { credentials: 'include' });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to load addresses');
  return json.data.addresses || [];
}

export async function addAddress(payload) {
  const res = await fetch(`${API_BASE}/user/address`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to add address');
  return json.data.address;
}

export async function setDefaultAddress(id) {
  const res = await fetch(`${API_BASE}/user/address/${id}/default`, {
    method: 'POST',
    credentials: 'include',
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to set default');
  return json.data.address;
}
