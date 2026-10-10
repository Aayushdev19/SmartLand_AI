const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `API error ${res.status}`);
  }
  return res.json();
}

export async function predictProperty(payload) {
  return request('/predict', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getOptions() {
  return request('/lookup/options');
}

export async function getDistricts() {
  return request('/lookup/districts');
}

export async function getLocalitiesGeo() {
  return request('/lookup/localities/geo');
}

export async function getJantriRate(district, landType = 'Residential') {
  return request(`/jantri?district=${encodeURIComponent(district)}&land_type=${encodeURIComponent(landType)}`);
}

export async function getAnalyticsSummary() {
  return request('/analytics/summary');
}

export async function getAnalyticsTrends() {
  return request('/analytics/trends');
}

export async function compareProperties(params) {
  const q = new URLSearchParams(params).toString();
  return request(`/compare?${q}`);
}

export async function healthCheck() {
  return request('/health');
}
