import { Routes } from '@angular/router';

const coldTrackShell = () => import('./views/coldtrack-shell/coldtrack-shell').then(m => m.ColdtrackShell);
const baseTitle = 'ColdTrack';

export const coldtrackRoutes: Routes = [
  { path: 'home', loadComponent: coldTrackShell, title: `${baseTitle} - Home` },
];
