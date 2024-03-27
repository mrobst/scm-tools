import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'import-ev3',
    loadComponent: () =>
      import('./import-ev3/import-ev3.component').then(
        (m) => m.ImportEv3Component
      ),
  },
];
