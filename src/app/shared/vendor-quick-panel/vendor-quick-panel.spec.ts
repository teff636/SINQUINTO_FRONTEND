import { TestBed, ComponentFixture } from '@angular/core/testing';
import { VendorQuickPanelComponent } from './vendor-quick-panel';

describe('VendorQuickPanelComponent', () => {
  let component: VendorQuickPanelComponent;
  let fixture: ComponentFixture<VendorQuickPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorQuickPanelComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(VendorQuickPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty activeSection by default', () => {
    expect(component.activeSection).toBe('');
  });

  it('should accept servicios activeSection', () => {
    component.activeSection = 'servicios';
    expect(component.activeSection).toBe('servicios');
  });

  it('should accept solicitudes activeSection', () => {
    component.activeSection = 'solicitudes';
    expect(component.activeSection).toBe('solicitudes');
  });

  it('should accept historial activeSection', () => {
    component.activeSection = 'historial';
    expect(component.activeSection).toBe('historial');
  });

  it('should emit goServicios', () => {
    const emitted = vi.fn();
    component.goServicios.subscribe(emitted);
    component.goServicios.emit();
    expect(emitted).toHaveBeenCalled();
  });

  it('should emit goSolicitudes', () => {
    const emitted = vi.fn();
    component.goSolicitudes.subscribe(emitted);
    component.goSolicitudes.emit();
    expect(emitted).toHaveBeenCalled();
  });

  it('should emit goHistorial', () => {
    const emitted = vi.fn();
    component.goHistorial.subscribe(emitted);
    component.goHistorial.emit();
    expect(emitted).toHaveBeenCalled();
  });
});
