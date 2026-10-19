
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api";

function formatDuration(durationType, durationValue) {
  const unit =
    durationValue === 1 ? durationType : `${durationType}s`;

  return `${durationValue} ${unit}`;
}

function App() {
  const [products, setProducts] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const [productsResponse, packagesResponse] = await Promise.all([
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/packages`),
        ]);

        if (!productsResponse.ok || !packagesResponse.ok) {
          throw new Error("Unable to load the rental catalog.");
        }

        const productsData = await productsResponse.json();
        const packagesData = await packagesResponse.json();

        setProducts(productsData.products);
        setPackages(packagesData.packages);
      } catch (err) {
        setError(err.message || "Something went wrong loading rentals.");
      } finally {
        setLoading(false);
      }
    }

    fetchCatalog();
  }, []);

  return (
    <div className="rentready-app">
      <nav className="navbar navbar-expand-lg navbar-dark rentready-nav">
        <div className="container">
          <a className="navbar-brand fw-bold" href="/">
            RentReady
          </a>

          <span className="navbar-text text-white">
            Equipment &amp; Dumpster Rentals
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
            <p className="mt-3">Loading rental products and prices...</p>
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
            {products.map((product) => {
              const productPackages = packages.filter(
                (rentalPackage) =>
                  rentalPackage.productId?._id === product._id
              );

              return (
                <div
                  className="col-12 col-md-6 col-lg-4"
                  key={product._id}
                >
                  <article className="card h-100 shadow-sm rental-card">
                    <div className="rental-image-placeholder">
                      <span aria-hidden="true">
                        {product.category === "dumpster"
                          ? "Dumpster"
                          : "Equipment"}
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

                      <div className="mt-2">
                        <h4 className="h6 fw-bold">Rental options</h4>

                        {productPackages.length > 0 ? (
                          <ul className="list-group list-group-flush mb-3">
                            {productPackages.map((rentalPackage) => (
                              <li
                                className="list-group-item px-0 d-flex justify-content-between align-items-center gap-2"
                                key={rentalPackage._id}
                              >
                                <span>
                                  {formatDuration(
                                    rentalPackage.durationType,
                                    rentalPackage.durationValue
                                  )}
                                </span>

                                <strong>
                                  {new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                  }).format(rentalPackage.price)}
                                </strong>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="small text-secondary">
                            No rental packages available yet.
                          </p>
                        )}
                      </div>

                      <p className="small text-secondary mt-auto mb-0">
                        Inventory quantity: {product.inventoryQuantity}
                      </p>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="rentready-footer py-4">
        <div className="container text-center">
          <p className="mb-0">
            RentReady &middot; Equipment and dumpster rentals
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
