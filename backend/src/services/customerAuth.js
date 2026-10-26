
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

let accessToken = null;
let currentCustomer = null;

async function authRequest(path, options = {}) {
  const response = await fetch(`${API_URL}/auth/customer${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Authentication request failed.");
  }

  return data;
}

export async function registerCustomer({ name, email, password }) {
  const data = await authRequest("/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

  accessToken = data.token;
  currentCustomer = data.customer;

  return data.customer;
}

export async function loginCustomer({ email, password }) {
  const data = await authRequest("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  accessToken = data.token;
  currentCustomer = data.customer;

  return data.customer;
}

export async function getCurrentCustomer() {
  if (!accessToken) return null;

  try {
    const data = await authRequest("/me");
    currentCustomer = data.customer;
    return currentCustomer;
  } catch {
    logoutCustomer();
    return null;
  }
}

export function getCustomerToken() {
  return accessToken;
}

export function getSignedInCustomer() {
  return currentCustomer;
}

export function logoutCustomer() {
  accessToken = null;
  currentCustomer = null;
}
