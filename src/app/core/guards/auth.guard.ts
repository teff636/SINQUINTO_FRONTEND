import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route) => {

  const router = inject(Router);
  const usuarioStr = localStorage.getItem('usuario');

  if (!usuarioStr) {
    router.navigate(['/login']);
    return false;
  }

  const user = JSON.parse(usuarioStr);
  const rolEsperado = route.data?.['rol'];

  // Si no hay rol esperado en la ruta, dejar pasar
  if (!rolEsperado) return true;

  // Mapeo de roles Java a roles de rutas
  const rolMap: any = {
    'SALESPERSON': 'Vendedor',
    'CUSTOMER': 'Cliente'
  };

  const rolUsuario = rolMap[user.role] || user.role;

  if (rolUsuario !== rolEsperado) {
    router.navigate(['/acceso-denegado']);
    return false;
  }

  return true;
};