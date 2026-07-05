# ParkFinder Issues (New Categorized List)

This document categorizes completely new issues into Medium, Intermediate, Hard, and Advanced levels. Each category contains 10 issues distinct from the original list.

## Medium

1. **Issue no:** #201
   **Issue name:** Add "Clear All Filters" button on search page
   **Issue description:** Allow users to reset all active search filters (price, distance, rating) with a single click to easily start a new search.

2. **Issue no:** #202
   **Issue name:** Implement password strength meter on registration form
   **Issue description:** Provide visual feedback (red/yellow/green bar) on password complexity during account creation to encourage secure passwords.

3. **Issue no:** #203
   **Issue name:** Add "Copy to Clipboard" for parking lot address
   **Issue description:** Add an icon next to the parking lot address that allows users to easily copy the exact text to paste into other navigation apps.

4. **Issue no:** #204
   **Issue name:** Fix overlapping text in footer on tablet devices
   **Issue description:** Resolve CSS flexbox issues that cause footer links to overlap or break out of their container on 768px wide screens.

5. **Issue no:** #205
   **Issue name:** Add character countdown for user review text area
   **Issue description:** Display remaining characters for the 500-character limit on the review submission form, updating dynamically as the user types.

6. **Issue no:** #206
   **Issue name:** Create custom 404 Not Found page
   **Issue description:** Replace the default browser 404 page with a branded, styled page featuring navigation links to guide users back home.

7. **Issue no:** #207
   **Issue name:** Implement breadcrumb navigation for user settings
   **Issue description:** Add a breadcrumb trail (e.g., Home > Profile > Security) to improve user orientation and navigation within the dashboard.

8. **Issue no:** #208
   **Issue name:** Add skeleton loaders for parking lot images
   **Issue description:** Display placeholder skeleton animations while high-resolution parking lot images are fetching from the network.

9. **Issue no:** #209
   **Issue name:** Standardize button hover states across the application
   **Issue description:** Ensure all primary and secondary buttons have consistent CSS transition effects (opacity, color shift) on hover.

10. **Issue no:** #210
    **Issue name:** Implement "Show/Hide Password" toggle
    **Issue description:** Add an eye icon toggle inside password input fields to let users temporarily view their entered text on login and signup screens.

---

## Intermediate

1. **Issue no:** #211
   **Issue name:** Add "Favorite Parking Lots" functionality
   **Issue description:** Allow users to bookmark frequently used parking lots for quick access later from a dedicated "Favorites" page.

2. **Issue no:** #212
   **Issue name:** Implement a "Contact Support" form with email integration
   **Issue description:** Create a form that sends user inquiries directly to the support team's inbox using Nodemailer.

3. **Issue no:** #213
   **Issue name:** Add PDF download option for booking receipts
   **Issue description:** Generate and allow users to download a formatted PDF receipt (including tax details) for completed parking sessions.

4. **Issue no:** #214
   **Issue name:** Implement user session timeout and auto-logout
   **Issue description:** Automatically log out users and redirect them to the login screen after 30 minutes of inactivity for security purposes.

5. **Issue no:** #215
   **Issue name:** Add multilingual support (i18n) for English and Spanish
   **Issue description:** Integrate a localization library (like react-i18next) to allow users to switch the entire interface language.

6. **Issue no:** #216
   **Issue name:** Create an interactive "How it Works" onboarding carousel
   **Issue description:** Build a dismissable UI tour for first-time users explaining the booking process, scanning, and checkout.

7. **Issue no:** #217
   **Issue name:** Implement two-factor authentication (2FA) via email
   **Issue description:** Require users to enter a one-time 6-digit passcode sent to their email when logging in from a new, unrecognized device.

8. **Issue no:** #218
   **Issue name:** Add graphical charts for user booking history
   **Issue description:** Use a charting library (e.g., Recharts) to display a bar chart of the user's parking expenses over the last 6 months.

9. **Issue no:** #219
   **Issue name:** Implement soft-delete for user reviews
   **Issue description:** Allow users to delete their reviews, hiding them from the public UI but retaining them in the database for administrative moderation.

10. **Issue no:** #220
    **Issue name:** Add "Pull to Refresh" functionality on mobile web
    **Issue description:** Implement touch-based pull-to-refresh for the parking lot search results list to easily fetch updated availability on mobile devices.

---

## Hard

1. **Issue no:** #221
   **Issue name:** Implement WebSockets for live parking spot availability updates
   **Issue description:** Replace HTTP polling with a WebSocket connection to push availability and pricing changes instantly to connected clients.

