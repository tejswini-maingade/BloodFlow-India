import { getToken } from './tokenStore';

// Empty = same origin (dev proxy locally, Express in production).
const BASE_URL = import.meta.env.VITE_API_URL ?? '';

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

// URLSearchParams encodes "+" as %2B, so "O+" is sent correctly.
function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const text = query.toString();
  return text ? `?${text}` : '';
}

async function request(path, { method = 'GET', body, params } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}${buildQuery(params)}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0);
  }

  let json = null;
  try {
    json = await response.json();
  } catch {
    /* non-JSON response, handled below */
  }

  if (!response.ok || !json || json.success === false) {
    throw new ApiError(
      json?.error?.message || `Request failed (${response.status})`,
      response.status,
      json?.error?.details
    );
  }
  return { data: json.data, meta: json.meta ?? null };
}

export const api = {
  // Public
  getDashboard: () => request('/api/dashboard'),
  getAlerts: (limit = 20) => request('/api/alerts', { params: { limit } }),
  getBlood: (filters) => request('/api/blood', { params: filters }),
  getFacilities: (filters) => request('/api/hospitals', { params: filters }),
  getFacility: (id) => request(`/api/hospitals/${id}`),

  // Auth + admin (used in Phase 3C)
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password } }),
  createInventory: (payload) => request('/api/blood', { method: 'POST', body: payload }),
  updateInventory: (id, unitsAvailable) =>
    request(`/api/blood/${id}`, { method: 'PUT', body: { unitsAvailable } }),
  deleteInventory: (id) => request(`/api/blood/${id}`, { method: 'DELETE' }),
};
