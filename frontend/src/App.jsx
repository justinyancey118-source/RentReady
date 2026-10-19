
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(
          "http://localhost:5000/api/products"
        );

        if (!response.ok) {
          throw new Error("Unable to load rental products.");
        }

        const data = await response.json();
        setProducts(data.products);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div className="rentready-app">
      <nav className="navbar navbar-expand-lg navbar-dark rentready-nav">
        <div className="container">
          <a className="navbar-brand fw-bold" href="/">
            RentReady
          </a>

          <span className="navbar-text text-white">
            Equipment & Dumpster Rentals
          </span>
        </div>
      </nav>

      <header className="rentready-hero">
        <div className="container py-5">
          <span className="badge text-bg-light mb-3">
            YOUR NEXT PROJECT STARTS HERE
          </span>

          <h1 className="display-4 fw-bold">
            The right equipment.
            <br />
            The right project.
          </h1>

          <p className="lead mt-3">
            Explore equipment and dumpster rentals in one place.
          </p>

          <a href="#catalog" className="btn btn-light btn-lg mt-3">
            Explore rentals
          </a>
        </div>
      </header>

      <main className="container py-5" id="catalog">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          <div>
            <h2 className="fw-bold mb-1">Explore our rentals</h2>
            <p className="text-secondary mb-0">
              Find equipment for your next project.
            </p>
          </div>

          <span className="badge text-bg-success fs-6">
            {products.length} listings
          </span>
        </div>

        {loading && (
          <div className="text-center py-5" role="status">
            <div className="spinner-border text-success" />
            <p className="mt-3">Loading rental products...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="alert alert-info">
            No rental products are listed yet.
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="row g-4">
            {products.map((product) => (
              <div className="col-12 col-md-6 col-lg-4" key={product._id}>
                <article className="card h-100 shadow-sm rental-card">
                  <div className="rental-image-placeholder">
                    <span aria-hidden="true">
                      {product.category === "dumpster" ? "🗑️" : "🛠️"}
                    </span>
                  </div>

                  <div className="card-body d-flex flex-column">
                    <span className="badge text-bg-success align-self-start mb-2">
                      {product.category}
                    </span>

                    <h3 className="card-title h5 fw-bold">
                      {product.name}
                    </h3>

                    <p className="card-text text-secondary">
                      {product.description}
                    </p>

                    <p className="small text-secondary mt-auto mb-0">
                      Inventory quantity: {product.inventoryQuantity}
                    </p>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="rentready-footer py-4">
        <div className="container text-center">
          <p className="mb-0">
            RentReady · Equipment and dumpster rentals
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
