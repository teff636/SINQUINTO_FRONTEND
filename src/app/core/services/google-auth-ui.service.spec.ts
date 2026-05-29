import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { GoogleAuthUiService } from './google-auth-ui.service';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('GoogleAuthUiService', () => {
  let service: GoogleAuthUiService;
  let routerMock: any;
  let authMock: any;

  beforeEach(() => {
    routerMock = { navigate: vi.fn() };
    authMock = {
      loginConGoogle: vi.fn(),
      guardarSesion: vi.fn(),
      guardarGooglePendiente: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        GoogleAuthUiService,
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authMock }
      ]
    });
    service = TestBed.inject(GoogleAuthUiService);
  });

  afterEach(() => {
    delete (window as any).google;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('procesarCredencial navigates to /vendedor for SALESPERSON', () => {
    const mockRes = new HttpResponse({ body: { role: 'SALESPERSON', token: 'tok', userId: 1 }, status: 200 });
    authMock.loginConGoogle.mockReturnValue(of(mockRes));
    service.procesarCredencial('cred', vi.fn());
    expect(authMock.guardarSesion).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/vendedor']);
  });

  it('procesarCredencial navigates to /cliente for CUSTOMER', () => {
    const mockRes = new HttpResponse({ body: { role: 'CUSTOMER', token: 'tok', userId: 2 }, status: 200 });
    authMock.loginConGoogle.mockReturnValue(of(mockRes));
    service.procesarCredencial('cred', vi.fn());
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cliente']);
  });

  it('procesarCredencial saves google pending and navigates to /select-role on 202', () => {
    const mockRes = new HttpResponse({
      body: { email: 'g@g.com', name: 'G', lastName: 'X' }, status: 202
    });
    authMock.loginConGoogle.mockReturnValue(of(mockRes));
    service.procesarCredencial('cred', vi.fn());
    expect(authMock.guardarGooglePendiente).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/select-role']);
  });

  it('procesarCredencial calls onError on HTTP error', () => {
    authMock.loginConGoogle.mockReturnValue(throwError(() => new Error('fail')));
    const onError = vi.fn();
    service.procesarCredencial('cred', onError);
    expect(onError).toHaveBeenCalled();
  });

  it('iniciarBoton does not crash when google never loads', () => {
    vi.useFakeTimers();
    delete (window as any).google;
    const onError = vi.fn();
    service.iniciarBoton('someElement', onError);
    vi.advanceTimersByTime(5100);
    vi.useRealTimers();
  });

  it('iniciarBoton sets up google button when google is available', () => {
    const renderButton = vi.fn();
    const initialize = vi.fn();
    (window as any).google = {
      accounts: {
        id: { initialize, renderButton }
      }
    };
    const div = document.createElement('div');
    div.id = 'testGoogleBtn';
    document.body.appendChild(div);
    service.iniciarBoton('testGoogleBtn', vi.fn());
    expect(initialize).toHaveBeenCalled();
    expect(renderButton).toHaveBeenCalled();
    document.body.removeChild(div);
  });
});
