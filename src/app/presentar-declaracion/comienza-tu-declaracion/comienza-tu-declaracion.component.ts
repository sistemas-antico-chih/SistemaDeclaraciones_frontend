import { Component, OnInit, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogElementsExampleDialog } from '../comienza-tu-declaracion/comienza-tu-declaracion.dialog.component';


@Component({
  selector: 'app-comienza-tu-declaracion',
  templateUrl: './comienza-tu-declaracion.component.html',
  styleUrls: ['./comienza-tu-declaracion.component.scss'],
})

export class ComienzaTuDeclaracionComponent  {
  //constructor() {}
  ngOnInit(){
  }
  constructor(public dialog: MatDialog) {}

  openDialog() {
    this.dialog.open();
    /*let dialogRef = this.dialog.open(DialogElementsExampleDialog,{
      closeOnNavigation: true,
    });*/
    console.log("component has been initialized! openDialog");
    //dialogRef.close();
  }
}