import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { NotificationUiService } from './notification-ui.service';
import { AuthService, Notificacion } from './auth.service';

const mockNotif: Notificacion = {
  id: 1, userId: 10, type: 'APPOINTMENT_ACCEPTED', title: 'T', message: 'M', read: false
};

describe('NotificationUiService', () => {
  let service: NotificationUiService;
  let authMock: any;

  beforeEach(() => {
    authMock = {
      getNotificacionesNoLeidas: vi.fn(() => of([])),
      marcarNotificacionLeida: vi.fn(() => of(mockNotif)),
      marcarTodasNotificacionesLeidas: vi.fn(() => of({})),
    };

    TestBed.configureTestingModule({
      providers: [NotificationUiService, { provide: AuthService, useValue: authMock }]
    });
    service = TestBed.inject(NotificationUiService);
  });

  afterEach(() => {
    service.detenerPolling();
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('starts with empty notificaciones and count 0', () => {
    expect(service.notificaciones).toEqual([]);
    expect(service.count).toBe(0);
  });

  it('cargar loads notifications from service', () => {
    authMock.getNotificacionesNoLeidas.mockReturnValue(of([mockNotif]));
    service.cargar(10);
    expect(service.count).toBe(1);
    expect(service.notificaciones[0].id).toBe(1);
  });

  it('cargar handles error silently', () => {
    authMock.getNotificacionesNoLeidas.mockReturnValue(throwError(() => new Error('fail')));
    expect(() => service.cargar(10)).not.toThrow();
    expect(service.count).toBe(0);
  });

  it('iniciarPolling loads immediately', () => {
    authMock.getNotificacionesNoLeidas.mockReturnValue(of([mockNotif]));
    service.iniciarPolling(10);
    expect(service.count).toBe(1);
    service.detenerPolling();
  });

  it('iniciarPolling polls again after 15 seconds', () => {
    vi.useFakeTimers();
    authMock.getNotificacionesNoLeidas.mockReturnValue(of([mockNotif]));
    service.iniciarPolling(10);
    expect(authMock.getNotificacionesNoLeidas).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(15000);
    expect(authMock.getNotificacionesNoLeidas).toHaveBeenCalledTimes(2);
    service.detenerPolling();
    vi.useRealTimers();
  });

  it('detenerPolling clears the interval', () => {
    vi.useFakeTimers();
    authMock.getNotificacionesNoLeidas.mockReturnValue(of([mockNotif]));
    service.iniciarPolling(10);
    service.detenerPolling();
    vi.advanceTimersByTime(15000);
    expect(authMock.getNotificacionesNoLeidas).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('detenerPolling is safe to call multiple times', () => {
    expect(() => {
      service.detenerPolling();
      service.detenerPolling();
    }).not.toThrow();
  });

  it('marcarLeida removes notification on success', () => {
    authMock.getNotificacionesNoLeidas.mockReturnValue(of([mockNotif]));
    service.cargar(10);
    service.marcarLeida(mockNotif);
    expect(service.count).toBe(0);
  });

  it('marcarLeida calls callback after success', () => {
    authMock.getNotificacionesNoLeidas.mockReturnValue(of([mockNotif]));
    service.cargar(10);
    const cb = vi.fn();
    service.marcarLeida(mockNotif, cb);
    expect(cb).toHaveBeenCalledOnce();
  });

  it('marcarLeida removes notification on error too', () => {
    authMock.getNotificacionesNoLeidas.mockReturnValue(of([mockNotif]));
    service.cargar(10);
    authMock.marcarNotificacionLeida.mockReturnValue(throwError(() => new Error('fail')));
    service.marcarLeida(mockNotif);
    expect(service.count).toBe(0);
  });

  it('marcarLeida does not call callback on error', () => {
    authMock.getNotificacionesNoLeidas.mockReturnValue(of([mockNotif]));
    service.cargar(10);
    authMock.marcarNotificacionLeida.mockReturnValue(throwError(() => new Error('fail')));
    const cb = vi.fn();
    service.marcarLeida(mockNotif, cb);
    expect(cb).not.toHaveBeenCalled();
  });

  it('marcarTodas clears all notifications on success', () => {
    authMock.getNotificacionesNoLeidas.mockReturnValue(of([mockNotif]));
    service.cargar(10);
    service.marcarTodas(10);
    expect(service.count).toBe(0);
  });

  it('marcarTodas handles error silently', () => {
    authMock.marcarTodasNotificacionesLeidas.mockReturnValue(throwError(() => new Error('fail')));
    expect(() => service.marcarTodas(10)).not.toThrow();
  });

  it('ngOnDestroy stops polling', () => {
    service.iniciarPolling(10);
    service.ngOnDestroy();
    expect(service['pollingInterval']).toBeNull();
  });
});
