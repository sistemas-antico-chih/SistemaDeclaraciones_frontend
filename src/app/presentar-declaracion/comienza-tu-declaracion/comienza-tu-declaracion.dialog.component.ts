import { Component, OnInit, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
//import { ComienzaTuDeclaracionComponent } from '../comienza-tu-declaracion/comienza-tu-declaracion.component'

@Component({
  selector: 'comienza-tu-declaracion.dialog',
  templateUrl: './comienza-tu-declaracion.dialog.component.html',
  styleUrls: ['./comienza-tu-declaracion.component.scss'],
})

export class DialogElementsExampleDialog {
  constructor(public dialog: MatDialog) {}

  ngOnInit(){
    console.log("component has been initialized! ngOnInitxxxxx");
    this.dialog.close(DialogElementsExampleDialog)
  }
  closeDialog() {
    console.log("component has been initialized! closeDialog");
    this.dialog.close(DialogElementsExampleDialog)
  }
}