/**
 * GAFOOR DRIVING SCHOOL — REST API CLIENT
 * Handles requests to /api with authentication headers, error classification, and JSON parsing.
 */

class ApiClient {
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders
    };

    let token = null;
    let isAdmin = false;
    if (typeof localStorage !== 'undefined') {
      const adminToken = localStorage.getItem('gds_admin_token');
      const userToken = localStorage.getItem('gds_user_token');
      const trainerToken = localStorage.getItem('gds_trainer_token');
      const generalToken = localStorage.getItem('gds_auth_token');

      if (adminToken) {
        token = adminToken;
        isAdmin = true;
      } else if (trainerToken) {
        token = trainerToken;
      } else if (userToken) {
        token = userToken;
      } else if (generalToken) {
        token = generalToken;
      }
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      if (isAdmin && (token.includes('admin') || token.startsWith('gds_adm'))) {
        headers['X-Admin-Role'] = 'admin';
      }
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
    const url = `${this.baseUrl}${cleanEndpoint}`;
    const config = {
      ...options,
      headers: this.getHeaders(options.headers || {})
    };

    try {
      const response = await fetch(url, config);
      let data = null;
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch (_) {
          data = { message: text };
        }
      }

      if (!response.ok) {
        const error = new Error(data?.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        error.errors = data?.errors || null;
        throw error;
      }

      return data;
    } catch (err) {
      if (err.status) throw err;
      const netErr = new Error(err.message || 'Unable to connect to server. Please check your connection.');
      netErr.status = 0;
      netErr.isNetworkError = true;
      throw netErr;
    }
  }

  get(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'GET', headers });
  }

  post(endpoint, body, headers = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      headers
    });
  }

  put(endpoint, body, headers = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers
    });
  }

  delete(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'DELETE', headers });
  }
}

export const api = new ApiClient();
export default api;
