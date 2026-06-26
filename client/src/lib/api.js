const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Common request helper for backend API calls
 * @param {string} endpoint - The path relative to API_URL (e.g. '/users/sync')
 * @param {object} options - Standard fetch options
 */
async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP request failed with status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`[API Error] endpoint: ${endpoint}:`, error.message);
    throw error;
  }
}

// User Actions
export const syncUserWithDB = (clerkUserId, email, firstName, lastName) => {
  return request('/users/sync', {
    method: 'POST',
    body: { clerkUserId, email, firstName, lastName }
  });
};

// Product Actions (FULL CRUD)
export const fetchProductsFromDB = (clerkUserId) => {
  return request(`/products?clerkUserId=${clerkUserId}`);
};

/**
 * Saves a product (both creates and updates depending on if body contains product 'id')
 */
export const saveProductToDB = (productData) => {
  return request('/products/save', {
    method: 'POST',
    body: productData
  });
};

export const deleteProductFromDB = (productId, clerkUserId) => {
  return request(`/products/${productId}?clerkUserId=${clerkUserId}`, {
    method: 'DELETE'
  });
};
