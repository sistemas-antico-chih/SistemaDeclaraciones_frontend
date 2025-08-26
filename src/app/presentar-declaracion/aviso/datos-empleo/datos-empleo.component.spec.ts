import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatosEmpleoAvisoComponent } from './datos-empleo.component';

describe('DatosEmpleoComponent', () => {
  let component: DatosEmpleoAvisoComponent;
  let fixture: ComponentFixture<DatosEmpleoAvisoComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [DatosEmpleoAvisoComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(DatosEmpleoAvisoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
