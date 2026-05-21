import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { ClienteComponent } from './pages/login/cliente/cliente';
import { VendedorComponent } from './pages/login/vendedor/vendedor';
import { PerfilVendedorComponent } from './pages/login/vendedor/perfil-vendedor';
import { MisServiciosComponent } from './pages/login/vendedor/mis-servicios';
import { SolicitudesVendedorComponent } from './pages/login/vendedor/solicitudes-vendedor';
import { AccesoDenegadoComponent } from './pages/acceso-denegado/acceso-denegado';
import { RegisterUsuarioComponent } from './pages/login/register-usuario/register-usuario';
import { PublicarServicioComponent } from './pages/login/vendedor/publicar-servicio';
import { VerServicioComponent } from './pages/login/cliente/ver-servicio';
import { EstadoClienteComponent } from './pages/login/cliente/estado-cliente';
import { LogsComponent } from './pages/logs/logs';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register-usuario', component: RegisterUsuarioComponent },
  { path: 'logs', component: LogsComponent },

  {
    path: 'cliente',
    component: ClienteComponent,
    canActivate: [authGuard],
    data: { rol: 'Cliente' }
  },

  {
    path: 'ver-servicio',
    component: VerServicioComponent,
    canActivate: [authGuard],
    data: { rol: 'Cliente' }
  },

  {
    path: 'estado-cliente',
    component: EstadoClienteComponent,
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
    path: 'solicitudes-vendedor',
    component: SolicitudesVendedorComponent,
    canActivate: [authGuard],
    data: { rol: 'Vendedor' }
  },

  {
    path: 'publicar-servicio',
    component: PublicarServicioComponent,
    canActivate: [authGuard],
    data: { rol: 'Vendedor' }
  },

  {
    path: 'acceso-denegado',
    component: AccesoDenegadoComponent
  }
];