2. **Issue no:** #222
   **Issue name:** Integrate Elasticsearch for advanced spatial search
   **Issue description:** Replace standard MongoDB queries with an Elasticsearch cluster to handle complex, high-speed, radius-based text and location searches.

3. **Issue no:** #223
   **Issue name:** Build a comprehensive admin dashboard with data grid
   **Issue description:** Create a robust data table for administrators featuring server-side filtering, multi-column sorting, and bulk actions for managing users.

4. **Issue no:** #224
   **Issue name:** Implement a referral program system
   **Issue description:** Build the backend logic and database schema to track unique referral codes, monitor user signups, and distribute wallet credit rewards.

5. **Issue no:** #225
   **Issue name:** Migrate file uploads to AWS S3
   **Issue description:** Refactor the current local image upload system to stream user avatars and parking lot photos securely directly to an Amazon S3 bucket.

6. **Issue no:** #226
   **Issue name:** Implement dynamic surge pricing algorithm
   **Issue description:** Create a background cron job that analyzes current lot occupancy and automatically adjusts hourly rates based on predefined demand thresholds.

7. **Issue no:** #227
   **Issue name:** Build an automated data anonymization script for GDPR compliance
   **Issue description:** Create a secure, scheduled process that strips Personally Identifiable Information (PII) from the database when exporting logs for external analytics.

8. **Issue no:** #228
   **Issue name:** Implement OAuth2 provider functionality
   **Issue description:** Turn the application into an identity provider, allowing third-party applications to authenticate users via a "Login with ParkFinder" flow.

9. **Issue no:** #229
   **Issue name:** Add offline support with Service Workers
   **Issue description:** Configure PWA features and caching strategies so users can view their active booking details and QR codes even without an internet connection.

10. **Issue no:** #230
    **Issue name:** Refactor Monolithic Express App to use Clean Architecture
    **Issue description:** Major restructuring of the `server` directory to separate concerns into Domain, Application, Infrastructure, and Presentation layers.

---

## Advanced

1. **Issue no:** #231
   **Issue name:** Integrate a Voice UI (VUI) for hands-free parking search
   **Issue description:** Implement Web Speech API speech-to-text, allowing users to search for parking using natural language voice commands while driving.

2. **Issue no:** #232
   **Issue name:** Deploy a federated GraphQL API over existing REST endpoints
   **Issue description:** Create an Apollo GraphQL gateway that aggregates data from the existing REST services to optimize payloads for mobile clients.

3. **Issue no:** #233
   **Issue name:** Implement Blockchain-based immutable audit logs
   **Issue description:** Store critical security events (like admin logins and permission changes) on a lightweight private blockchain or distributed ledger to prevent tampering.

4. **Issue no:** #234
   **Issue name:** Build an AI chatbot for customer support using LLMs
   **Issue description:** Integrate an advanced conversational AI (using an API like OpenAI) to handle common customer inquiries, booking modifications, and basic troubleshooting automatically.

5. **Issue no:** #235
   **Issue name:** Implement a distributed tracing system with OpenTelemetry
   **Issue description:** Set up comprehensive request tracing across the frontend, API, and database to pinpoint performance bottlenecks and generate service dependency maps.

6. **Issue no:** #236
   **Issue name:** Create an automated chaos engineering testing suite
   **Issue description:** Develop scripts that randomly terminate server instances and drop database connections in a staging environment to ensure system resilience and recovery.

7. **Issue no:** #237
   **Issue name:** Implement a custom WebGL indoor routing map
   **Issue description:** Build a visually rich 3D routing engine using Three.js that visually guides users from the garage entrance directly to their reserved spot on their mobile device.

8. **Issue no:** #238
   **Issue name:** Design and deploy a Kubernetes-based auto-scaling infrastructure
   **Issue description:** Containerize the application and write Helm charts to automatically scale pods horizontally based on real-time CPU/Memory usage metrics.

9. **Issue no:** #239
   **Issue name:** Implement predictive maintenance alerts for parking sensors
   **Issue description:** Use statistical modeling to analyze IoT hardware sensor data streams and alert maintenance staff when a sensor is exhibiting degradation patterns before it fails.

10. **Issue no:** #240
    **Issue name:** Build a real-time event-sourcing architecture with Apache Kafka
    **Issue description:** Refactor the core booking and payment engine to use an event-driven architecture, treating all state changes as an append-only sequence of immutable events.
