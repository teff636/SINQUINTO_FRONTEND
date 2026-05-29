import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { provideRouter } from '@angular/router';
import { authGuard } from './auth.guard';

const runGuard = (route: Partial<ActivatedRouteSnapshot> = {}): boolean | any => {
  return TestBed.runInInjectionContext(() => {
    return authGuard(route as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
  });
};

describe('authGuard', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should redirect to /login when no user in localStorage', () => {
    localStorage.clear();
    const navigateSpy = vi.spyOn(router, 'navigate');
    const result = runGuard({});
    expect(result).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should return true when user exists and no role required', () => {
    localStorage.setItem('usuario', JSON.stringify({ role: 'CUSTOMER' }));
    const result = runGuard({ data: {} });
    expect(result).toBe(true);
  });

  it('should return true when user role matches expected role (CUSTOMER → Cliente)', () => {
    localStorage.setItem('usuario', JSON.stringify({ role: 'CUSTOMER' }));
    const result = runGuard({ data: { rol: 'Cliente' } });
    expect(result).toBe(true);
  });

  it('should return true when user role matches expected role (SALESPERSON → Vendedor)', () => {
    localStorage.setItem('usuario', JSON.stringify({ role: 'SALESPERSON' }));
    const result = runGuard({ data: { rol: 'Vendedor' } });
    expect(result).toBe(true);
  });

  it('should redirect to /acceso-denegado when role does not match', () => {
    localStorage.setItem('usuario', JSON.stringify({ role: 'CUSTOMER' }));
    const navigateSpy = vi.spyOn(router, 'navigate');
    const result = runGuard({ data: { rol: 'Vendedor' } });
    expect(result).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/acceso-denegado']);
  });

  it('should return true when user has no data property on route', () => {
    localStorage.setItem('usuario', JSON.stringify({ role: 'CUSTOMER' }));
    const result = runGuard({});
    expect(result).toBe(true);
  });
});
