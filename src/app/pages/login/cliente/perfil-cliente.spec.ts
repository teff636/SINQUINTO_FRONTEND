import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { PerfilClienteComponent } from './perfil-cliente';
import { AuthService, Notificacion } from '../../../core/services/auth.service';
import { NotificationUiService } from '../../../core/services/notification-ui.service';
import { ClientNavigationService } from '../../../core/services/client-navigation.service';

describe('PerfilClienteComponent', () => {
  let component: PerfilClienteComponent;
  let fixture: ComponentFixture<PerfilClienteComponent>;
  let authMock: any;
  let routerMock: any;
  let notifMock: any;
  let clientNavMock: any;

  const mockUser = { userId: 1, email: 'p@p.com', name: 'Pedro', lastName: 'Lopez', phoneNumber: '3001' };

  beforeEach(async () => {
    authMock = {
      getUsuarioLocal: vi.fn(() => mockUser),
      getUsuarioPorId: vi.fn(() => of(mockUser)),
      actualizarUsuario: vi.fn(() => of({})),
      guardarSesion: vi.fn()
    };
    routerMock = { navigate: vi.fn() };
    notifMock = {
      iniciarPolling: vi.fn(), detenerPolling: vi.fn(),
      count: 0, notificaciones: [],
      marcarLeida: vi.fn((_n: any, cb?: () => void) => { if (cb) cb(); }),
      marcarTodas: vi.fn()
    };
    clientNavMock = {
      manejarNotificacion: vi.fn((_n: any, cerrar: () => void) => cerrar())
    };

    localStorage.setItem('usuario', JSON.stringify(mockUser));

    await TestBed.configureTestingModule({
      imports: [PerfilClienteComponent],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
        { provide: NotificationUiService, useValue: notifMock },
        { provide: ClientNavigationService, useValue: clientNavMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => { localStorage.clear(); });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('cargarUsuario loads from getUsuarioLocal', () => {
    expect(component.correo).toBe('p@p.com');
    expect(component.nombreCompleto).toBe('Pedro');
  });

  it('ngOnDestroy stops polling', () => {
    component.ngOnDestroy();
    expect(notifMock.detenerPolling).toHaveBeenCalled();
  });

  it('obtenerIniciales returns initials from nombre and apellido', () => {
    component.nombreCompleto = 'Pedro';
    component.apellido = 'Lopez';
    expect(component.obtenerIniciales()).toBe('PL');
  });

  it('obtenerIniciales falls back to email when no name', () => {
    component.nombreCompleto = '';
    component.apellido = '';
    component.correo = 'test@test.com';
    expect(component.obtenerIniciales()).toBe('TE');
  });

  it('obtenerIniciales returns CL when nothing available', () => {
    component.nombreCompleto = '';
    component.apellido = '';
    component.correo = '';
    expect(component.obtenerIniciales()).toBe('CL');
  });

  it('nombreMostrado returns full name', () => {
    component.nombreCompleto = 'Pedro';
    component.apellido = 'Lopez';
    expect(component.nombreMostrado).toBe('Pedro Lopez');
  });

  it('activarEdicion sets modoEdicion to true', () => {
    component.activarEdicion();
    expect(component.modoEdicion).toBe(true);
  });

  it('cancelarEdicion restores original values', () => {
    component.nombreOriginal = 'Original';
    component.nombreCompleto = 'Changed';
    component.cancelarEdicion();
    expect(component.nombreCompleto).toBe('Original');
    expect(component.modoEdicion).toBe(false);
  });

  it('pedirContrasena shows error when nombre is empty', () => {
    component.nombreCompleto = '';
    component.pedirContrasena();
    expect(component.mensajeError).toContain('nombre');
  });

  it('pedirContrasena shows error when apellido is empty', () => {
    component.nombreCompleto = 'P';
    component.apellido = '';
    component.pedirContrasena();
    expect(component.mensajeError).toContain('apellido');
  });

  it('pedirContrasena shows error when correo is empty', () => {
    component.nombreCompleto = 'P';
    component.apellido = 'L';
    component.correo = '';
    component.pedirContrasena();
    expect(component.mensajeError).toContain('correo');
  });

  it('pedirContrasena opens modal when all fields valid', () => {
    component.nombreCompleto = 'Pedro';
    component.apellido = 'Lopez';
    component.correo = 'p@p.com';
    component.pedirContrasena();
    expect(component.mostrarModalContrasena).toBe(true);
  });

  it('confirmarYGuardar shows error when password is empty', () => {
    component.contrasenaConfirmacion = '';
    component.confirmarYGuardar();
    expect(component.errorContrasena).toContain('contraseña');
  });

  it('confirmarYGuardar calls guardarCambios when password provided', () => {
    component.contrasenaConfirmacion = 'pass123';
    component.guardarCambios = vi.fn();
    component.confirmarYGuardar();
    expect(component.guardarCambios).toHaveBeenCalled();
  });

  it('guardarCambios calls actualizarUsuario', () => {
    component.guardarCambios();
    expect(authMock.actualizarUsuario).toHaveBeenCalled();
  });

  it('guardarCambios shows success message', () => {
    component.guardarCambios();
    expect(component.mensajeExito).toContain('actualizado');
  });

  it('guardarCambios handles error and shows local save message', () => {
    authMock.actualizarUsuario.mockReturnValue(throwError(() => new Error('fail')));
    component.guardarCambios();
    expect(component.mensajeExito).toContain('localmente');
  });

  it('cancelarContrasena closes modal', () => {
    component.mostrarModalContrasena = true;
    component.cancelarContrasena();
    expect(component.mostrarModalContrasena).toBe(false);
  });

  it('cerrarSesion clears localStorage and navigates to /login', () => {
    localStorage.setItem('token', 'tok');
    component.cerrarSesion();
    expect(localStorage.getItem('token')).toBeNull();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('cargarUsuario redirects to /login when no user', () => {
    authMock.getUsuarioLocal.mockReturnValue(null);
    component.cargarUsuario();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('irInicio navigates to /cliente', () => {
    component.irInicio();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cliente']);
  });

  it('irGuardados navigates to /guardados-cliente', () => {
    component.irGuardados();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/guardados-cliente']);
  });

  it('toggleNotif toggles notifAbierta', () => {
    component.toggleNotif();
    expect(component.notifAbierta).toBe(true);
  });

  it('marcarTodasLeidas calls marcarTodas', () => {
    component.marcarTodasLeidas();
    expect(notifMock.marcarTodas).toHaveBeenCalledWith(1);
  });

  it('manejarNotificacion delegates to clientNav', () => {
    const notif: Notificacion = { id: 1, userId: 1, type: 'APPOINTMENT_COMPLETED', title: 'T', message: 'M', read: false };
    component.manejarNotificacion(notif);
    expect(clientNavMock.manejarNotificacion).toHaveBeenCalled();
  });

  it('irEstado navigates to /estado-cliente', () => {
    component.irEstado();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/estado-cliente']);
  });

  it('cerrarNotif closes panel', () => {
    component.notifAbierta = true;
    component.cerrarNotif();
    expect(component.notifAbierta).toBe(false);
  });

  it('cargarUsuario triggers getUsuarioPorId when name or phone missing', () => {
    authMock.getUsuarioLocal.mockReturnValue({ userId: 2, email: 'x@x.com', name: '' });
    component.cargarUsuario();
    expect(authMock.getUsuarioPorId).toHaveBeenCalledWith(2);
  });

  it('obtenerIniciales returns first two chars of nombre when no apellido', () => {
    component.nombreCompleto = 'Ana';
    component.apellido = '';
    expect(component.obtenerIniciales()).toBe('AN');
  });

  it('cargarMetricasLocales loads totalGuardados from localStorage', () => {
    localStorage.setItem('servicios_guardados_cliente', JSON.stringify([{}, {}]));
    component.cargarMetricasLocales();
    expect(component.totalGuardados).toBe(2);
  });

  it('cargarMetricasLocales handles invalid guardados JSON', () => {
    localStorage.setItem('servicios_guardados_cliente', 'invalid-json');
    component.cargarMetricasLocales();
    expect(component.totalGuardados).toBe(0);
  });

  it('cargarMetricasLocales handles invalid solicitudes JSON', () => {
    localStorage.setItem('solicitudes_cliente', 'invalid-json');
    component.cargarMetricasLocales();
    expect(component.totalSolicitudes).toBe(0);
  });
});


