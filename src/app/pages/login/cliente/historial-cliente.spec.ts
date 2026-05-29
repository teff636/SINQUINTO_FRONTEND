import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { HistorialClienteComponent } from './historial-cliente';
import { AuthService, Notificacion } from '../../../core/services/auth.service';
import { NotificationUiService } from '../../../core/services/notification-ui.service';

describe('HistorialClienteComponent', () => {
  let component: HistorialClienteComponent;
  let fixture: ComponentFixture<HistorialClienteComponent>;
  let authMock: any;
  let routerMock: any;
  let notifMock: any;

  const mockUser = { userId: 1, email: 'h@h.com' };
  const mockItem = {
    appointmentId: 1, serviceOfferId: 2, serviceTitle: 'S', sellerName: 'V',
    category: 'Tech', date: '2025-01-01', price: 100, status: 'COMPLETED', hasRating: false
  };

  beforeEach(async () => {
    authMock = {
      getUsuarioLocal: vi.fn(() => mockUser),
      obtenerHistorialCliente: vi.fn(() => of([mockItem])),
      obtenerSolicitudesCliente: vi.fn(() => of([mockItem])),
      crearCalificacion: vi.fn(() => of({}))
    };
    routerMock = { navigate: vi.fn() };
    notifMock = {
      iniciarPolling: vi.fn(), detenerPolling: vi.fn(),
      count: 0, notificaciones: [],
      marcarLeida: vi.fn((_n: any, cb?: () => void) => { if (cb) cb(); }),
      marcarTodas: vi.fn()
    };

    localStorage.setItem('usuario', JSON.stringify(mockUser));

    await TestBed.configureTestingModule({
      imports: [HistorialClienteComponent],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
        { provide: NotificationUiService, useValue: notifMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HistorialClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => { localStorage.clear(); });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads historial on init', () => {
    expect(component.historial.length).toBe(1);
    expect(component.cargando).toBe(false);
  });

  it('ngOnDestroy stops polling', () => {
    component.ngOnDestroy();
    expect(notifMock.detenerPolling).toHaveBeenCalled();
  });

  it('abrirModal sets solicitudActual and shows modal', () => {
    component.abrirModal(mockItem);
    expect(component.mostrarModal).toBe(true);
    expect(component.solicitudActual).toBe(mockItem);
    expect(component.calificacion).toBe(0);
  });

  it('cerrarModal hides modal and clears solicitudActual', () => {
    component.abrirModal(mockItem);
    component.cerrarModal();
    expect(component.mostrarModal).toBe(false);
    expect(component.solicitudActual).toBeNull();
  });

  it('seleccionarEstrella sets calificacion', () => {
    component.seleccionarEstrella(4);
    expect(component.calificacion).toBe(4);
  });

  it('enviarResena shows error when calificacion is 0', () => {
    component.abrirModal(mockItem);
    component.calificacion = 0;
    component.enviarResena();
    expect(component.mensajeError).toContain('calificación');
  });

  it('enviarResena submits rating successfully', () => {
    component.abrirModal(mockItem);
    component.calificacion = 5;
    component.comentario = 'Excellent!';
    component.enviarResena();
    expect(authMock.crearCalificacion).toHaveBeenCalled();
    expect(component.mensajeExito).toContain('Reseña enviada');
  });

  it('enviarResena handles error', () => {
    authMock.crearCalificacion.mockReturnValue(throwError(() => new Error('fail')));
    component.abrirModal(mockItem);
    component.calificacion = 3;
    component.enviarResena();
    expect(component.mensajeError).toContain('Error');
  });

  it('volverASolicitar navigates to /ver-servicio', () => {
    component.volverASolicitar(mockItem);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/ver-servicio'], expect.anything());
  });

  it('irInicio navigates to /cliente', () => {
    component.irInicio();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cliente']);
  });

  it('toggleNotif toggles notifAbierta', () => {
    component.toggleNotif();
    expect(component.notifAbierta).toBe(true);
  });

  it('cargarHistorial falls back to obtenerSolicitudesCliente on error', () => {
    authMock.obtenerHistorialCliente.mockReturnValue(throwError(() => new Error('fail')));
    component.cargarHistorial();
    expect(authMock.obtenerSolicitudesCliente).toHaveBeenCalled();
  });

  it('cargarHistorial redirects to /login when no user', () => {
    authMock.getUsuarioLocal.mockReturnValue(null);
    component.cargarHistorial();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('manejarNotificacion COMPLETED opens modal for unrated item', () => {
    component.historial = [{ ...mockItem, hasRating: false }];
    const notif: Notificacion = { id: 1, userId: 1, type: 'APPOINTMENT_COMPLETED', title: 'T', message: 'M', read: false, appointmentId: 1 };
    component.manejarNotificacion(notif);
    expect(component.mostrarModal).toBe(true);
  });

  it('manejarNotificacion ACCEPTED navigates to /estado-cliente', () => {
    const notif: Notificacion = { id: 1, userId: 1, type: 'APPOINTMENT_ACCEPTED', title: 'T', message: 'M', read: false };
    component.manejarNotificacion(notif);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/estado-cliente']);
  });
});



