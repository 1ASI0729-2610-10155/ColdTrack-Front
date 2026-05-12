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

Start the fake API:

```bash
npm run api
```

Start the Angular application in another terminal:

```bash
npm start
```

Open the app at `http://localhost:4200`.

## Demo Account

- Email: `test@test.com`
- Password: `password`

New accounts and new shipments are posted to the fake API served from `server/db.js` during the running session.

## Project Structure

- `src/app/iam/domain/model`: authentication user model.
- `src/app/iam/application`: authentication state services.
- `src/app/coldtrack/domain/model`: shipment, sensor, and alert entities.
- `src/app/coldtrack/application`: signal-based operational store.
- `src/app/coldtrack/infrastructure`: request/response DTOs, API resource, and assemblers.
- `src/app/coldtrack/presentation`: feature routes and Angular Material views.
- `public/i18n`: English and Spanish translation files.
- `server/db.js`: fake API seed data.
n## Fake 
APIn
The project uses a local json-server API to provide demo users, shipments, sensors, and alerts during development.
