import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { HistorialVendedorComponent } from './historial-vendedor';
import { AuthService, Notificacion } from '../../../core/services/auth.service';
import { NotificationUiService } from '../../../core/services/notification-ui.service';
import { VendorNavigationService } from '../../../core/services/vendor-navigation.service';

describe('HistorialVendedorComponent', () => {
  let component: HistorialVendedorComponent;
  let fixture: ComponentFixture<HistorialVendedorComponent>;
  let authMock: any;
  let notifMock: any;
  let vendorNavMock: any;

  const mockUser = { userId: 5, email: 'v@v.com' };
  const mockSolicitud = {
    appointmentId: 1, serviceOfferId: 2, serviceTitle: 'S', customerName: 'C',
    customerEmail: 'c@c.com', date: '2025-01-01', price: 200, status: 'COMPLETED'
  };

  beforeEach(async () => {
    authMock = {
      getUsuarioLocal: vi.fn(() => mockUser),
      obtenerSolicitudesVendedor: vi.fn(() => of([mockSolicitud, { ...mockSolicitud, status: 'PENDING', appointmentId: 2 }]))
    };
    notifMock = {
      iniciarPolling: vi.fn(), detenerPolling: vi.fn(),
      count: 2, notificaciones: [],
      marcarLeida: vi.fn(), marcarTodas: vi.fn()
    };
    vendorNavMock = {
      irInicio: vi.fn(), irMisServicios: vi.fn(), irSolicitudes: vi.fn(),
      irHistorial: vi.fn(), irPerfil: vi.fn(),
      marcarTodasLeidas: vi.fn(),
      manejarNotificacion: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [HistorialVendedorComponent],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: NotificationUiService, useValue: notifMock },
        { provide: VendorNavigationService, useValue: vendorNavMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HistorialVendedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filters COMPLETED items in historial', () => {
    expect(component.historial.length).toBe(1);
    expect(component.historial[0].status).toBe('COMPLETED');
  });

  it('sets cargando to false after loading', () => {
    expect(component.cargando).toBe(false);
  });

  it('ngOnDestroy stops polling', () => {
    component.ngOnDestroy();
    expect(notifMock.detenerPolling).toHaveBeenCalled();
  });

  it('notifCount getter returns notifService.count', () => {
    expect(component.notifCount).toBe(2);
  });

  it('inicialCliente returns uppercase substring', () => {
    expect(component.inicialCliente('Carlos')).toBe('CA');
  });

  it('inicialCliente falls back to CL for empty string', () => {
    expect(component.inicialCliente('')).toBe('CL');
  });

  it('manejarNotificacion delegates to vendorNav', () => {
    const notif: Notificacion = { id: 1, userId: 1, type: 'APPOINTMENT_REQUESTED', title: 'T', message: 'M', read: false };
    component.manejarNotificacion(notif);
    expect(vendorNavMock.manejarNotificacion).toHaveBeenCalledWith(notif, expect.any(Function));
  });

  it('marcarTodasLeidas delegates to vendorNav', () => {
    component.marcarTodasLeidas();
    expect(vendorNavMock.marcarTodasLeidas).toHaveBeenCalled();
  });

  it('toggleNotif toggles notifAbierta', () => {
    component.toggleNotif();
    expect(component.notifAbierta).toBe(true);
    component.toggleNotif();
    expect(component.notifAbierta).toBe(false);
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

  it('irMisServicios delegates to vendorNav', () => {
    component.irMisServicios();
    expect(vendorNavMock.irMisServicios).toHaveBeenCalled();
  });

  it('irSolicitudes delegates to vendorNav', () => {
    component.irSolicitudes();
    expect(vendorNavMock.irSolicitudes).toHaveBeenCalled();
  });

  it('irPerfil delegates to vendorNav', () => {
    component.irPerfil();
    expect(vendorNavMock.irPerfil).toHaveBeenCalled();
  });

  it('cargarHistorial handles error gracefully', () => {
    authMock.obtenerSolicitudesVendedor.mockReturnValue(throwError(() => new Error('fail')));
    component.cargarHistorial(5);
    expect(component.historial).toEqual([]);
    expect(component.cargando).toBe(false);
  });

  it('redirects to /login when no user on init', () => {
    authMock.getUsuarioLocal.mockReturnValue(null);
    const routerMockInj = TestBed.inject(Router) as any;
    component.ngOnInit();
    expect(routerMockInj.navigate).toHaveBeenCalledWith(['/login']);
  });
});


