import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login';
import { ClienteComponent } from './pages/login/cliente/cliente';
import { VendedorComponent } from './pages/login/vendedor/vendedor';
import { PerfilVendedorComponent } from './pages/login/vendedor/perfil-vendedor';
import { MisServiciosComponent } from './pages/login/vendedor/mis-servicios';
import { SolicitudesVendedorComponent } from './pages/login/vendedor/solicitudes-vendedor';
import { AccesoDenegadoComponent } from './pages/acceso-denegado/acceso-denegado';
import { RegisterUsuarioComponent } from './pages/login/register-usuario/register-usuario';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },

  { path: 'register-usuario', component: RegisterUsuarioComponent },
  {
    path: 'cliente',
    component: ClienteComponent,
    canActivate: [authGuard],
    data: { rol: 'Cliente' }
  },

  {
    path: 'vendedor',
    component: VendedorComponent,
    canActivate: [authGuard],
    data: { rol: 'Vendedor' }
  },

  {
    path: 'perfil-vendedor',
    component: PerfilVendedorComponent,
    canActivate: [authGuard],
    data: { rol: 'Vendedor' }
  },
  {
  path: 'mis-servicios',
  component: MisServiciosComponent,
  canActivate: [authGuard],
  data: { rol: 'Vendedor' }
},

  {
    path: 'acceso-denegado',
    component: AccesoDenegadoComponent
  },

  {
  path: 'solicitudes-vendedor',
  component: SolicitudesVendedorComponent,
  canActivate: [authGuard],
  data: { rol: 'Vendedor' }
},


];