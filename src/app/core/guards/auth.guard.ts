import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route) => {
  console.log('GUARD ACTIVADO');

  const router = inject(Router);

  const usuario = localStorage.getItem('usuario');

  if (!usuario) {
    router.navigate(['/login']);
    return false;
  }

  const user = JSON.parse(usuario);
  const rolUsuario = user.rol || user.Rol;
  const rolEsperado = route.data?.['rol'];

  if (rolEsperado && rolUsuario !== rolEsperado) {
    router.navigate(['/acceso-denegado']);
    return false;
  }

  return true;
};