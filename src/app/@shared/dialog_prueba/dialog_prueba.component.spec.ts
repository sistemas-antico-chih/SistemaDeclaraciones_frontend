import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogComponentPrueba } from './dialog_prueba.component';

describe('DialogComponentPrueba', () => {
  let component: DialogComponentPrueba;
  let fixture: ComponentFixture<DialogComponentPrueba>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DialogComponentPrueba],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogComponentPrueba);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
