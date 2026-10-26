
import { useEffect, useState } from "react";
import "./App.css";
import RentalProductImage from "./components/RentalProductImage";
import { getCurrentCustomer, logoutCustomer, getCustomerToken } from "./services/customerAuth";

import {
  getProducts,
  getPackages,
  createBooking,
} from "./services/api";

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

  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState("");

  const [customer, setCustomer] = useState(null);
  const [checkingAccount, setCheckingAccount] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    let active = true;
    async function checkAccount() {
      try {
        const account = await getCurrentCustomer();
        if (active) setCustomer(account);
      } finally {
        if (active) setCheckingAccount(false);
      }
    }
    checkAccount();
    return () => { active = false; };
  }, []);

  function handleLogout() {
    logoutCustomer();
    setCustomer(null);
    setBookingError("");
    setBookingSuccess(null);
  }

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const [productsData, packagesData] = await Promise.all([
          getProducts(),
          getPackages(),
        ]);

        setProducts(productsData.products);
        setPackages(packagesData.packages);
      } catch (err) {
        setError(err.message || "Unable to load rental catalog.");
      } finally {
        setLoading(false);
      }
    }

    fetchCatalog();
  }, []);

  const selectedProduct = products.find(
    (product) => product._id === selectedProductId
  );

  const availablePackages = packages.filter(
    (rentalPackage) =>
      rentalPackage.productId?._id === selectedProductId
  );

  const selectedPackage = availablePackages.find(
    (rentalPackage) => rentalPackage._id === selectedPackageId
  );

  function handleProductChange(event) {
    setSelectedProductId(event.target.value);
    setSelectedPackageId("");
    setStartDate("");
    setEndDate("");
    setBookingError("");
    setBookingSuccess(null);
  }

  function handlePackageChange(event) {
    setSelectedPackageId(event.target.value);
    setBookingError("");
    setBookingSuccess(null);
  }

  const isDumpster = selectedProduct?.category === "dumpster";

  function getEstimatedRentalCost() {
    if (!selectedPackage) return null;

    if (!isDumpster) {
      return selectedPackage.price;
    }

    if (!startDate || !endDate) return null;

    const start = Date.parse(`${startDate}T00:00:00.000Z`);
    const end = Date.parse(`${endDate}T00:00:00.000Z`);

    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
      return null;
    }

    const elapsedDays = Math.round(
      (end - start) / (24 * 60 * 60 * 1000)
    );
    const billableDays = Math.max(1, elapsedDays);
    const includedDays =
      selectedPackage.includedDays ?? selectedPackage.durationValue;
    const extraDayPrice = selectedPackage.extraDayPrice ?? 0;
    const extraDays = Math.max(0, billableDays - includedDays);

    return selectedPackage.price + extraDays * extraDayPrice;
  }

  async function handleBookingSubmit(event) {
    event.preventDefault();
    setBookingError("");
    setBookingSuccess(null);

    if (checkingAccount) {
      setBookingError("Checking your account. Please try again.");
      return;
    }

    if (!customer || !getCustomerToken()) {
      setBookingError("Please sign in before submitting a rental request.");
      return;
    }

    if (!selectedProduct || !selectedPackage) {
      setBookingError("Please select a rental product and package.");
      return;
    }

    if (!startDate) {
      setBookingError(
        isDumpster
          ? "Please choose a delivery date."
          : "Please choose a rental start date and time."
      );
      return;
    }

    if (isDumpster && !endDate) {
      setBookingError("Please choose a pickup date.");
      return;
    }

    if (isDumpster && endDate < startDate) {
      setBookingError("The pickup date cannot be before the delivery date.");
      return;
    }

    setSubmitting(true);

    try {
      const bookingDetails = {
        productId: selectedProductId,
        packageId: selectedPackageId,
        startDate: isDumpster
          ? startDate
          : new Date(startDate).toISOString(),
      };

      if (isDumpster) {
        bookingDetails.endDate = endDate;
      }

      const result = await createBooking(bookingDetails);
      setBookingSuccess(result.booking);
      setStartDate("");
      setEndDate("");
    } catch (err) {
      setBookingError(
        err.message || "Unable to submit your rental request."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rentready-app">
      <nav className="navbar navbar-dark rentready-nav">
        <div className="container">
          <a className="navbar-brand fw-bold" href="/">
            RentReady
          </a>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <a className="btn btn-outline-light btn-sm" href="#rentals">
              Browse Rentals
            </a>
            {!checkingAccount && (customer ? (
              <>
                <a className="btn btn-light btn-sm" href="/account">My Rentals</a>
                <span className="text-white small d-none d-md-inline">{customer.name}</span>
                <button className="btn btn-outline-light btn-sm" type="button" onClick={handleLogout}>
                  Log Out
                </button>
              </>
            ) : (
              <>
                <a className="btn btn-outline-light btn-sm" href="/login">Login</a>
                <a className="btn btn-light btn-sm" href="/register">Register</a>
              </>
            ))}
          </div>
        </div>
      </nav>

      <header className="rentready-hero py-5">
        <div className="container py-4">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <p className="text-uppercase fw-semibold mb-2">
                Equipment and dumpster rentals
              </p>
              <h1 className="display-4 fw-bold">
                Get the right tools for your next project.
              </h1>
              <p className="lead mt-3">
                Explore rental options, compare packages, and submit a
                request. Every request is reviewed before it is approved.
              </p>
              <a className="btn btn-light btn-lg mt-2" href="#rentals">
                Explore Rentals
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-5">
        <section id="rentals" className="mb-5">
          <div className="mb-4">
            <p className="text-uppercase fw-semibold text-success mb-1">
              Rental catalog
            </p>
            <h2 className="fw-bold">Find your rental</h2>
            <p className="text-secondary">
              Compare available rental packages before submitting a request.
            </p>
          </div>

          {loading && (
            <div className="alert alert-info" role="status">
              Loading rental catalog...
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="alert alert-warning">
              No rentals are currently listed.
            </div>
          )}

          <div className="row g-4">
            {products.map((product) => {
              const productPackages = packages.filter(
                (rentalPackage) =>
                  rentalPackage.productId?._id === product._id
              );

              return (
                <div className="col-md-6 col-xl-4" key={product._id}>
                  <article className="card rental-card h-100 shadow-sm">
                    <RentalProductImage product={product} />

                    <div className="card-body">
                      <span className="badge text-bg-success mb-2">
                        {product.category === "dumpster"
                          ? "Dumpster"
                          : "Equipment"}
                      </span>

                      <h3 className="h5 card-title fw-bold">
                        {product.name}
                      </h3>

                      <p className="card-text text-secondary">
                        {product.description}
                      </p>

                      <h4 className="h6 fw-bold mt-4">Rental packages</h4>

                      {productPackages.length > 0 ? (
                        <ul className="list-group list-group-flush">
                          {productPackages.map((rentalPackage) => (
                            <li
                              className="list-group-item px-0 d-flex justify-content-between gap-3"
                              key={rentalPackage._id}
                            >
                              <span>
                                {formatDuration(
                                  rentalPackage.durationType,
                                  rentalPackage.durationValue
                                )}
                              </span>
                              <strong>
                                ${rentalPackage.price.toFixed(2)}
                              </strong>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-secondary">
                          No active packages listed.
                        </p>
                      )}

                      <button
                        className="btn btn-success mt-3 w-100"
                        type="button"
                        onClick={() => {
                          setSelectedProductId(product._id);
                          setSelectedPackageId("");
                          setStartDate("");
                          setEndDate("");
                          setBookingError("");
                          setBookingSuccess(null);
                          document
                            .getElementById("booking")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        Request This Rental
                      </button>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </section>

        <section id="booking" className="py-4">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-7">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4 p-md-5">
                  <p className="text-uppercase fw-semibold text-success mb-1">
                    Booking request
                  </p>
                  <h2 className="fw-bold mb-2">
                    Request a rental
                  </h2>
                  <p className="text-secondary mb-4">
                    Submit your details and preferred rental dates. This
                    form creates a pending request, not a confirmed booking.
                  </p>

                  {bookingSuccess && (
                    <div className="alert alert-success" role="status">
                      <h3 className="h5">Request submitted!</h3>
                      <p className="mb-1">
                        Your request for {bookingSuccess.product} has been
                        received.
                      </p>
                      <p className="mb-1">
                        Request reference:{" "}
                        <strong>{bookingSuccess.id}</strong>
                      </p>
                      <p className="mb-0">
                        Status: <strong>{bookingSuccess.status}</strong>.
                        The business must review your request before it is
                        confirmed.
                      </p>
                    </div>
                  )}

                  {bookingError && (
                    <div className="alert alert-danger" role="alert">
                      {bookingError}
                    </div>
                  )}

                  <form onSubmit={handleBookingSubmit}>
                    {checkingAccount ? (
                      <div className="alert alert-info" role="status">
                        Checking your account...
                      </div>
                    ) : customer ? (
                      <div className="alert alert-light border">
                        <strong>Requesting as:</strong> {customer.name}
                        <div className="text-secondary small">{customer.email}</div>
                      </div>
                    ) : (
                      <div className="alert alert-warning">
                        Please <a href="/login">sign in</a> or <a href="/register">create an account</a> to submit a rental request.
                        You can still browse all rentals below.
                      </div>
                    )}

                    <div className="mb-3">
                      <label htmlFor="product" className="form-label">
                        Rental product
                      </label>
                      <select
                        id="product"
                        className="form-select"
                        required
                        value={selectedProductId}
                        onChange={handleProductChange}
                      >
                        <option value="">Choose a rental...</option>
                        {products.map((product) => (
                          <option key={product._id} value={product._id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="rentalPackage" className="form-label">
                        Rental package
                      </label>
                      <select
                        id="rentalPackage"
                        className="form-select"
                        required
                        value={selectedPackageId}
                        onChange={handlePackageChange}
                        disabled={!selectedProductId}
                      >
                        <option value="">Choose a package...</option>
                        {availablePackages.map((rentalPackage) => (
                          <option
                            key={rentalPackage._id}
                            value={rentalPackage._id}
                          >
                            {formatDuration(
                              rentalPackage.durationType,
                              rentalPackage.durationValue
                            )}{" "}
                            — ${rentalPackage.price.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedProduct && (
                      <div className="alert alert-light border">
                        <strong>Selected rental:</strong>{" "}
                        {selectedProduct.name}
                        <br />
                        <strong>Category:</strong>{" "}
                        {isDumpster ? "Dumpster" : "Equipment"}
                      </div>
                    )}

                    {isDumpster ? (
                      <>
                        <div className="mb-3">
                          <label htmlFor="startDate" className="form-label">
                            Preferred delivery date
                          </label>
                          <input
                            id="startDate"
                            className="form-control"
                            type="date"
                            required
                            value={startDate}
                            onChange={(event) => setStartDate(event.target.value)}
                          />
                        </div>

                        <div className="mb-3">
                          <label htmlFor="endDate" className="form-label">
                            Preferred pickup date
                          </label>
                          <input
                            id="endDate"
                            className="form-control"
                            type="date"
                            min={startDate || undefined}
                            required
                            value={endDate}
                            onChange={(event) => setEndDate(event.target.value)}
                          />
                        </div>
                      </>
                    ) : selectedProduct ? (
                      <div className="mb-3">
                        <label htmlFor="startDate" className="form-label">
                          Preferred rental start date and time
                        </label>
                        <input
                          id="startDate"
                          className="form-control"
                          type="datetime-local"
                          required
                          value={startDate}
                          onChange={(event) => setStartDate(event.target.value)}
                        />
                        <div className="form-text">
                          The end date and time are calculated from the
                          selected package.
                        </div>
                      </div>
                    ) : null}

                    {selectedPackage && (
                      <div className="border rounded p-3 mb-4">
                        <div className="d-flex justify-content-between gap-3">
                          <span>Estimated rental subtotal</span>
                          <strong>
                            {getEstimatedRentalCost() === null
                              ? "Enter valid dates"
                              : `$${getEstimatedRentalCost().toFixed(2)}`}
                          </strong>
                        </div>
                        <p className="small text-secondary mb-0 mt-2">
                          Estimate only. Delivery fees and any additional
                          charges are determined during business review.
                          Final pricing is confirmed when the request is
                          reviewed.
                        </p>
                      </div>
                    )}

                    <button
                      className="btn btn-success btn-lg w-100"
                      type="submit"
                      disabled={submitting || loading || checkingAccount || !customer || products.length === 0}
                    >
                      {submitting
                        ? "Submitting request..."
                        : "Submit Rental Request"}
                    </button>
                    {!checkingAccount && !customer && (
                      <p className="text-center small text-secondary mt-3 mb-0">
                        <a href="/login">Sign in</a> to request this rental.
                      </p>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="rentready-footer py-4">
        <div className="container text-center">
          <p className="mb-1 fw-bold">RentReady</p>
          <p className="mb-0 small">
            Rental requests are subject to review and approval.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
