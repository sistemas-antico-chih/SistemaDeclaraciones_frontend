import { Component, OnInit, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogElementsExampleDialog } from '../comienza-tu-declaracion/comienza-tu-declaracion.dialog.component';


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
    let dialogRef = this.dialog.open(DialogElementsExampleDialog,{
      closeOnNavigation: true,
    });
    console.log("component has been initialized! openDialog");
    //dialogRef.close();
  }
}
/*
@Component({
  selector: 'comienza-tu-declaracion.dialog',
  templateUrl: 'comienza-tu-declaracion.dialog.html',
})

export class DialogElementsExampleDialog {
  ngOnInit(){
    console.log("component has been initialized! ngOnInitxxxxx");
  }
}*/