import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppTopbarComponent } from './app-topbar';
import { Notificacion } from '../../core/services/auth.service';

describe('AppTopbarComponent', () => {
  let component: AppTopbarComponent;
  let fixture: ComponentFixture<AppTopbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppTopbarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AppTopbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default variant client', () => {
    expect(component.variant).toBe('client');
  });

  it('should accept vendor variant', () => {
    component.variant = 'vendor';
    expect(component.variant).toBe('vendor');
  });

  it('should accept iniciales input', () => {
    component.iniciales = 'AB';
    expect(component.iniciales).toBe('AB');
  });

  it('should accept badgeCount input', () => {
    component.badgeCount = 3;
    expect(component.badgeCount).toBe(3);
  });

  it('should emit toggleNotif', () => {
    const emitted = vi.fn();
    component.toggleNotif.subscribe(emitted);
    component.toggleNotif.emit();
    expect(emitted).toHaveBeenCalled();
  });

  it('should emit cerrarNotif', () => {
    const emitted = vi.fn();
    component.cerrarNotif.subscribe(emitted);
    component.cerrarNotif.emit();
    expect(emitted).toHaveBeenCalled();
  });

  it('should emit marcarTodas', () => {
    const emitted = vi.fn();
    component.marcarTodas.subscribe(emitted);
    component.marcarTodas.emit();
    expect(emitted).toHaveBeenCalled();
  });

  it('should emit goInicio', () => {
    const emitted = vi.fn();
    component.goInicio.subscribe(emitted);
    component.goInicio.emit();
    expect(emitted).toHaveBeenCalled();
  });

  it('should emit goPerfil', () => {
    const emitted = vi.fn();
    component.goPerfil.subscribe(emitted);
    component.goPerfil.emit();
    expect(emitted).toHaveBeenCalled();
  });

  it('should accept itemsNotif array', () => {
    const notifs: Notificacion[] = [
      { id: 1, userId: 1, type: 'APPOINTMENT_ACCEPTED', title: 'T', message: 'M', read: false }
    ];
    component.itemsNotif = notifs;
    expect(component.itemsNotif.length).toBe(1);
  });

  it('should emit manejarNotif with notificacion', () => {
    const notif: Notificacion = { id: 1, userId: 1, type: 'APPOINTMENT_ACCEPTED', title: 'T', message: 'M', read: false };
    const emitted = vi.fn();
    component.manejarNotif.subscribe(emitted);
    component.manejarNotif.emit(notif);
    expect(emitted).toHaveBeenCalledWith(notif);
  });
});
