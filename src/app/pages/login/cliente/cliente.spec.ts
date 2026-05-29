import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ClienteComponent } from './cliente';
import { AuthService, Notificacion } from '../../../core/services/auth.service';
import { NotificationUiService } from '../../../core/services/notification-ui.service';
import { ClientNavigationService } from '../../../core/services/client-navigation.service';

describe('ClienteComponent', () => {
  let component: ClienteComponent;
  let fixture: ComponentFixture<ClienteComponent>;
  let authMock: any;
  let routerMock: any;
  let notifMock: any;
  let clientNavMock: any;

  const mockUser = { userId: 1, email: 'test@test.com', name: 'Test' };
  const mockServicio = {
    serviceOfferId: 1, sellerId: 2, photo: '', title: 'Servicio Tech',
    description: 'Desc', category: 'TecnologÃ­a', price: 100, estimatedDuration: 60
  };

  beforeEach(async () => {
    authMock = {
      getUsuarioLocal: vi.fn(() => mockUser),
      getServicios: vi.fn(() => of([mockServicio])),
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
    localStorage.setItem('servicios_guardados_cliente', JSON.stringify([mockServicio]));

    await TestBed.configureTestingModule({
      imports: [ClienteComponent],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
        { provide: NotificationUiService, useValue: notifMock },
        { provide: ClientNavigationService, useValue: clientNavMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit starts polling', () => {
    expect(notifMock.iniciarPolling).toHaveBeenCalledWith(1);
  });

  it('ngOnInit loads services', () => {
    expect(component.servicios.length).toBe(1);
  });

  it('ngOnDestroy stops polling', () => {
    component.ngOnDestroy();
    expect(notifMock.detenerPolling).toHaveBeenCalled();
  });

  it('iniciales set from email', () => {
    expect(component.iniciales).toBe('TE');
  });

  it('guardados loaded from localStorage', () => {
    expect(component.guardados.length).toBe(1);
  });

  it('filtrarCategoria updates categoriaActiva', () => {
    component.filtrarCategoria('TecnologÃ­a');
    expect(component.categoriaActiva).toBe('TecnologÃ­a');
  });

  it('filtrarCategoria Todos shows all services', () => {
    component.filtrarCategoria('Todos');
    expect(component.serviciosFiltrados.length).toBe(1);
  });

  it('filtrarCategoria filters by category', () => {
    component.filtrarCategoria('DiseÃ±o');
    expect(component.serviciosFiltrados.length).toBe(0);
  });

  it('buscar applies search filter', () => {
    component.busqueda = 'tech';
    component.buscar();
    expect(component.serviciosFiltrados.length).toBe(1);
  });

  it('buscar filters out non-matching', () => {
    component.busqueda = 'xyz123notfound';
    component.buscar();
    expect(component.serviciosFiltrados.length).toBe(0);
  });

  it('toggleGuardado adds service if not saved', () => {
    const newServicio = { ...mockServicio, serviceOfferId: 99 };
    const prevLen = component.guardados.length;
    component.toggleGuardado(newServicio);
    expect(component.guardados.length).toBe(prevLen + 1);
  });

  it('toggleGuardado removes service if already saved', () => {
    component.guardados = [mockServicio];
    component.toggleGuardado(mockServicio);
    expect(component.guardados.length).toBe(0);
  });

  it('estaGuardado returns true for saved service', () => {
    component.guardados = [mockServicio];
    expect(component.estaGuardado(mockServicio)).toBe(true);
  });

  it('estaGuardado returns false for unsaved service', () => {
    component.guardados = [];
    expect(component.estaGuardado(mockServicio)).toBe(false);
  });

  it('verServicio navigates to /ver-servicio', () => {
    component.verServicio(mockServicio);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/ver-servicio'], expect.anything());
  });

  it('irInicio navigates to /cliente', () => {
    component.irInicio();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cliente']);
  });

  it('irGuardados navigates to /guardados-cliente', () => {
    component.irGuardados();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/guardados-cliente']);
  });

  it('irEstado navigates to /estado-cliente', () => {
    component.irEstado();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/estado-cliente']);
  });

  it('irHistorial navigates to /historial-cliente', () => {
    component.irHistorial();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/historial-cliente']);
  });

  it('irPerfil navigates to /perfil-cliente', () => {
    component.irPerfil();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/perfil-cliente']);
  });

  it('toggleNotif toggles notifAbierta', () => {
    component.notifAbierta = false;
    component.toggleNotif();
    expect(component.notifAbierta).toBe(true);
    component.toggleNotif();
    expect(component.notifAbierta).toBe(false);
  });

  it('cerrarNotif sets notifAbierta to false', () => {
    component.notifAbierta = true;
    component.cerrarNotif();
    expect(component.notifAbierta).toBe(false);
  });

  it('manejarNotificacion delegates to clientNav', () => {
    const notif: Notificacion = { id: 1, userId: 1, type: 'APPOINTMENT_ACCEPTED', title: 'T', message: 'M', read: false };
    component.manejarNotificacion(notif);
    expect(clientNavMock.manejarNotificacion).toHaveBeenCalled();
  });

  it('manejarNotificacion ACCEPTED closes panel', () => {
    const notif: Notificacion = { id: 1, userId: 1, type: 'APPOINTMENT_ACCEPTED', title: 'T', message: 'M', read: false };
    component.notifAbierta = true;
    component.manejarNotificacion(notif);
    expect(component.notifAbierta).toBe(false);
  });

  it('manejarNotificacion COMPLETED closes panel', () => {
    const notif: Notificacion = { id: 2, userId: 1, type: 'APPOINTMENT_COMPLETED', title: 'T', message: 'M', read: false };
    component.notifAbierta = true;
    component.manejarNotificacion(notif);
    expect(component.notifAbierta).toBe(false);
  });

  it('marcarTodasLeidas calls marcarTodas with userId', () => {
    component.marcarTodasLeidas();
    expect(notifMock.marcarTodas).toHaveBeenCalledWith(1);
  });

  it('cargarServicios handles error gracefully', () => {
    authMock.getServicios.mockReturnValue(throwError(() => new Error('fail')));
    component.cargarServicios();
    expect(component.servicios.length).toBe(0);
  });

  it('initiales fall back to CL when no user', () => {
    authMock.getUsuarioLocal.mockReturnValue(null);
    localStorage.removeItem('usuario');
    (component as any).cargarUsuario();
    expect(component.iniciales).toBe('CL');
  });
});


