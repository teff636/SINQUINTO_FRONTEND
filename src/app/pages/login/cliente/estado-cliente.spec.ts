import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { EstadoClienteComponent } from './estado-cliente';
import { AuthService, Notificacion } from '../../../core/services/auth.service';
import { NotificationUiService } from '../../../core/services/notification-ui.service';
import { ClientNavigationService } from '../../../core/services/client-navigation.service';

describe('EstadoClienteComponent', () => {
  let component: EstadoClienteComponent;
  let fixture: ComponentFixture<EstadoClienteComponent>;
  let authMock: any;
  let routerMock: any;
  let notifMock: any;
  let clientNavMock: any;

  const mockUser = { userId: 1, email: 'cl@cl.com' };
  const mockSolicitud = {
    appointmentId: 1, serviceOfferId: 2, serviceTitle: 'S', sellerName: 'V',
    category: 'Tech', date: '2025-01-01', price: 100, status: 'PENDING'
  };

  beforeEach(async () => {
    authMock = {
      getUsuarioLocal: vi.fn(() => mockUser),
      obtenerSolicitudesCliente: vi.fn(() => of([mockSolicitud]))
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
      imports: [EstadoClienteComponent],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
        { provide: NotificationUiService, useValue: notifMock },
        { provide: ClientNavigationService, useValue: clientNavMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EstadoClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => { localStorage.clear(); });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads iniciales from localStorage email', () => {
    expect(component.iniciales).toBe('CL');
  });

  it('loads solicitudes on init', () => {
    expect(component.solicitudes.length).toBe(1);
    expect(component.cargando).toBe(false);
  });

  it('ngOnDestroy stops polling', () => {
    component.ngOnDestroy();
    expect(notifMock.detenerPolling).toHaveBeenCalled();
  });

  it('get pendientes counts PENDING status', () => {
    expect(component.pendientes).toBe(1);
  });

  it('get aceptadas counts ACCEPTED status', () => {
    component.solicitudes = [{ ...mockSolicitud, status: 'ACCEPTED' }];
    expect(component.aceptadas).toBe(1);
  });

  it('get finalizadas counts COMPLETED status', () => {
    component.solicitudes = [{ ...mockSolicitud, status: 'COMPLETED' }];
    expect(component.finalizadas).toBe(1);
  });

  it('solicitudesFiltradas TODAS returns all non-completed', () => {
    component.filtroActivo = 'TODAS';
    expect(component.solicitudesFiltradas.length).toBe(1);
  });

  it('solicitudesFiltradas filters by PENDING', () => {
    component.filtroActivo = 'PENDING';
    expect(component.solicitudesFiltradas.length).toBe(1);
  });

  it('solicitudesFiltradas filters out non-matching', () => {
    component.filtroActivo = 'REJECTED';
    expect(component.solicitudesFiltradas.length).toBe(0);
  });

  it('cambiarFiltro updates filtroActivo', () => {
    component.cambiarFiltro('ACCEPTED');
    expect(component.filtroActivo).toBe('ACCEPTED');
  });

  it('estadoLabel maps PENDING correctly', () => {
    expect(component.estadoLabel('PENDING')).toBe('Pendiente');
  });

  it('estadoLabel maps ACCEPTED correctly', () => {
    expect(component.estadoLabel('ACCEPTED')).toBe('Aceptada');
  });

  it('estadoLabel maps REJECTED correctly', () => {
    expect(component.estadoLabel('REJECTED')).toBe('Rechazada');
  });

  it('estadoLabel returns unknown status as-is', () => {
    expect(component.estadoLabel('UNKNOWN')).toBe('UNKNOWN');
  });

  it('estadoDescripcion returns description for known status', () => {
    expect(component.estadoDescripcion('PENDING')).toContain('Esperando');
  });

  it('estadoDescripcion returns empty for unknown status', () => {
    expect(component.estadoDescripcion('UNKNOWN')).toBe('');
  });

  it('irInicio navigates to /cliente', () => {
    component.irInicio();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cliente']);
  });

  it('irPerfil navigates to /perfil-cliente', () => {
    component.irPerfil();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/perfil-cliente']);
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

  it('manejarNotificacion ACCEPTED delegates to clientNav', () => {
    const notif: Notificacion = { id: 1, userId: 1, type: 'APPOINTMENT_ACCEPTED', title: 'T', message: 'M', read: false };
    component.manejarNotificacion(notif);
    expect(clientNavMock.manejarNotificacion).toHaveBeenCalled();
  });

  it('manejarNotificacion COMPLETED delegates to clientNav', () => {
    const notif: Notificacion = { id: 1, userId: 1, type: 'APPOINTMENT_COMPLETED', title: 'T', message: 'M', read: false };
    component.manejarNotificacion(notif);
    expect(clientNavMock.manejarNotificacion).toHaveBeenCalled();
  });

  it('cargarSolicitudes redirects to /login when no user', () => {
    authMock.getUsuarioLocal.mockReturnValue(null);
    component.cargarSolicitudes();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('cargarSolicitudes handles error gracefully', () => {
    authMock.obtenerSolicitudesCliente.mockReturnValue(throwError(() => new Error('fail')));
    component.cargarSolicitudes();
    expect(component.cargando).toBe(false);
  });

  it('cargarIniciales sets CL when localStorage is missing', () => {
    localStorage.removeItem('usuario');
    component.cargarIniciales();
    expect(component.iniciales).toBe('CL');
  });

  it('cargarIniciales sets CL when JSON is invalid', () => {
    localStorage.setItem('usuario', 'not-json');
    component.cargarIniciales();
    expect(component.iniciales).toBe('CL');
  });

  it('cargarSolicitudes sets cargando=false when userId is missing', () => {
    authMock.getUsuarioLocal.mockReturnValue({ email: 'x@x.com' });
    component.cargarSolicitudes();
    expect(component.cargando).toBe(false);
  });

  it('manejarNotificacion delegates to clientNav', () => {
    const notif: Notificacion = { id: 1, userId: 1, type: 'APPOINTMENT_ACCEPTED', title: 'T', message: 'M', read: false };
    component.manejarNotificacion(notif);
    expect(clientNavMock.manejarNotificacion).toHaveBeenCalled();
  });

  it('marcarTodasLeidas calls notifService.marcarTodas', () => {
    component.marcarTodasLeidas();
    expect(notifMock.marcarTodas).toHaveBeenCalledWith(1);
  });

  it('volverCliente navigates to /cliente', () => {
    component.volverCliente();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cliente']);
  });

  it('irGuardados navigates to /guardados-cliente', () => {
    component.irGuardados();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/guardados-cliente']);
  });

  it('irHistorial navigates to /historial-cliente', () => {
    component.irHistorial();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/historial-cliente']);
  });

  it('solicitudesFiltradas ACCEPTED includes CONFIRMED too', () => {
    component.solicitudes = [{ ...mockSolicitud, status: 'CONFIRMED' }];
    component.filtroActivo = 'ACCEPTED';
    expect(component.solicitudesFiltradas.length).toBe(1);
  });

  it('estadoLabel maps COMPLETED correctly', () => {
    expect(component.estadoLabel('COMPLETED')).toBe('Completada');
  });

  it('estadoLabel maps CONFIRMED correctly', () => {
    expect(component.estadoLabel('CONFIRMED')).toBe('Confirmada');
  });

  it('estadoLabel maps CANCELLED correctly', () => {
    expect(component.estadoLabel('CANCELLED')).toBe('Cancelada');
  });

  it('estadoDescripcion returns description for ACCEPTED', () => {
    expect(component.estadoDescripcion('ACCEPTED')).toContain('aceptó');
  });

  it('estadoDescripcion returns description for REJECTED', () => {
    expect(component.estadoDescripcion('REJECTED')).toContain('no pudo');
  });

  it('estadoDescripcion returns description for COMPLETED', () => {
    expect(component.estadoDescripcion('COMPLETED')).toContain('finalizado');
  });
});



