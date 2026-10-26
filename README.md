# RentReady

**AI-assisted equipment and dumpster rental requests for contractors and homeowners.**

RentReady is a full-stack capstone project built with **React (Vite), Bootstrap, Node.js, Express, MongoDB Atlas, and OpenAI**. Customers browse equipment and dumpsters, select rental terms, submit requests, and track their status. Administrators review requests, confirm delivery and additional charges, and approve bookings subject to inventory constraints.

> **Booking policy:** Submitting a request does **not** confirm a reservation. An administrator must approve it. Delivery fees and final pricing are confirmed during review.

## Live links

- **Frontend:** https://rent-ready-woad.vercel.app
- **Backend health:** https://rentready-mt71.onrender.com/api/health
- **Source code:** https://github.com/justinyancey118-source/RentReady

> The Render free service may take extra time to respond after inactivity. Never commit secrets or the contents of a `.env` file.

## Features

### Customer
- Account registration and login using authenticated requests.
- Equipment and dumpster catalog with product images and rental packages.
- Equipment requests: choose a package and start time; backend calculates the planned end.
- Dumpster requests: choose delivery and pickup dates; backend calculates eligible rental days and subtotal.
- Submit rental requests for administrator approval.
- **My Rentals** dashboard with request status and confirmed totals for approved bookings.
- Cancel a customer's own **pending** requests; approved bookings require administrator handling.
- AI assistant that recommends up to three products from active MongoDB catalog entries based on a project description.

### Administrator
- Separate administrator authentication and booking dashboard.
- Review pending bookings, approve, reject, or cancel as permitted by booking status.
- Specify delivery fees, additional charges, and final charges at approval.
- Enforce inventory quantities against overlapping approved bookings.

## Technology

| Layer | Tools |
|---|---|
| Frontend | React, Vite, JavaScript, Bootstrap |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB Atlas |
| Authentication | JWT, bcryptjs |
| AI | OpenAI API (backend only) |
| Hosting | Vercel (frontend), Render (API) |
| Version control | Git and GitHub |

## Architecture

```text
Browser / React + Bootstrap (Vercel)
  ├── Public catalog → GET /api/products, /api/packages
  ├── Customer auth → /api/auth/customer/...
  ├── Booking requests → /api/bookings/...
  └── AI assistant → POST /api/recommendations
                             │
                         Express (Render)
                         ├── MongoDB Atlas
                         └── OpenAI API
```

## Repository structure

```text
RentReady/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── scripts/
│   │   └── server.js
│   ├── package.json
│   └── .env                  # local only; do not commit
└── frontend/
    ├── public/images/
    ├── src/
    │   ├── components/
    │   ├── data/
    │   ├── services/
    │   └── App.jsx
    └── package.json
```

## Local setup

**Requirements:** Node.js, npm, an accessible MongoDB Atlas cluster, and an OpenAI API key for AI recommendations.

1. Clone the repository:
   ```powershell
   git clone https://github.com/justinyancey118-source/RentReady.git
   cd RentReady
   ```
2. Install dependencies:
   ```powershell
   npm --prefix backend install
   npm --prefix frontend install
   ```
3. Create `backend/.env` with the environment variable names required by the backend source. Example (replace placeholders locally):
   ```dotenv
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_strong_random_secret
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_MODEL=gpt-4.1-mini
   FRONTEND_URL=http://localhost:5173
   PORT=5000
   ```
   **Verify the MongoDB URI variable name in `backend/src/config/db.js` and any additional auth settings in the authentication files.** Do not commit `.env`.
4. Start the backend and frontend in **separate terminals**:
   ```powershell
   npm --prefix backend run dev
   npm --prefix frontend run dev
   ```
5. Open the Vite URL shown in the terminal (typically `http://localhost:5173`).

The frontend's API base URL defaults to `http://localhost:5000/api`; optionally set `VITE_API_URL` for another backend. An `OPENAI_API_KEY` and appropriate API billing are required for live AI results.

## Deployment

- **Render:** GitHub repo, root directory `backend`, build `npm install`, start `npm start`. Configure server-side MongoDB, JWT, OpenAI, and `FRONTEND_URL` secrets in Render's environment settings. Ensure Atlas network access permits the Render service to connect.
- **Vercel:** Same repo, root directory `frontend`, Vite framework, build `npm run build`, output `dist`. Set `VITE_API_URL=https://rentready-mt71.onrender.com/api` **at build time**.
- **CORS:** Add the exact Vercel production domain to Render's `FRONTEND_URL`. Check deployment-preview origins separately if used.
- **Routing:** SPA routes such as `/login`, `/register`, `/account`, and `/admin` need a Vercel rewrite to `/index.html` (see `frontend/vercel.json` if present).

## Booking and pricing rules

1. Customers request a product and package; requests start as **pending**.
2. Rental dates and rental subtotal are calculated or validated by the backend, not trusted from the browser.
3. Administrators provide delivery fees and additional charges before approval.
4. Approval rechecks overlapping **approved** rentals against the product's `inventoryQuantity` and uses a MongoDB transaction to coordinate competing approvals.
5. Customers can cancel their own pending requests; administrators manage approved-booking cancellation.
6. Prices and availability are not guaranteed until admin approval.

## Testing performed

The following were reported as successfully tested during capstone development:
- Customer login and rental requests; My Rentals dashboard and cancellation.
- Administrator workflows, including approval and inventory overbooking prevention.
- AI recommendation assistant using catalog products.
- Catalog and product images from the deployed website.
- Production React build (`npm run build`) and deployment to Vercel and Render.
- Render API health and retrieval of 10 products from MongoDB Atlas.
- GitHub push and at least 15 meaningful commits.

These are **manual test results**, not an automated test-suite claim. Re-run smoke tests after changes.

## Current limitations and next improvements

- **Forgot password / email-based password reset is not implemented yet.** It is a planned enhancement.
- Production hardening: request rate limits (especially login and AI endpoints), session/token invalidation, security headers, stricter origin management, and broader automated tests.
- Admin-provided charges and inventory validation should be re-tested with concurrent traffic and deployment edge cases.
- AI suggestions are informational; they do not guarantee availability or final pricing.

## Credits and notes

RentReady was created as a full-stack software development capstone project. Product descriptions and rental policies should be verified by the business before commercial use. API keys and database credentials belong only in server-side environment variables.
