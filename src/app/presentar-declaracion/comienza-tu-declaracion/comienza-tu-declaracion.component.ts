import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-comienza-tu-declaracion',
  templateUrl: './comienza-tu-declaracion.component.html',
  styleUrls: ['./comienza-tu-declaracion.component.scss'],
})

export class ComienzaTuDeclaracionComponent  {
  //constructor() {}

  ngOnInit(){
    this.dialog.open(DialogElementsExampleDialog);
    console.log("component has been initialized! ngOnInit");
  }
  //: void {}
  constructor(public dialog: MatDialog) {}

  openDialog() {
    this.dialog.open(DialogElementsExampleDialog);
    console.log("component has been initialized! openDialog");
  }

  /*closeDialog(): void {
    this.dialog.close();
  }*/
}

@Component({
  selector: 'comienza-tu-declaracion.dialog',
  templateUrl: 'comienza-tu-declaracion.dialog.html',
})

export class DialogElementsExampleDialog {}