import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // localStorage / sessionStorage methods
  it('guardarSesion stores token and usuario', () => {
    service.guardarSesion({ token: 'tok123', role: 'CUSTOMER', userId: 5 });
    expect(localStorage.getItem('token')).toBe('tok123');
    expect(JSON.parse(localStorage.getItem('usuario')!).userId).toBe(5);
  });

  it('cerrarSesion removes token and usuario', () => {
    localStorage.setItem('token', 'tok');
    localStorage.setItem('usuario', '{}');
    service.cerrarSesion();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('usuario')).toBeNull();
  });

  it('getUsuarioLocal returns null when nothing stored', () => {
    expect(service.getUsuarioLocal()).toBeNull();
  });

  it('getUsuarioLocal returns parsed user', () => {
    localStorage.setItem('usuario', JSON.stringify({ userId: 1, email: 'a@a.com' }));
    expect(service.getUsuarioLocal()?.userId).toBe(1);
  });

  it('getToken returns stored token', () => {
    localStorage.setItem('token', 'mytoken');
    expect(service.getToken()).toBe('mytoken');
  });

  it('getToken returns null when absent', () => {
    expect(service.getToken()).toBeNull();
  });

  it('guardarGooglePendiente stores in sessionStorage', () => {
    service.guardarGooglePendiente({ idToken: 'gt', email: 'g@g.com', name: 'G', lastName: 'X' });
    const stored = JSON.parse(sessionStorage.getItem('googlePendiente')!);
    expect(stored.idToken).toBe('gt');
  });

  it('getGooglePendiente returns null when absent', () => {
    expect(service.getGooglePendiente()).toBeNull();
  });

  it('getGooglePendiente returns stored data', () => {
    sessionStorage.setItem('googlePendiente', JSON.stringify({ idToken: 'x' }));
    expect(service.getGooglePendiente()?.idToken).toBe('x');
  });

  it('limpiarGooglePendiente removes item', () => {
    sessionStorage.setItem('googlePendiente', '{}');
    service.limpiarGooglePendiente();
    expect(sessionStorage.getItem('googlePendiente')).toBeNull();
  });

  // HTTP methods
  it('login POSTs to /auth/login', () => {
    service.login({ email: 'test@test.com', password: '123' }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/auth/login'));
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'abc', role: 'CUSTOMER', userId: 1 });
  });

  it('register POSTs to /auth/register', () => {
    service.register({ name: 'John' }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/auth/register'));
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('getUsuarios GETs /users', () => {
    service.getUsuarios().subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/users') && !r.url.includes('/users/'));
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getUsuarioPorId GETs /users/:id', () => {
    service.getUsuarioPorId(3).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/users/3'));
    req.flush({});
  });

  it('actualizarUsuario PUTs /users', () => {
    service.actualizarUsuario({ userId: 1 }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/users') && r.method === 'PUT');
    req.flush({});
  });

  it('getServicios GETs /service-offers', () => {
    service.getServicios().subscribe();
    const req = httpMock.expectOne(r => r.url.endsWith('/service-offers'));
    req.flush([]);
  });

  it('getServiciosPorVendedor GETs /service-offers/seller/:id', () => {
    service.getServiciosPorVendedor(2).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/service-offers/seller/2'));
    req.flush([]);
  });

  it('crearServicio POSTs /service-offers', () => {
    service.crearServicio({ title: 'Test' }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/service-offers') && r.method === 'POST');
    req.flush({});
  });

  it('actualizarServicio PUTs /service-offers/:id', () => {
    service.actualizarServicio(5, { title: 'Updated' }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/service-offers/5') && r.method === 'PUT');
    req.flush({});
  });

  it('eliminarServicio DELETEs /service-offers/:id', () => {
    service.eliminarServicio(5).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/service-offers/5') && r.method === 'DELETE');
    req.flush({});
  });

  it('getCategorias GETs /categories', () => {
    service.getCategorias().subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/categories'));
    req.flush([]);
  });

  it('getCitasPorServicio GETs appointments by service', () => {
    service.getCitasPorServicio(3).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/appointments/service-offer/3'));
    req.flush([]);
  });

  it('getCitasPorUsuario GETs appointments by user', () => {
    service.getCitasPorUsuario(1).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/appointments/user/1') && !r.url.includes('/details') && !r.url.includes('/historial'));
    req.flush([]);
  });

  it('crearCita POSTs to /appointments', () => {
    service.crearCita({ userId: 1 }).subscribe();
    const req = httpMock.expectOne(r => r.url.endsWith('/appointments') && r.method === 'POST');
    req.flush({});
  });

  it('actualizarCita PUTs /appointments/:id', () => {
    service.actualizarCita(10, { status: 'ACCEPTED' }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/appointments/10') && r.method === 'PUT');
    req.flush({});
  });

  it('getCalificacionesPorServicio GETs ratings', () => {
    service.getCalificacionesPorServicio(3).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/ratings/service-offer/3'));
    req.flush([]);
  });

  it('crearCalificacion POSTs rating', () => {
    service.crearCalificacion({ rating: 5 }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/ratings') && r.method === 'POST');
    req.flush({});
  });

  it('obtenerSolicitudesCliente GETs with /details', () => {
    service.obtenerSolicitudesCliente(1).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/details'));
    req.flush([]);
  });

  it('obtenerHistorialCliente GETs /historial', () => {
    service.obtenerHistorialCliente(1).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/historial'));
    req.flush([]);
  });

  it('obtenerSolicitudesVendedor GETs appointments by seller', () => {
    service.obtenerSolicitudesVendedor(2).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/appointments/seller/2'));
    req.flush([]);
  });

  it('actualizarEstadoSolicitud PATCHes with status', () => {
    service.actualizarEstadoSolicitud(10, 'ACCEPTED').subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/appointments/10/status'));
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'ACCEPTED' });
    req.flush({});
  });

  it('loginConGoogle POSTs with idToken', () => {
    service.loginConGoogle('gt123').subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/auth/google-login'));
    expect(req.request.body.idToken).toBe('gt123');
    req.flush({}, { status: 200, statusText: 'OK' });
  });

  it('registrarConGoogle POSTs to /auth/google-register', () => {
    service.registrarConGoogle({ idToken: 'x', role: 'CUSTOMER', name: 'N', lastName: 'L', phoneNumber: '123' }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/auth/google-register'));
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('getNotificacionesUsuario GETs notifications for user', () => {
    service.getNotificacionesUsuario(1).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/notifications/user/1') && !r.url.includes('/unread') && !r.url.includes('/read-all'));
    req.flush([]);
  });

  it('getNotificacionesNoLeidas GETs unread notifications', () => {
    service.getNotificacionesNoLeidas(1).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/unread'));
    req.flush([]);
  });

  it('marcarNotificacionLeida PATCHes notification read', () => {
    service.marcarNotificacionLeida(5).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/notifications/5/read'));
    expect(req.request.method).toBe('PATCH');
    req.flush({});
  });

  it('marcarTodasNotificacionesLeidas PATCHes read-all', () => {
    service.marcarTodasNotificacionesLeidas(1).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/read-all'));
    req.flush({});
  });
});
