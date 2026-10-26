
import { useState } from "react";
import { registerCustomer } from "../services/customerAuth";

export default function CustomerRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 12 || password.length > 128) {
      setError("Password must be between 12 and 128 characters.");
      return;
    }

    setLoading(true);

    try {
      await registerCustomer({ name, email, password });
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container py-5" style={{ maxWidth: 500 }}>
      <div className="text-center mb-4">
        <a href="/" className="text-decoration-none">
          <h1 className="fw-bold text-success">RentReady</h1>
        </a>
        <p className="text-secondary">
          Create an account for your equipment and dumpster rentals.
        </p>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <h2 className="h4 mb-4">Create Account</h2>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="registerName" className="form-label">
                Full name
              </label>
              <input
                id="registerName"
                type="text"
                className="form-control"
                value={name}
                onChange={(event) => setName(event.target.value)}
                minLength={2}
                maxLength={100}
                autoComplete="name"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="registerEmail" className="form-label">
                Email address
              </label>
              <input
                id="registerEmail"
                type="email"
                className="form-control"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="registerPassword" className="form-label">
                Password
              </label>
              <input
                id="registerPassword"
                type="password"
                className="form-control"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={12}
                maxLength={128}
                autoComplete="new-password"
                required
              />
              <div className="form-text">
                Use at least 12 characters.
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="registerConfirmPassword"
                className="form-label"
              >
                Confirm password
              </label>
              <input
                id="registerConfirmPassword"
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-success w-100"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center mt-4 mb-0">
            Already registered? <a href="/login">Sign in</a>
          </p>
        </div>
      </div>

      <p className="text-center mt-3">
        <a href="/" className="text-secondary">
          Back to rental catalog
        </a>
      </p>
    </main>
  );
}
