
import { getCustomerToken } from "./customerAuth";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(endpoint, options = {}, requiresAuth = false) {
  const headers = {
    ...options.headers,
  };

  if (requiresAuth) {
    const token = getCustomerToken();

    if (!token) {
      throw new Error("Please sign in to continue.");
    }

    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && requiresAuth) {
      throw new Error("Your session has expired. Please sign in again.");
    }

    throw new Error(
      data.message || "The request could not be completed."
    );
  }

  return data;
}

// Public rental catalog
export function getProducts() {
  return request("/products");
}

export function getPackages() {
  return request("/packages");
}

// Customers must be logged in to submit rental requests.
export function createBooking(bookingDetails) {
  return request(
    "/bookings",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingDetails),
    },
    true
  );
}

// Get the signed-in customer's bookings.
export function getMyBookings() {
  return request("/bookings/my", {}, true);
}

// Cancel one of the customer's pending bookings.
export function cancelMyBooking(bookingId) {
  return request(
    `/bookings/my/${encodeURIComponent(bookingId)}/cancel`,
    { method: "PATCH" },
    true
  );
}
