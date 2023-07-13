import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button'


@Component({
  selector: 'app-comienza-tu-declaracion',
  templateUrl: './comienza-tu-declaracion.component.html',
  styleUrls: ['./comienza-tu-declaracion.component.scss'],
})

export class ComienzaTuDeclaracionComponent  {
  //constructor() {}

  ngOnInit(){
    console.log("component has been initialized!");
  }
  //: void {}
  constructor(public dialog: MatDialog) {}

  openDialog() {
    this.dialog.open(DialogElementsExampleDialog);
    console.log("component has been initialized!");
  }
}

@Component({
  selector: 'comienza-tu-declaracion.dialog',
  templateUrl: 'comienza-tu-declaracion.dialog.html',
})

export class DialogElementsExampleDialog {}