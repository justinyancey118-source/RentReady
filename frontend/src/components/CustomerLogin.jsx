
import { useState } from "react";
import { loginCustomer } from "../services/customerAuth";

export default function CustomerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginCustomer({ email, password });
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container py-5" style={{ maxWidth: 480 }}>
      <div className="text-center mb-4">
        <a href="/" className="text-decoration-none">
          <h1 className="fw-bold text-success">RentReady</h1>
        </a>
        <p className="text-secondary">
          Sign in to your rental account.
        </p>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <h2 className="h4 mb-4">Customer Login</h2>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="loginEmail" className="form-label">
                Email address
              </label>
              <input
                id="loginEmail"
                type="email"
                className="form-control"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="loginPassword" className="form-label">
                Password
              </label>
              <input
                id="loginPassword"
                type="password"
                className="form-control"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-success w-100"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center mt-4 mb-0">
            Don't have an account?{" "}
            <a href="/register">Create one</a>
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
