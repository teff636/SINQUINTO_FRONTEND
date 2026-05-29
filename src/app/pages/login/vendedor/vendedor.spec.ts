import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { VendedorComponent, Servicio } from './vendedor';
import { AuthService, Notificacion } from '../../../core/services/auth.service';
import { NotificationUiService } from '../../../core/services/notification-ui.service';

describe('VendedorComponent', () => {
  let component: VendedorComponent;
  let fixture: ComponentFixture<VendedorComponent>;
  let authMock: any;
  let routerMock: any;
  let notifMock: any;

  const mockUser = { userId: 5, email: 'v@vendor.com', name: 'Vendedor' };
  const mockServicio: Servicio = { serviceOfferId: 1, photo: '', title: 'Corte de cabello', category: 'Hogar', price: 50, description: 'Desc' };

  beforeEach(async () => {
    authMock = {
      getUsuarioLocal: vi.fn(() => mockUser),
      getServiciosPorVendedor: vi.fn(() => of([mockServicio])),
      obtenerSolicitudesVendedor: vi.fn(() => of([{ status: 'PENDING' }, { status: 'ACCEPTED' }, { status: 'COMPLETED' }])),
      getCalificacionesPorServicio: vi.fn(() => of([{ rating: 5 }]))
    };
    routerMock = { navigate: vi.fn() };
    notifMock = {
      iniciarPolling: vi.fn(), detenerPolling: vi.fn(),
      count: 1, notificaciones: [{ id: 1, type: 'APPOINTMENT_REQUESTED' }],
      marcarLeida: vi.fn((_n: any, cb?: () => void) => { if (cb) cb(); }),
      marcarTodas: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [VendedorComponent],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
        { provide: NotificationUiService, useValue: notifMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VendedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads servicios on init', () => {
    expect(component.servicios.length).toBe(1);
  });

  it('solicitudesActivas counts PENDING and ACCEPTED', () => {
    expect(component.solicitudesActivas).toBe(2);
  });

  it('totalServiciosPublicados returns services count', () => {
    expect(component.totalServiciosPublicados).toBe(1);
  });

  it('ratingPromedio returns formatted value when hayRatings', () => {
    expect(component.hayRatings).toBe(true);
    expect(component.ratingPromedio).toBe('5.0');
  });

  it('ratingPromedio returns dash when no ratings', () => {
    component.hayRatings = false;
    expect(component.ratingPromedio).toBe('–');
  });

  it('ngOnDestroy stops polling', () => {
    component.ngOnDestroy();
    expect(notifMock.detenerPolling).toHaveBeenCalled();
  });

  it('nombreVisible formats email as name', () => {
    component.nombreCompleto = 'vendedor@domain.com';
    expect(component.nombreVisible).toContain('Vendedor');
  });

  it('filtrarCategoria updates categoriaActiva', () => {
    component.filtrarCategoria('Hogar');
    expect(component.categoriaActiva).toBe('Hogar');
    expect(component.serviciosFiltrados.length).toBe(1);
  });

  it('filtrarCategoria Todos shows all', () => {
    component.filtrarCategoria('Todos');
    expect(component.serviciosFiltrados.length).toBe(1);
  });

  it('filtrarCategoria non-matching returns empty', () => {
    component.filtrarCategoria('Legal');
    expect(component.serviciosFiltrados.length).toBe(0);
  });

  it('buscarServicios filters by title', () => {
    const event = { target: { value: 'corte' } } as any;
    component.buscarServicios(event);
    expect(component.serviciosFiltrados.length).toBe(1);
  });

  it('buscarServicios returns empty when no match', () => {
    const event = { target: { value: 'xyz999' } } as any;
    component.buscarServicios(event);
    expect(component.serviciosFiltrados.length).toBe(0);
  });

  it('abrirFormulario shows form', () => {
    component.abrirFormulario();
    expect(component.mostrarFormulario).toBe(true);
  });

  it('cerrarFormulario hides form and reloads', () => {
    component.mostrarFormulario = true;
    component.cerrarFormulario();
    expect(component.mostrarFormulario).toBe(false);
  });

  it('onServicioPublicado hides form and reloads', () => {
    component.mostrarFormulario = true;
    component.onServicioPublicado();
    expect(component.mostrarFormulario).toBe(false);
  });

  it('getInicialesServicio returns uppercase initials from first two words', () => {
    expect(component.getInicialesServicio(mockServicio)).toBe('CD');
  });

  it('getCategoriaVisual returns category or General', () => {
    expect(component.getCategoriaVisual(mockServicio)).toBe('Hogar');
    expect(component.getCategoriaVisual({ ...mockServicio, category: '' })).toBe('General');
  });

  it('irInicio navigates to /vendedor', () => {
    component.irInicio();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/vendedor']);
  });

  it('irMisServicios navigates to /mis-servicios', () => {
    component.irMisServicios();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/mis-servicios']);
  });

  it('irSolicitudes navigates to /solicitudes-vendedor', () => {
    component.irSolicitudes();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/solicitudes-vendedor']);
  });

  it('irHistorial navigates to /historial-vendedor', () => {
    component.irHistorial();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/historial-vendedor']);
  });

  it('toggleNotif toggles panel', () => {
    component.toggleNotif();
    expect(component.notifAbierta).toBe(true);
  });

  it('cerrarNotif closes panel', () => {
    component.notifAbierta = true;
    component.cerrarNotif();
    expect(component.notifAbierta).toBe(false);
  });

  it('manejarNotificacion navigates to /solicitudes-vendedor on REQUESTED', () => {
    const notif: Notificacion = { id: 1, userId: 1, type: 'APPOINTMENT_REQUESTED', title: 'T', message: 'M', read: false };
    component.manejarNotificacion(notif);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/solicitudes-vendedor']);
  });

  it('marcarTodasLeidas calls notifService.marcarTodas', () => {
    component.marcarTodasLeidas();
    expect(notifMock.marcarTodas).toHaveBeenCalledWith(5);
  });

  it('cargarServicios handles error', () => {
    authMock.getServiciosPorVendedor.mockReturnValue(throwError(() => new Error('fail')));
    component.cargarServicios();
    expect(component.servicios.length).toBe(0);
  });
});


