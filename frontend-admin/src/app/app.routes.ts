import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { MenuMgmtComponent } from './dashboard/menu-mgmt/menu-mgmt.component';
import { TablesComponent } from './dashboard/tables/tables.component';
import { PublicMenuComponent } from './public/menu/menu.component';
import { LiveOrdersComponent } from './dashboard/live-orders/live-orders.component';

export const routes: Routes = [
   { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [authGuard],
    children: [
    { path: 'menu', component: MenuMgmtComponent },
    {path : 'tables', component: TablesComponent },
    {path: 'orders',component:LiveOrdersComponent},
    { path: '', redirectTo: 'menu', pathMatch: 'full' } // Default dashboard view
  ]
  },
  { path: 'public-menu/:rid/:tid', component: PublicMenuComponent }, 
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
