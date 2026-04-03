// import { Routes } from '@angular/router';
// import { authGuard, publicGuard } from './guards/auth.guard';

// export const routes: Routes = [
//   {
//     path: 'auth',
//     children: [
//       {
//         path: 'login',
//         canActivate: [publicGuard],
//         loadComponent: () => import('./auth/auth.component').then(m => m.AuthComponent),
//       },
//       {
//         path: 'signup',
//         canActivate: [publicGuard],
//         loadComponent: () => import('./auth/auth.component').then(m => m.AuthComponent),
//       },
//       {
//         // Spring Boot successHandler redirects here: /auth/callback?token=...&email=...&name=...
//         path: 'callback',
//         loadComponent: () =>
//           import('./oauth/oauth.component')
//             .then(m => m.OAuthCallbackComponent),
//       },
//       { path: '', redirectTo: 'login', pathMatch: 'full' },
//     ],
//   },
// //   {
// //     path: 'dashboard',
// //     canActivate: [authGuard],
// //     loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
// //   },
// //   { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
// //   { path: '**', redirectTo: 'auth/login' },
// ];


import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './guards/auth.guard';

export const routes: Routes = [

  {
    path: 'auth',
    children: [
      {
        path: 'login',
        canActivate: [publicGuard],
        loadComponent: () =>
          import('./auth/auth.component').then(m => m.AuthComponent),
      },
      {
        path: 'signup',
        canActivate: [publicGuard],
        loadComponent: () =>
          import('./auth/auth.component').then(m => m.AuthComponent),
      },
      {
        path: 'callback',
        loadComponent: () =>
          import('./oauth/oauth.component')
            .then(m => m.OAuthCallbackComponent),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // ✅ ENABLE DASHBOARD
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/dashboard').then(m => m.Dashboard),
  },

  // ✅ ROOT REDIRECT (IMPORTANT)
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  // ✅ FALLBACK (IMPORTANT)
  { path: '**', redirectTo: 'auth/login' },
];