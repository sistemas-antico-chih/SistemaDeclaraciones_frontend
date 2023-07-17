import { Component, OnInit, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ComienzaTuDeclaracionComponent } from '../comienza-tu-declaracion/comienza-tu-declaracion.component'

@Component({
  selector: 'comienza-tu-declaracion.dialog',
  templateUrl: 'comienza-tu-declaracion.dialog.html',
})

export class DialogElementsExampleDialog {
  ngOnInit(){
    console.log("component has been initialized! ngOnInitxxxxx");
  }
  closeDialog() {
    console.log("component has been initialized! closeDialog");
  }
}