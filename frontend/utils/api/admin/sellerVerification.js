const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function listSellerVerifications(params = {}) {
  const q = new URLSearchParams(params);
  const res = await fetch(`${API_BASE}/admin/seller-verification/list?${q.toString()}`, { credentials: 'include' });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to load');
  return json.data;
}

export async function getSellerVerification(userId) {
  const res = await fetch(`${API_BASE}/admin/seller-verification/${userId}`, { credentials: 'include' });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to load');
  return json.data;
}

export async function updateSellerStatuses(userId, payload) {
  const res = await fetch(`${API_BASE}/admin/seller-verification/${userId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update');
  return json.data;
}

export async function approveSeller(userId) {
  const res = await fetch(`${API_BASE}/admin/seller-verification/${userId}/approve`, {
    method: 'POST',
    credentials: 'include',
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to approve');
  return json.data;
}

export async function rejectSeller(userId, reason) {
  const res = await fetch(`${API_BASE}/admin/seller-verification/${userId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
    credentials: 'include',
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to reject');
  return json.data;
}
