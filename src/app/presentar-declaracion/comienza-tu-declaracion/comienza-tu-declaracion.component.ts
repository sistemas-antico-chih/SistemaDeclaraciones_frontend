import { Component, OnInit, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';


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
    let dialogRef = this.dialog.open(DialogElementsExampleDialog,{
      closeOnNavigation: true,
    });
    console.log("component has been initialized! openDialog");
    this.dialog.open()
  }
}

@Component({
  selector: 'comienza-tu-declaracion.dialog',
  templateUrl: 'comienza-tu-declaracion.dialog.html',
})

export class DialogElementsExampleDialog extends ComienzaTuDeclaracionComponent{
  ngOnInit(){
    console.log("component has been initialized! ngOnInitxxxxx");
   let dialog = this.dialog.open(DialogElementsExampleDialog,{
      closeOnNavigation: true,
    });
    this.dialog.close();
    
  }
}