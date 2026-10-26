
import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AdminDashboard() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [deliveryFee, setDeliveryFee] = useState("0");
  const [additionalCharges, setAdditionalCharges] = useState("0");
  const [notes, setNotes] = useState("");

  async function apiRequest(endpoint, options = {}, authToken = token) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(authToken
          ? { Authorization: `Bearer ${authToken}` }
          : {}),
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 && authToken) {
        setToken("");
        setBookings([]);
      }
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data;
  }

  async function loadBookings(authToken = token) {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest(
        "/bookings/admin",
        {},
        authToken
      );
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadBookings(token);
    }
    // Intentionally reload only when authentication changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await apiRequest(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        },
        ""
      );

      setPassword("");
      setToken(data.token);
      setMessage("Admin login successful.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setToken("");
    setBookings([]);
    setPassword("");
    setMessage("");
    setEditingId(null);
  }

  async function updateBooking(id, action, payload = {}) {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await apiRequest(
        `/bookings/admin/${id}/${action}`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        }
      );

      setMessage(data.message);
      setEditingId(null);
      setNotes("");
      await loadBookings();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function beginApproval(booking) {
    setEditingId(booking._id);
    setDeliveryFee("0");
    setAdditionalCharges("0");
    setNotes("");
  }

  function submitApproval(booking) {
    const delivery = Number(deliveryFee);
    const additional = Number(additionalCharges);

    if (
      deliveryFee.trim() === "" ||
      additionalCharges.trim() === "" ||
      !Number.isFinite(delivery) ||
      !Number.isFinite(additional) ||
      delivery < 0 ||
      additional < 0
    ) {
      setError("Enter valid nonnegative charges.");
      return;
    }

    updateBooking(booking._id, "approve", {
      deliveryFee: delivery,
      additionalCharges: additional,
      adminNotes: notes,
    });
  }

  function requestReason(action, booking) {
    const reason = window.prompt(
      `Optional reason for ${action}:`,
      ""
    );

    if (reason === null) return;

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this booking?`
    );

    if (!confirmed) return;

    updateBooking(booking._id, action, { reason });
  }

  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter((booking) => booking.status === filter);

  function formatDate(date) {
    if (!date) return "—";
    return new Date(date).toLocaleString();
  }

  function formatMoney(amount) {
    if (amount === null || amount === undefined) return "—";

    return Number(amount).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  }

  if (!token) {
    return (
      <main className="container py-5" style={{ maxWidth: 500 }}>
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h1 className="h3 mb-3">RentReady Admin</h1>

            {error && (
              <div className="alert alert-danger">{error}</div>
            )}

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label htmlFor="adminEmail" className="form-label">
                  Admin email
                </label>
                <input
                  id="adminEmail"
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="adminPassword" className="form-label">
                  Password
                </label>
                <input
                  id="adminPassword"
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <a href="/" className="d-block mt-3">
              Back to rental catalog
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h2 mb-1">RentReady Admin Dashboard</h1>
          <p className="text-secondary mb-0">
            Manage equipment and dumpster rental requests.
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary"
            onClick={() => loadBookings()}
            disabled={loading}
          >
            Refresh
          </button>
          <button
            className="btn btn-outline-danger"
            onClick={logout}
          >
            Log out
          </button>
        </div>
      </div>

      {message && (
        <div className="alert alert-success">{message}</div>
      )}

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      <div className="card mb-4">
        <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <strong>Total bookings: {bookings.length}</strong>
            <span className="ms-3 text-secondary">
              Pending: {bookings.filter((b) => b.status === "pending").length}
            </span>
          </div>

          <select
            className="form-select"
            style={{ maxWidth: 220 }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter bookings"
          >
            <option value="all">All bookings</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && filteredBookings.length === 0 && (
        <div className="alert alert-info">
          No bookings match this filter.
        </div>
      )}

      <div className="row g-3">
        {filteredBookings.map((booking) => (
          <div className="col-12" key={booking._id}>
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex flex-wrap justify-content-between gap-2">
                  <div>
                    <h2 className="h5 mb-1">
                      {booking.productId?.name || "Rental product"}
                    </h2>
                    <p className="text-secondary mb-2">
                      {booking.customerName} — {booking.email || booking.customerEmail}
                    </p>
                  </div>

                  <span className="badge text-bg-secondary align-self-start">
                    {booking.status}
                  </span>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <strong>Start:</strong> {formatDate(booking.startDate)}
                  </div>
                  <div className="col-md-6">
                    <strong>End:</strong> {formatDate(booking.endDate)}
                  </div>
                  <div className="col-md-6">
                    <strong>Rental subtotal:</strong>{" "}
                    {formatMoney(booking.rentalSubtotal)}
                  </div>
                  <div className="col-md-6">
                    <strong>Final total:</strong>{" "}
                    {booking.status === "approved" ||
                    booking.status === "cancelled"
                      ? formatMoney(booking.finalTotal)
                      : "Not confirmed"}
                  </div>
                </div>

                {booking.adminNotes && (
                  <p>
                    <strong>Admin notes:</strong> {booking.adminNotes}
                  </p>
                )}

                {booking.status === "pending" && (
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      className="btn btn-success"
                      disabled={loading}
                      onClick={() => beginApproval(booking)}
                    >
                      Approve
                    </button>

                    <button
                      className="btn btn-outline-danger"
                      disabled={loading}
                      onClick={() => requestReason("reject", booking)}
                    >
                      Reject
                    </button>

                    <button
                      className="btn btn-outline-secondary"
                      disabled={loading}
                      onClick={() => requestReason("cancel", booking)}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {booking.status === "approved" && (
                  <button
                    className="btn btn-outline-danger"
                    disabled={loading}
                    onClick={() => requestReason("cancel", booking)}
                  >
                    Cancel approved booking
                  </button>
                )}

                {editingId === booking._id && (
                  <div className="border rounded p-3 mt-3">
                    <h3 className="h6">Approve rental</h3>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">
                          Delivery fee ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="form-control"
                          value={deliveryFee}
                          onChange={(e) => setDeliveryFee(e.target.value)}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">
                          Additional charges ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="form-control"
                          value={additionalCharges}
                          onChange={(e) => setAdditionalCharges(e.target.value)}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label">
                          Admin notes
                        </label>
                        <textarea
                          className="form-control"
                          rows="2"
                          maxLength="1000"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>

                      <div className="col-12">
                        <strong>Calculated final total: </strong>
                        {formatMoney(
                          booking.rentalSubtotal +
                          Number(deliveryFee || 0) +
                          Number(additionalCharges || 0)
                        )}
                      </div>

                      <div className="col-12 d-flex gap-2">
                        <button
                          className="btn btn-success"
                          disabled={loading}
                          onClick={() => submitApproval(booking)}
                        >
                          Confirm approval
                        </button>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => setEditingId(null)}
                        >
                          Back
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <small className="text-secondary d-block mt-3">
                  Booking ID: {booking._id}
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
