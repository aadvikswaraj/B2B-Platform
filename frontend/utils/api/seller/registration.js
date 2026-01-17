// API utilities for seller registration (step progress/save)

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function getRegistrationProgress() {
  const res = await fetch(`${API_BASE}/seller/registration/progress`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load progress');
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to load progress');
  return json.data;
}

export async function saveRegistrationStep(payload, filesKeys = []) {
  const form = new FormData();
  
  // Send all fields as FormData, files as files, arrays as JSON
  Object.entries(payload).forEach(([k, v]) => {
    if (filesKeys.includes(k) && (v instanceof File || v instanceof Blob)) {
      form.append(k, v);
    } else if (Array.isArray(v)) {
      form.append(k, JSON.stringify(v));
    } else if (v !== undefined && v !== null) {
      form.append(k, v);
    }
  });
  
  const res = await fetch(`${API_BASE}/seller/registration/save-step`, {
    method: 'POST',
    body: form,
    credentials: 'include',
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Save failed');
  return json.data;
}