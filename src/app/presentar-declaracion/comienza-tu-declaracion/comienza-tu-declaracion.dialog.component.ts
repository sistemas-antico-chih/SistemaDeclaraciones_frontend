import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
//import { ComienzaTuDeclaracionComponent } from '../comienza-tu-declaracion/comienza-tu-declaracion.component'

@Component({
  selector: 'comienza-tu-declaracion.dialog',
  templateUrl: './comienza-tu-declaracion.dialog.component.html',
  //styleUrls: ['./comienza-tu-declaracion.component.scss'],
})

export class DialogElementsExampleDialog implements OnInit{
  //constructor(public dialog: MatDialog) {}
  constructor(
    private dialog: MatDialogRef,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(){
    console.log("component has been initialized! ngOnInitxxxxx");
   // this.dialog.close(DialogElementsExampleDialog)
  }
  closeDialog() {
    console.log("component has been initialized! closeDialog");
    this.dialog.closed(DialogElementsExampleDialog);
    //this.dialog.close(DialogElementsExampleDialog)
  }
}