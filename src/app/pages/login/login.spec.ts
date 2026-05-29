import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { LoginComponent } from './login';
import { AuthService } from '../../core/services/auth.service';
import { GoogleAuthUiService } from '../../core/services/google-auth-ui.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authMock: any;
  let routerMock: any;
  let googleAuthMock: any;

  beforeEach(async () => {
    authMock = {
      login: vi.fn(() => of({ token: 'tok', role: 'CUSTOMER', userId: 1 })),
      guardarSesion: vi.fn(),
    };
    routerMock = { navigate: vi.fn() };
    googleAuthMock = { iniciarBoton: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
        { provide: GoogleAuthUiService, useValue: googleAuthMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngAfterViewInit initializes google button', () => {
    component.ngAfterViewInit();
    expect(googleAuthMock.iniciarBoton).toHaveBeenCalled();
  });

  it('irRegistro navigates to /register-usuario', () => {
    component.irRegistro();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/register-usuario']);
  });

  it('iniciarSesion with CUSTOMER role navigates to /cliente', () => {
    component.usuario = 'test@test.com';
    component.password = '123';
    component.iniciarSesion();
    expect(authMock.login).toHaveBeenCalledWith({ email: 'test@test.com', password: '123' });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cliente']);
  });

  it('iniciarSesion with SALESPERSON role navigates to /vendedor', () => {
    authMock.login.mockReturnValue(of({ token: 'tok', role: 'SALESPERSON', userId: 2 }));
    component.usuario = 'v@v.com';
    component.password = 'pass';
    component.iniciarSesion();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/vendedor']);
  });

  it('iniciarSesion shows error message on failure', () => {
    authMock.login.mockReturnValue(throwError(() => new Error('Unauthorized')));
    component.iniciarSesion();
    expect(component.mensaje).toBe('Correo o contraseña incorrectos');
  });

  it('guardarSesion called on successful login', () => {
    component.iniciarSesion();
    expect(authMock.guardarSesion).toHaveBeenCalled();
  });
});
