import {Routes} from '@angular/router';
import {TabsPage} from './tabs.page';
import {authGuard} from "../../guards/auth.guard";

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'map',
        loadComponent: () =>
          import('../map/map.page').then((m) => m.MapPage),
      },
      {
        path: 'schedule',
        loadComponent: () =>
          import('../schedule/schedule.page').then((m) => m.SchedulePage),
        canActivate: [authGuard]
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('../profile/profile.page').then((m) => m.ProfilePage),
        canActivate: [authGuard]
      },
    ],
  },
  {
    path: '*',
    redirectTo: '/tabs/map',
    pathMatch: 'full',
  },
];
