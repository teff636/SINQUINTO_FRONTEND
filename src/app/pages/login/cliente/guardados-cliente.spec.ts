import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GuardadosClienteComponent, ServicioGuardado } from './guardados-cliente';
import { AuthService, Notificacion } from '../../../core/services/auth.service';
import { NotificationUiService } from '../../../core/services/notification-ui.service';
import { ClientNavigationService } from '../../../core/services/client-navigation.service';

describe('GuardadosClienteComponent', () => {
  let component: GuardadosClienteComponent;
  let fixture: ComponentFixture<GuardadosClienteComponent>;
  let authMock: any;
  let routerMock: any;
  let notifMock: any;
  let clientNavMock: any;

  const mockUser = { userId: 1, email: 'u@u.com' };
  const mockServicio: ServicioGuardado = {
    serviceOfferId: 10, sellerId: 2, photo: '', title: 'Servicio',
    description: 'D', category: 'Hogar', price: 50, estimatedDuration: 30
  };

  beforeEach(async () => {
    authMock = { getUsuarioLocal: vi.fn(() => mockUser) };
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
    localStorage.setItem('servicios_guardados_cliente', JSON.stringify([mockServicio]));

    await TestBed.configureTestingModule({
      imports: [GuardadosClienteComponent],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
        { provide: NotificationUiService, useValue: notifMock },
        { provide: ClientNavigationService, useValue: clientNavMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GuardadosClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => { localStorage.clear(); });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads guardados from localStorage', () => {
    expect(component.guardados.length).toBe(1);
  });

  it('loads iniciales from email', () => {
    expect(component.iniciales).toBe('U@');
  });

  it('iniciales falls back to CL when no usuario', () => {
    localStorage.removeItem('usuario');
    component.cargarIniciales();
    expect(component.iniciales).toBe('CL');
  });

  it('ngOnDestroy stops polling', () => {
    component.ngOnDestroy();
    expect(notifMock.detenerPolling).toHaveBeenCalled();
  });

  it('quitarGuardado removes service and updates localStorage', () => {
    component.guardados = [mockServicio];
    component.quitarGuardado(mockServicio);
    expect(component.guardados.length).toBe(0);
    const stored = JSON.parse(localStorage.getItem('servicios_guardados_cliente')!);
    expect(stored.length).toBe(0);
  });

  it('verServicio navigates to /ver-servicio', () => {
    component.verServicio(mockServicio);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/ver-servicio'], expect.anything());
  });

  it('irInicio navigates to /cliente', () => {
    component.irInicio();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cliente']);
  });

  it('irEstado navigates to /estado-cliente', () => {
    component.irEstado();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/estado-cliente']);
  });

  it('irHistorial navigates to /historial-cliente', () => {
    component.irHistorial();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/historial-cliente']);
  });

  it('toggleNotif toggles notifAbierta', () => {
    component.toggleNotif();
    expect(component.notifAbierta).toBe(true);
  });

  it('cerrarNotif closes notification panel', () => {
    component.notifAbierta = true;
    component.cerrarNotif();
    expect(component.notifAbierta).toBe(false);
  });

  it('manejarNotificacion REJECTED delegates to clientNav', () => {
    const notif: Notificacion = { id: 1, userId: 1, type: 'APPOINTMENT_REJECTED', title: 'T', message: 'M', read: false };
    component.manejarNotificacion(notif);
    expect(clientNavMock.manejarNotificacion).toHaveBeenCalled();
  });

  it('marcarTodasLeidas calls marcarTodas', () => {
    component.marcarTodasLeidas();
    expect(notifMock.marcarTodas).toHaveBeenCalledWith(1);
  });

  it('cargarGuardados handles empty localStorage', () => {
    localStorage.removeItem('servicios_guardados_cliente');
    component.cargarGuardados();
    expect(component.guardados).toEqual([]);
  });

  it('cargarGuardados handles invalid JSON gracefully', () => {
    localStorage.setItem('servicios_guardados_cliente', 'invalid-json');
    component.cargarGuardados();
    expect(component.guardados).toEqual([]);
  });

  it('cargarIniciales handles invalid JSON gracefully', () => {
    localStorage.setItem('usuario', 'not-json');
    component.cargarIniciales();
    expect(component.iniciales).toBe('CL');
  });

  it('manejarNotificacion COMPLETED delegates to clientNav', () => {
    const notif: Notificacion = { id: 1, userId: 1, type: 'APPOINTMENT_COMPLETED', title: 'T', message: 'M', read: false };
    component.manejarNotificacion(notif);
    expect(clientNavMock.manejarNotificacion).toHaveBeenCalled();
  });

  it('irPerfil navigates to /perfil-cliente', () => {
    component.irPerfil();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/perfil-cliente']);
  });

  it('volverCliente navigates to /cliente', () => {
    component.volverCliente();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cliente']);
  });
});


