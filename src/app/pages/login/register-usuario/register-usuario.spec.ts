import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { RegisterUsuarioComponent } from './register-usuario';
import { AuthService } from '../../../core/services/auth.service';
import { GoogleAuthUiService } from '../../../core/services/google-auth-ui.service';

describe('RegisterUsuarioComponent', () => {
  let component: RegisterUsuarioComponent;
  let fixture: ComponentFixture<RegisterUsuarioComponent>;
  let authMock: any;
  let routerMock: any;
  let googleAuthMock: any;

  beforeEach(async () => {
    authMock = {
      register: vi.fn(() => of({})),
    };
    routerMock = { navigate: vi.fn() };
    googleAuthMock = { iniciarBoton: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [RegisterUsuarioComponent],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
        { provide: GoogleAuthUiService, useValue: googleAuthMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterUsuarioComponent);
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

  it('volverLogin emits cerrar event', () => {
    const emitted = vi.fn();
    component.cerrar.subscribe(emitted);
    component.volverLogin();
    expect(emitted).toHaveBeenCalled();
  });

  it('registrar shows error when fields are empty', () => {
    component.nombre = '';
    component.registrar();
    expect(component.mensaje).toBe('Todos los campos son obligatorios');
  });

  it('registrar shows error when apellido is empty', () => {
    component.nombre = 'John';
    component.apellido = '';
    component.registrar();
    expect(component.mensaje).toBe('Todos los campos son obligatorios');
  });

  it('registrar calls authService.register with all fields', () => {
    component.nombre = 'John';
    component.apellido = 'Doe';
    component.correo = 'j@j.com';
    component.password = 'pass123';
    component.telefono = '3001234567';
    component.rol = 'CUSTOMER';
    component.registrar();
    expect(authMock.register).toHaveBeenCalledWith({
      name: 'John',
      lastName: 'Doe',
      email: 'j@j.com',
      password: 'pass123',
      phoneNumber: '3001234567',
      role: 'CUSTOMER'
    });
  });

  it('registrar shows mostrarExito on success', () => {
    component.nombre = 'John';
    component.apellido = 'Doe';
    component.correo = 'j@j.com';
    component.password = 'pass';
    component.telefono = '123';
    component.registrar();
    expect(component.mostrarExito).toBe(true);
  });

  it('registrar shows 409 error message for duplicate email', () => {
    component.nombre = 'J';
    component.apellido = 'D';
    component.correo = 'dup@dup.com';
    component.password = 'p';
    component.telefono = '1';
    authMock.register.mockReturnValue(throwError(() => ({ status: 409 })));
    component.registrar();
    expect(component.mensaje).toBe('Este correo ya está registrado');
  });

  it('registrar shows generic error for other errors', () => {
    component.nombre = 'J';
    component.apellido = 'D';
    component.correo = 'j@j.com';
    component.password = 'p';
    component.telefono = '1';
    authMock.register.mockReturnValue(throwError(() => ({ status: 500 })));
    component.registrar();
    expect(component.mensaje).toBe('Error al registrar, intenta de nuevo');
  });

  it('registrar hides success and emits cerrar after 2 seconds', () => {
    vi.useFakeTimers();
    component.nombre = 'J';
    component.apellido = 'D';
    component.correo = 'j@j.com';
    component.password = 'p';
    component.telefono = '1';
    const emitted = vi.fn();
    component.cerrar.subscribe(emitted);
    component.registrar();
    expect(component.mostrarExito).toBe(true);
    vi.advanceTimersByTime(2000);
    expect(component.mostrarExito).toBe(false);
    expect(emitted).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
