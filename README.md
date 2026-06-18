# ColdTrack Front

ColdTrack Front is an Angular 21 web application for monitoring cold-chain shipments. It supports shipment registration, sensor management, active alerts, shipment history, authentication, and runtime language switching between English and Spanish.

The application uses TypeScript, Angular Material, HttpClient, Angular Signals for state management, and `@ngx-translate/core` with `@ngx-translate/http-loader` for i18n. Its frontend architecture follows Entity, Request/Response, Resource, Assembler, and Store patterns.

## Author

Developed by the HackRats team.

## Requirements

- Node.js compatible with Angular 21
- npm

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

## Git Flow

The project uses `main` as the stable branch and `develop` as the integration branch for team contributions. New work should be created from `develop` using feature branches, and completed changes should be merged back into `develop` through pull requests.
