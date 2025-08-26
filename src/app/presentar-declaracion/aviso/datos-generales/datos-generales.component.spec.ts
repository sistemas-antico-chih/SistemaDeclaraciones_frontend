import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatosGeneralesAvisoComponent } from './datos-generales.component';

describe('DatosGeneralesComponent', () => {
  let component: DatosGeneralesAvisoComponent;
  let fixture: ComponentFixture<DatosGeneralesAvisoComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [DatosGeneralesAvisoComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(DatosGeneralesAvisoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
