import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { PerfilVendedorComponent } from './perfil-vendedor';
import { AuthService, Notificacion } from '../../../core/services/auth.service';
import { NotificationUiService } from '../../../core/services/notification-ui.service';
import { VendorNavigationService } from '../../../core/services/vendor-navigation.service';

describe('PerfilVendedorComponent', () => {
  let component: PerfilVendedorComponent;
  let fixture: ComponentFixture<PerfilVendedorComponent>;
  let authMock: any;
  let notifMock: any;
  let vendorNavMock: any;
  let routerMock: any;

  const mockUser = { userId: 5, email: 'v@v.com', role: 'SALESPERSON' };
  const mockServicio = { serviceOfferId: 1 };
  const mockRating = { rating: 4, score: 4 };

  beforeEach(async () => {
    authMock = {
      getUsuarioLocal: vi.fn(() => mockUser),
      getUsuarioPorId: vi.fn(() => of({ name: 'Vendedor', lastName: 'Test', email: 'v@v.com', phoneNumber: '123' })),
      getServiciosPorVendedor: vi.fn(() => of([mockServicio])),
      getCalificacionesPorServicio: vi.fn(() => of([mockRating])),
      actualizarUsuario: vi.fn(() => of({})),
      cerrarSesion: vi.fn(),
      login: vi.fn(() => of({}))
    };
    routerMock = { navigate: vi.fn() };
    notifMock = {
      iniciarPolling: vi.fn(), detenerPolling: vi.fn(),
      count: 0, notificaciones: [],
      marcarLeida: vi.fn(), marcarTodas: vi.fn()
    };
    vendorNavMock = {
      irInicio: vi.fn(), irMisServicios: vi.fn(), irSolicitudes: vi.fn(),
      irHistorial: vi.fn(), irPerfil: vi.fn(),
      marcarTodasLeidas: vi.fn(), manejarNotificacion: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [PerfilVendedorComponent],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
        { provide: NotificationUiService, useValue: notifMock },
        { provide: VendorNavigationService, useValue: vendorNavMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilVendedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads user data on init', () => {
    expect(component.nombreCompleto).toBe('Vendedor');
    expect(component.correo).toBe('v@v.com');
  });

  it('calculates totalServicios', () => {
    expect(component.totalServicios).toBe(1);
  });

  it('calculates ratingPromedio from services', () => {
    expect(component.hayRatings).toBe(true);
    expect(component.ratingPromedioCalc).toBe(4);
  });

  it('ratingPromedio getter returns formatted string', () => {
    expect(component.ratingPromedio).toBe('4.0');
  });

  it('ratingPromedio returns dash when no ratings', () => {
    component.hayRatings = false;
    expect(component.ratingPromedio).toBe('–');
  });

  it('ngOnDestroy stops polling', () => {
    component.ngOnDestroy();
    expect(notifMock.detenerPolling).toHaveBeenCalled();
  });

  it('iniciales getter returns uppercase from nombreCompleto', () => {
    component.nombreCompleto = 'Vendedor';
    expect(component.iniciales).toBe('VE');
  });

  it('nombreMostrado returns full name', () => {
    component.nombreCompleto = 'Vendedor';
    component.apellido = 'Test';
    expect(component.nombreMostrado).toBe('Vendedor Test');
  });

  it('activarEdicion sets modoEdicion', () => {
    component.activarEdicion();
    expect(component.modoEdicion).toBe(true);
  });

  it('cancelarEdicion resets to ngOnInit state', () => {
    component.modoEdicion = true;
    component.cancelarEdicion();
    expect(component.modoEdicion).toBe(false);
  });

  it('pedirContrasena opens modal', () => {
    component.pedirContrasena();
    expect(component.mostrarModalContrasena).toBe(true);
  });

  it('cancelarContrasena closes modal', () => {
    component.mostrarModalContrasena = true;
    component.cancelarContrasena();
    expect(component.mostrarModalContrasena).toBe(false);
  });

  it('confirmarYGuardar shows error when no password', () => {
    component.contrasenaConfirmacion = '';
    component.confirmarYGuardar();
    expect(component.errorContrasena).toBe('Ingresa tu contraseña');
  });

  it('confirmarYGuardar calls login with credentials on submit', () => {
    component.correo = 'v@v.com';
    component.contrasenaConfirmacion = 'pass';
    component.confirmarYGuardar();
    expect(authMock.login).toHaveBeenCalledWith({ email: 'v@v.com', password: 'pass' });
  });

  it('confirmarYGuardar shows error on wrong password', () => {
    component.correo = 'v@v.com';
    component.contrasenaConfirmacion = 'wrong';
    authMock.login.mockReturnValue(throwError(() => new Error('Unauthorized')));
    component.confirmarYGuardar();
    expect(component.errorContrasena).toBe('Contraseña incorrecta');
  });

  it('guardarCambios calls actualizarUsuario', () => {
    component.guardarCambios();
    expect(authMock.actualizarUsuario).toHaveBeenCalled();
  });

  it('guardarCambios shows success message', () => {
    component.guardarCambios();
    expect(component.mensajeExito).toContain('correctamente');
  });

  it('guardarCambios handles error', () => {
    authMock.actualizarUsuario.mockReturnValue(throwError(() => new Error('fail')));
    component.guardarCambios();
    expect(component.mensajeError).toContain('Error');
  });

  it('cerrarSesion calls cerrarSesion and navigates to /login', () => {
    component.cerrarSesion();
    expect(authMock.cerrarSesion).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('irInicio delegates to vendorNav', () => {
    component.irInicio();
    expect(vendorNavMock.irInicio).toHaveBeenCalled();
  });

  it('irSolicitudes delegates to vendorNav', () => {
    component.irSolicitudes();
    expect(vendorNavMock.irSolicitudes).toHaveBeenCalled();
  });

  it('toggleNotif toggles notifAbierta', () => {
    component.toggleNotif();
    expect(component.notifAbierta).toBe(true);
  });

  it('cerrarNotif closes panel', () => {
    component.notifAbierta = true;
    component.cerrarNotif();
    expect(component.notifAbierta).toBe(false);
  });

  it('manejarNotificacion delegates to vendorNav', () => {
    const notif: Notificacion = { id: 1, userId: 1, type: 'APPOINTMENT_REQUESTED', title: 'T', message: 'M', read: false };
    component.manejarNotificacion(notif);
    expect(vendorNavMock.manejarNotificacion).toHaveBeenCalled();
  });

  it('redirects to /login when no user on init', () => {
    authMock.getUsuarioLocal.mockReturnValue(null);
    component.ngOnInit();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});


