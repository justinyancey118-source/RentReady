
import { useState } from "react";
import { getAIRecommendations } from "../services/api";

export default function AIRecommendations({ onSelectProduct }) {
  const [description, setDescription] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setRecommendations([]);
    setSearched(false);

    if (description.trim().length < 15) {
      setError("Please describe your project in at least 15 characters.");
      return;
    }

    setLoading(true);

    try {
      const result = await getAIRecommendations(description.trim());
      setRecommendations(result.recommendations || []);
      setSearched(true);
    } catch (err) {
      setError(err.message || "Unable to get recommendations.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="ai-assistant" className="mb-5">
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4 p-md-5">
          <span className="badge text-bg-success mb-3">
            AI-Powered
          </span>

          <h2 className="fw-bold">Smart Rental Assistant</h2>

          <p className="text-secondary">
            Describe your project and get recommendations from
            our actual equipment and dumpster catalog.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="projectDescription" className="form-label">
              What are you working on?
            </label>

            <textarea
              id="projectDescription"
              className="form-control mb-3"
              rows={4}
              minLength={15}
              maxLength={1000}
              required
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Example: I'm renovating a kitchen and need to remove old cabinets, drywall, and construction debris."
            />

            <button
              type="submit"
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? "Finding rentals..." : "Get AI Recommendations"}
            </button>
          </form>

          {error && (
            <div className="alert alert-danger mt-3" role="alert">
              {error}
              {error.toLowerCase().includes("sign in") && (
                <a href="/login" className="ms-2">
                  Sign In
                </a>
              )}
            </div>
          )}

          {searched && recommendations.length === 0 && (
            <div className="alert alert-info mt-4">
              No suitable catalog items were found for this project.
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="mt-4">
              <h3 className="h5 fw-bold mb-3">
                Recommended Rentals
              </h3>

              <div className="row g-3">
                {recommendations.map((item) => (
                  <div className="col-md-6" key={item.productId}>
                    <div className="card h-100">
                      <div className="card-body">
                        <h4 className="h5">{item.name}</h4>

                        <span className="badge text-bg-secondary mb-2">
                          {item.category}
                        </span>

                        <p>{item.reason}</p>

                        <button
                          type="button"
                          className="btn btn-outline-success"
                          onClick={() =>
                            onSelectProduct(item.productId)
                          }
                        >
                          Request This Rental
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-secondary small mt-3 mb-0">
                Recommendations are suggestions only.
                Rental availability and final charges require
                business confirmation.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
