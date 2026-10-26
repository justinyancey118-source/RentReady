
import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

import App from "./App.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import CustomerLogin from "./components/CustomerLogin.jsx";
import CustomerRegister from "./components/CustomerRegister.jsx";
import CustomerDashboard from "./components/CustomerDashboard.jsx";

const path = window.location.pathname.replace(/\/+$/, "") || "/";

function Root() {
  switch (path) {
    case "/admin":
      return <AdminDashboard />;

    case "/login":
      return <CustomerLogin />;

    case "/register":
      return <CustomerRegister />;

    case "/account":
      return <CustomerDashboard />;

    default:
      return <App />;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
