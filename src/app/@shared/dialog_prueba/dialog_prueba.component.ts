import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogDataPrueba {
  title: string;
  message: string;
  trueText: string;
  falseText: string;
}

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog_prueba.component.html',
  styleUrls: ['./dialog_prueba.component.scss'],
})
export class DialogComponentPrueba implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogDataPrueba) {}

  ngOnInit(): void {}
}
