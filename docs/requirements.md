# RentReady — Project Requirements

**Status:** Planning baseline  
**Purpose:** Track required features, implementation progress, and verification evidence.

## 1. Functional Requirements

| ID    | Requirement                   | Acceptance criteria                                                                                                  |
| ----- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| FR-01 | Product catalog               | Customers can browse active equipment and dumpster listings.                                                         |
| FR-02 | Product details               | Each listing displays supported rental packages and their supplied prices.                                           |
| FR-03 | Customer registration         | A customer can create an account with validated information.                                                         |
| FR-04 | Authentication                | Customers can log in and log out securely.                                                                           |
| FR-05 | Role-based authorization      | Customer and administrator permissions are enforced on the server.                                                   |
| FR-06 | Booking requests              | Customers can submit a request for a supported rental package or dumpster period.                                    |
| FR-07 | Booking history               | Customers can view their own booking requests and statuses.                                                          |
| FR-08 | Customer cancellation         | Customers can cancel their own pending requests.                                                                     |
| FR-09 | Administrative review         | Administrators can review, approve, or reject pending requests.                                                      |
| FR-10 | Inventory protection          | Inventory is rechecked at approval so overlapping approved bookings cannot exceed available stock.                   |
| FR-11 | Charge confirmation           | Administrators enter delivery fees and other charges before approval and confirm the final total.                    |
| FR-12 | Booking records               | Booking records retain relevant pricing snapshots and status history. Cancelled records are not deleted.             |
| FR-13 | AI recommendations            | The assistant recommends real catalog products and explains its recommendations.                                     |
| FR-14 | AI safeguards                 | The assistant cannot approve bookings or invent prices, availability, delivery fees, or unverified product policies. |
| FR-15 | Responsive interface          | The application is usable on desktop and mobile screens.                                                             |
| FR-16 | Validation and error handling | Invalid requests are rejected with useful feedback, and failures are handled safely.                                 |

## 2. Non-Functional Requirements

- **Security:** Passwords are hashed, secrets are protected, and protected endpoints enforce authorization.
- **Data integrity:** Booking approval uses server-side inventory checks.
- **Maintainability:** Frontend, routes, controllers, services, and database models have clear responsibilities.
- **Accessibility:** Forms, controls, and navigation use appropriate labels and keyboard-accessible interactions.
- **Reliability:** Loading, empty, success, and error states are provided where appropriate.
- **Documentation:** Setup instructions, architecture, requirements, testing, deployment, and known limitations are documented.

## 3. Booking Rules

1. A submitted request has a `pending` status and is not a confirmed reservation.
2. Pending requests do not reserve inventory.
3. Administrators must recheck inventory before approving a request.
4. Approved bookings must not exceed available inventory for overlapping rental periods.
5. Customers may cancel their own pending requests.
6. In the initial release, only administrators can cancel approved bookings.
7. Delivery fees and other applicable charges are entered during administrative review.
8. The final total must be confirmed before approval.
9. Supported package prices must not be arbitrarily prorated or multiplied for unsupported durations.
10. Dumpster rental days are calculated as elapsed days between delivery and pickup. Minimum billing rules remain to be confirmed.

## 4. Initial Verification Plan

- Test catalog loading and product details.
- Test registration, login, and protected routes.
- Test customer and administrator permissions.
- Test valid and invalid booking requests.
- Test customer cancellation rules.
- Test overlapping bookings and inventory approval.
- Test final charge calculations and pricing snapshots.
- Test AI recommendations against the actual catalog.
- Test responsive layouts and error states.
- Verify the deployed application and connected database.

## 5. Progress Tracking

All requirements begin as **Not started**. A requirement may be marked **Implemented** only after its code exists, and **Verified** only after the relevant test or check has passed.

| Status      | Meaning                                            |
| ----------- | -------------------------------------------------- |
| Not started | Work has not begun.                                |
| In progress | Implementation is underway.                        |
| Implemented | Code has been written but may not be fully tested. |
| Verified    | Acceptance criteria have been tested and passed.   |
| Blocked     | Progress depends on an unresolved issue.           |

Verification evidence and unresolved decisions will be recorded in the development journal.

## 6. Outstanding Decisions

- Confirm minimum billable dumpster rental duration.
- Confirm uncertain dumpster weight and waste-acceptance policies.
- Select an AI provider after checking API access.
- Select hosting and deployment services.
- Define and execute the final automated testing strategy.

These decisions must not be silently replaced with assumptions.
