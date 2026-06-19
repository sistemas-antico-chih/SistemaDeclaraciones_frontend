import {
  waitForAsync,
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { AgregarNotaAclaratoriaComponent }
from './agregar-nota-aclaratoria.component';

describe('AgregarNotaAclaratoriaComponent', () => {

  let component: AgregarNotaAclaratoriaComponent;

  let fixture:
    ComponentFixture<AgregarNotaAclaratoriaComponent>;

  beforeEach(
    waitForAsync(() => {

      TestBed.configureTestingModule({
        declarations: [
          AgregarNotaAclaratoriaComponent
        ],
      }).compileComponents();

    })
  );

  beforeEach(() => {

    fixture =
      TestBed.createComponent(
        AgregarNotaAclaratoriaComponent
      );

    component =
      fixture.componentInstance;

    fixture.detectChanges();

  });

  it('should create', () => {

    expect(component).toBeTruthy();

  });

});