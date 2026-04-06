import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {

  const usuario = localStorage.getItem('usuario');

  if (usuario) {
    return true;
  }
// proteger rutas

  window.location.href = '/'; // redirige al login
  return false;
};