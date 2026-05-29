import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { SolicitudesVendedorComponent, Solicitud } from './solicitudes-vendedor';
import { AuthService, Notificacion } from '../../../core/services/auth.service';
import { NotificationUiService } from '../../../core/services/notification-ui.service';
import { VendorNavigationService } from '../../../core/services/vendor-navigation.service';

describe('SolicitudesVendedorComponent', () => {
  let component: SolicitudesVendedorComponent;
  let fixture: ComponentFixture<SolicitudesVendedorComponent>;
  let authMock: any;
  let notifMock: any;
  let vendorNavMock: any;

  const mockUser = { userId: 5, email: 'v@v.com' };
  const pendiente: Solicitud = { appointmentId: 1, serviceOfferId: 2, serviceTitle: 'S', customerName: 'C', customerEmail: 'c@c.com', date: '2025-01-01', price: 100, status: 'PENDING' };
  const aceptada: Solicitud = { ...pendiente, appointmentId: 2, status: 'ACCEPTED' };
  const rechazada: Solicitud = { ...pendiente, appointmentId: 3, status: 'REJECTED' };

  beforeEach(async () => {
    authMock = {
      getUsuarioLocal: vi.fn(() => mockUser),
      obtenerSolicitudesVendedor: vi.fn(() => of([pendiente, aceptada, rechazada])),
      actualizarEstadoSolicitud: vi.fn(() => of({}))
    };
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
      imports: [SolicitudesVendedorComponent],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: NotificationUiService, useValue: notifMock },
        { provide: VendorNavigationService, useValue: vendorNavMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitudesVendedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads solicitudes on init and filters PENDING/ACCEPTED', () => {
    expect(component.solicitudes.length).toBe(2);
    expect(component.todasSolicitudes.length).toBe(3);
  });

  it('pendientes counts PENDING', () => {
    expect(component.pendientes).toBe(1);
  });

  it('aceptadas counts ACCEPTED', () => {
    expect(component.aceptadas).toBe(1);
  });

  it('rechazadas counts REJECTED', () => {
    expect(component.rechazadas).toBe(1);
  });

  it('ngOnDestroy stops polling', () => {
    component.ngOnDestroy();
    expect(notifMock.detenerPolling).toHaveBeenCalled();
  });

  it('aceptar updates status to ACCEPTED', () => {
    component.aceptar(pendiente);
    expect(authMock.actualizarEstadoSolicitud).toHaveBeenCalledWith(1, 'ACCEPTED');
    expect(pendiente.status).toBe('ACCEPTED');
  });

  it('rechazar updates status to REJECTED', () => {
    component.rechazar(pendiente);
    expect(authMock.actualizarEstadoSolicitud).toHaveBeenCalledWith(1, 'REJECTED');
    expect(pendiente.status).toBe('REJECTED');
  });

  it('marcarPendiente updates status to PENDING', () => {
    component.marcarPendiente(aceptada);
    expect(authMock.actualizarEstadoSolicitud).toHaveBeenCalledWith(2, 'PENDING');
    expect(aceptada.status).toBe('PENDING');
  });

  it('finalizar updates status to COMPLETED', () => {
    component.finalizar(aceptada);
    expect(authMock.actualizarEstadoSolicitud).toHaveBeenCalledWith(2, 'COMPLETED');
    expect(aceptada.status).toBe('COMPLETED');
  });

  it('estadoTexto maps PENDING to Pendiente', () => {
    expect(component.estadoTexto('PENDING')).toBe('Pendiente');
  });

  it('estadoTexto maps ACCEPTED to Aceptada', () => {
    expect(component.estadoTexto('ACCEPTED')).toBe('Aceptada');
  });

  it('estadoTexto maps REJECTED to Rechazada', () => {
    expect(component.estadoTexto('REJECTED')).toBe('Rechazada');
  });

  it('estadoTexto maps COMPLETED to Completada', () => {
    expect(component.estadoTexto('COMPLETED')).toBe('Completada');
  });

  it('estadoTexto returns unknown status as-is', () => {
    expect(component.estadoTexto('UNKNOWN')).toBe('UNKNOWN');
  });

  it('inicialCliente returns uppercase initials', () => {
    expect(component.inicialCliente('Maria')).toBe('MA');
  });

  it('esFechaHabilitable returns false for future date', () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    expect(component.esFechaHabilitable(future.toISOString())).toBe(false);
  });

  it('esFechaHabilitable returns true for past date', () => {
    expect(component.esFechaHabilitable('2020-01-01')).toBe(true);
  });

  it('esFechaHabilitable returns false for empty string', () => {
    expect(component.esFechaHabilitable('')).toBe(false);
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

  it('irInicio delegates to vendorNav', () => {
    component.irInicio();
    expect(vendorNavMock.irInicio).toHaveBeenCalled();
  });

  it('irSolicitudes delegates to vendorNav', () => {
    component.irSolicitudes();
    expect(vendorNavMock.irSolicitudes).toHaveBeenCalled();
  });

  it('manejarNotificacion delegates to vendorNav', () => {
    const notif: Notificacion = { id: 1, userId: 1, type: 'APPOINTMENT_REQUESTED', title: 'T', message: 'M', read: false };
    component.manejarNotificacion(notif);
    expect(vendorNavMock.manejarNotificacion).toHaveBeenCalled();
  });

  it('marcarTodasLeidas delegates to vendorNav', () => {
    component.marcarTodasLeidas();
    expect(vendorNavMock.marcarTodasLeidas).toHaveBeenCalled();
  });

  it('cargarSolicitudes handles error', () => {
    authMock.obtenerSolicitudesVendedor.mockReturnValue(throwError(() => new Error('fail')));
    component.cargarSolicitudes(5);
    expect(component.cargando).toBe(false);
  });
});


