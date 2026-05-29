import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ClientNavigationService } from './client-navigation.service';
import { Notificacion } from './auth.service';
import { NotificationUiService } from './notification-ui.service';

const mockNotif = (type: Notificacion['type']): Notificacion => ({
  id: 1, userId: 1, type, title: 'T', message: 'M', read: false
});

describe('ClientNavigationService', () => {
  let service: ClientNavigationService;
  let routerMock: any;
  let notifMock: any;

  beforeEach(() => {
    routerMock = { navigate: vi.fn() };
    notifMock = {
      marcarLeida: vi.fn((_n: any, cb?: () => void) => { if (cb) cb(); })
    };

    TestBed.configureTestingModule({
      providers: [
        ClientNavigationService,
        { provide: Router, useValue: routerMock },
        { provide: NotificationUiService, useValue: notifMock }
      ]
    });
    service = TestBed.inject(ClientNavigationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('navegarSegunNotificacion ACCEPTED navigates to /estado-cliente', () => {
    const cerrar = vi.fn();
    service.navegarSegunNotificacion('APPOINTMENT_ACCEPTED', cerrar);
    expect(cerrar).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/estado-cliente']);
  });

  it('navegarSegunNotificacion REJECTED navigates to /estado-cliente', () => {
    const cerrar = vi.fn();
    service.navegarSegunNotificacion('APPOINTMENT_REJECTED', cerrar);
    expect(cerrar).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/estado-cliente']);
  });

  it('navegarSegunNotificacion COMPLETED navigates to /historial-cliente', () => {
    const cerrar = vi.fn();
    service.navegarSegunNotificacion('APPOINTMENT_COMPLETED', cerrar);
    expect(cerrar).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/historial-cliente']);
  });

  it('navegarSegunNotificacion REQUESTED does nothing', () => {
    const cerrar = vi.fn();
    service.navegarSegunNotificacion('APPOINTMENT_REQUESTED', cerrar);
    expect(cerrar).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('manejarNotificacion calls marcarLeida and navigates on ACCEPTED', () => {
    const cerrar = vi.fn();
    service.manejarNotificacion(mockNotif('APPOINTMENT_ACCEPTED'), cerrar);
    expect(notifMock.marcarLeida).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/estado-cliente']);
  });

  it('manejarNotificacion calls marcarLeida and navigates on COMPLETED', () => {
    const cerrar = vi.fn();
    service.manejarNotificacion(mockNotif('APPOINTMENT_COMPLETED'), cerrar);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/historial-cliente']);
  });

  it('manejarNotificacion does not navigate on REQUESTED', () => {
    const cerrar = vi.fn();
    service.manejarNotificacion(mockNotif('APPOINTMENT_REQUESTED'), cerrar);
    expect(notifMock.marcarLeida).toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});
