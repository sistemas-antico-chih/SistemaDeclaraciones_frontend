import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DomicilioDeclaranteAvisoComponent } from './domicilio-declarante.component';

describe('DomicilioDeclaranteComponent', () => {
  let component: DomicilioDeclaranteAvisoComponent;
  let fixture: ComponentFixture<DomicilioDeclaranteAvisoComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [DomicilioDeclaranteAvisoComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(DomicilioDeclaranteAvisoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
