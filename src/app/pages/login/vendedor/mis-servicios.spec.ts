import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MisServiciosComponent, Servicio } from './mis-servicios';
import { AuthService, Notificacion } from '../../../core/services/auth.service';
import { NotificationUiService } from '../../../core/services/notification-ui.service';
import { VendorNavigationService } from '../../../core/services/vendor-navigation.service';

describe('MisServiciosComponent', () => {
  let component: MisServiciosComponent;
  let fixture: ComponentFixture<MisServiciosComponent>;
  let authMock: any;
  let notifMock: any;
  let vendorNavMock: any;

  const mockUser = { userId: 5, email: 'v@v.com' };
  const mockServicio: Servicio = { serviceOfferId: 1, photo: '', title: 'Servicio A', category: 'Tech', price: 100, description: 'Desc' };

  beforeEach(async () => {
    authMock = {
      getUsuarioLocal: vi.fn(() => mockUser),
      getServiciosPorVendedor: vi.fn(() => of([mockServicio])),
      eliminarServicio: vi.fn(() => of({}))
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
      imports: [MisServiciosComponent],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: NotificationUiService, useValue: notifMock },
        { provide: VendorNavigationService, useValue: vendorNavMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MisServiciosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads servicios on init', () => {
    expect(component.servicios.length).toBe(1);
  });

  it('ngOnDestroy stops polling', () => {
    component.ngOnDestroy();
    expect(notifMock.detenerPolling).toHaveBeenCalled();
  });

  it('eliminar removes service after confirm', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    component.servicios = [mockServicio];
    component.eliminar(mockServicio);
    expect(authMock.eliminarServicio).toHaveBeenCalledWith(1);
    expect(component.servicios.length).toBe(0);
  });

  it('eliminar does not remove when confirm is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.servicios = [mockServicio];
    component.eliminar(mockServicio);
    expect(authMock.eliminarServicio).not.toHaveBeenCalled();
    expect(component.servicios.length).toBe(1);
  });

  it('abrirFormulario shows form', () => {
    component.abrirFormulario();
    expect(component.mostrarFormulario).toBe(true);
  });

  it('onServicioPublicado closes form and reloads', () => {
    component.mostrarFormulario = true;
    component.onServicioPublicado();
    expect(component.mostrarFormulario).toBe(false);
    expect(authMock.getServiciosPorVendedor).toHaveBeenCalled();
  });

  it('cerrarFormulario closes form and reloads', () => {
    component.mostrarFormulario = true;
    component.cerrarFormulario();
    expect(component.mostrarFormulario).toBe(false);
  });

  it('formatearPrecio formats number with locale', () => {
    const result = component.formatearPrecio(1000);
    expect(result).toContain('1');
  });

  it('obtenerIdServicio formats service ID', () => {
    expect(component.obtenerIdServicio(mockServicio)).toBe('#SERV-001');
  });

  it('irSolicitudes delegates to vendorNav', () => {
    component.irSolicitudes();
    expect(vendorNavMock.irSolicitudes).toHaveBeenCalled();
  });

  it('irHistorial delegates to vendorNav', () => {
    component.irHistorial();
    expect(vendorNavMock.irHistorial).toHaveBeenCalled();
  });

  it('irPerfil delegates to vendorNav', () => {
    component.irPerfil();
    expect(vendorNavMock.irPerfil).toHaveBeenCalled();
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

  it('marcarTodasLeidas delegates to vendorNav', () => {
    component.marcarTodasLeidas();
    expect(vendorNavMock.marcarTodasLeidas).toHaveBeenCalled();
  });

  it('cargarServicios redirects to /login when no user', () => {
    authMock.getUsuarioLocal.mockReturnValue(null);
    const router = TestBed.inject(Router) as any;
    component.cargarServicios();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});


