import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ClientQuickPanelComponent } from './client-quick-panel';

describe('ClientQuickPanelComponent', () => {
  let component: ClientQuickPanelComponent;
  let fixture: ComponentFixture<ClientQuickPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientQuickPanelComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientQuickPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty activeSection by default', () => {
    expect(component.activeSection).toBe('');
  });

  it('should accept guardados activeSection', () => {
    component.activeSection = 'guardados';
    expect(component.activeSection).toBe('guardados');
  });

  it('should accept estado activeSection', () => {
    component.activeSection = 'estado';
    expect(component.activeSection).toBe('estado');
  });

  it('should accept historial activeSection', () => {
    component.activeSection = 'historial';
    expect(component.activeSection).toBe('historial');
  });

  it('should emit goGuardados', () => {
    const emitted = vi.fn();
    component.goGuardados.subscribe(emitted);
    component.goGuardados.emit();
    expect(emitted).toHaveBeenCalled();
  });

  it('should emit goEstado', () => {
    const emitted = vi.fn();
    component.goEstado.subscribe(emitted);
    component.goEstado.emit();
    expect(emitted).toHaveBeenCalled();
  });

  it('should emit goHistorial', () => {
    const emitted = vi.fn();
    component.goHistorial.subscribe(emitted);
    component.goHistorial.emit();
    expect(emitted).toHaveBeenCalled();
  });
});
