# ColdTrack Front

ColdTrack Front is an Angular 21 web application for monitoring cold-chain shipments. It supports shipment registration, sensor management, active alerts, shipment history, authentication, and runtime language switching between English and Spanish.

The application uses TypeScript, Angular Material, HttpClient, Angular Signals for state management, and `@ngx-translate/core` with `@ngx-translate/http-loader` for i18n. Its frontend architecture follows Entity, Request/Response, Resource, Assembler, and Store patterns.

## Author

Developed by the HackRats team.

## Requirements

- Node.js compatible with Angular 21
- npm

## Production URLs

- Frontend: https://coldtrack-front-open.web.app
- Backend API: https://freshguard-coldtrack-api.onrender.com/api/v1
- Backend Swagger UI: https://freshguard-coldtrack-api.onrender.com/swagger-ui/index.html
- OpenAPI JSON: https://freshguard-coldtrack-api.onrender.com/v3/api-docs

## Running the Project

Install dependencies:

```bash
npm install
```

Start the Angular application:

```bash
npm start
```

Open the app at `http://localhost:4200`.

## Demo Account

- Email: `test@test.com`
- Password: `password`

The application connects to the deployed ColdTrack API at `https://freshguard-coldtrack-api.onrender.com/api/v1`. Demo data is provided by its MySQL database.

> Render free-tier services may take several seconds to wake up after inactivity. If the dashboard does not load immediately, use the retry action displayed by the application.

## Final Review Flow

Use the following path to validate the integrated frontend and backend:

1. Sign in with the demo account or create a new account.
2. Open the dashboard and confirm that shipments, alerts, and metrics load from the backend.
3. Register a new shipment from **New Shipment**.
4. Register a sensor from **Sensors**.
5. Link an available sensor to a registered or in-transit shipment.
6. Add a telemetry reading for the assigned sensor.
7. Review generated alerts when temperature or humidity thresholds are exceeded.
8. Open shipment details and move the shipment from registered to in transit, then to completed.
9. Export shipment, alert, or history reports as CSV.

## Project Structure

- `src/app/iam/domain/model`: authentication user model.
- `src/app/iam/application`: authentication state services.
- `src/app/iam/infrastructure`: JWT session persistence and HTTP authentication interceptor.
- `src/app/coldtrack/domain/model`: shipment, sensor, and alert entities.
- `src/app/coldtrack/application`: signal-based operational store.
- `src/app/coldtrack/infrastructure`: request/response DTOs, API resource, and assemblers.
- `src/app/coldtrack/presentation`: feature routes and Angular Material views.
- `public/i18n`: English and Spanish translation files.

## Project Setup Notes

Documentation updated by Mathias Augusto Arechaga Saavedra to clarify the project setup workflow.

## Internationalization

ColdTrack includes English and Spanish translations through the public i18n files, allowing the interface to switch languages at runtime.

## Deployment

The Firebase Hosting configuration is stored in `firebase.json`. The production build is generated with:

```bash
npm run build
```

The Firebase deploy target is configured in `.firebaserc` as `coldtrack-front-open`.

## Git Flow

The project uses `main` as the stable branch and `develop` as the integration branch for team contributions. New work should be created from `develop` using feature branches, and completed changes should be merged back into `develop` through pull requests.

Recommended release flow:

```text
develop -> feature/<scope> -> develop -> main -> tag/release
```
