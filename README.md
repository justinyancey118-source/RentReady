# RentReady

RentReady is a full-stack equipment and dumpster rental platform designed to help homeowners, DIY users, and contractors explore rental options, submit booking requests, and manage rentals. The platform will include an AI-powered assistant that recommends suitable rental products from the available catalog.

**Project status:** In development

## Project Goals

- Build a responsive React frontend.
- Develop a REST API using Node.js and Express.
- Store application data in MongoDB using Mongoose.
- Implement customer registration, login, and role-based authorization.
- Display equipment and dumpster rental products with supported rental packages and prices.
- Allow customers to submit and manage booking requests.
- Provide an administrative workflow for reviewing requests, checking inventory, and confirming rental charges.
- Integrate an AI assistant that recommends real catalog products without inventing prices or availability.
- Test, deploy, and document the completed application.

## Technology Stack

- **Frontend:** React, Vite, JavaScript
- **Backend:** Node.js, Express
- **Database:** MongoDB, Mongoose
- **Version control:** Git and GitHub
- **Testing:** To be selected during implementation
- **AI integration:** Provider to be selected after checking API access
- **Deployment:** To be selected during deployment planning

## Planned Features

### Customer Features

- Browse equipment and dumpster listings.
- View supported rental packages and listed prices.
- Register and log in securely.
- Submit rental booking requests.
- View booking statuses and request details.
- Cancel eligible pending requests.
- Ask the AI assistant for catalog-based recommendations.

### Administrative Features

- Manage rental products and inventory.
- Review pending booking requests.
- Recheck inventory before approving requests.
- Enter delivery fees and other applicable charges.
- Confirm the final total before approving a booking.
- Reject requests when necessary.

### Booking Rules

- Submitting a request does not confirm a reservation.
- Pending requests do not reserve inventory.
- Inventory must be rechecked when a request is approved.
- Customers may cancel their own pending requests.
- Approved bookings can only be cancelled by an administrator in the initial release.
- Prices and booking details must be retained with the booking for accurate records.
- Delivery fees and final charges must not be invented or presented as confirmed before administrative review.

## Project Structure

```text
RentReady/
├── frontend/     # React application
├── backend/      # Express API and server-side logic
├── docs/         # Requirements and project documentation
├── .gitignore
└── README.md
```

## Development Setup

Prerequisites:

- Node.js and npm
- Git
- MongoDB access, to be configured
- An AI provider API key, if required by the selected integration

Frontend setup:

```powershell
cd frontend
npm install
npm run dev
```

Backend setup instructions will be added after the Express application is created.

## Security and Data Integrity

- Store secrets in environment variables, not source code.
- Hash passwords before storing them.
- Enforce authorization on protected server-side routes.
- Validate incoming data on the server.
- Prevent booking approvals from exceeding available inventory.
- Keep cancelled booking records for historical
