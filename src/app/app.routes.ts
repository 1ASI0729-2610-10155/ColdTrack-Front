import { Routes } from '@angular/router';
import { coldtrackRoutes } from './coldtrack/presentation/coldtrack.routes';

export const routes: Routes = [
  ...coldtrackRoutes,
  { path: '' , redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' },
];
