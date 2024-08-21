import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  title: string;
  message: string;
  trueText: string;
  falseText: string;
}

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  ngOnInit(): void {}
}


export interface DialogDataMensaje {
  title: string;
  messageAviso: string;
  messageAviso2: string;
  trueText: string;
  falseText: string;
}

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog_mensaje.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class DialogComponentMensaje implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogDataMensaje) {}

  ngOnInit(): void {}
}