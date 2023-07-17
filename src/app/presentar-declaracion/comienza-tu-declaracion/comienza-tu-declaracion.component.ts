import { Component, OnInit, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-comienza-tu-declaracion',
  templateUrl: './comienza-tu-declaracion.component.html',
  styleUrls: ['./comienza-tu-declaracion.component.scss'],
})

export class ComienzaTuDeclaracionComponent  {
  contentTemplate: TemplateRef<any>;

  //constructor() {}

  ngOnInit(){
    
  /*  this.dialog.open(DialogElementsExampleDialog,{
      closeOnNavigation: true,
    });

    console.log("component has been initialized! ngOnInit");*/
  }
  //: void {}
  constructor(public dialog: MatDialog) {}

  openDialog() {
    this.dialog.open(DialogElementsExampleDialog,{
      closeOnNavigation: true,
    });
    console.log("component has been initialized! openDialog");
    this.dialog.closed();
  }

  /*closeDialog(): void {
    this.dialog.close();
  }*/ 
}

@Component({
  selector: 'comienza-tu-declaracion.dialog',
  templateUrl: 'comienza-tu-declaracion.dialog.html',
})

export class DialogElementsExampleDialog {
  ngOnInit(){
    console.log("component has been initialized! ngOnInitxxxxx");
  }
  constructor(public dialog: MatDialog) {}
  closeDialog(): void {
  this.dialog.close();
  /*closeDialog(): void {
    this.dialog.close();
  }*/
}