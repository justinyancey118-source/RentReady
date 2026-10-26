
import { useEffect, useState } from "react";
import {
  getMyBookings,
  cancelMyBooking,
} from "../services/api";
import {
  getCurrentCustomer,
  logoutCustomer,
} from "../services/customerAuth";

function formatDate(value) {
  if (!value) return "Not available";

  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatMoney(value) {
  if (typeof value !== "number") return "Not available";

  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function StatusBadge({ status }) {
  const colors = {
    pending: "warning",
    approved: "success",
    rejected: "danger",
    cancelled: "secondary",
  };

  return (
    <span className={`badge text-bg-${colors[status] || "secondary"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function CustomerDashboard() {
  const [customer, setCustomer] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const account = await getCurrentCustomer();

        if (!account) {
          window.location.replace("/login");
          return;
        }

        setCustomer(account);

        const data = await getMyBookings();
        setBookings(data.bookings || []);
      } catch (err) {
        setError(err.message || "Unable to load your rentals.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  async function handleCancel(bookingId) {
    if (!window.confirm("Cancel this pending rental request?")) {
      return;
    }

    setCancellingId(bookingId);
    setError("");
    setMessage("");

    try {
      await cancelMyBooking(bookingId);

      setBookings((current) =>
        current.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: "cancelled" }
            : booking
        )
      );

      setMessage("Your rental request has been cancelled.");
    } catch (err) {
      setError(err.message);
    } finally {
      setCancellingId(null);
    }
  }

  function handleLogout() {
    logoutCustomer();
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <main className="container py-5">
        <p>Loading your RentReady account...</p>
      </main>
    );
  }

  if (!customer) {
    return (
      <main className="container py-5">
        <div className="alert alert-warning">
          Please <a href="/login">sign in</a> to view your account.
        </div>
      </main>
    );
  }

  return (
    <main className="container py-4">
      <header className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <a href="/" className="text-decoration-none">
            <h1 className="text-success fw-bold mb-1">RentReady</h1>
          </a>
          <p className="text-secondary mb-0">
            Welcome back, {customer.name}
          </p>
        </div>

        <div className="d-flex gap-2">
          <a href="/" className="btn btn-outline-success">
            Browse Rentals
          </a>
          <button
            className="btn btn-outline-secondary"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </header>

      <div className="mb-4">
        <h2 className="h3">My Rentals</h2>
        <p className="text-secondary">
          Track your rental requests and confirmed bookings.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="alert alert-success" role="status">
          {message}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-5">
            <h3 className="h5">No rental requests yet</h3>
            <p className="text-secondary">
              Once you submit a rental request, it will appear here.
            </p>
            <a href="/" className="btn btn-success">
              Explore Equipment
            </a>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {bookings.map((booking) => (
            <div className="col-md-6" key={booking._id}>
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                    <h3 className="h5 mb-0">
                      {booking.productId?.name || "Rental Product"}
                    </h3>
                    <StatusBadge status={booking.status} />
                  </div>

                  <p className="text-secondary small mb-3">
                    Request #{booking._id.slice(-8).toUpperCase()}
                  </p>

                  <p className="mb-2">
                    <strong>Rental type:</strong>{" "}
                    {booking.rentalType}
                  </p>

                  <p className="mb-2">
                    <strong>
                      {booking.rentalType === "dumpster"
                        ? "Delivery:"
                        : "Start:"}
                    </strong>{" "}
                    {formatDate(booking.startDate)}
                  </p>

                  <p className="mb-2">
                    <strong>
                      {booking.rentalType === "dumpster"
                        ? "Pickup:"
                        : "End:"}
                    </strong>{" "}
                    {formatDate(booking.endDate)}
                  </p>

                  <p className="mb-2">
                    <strong>Rental subtotal:</strong>{" "}
                    {formatMoney(booking.rentalSubtotal)}
                  </p>

                  {booking.status === "approved" &&
                    typeof booking.finalTotal === "number" && (
                      <p className="mb-2">
                        <strong>Confirmed total:</strong>{" "}
                        {formatMoney(booking.finalTotal)}
                      </p>
                    )}

                  {booking.status === "pending" && (
                    <div className="alert alert-light border small mt-3">
                      Awaiting admin review. Delivery fees and final
                      charges will be confirmed upon approval.
                    </div>
                  )}

                  {booking.status === "pending" && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm mt-2"
                      disabled={cancellingId === booking._id}
                      onClick={() => handleCancel(booking._id)}
                    >
                      {cancellingId === booking._id
                        ? "Cancelling..."
                        : "Cancel Request"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
