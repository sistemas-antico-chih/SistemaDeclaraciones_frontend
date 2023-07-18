import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogElementsExampleDialog } from './comienza-tu-declaracion.dialog.component';

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
 /*constructor(
  private dialog: MatDialog,
  @Inject(MAT_DIALOG_DATA) public data: any
) {}*/

  openDialog() {
    this.dialog.open(DialogElementsExampleDialog);
    /*let dialogRef = this.dialog.open(DialogElementsExampleDialog,{
      closeOnNavigation: true,
    });*/
    console.log("component has been initialized! openDialog");
    //dialogRef.close();
  }
  closeDialog(){
    console.log("llega");
    //this.dialog.close()
  }
}