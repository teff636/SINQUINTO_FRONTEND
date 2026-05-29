import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { VendorNavigationService } from './vendor-navigation.service';
import { Router } from '@angular/router';
import { AuthService, Notificacion } from './auth.service';
import { NotificationUiService } from './notification-ui.service';

describe('VendorNavigationService', () => {
  let service: VendorNavigationService;
  let routerMock: any;
  let authMock: any;
  let notifMock: any;

  const mockNotif: Notificacion = {
    id: 1, userId: 1, type: 'APPOINTMENT_REQUESTED', title: 'T', message: 'M', read: false
  };

  beforeEach(() => {
    routerMock = { navigate: vi.fn() };
    authMock = { getUsuarioLocal: vi.fn(() => ({ userId: 5 })) };
    notifMock = {
      marcarLeida: vi.fn((_n: any, cb?: () => void) => { if (cb) cb(); }),
      marcarTodas: vi.fn(() => of({}))
    };

    TestBed.configureTestingModule({
      providers: [
        VendorNavigationService,
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authMock },
        { provide: NotificationUiService, useValue: notifMock }
      ]
    });
    service = TestBed.inject(VendorNavigationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('irInicio navigates to /vendedor', () => {
    service.irInicio();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/vendedor']);
  });

  it('irMisServicios navigates to /mis-servicios', () => {
    service.irMisServicios();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/mis-servicios']);
  });

  it('irSolicitudes navigates to /solicitudes-vendedor', () => {
    service.irSolicitudes();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/solicitudes-vendedor']);
  });

  it('irHistorial navigates to /historial-vendedor', () => {
    service.irHistorial();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/historial-vendedor']);
  });

  it('irPerfil navigates to /perfil-vendedor', () => {
    service.irPerfil();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/perfil-vendedor']);
  });

  it('marcarTodasLeidas calls marcarTodas with userId', () => {
    service.marcarTodasLeidas();
    expect(notifMock.marcarTodas).toHaveBeenCalledWith(5);
  });

  it('marcarTodasLeidas does nothing if no user', () => {
    authMock.getUsuarioLocal.mockReturnValue(null);
    expect(() => service.marcarTodasLeidas()).not.toThrow();
    expect(notifMock.marcarTodas).not.toHaveBeenCalled();
  });

  it('manejarNotificacion marks as read and navigates on APPOINTMENT_REQUESTED', () => {
    const cerrar = vi.fn();
    service.manejarNotificacion(mockNotif, cerrar);
    expect(notifMock.marcarLeida).toHaveBeenCalled();
    expect(cerrar).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/solicitudes-vendedor']);
  });

  it('manejarNotificacion calls marcarLeida for non-REQUESTED type without navigate', () => {
    const acceptedNotif = { ...mockNotif, type: 'APPOINTMENT_ACCEPTED' as const };
    const cerrar = vi.fn();
    service.manejarNotificacion(acceptedNotif, cerrar);
    expect(notifMock.marcarLeida).toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});
