import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudesVendedor } from './solicitudes-vendedor';

describe('SolicitudesVendedor', () => {
  let component: SolicitudesVendedor;
  let fixture: ComponentFixture<SolicitudesVendedor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudesVendedor],
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitudesVendedor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
