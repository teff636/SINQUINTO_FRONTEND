import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { ClienteComponent } from './pages/login/cliente/cliente';
import { VendedorComponent } from './pages/login/vendedor/vendedor';
import { authGuard } from './core/guards/auth.guard';
import { RegisterUsuarioComponent } from './pages/login/register-usuario/register-usuario';

export const routes: Routes = [
  { path: '', redirectTo:"login", pathMatch: 'full' },
  { path: 'login',component: LoginComponent },
  { path: 'cliente', component: ClienteComponent, canActivate: [authGuard] },
  { path: 'vendedor', component: VendedorComponent, canActivate: [authGuard] }
];