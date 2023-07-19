import { Component } from '@angular/core';
import { MatDialog  } from '@angular/material/dialog';
import { DialogElementsExampleDialog } from './comienza-tu-declaracion.dialog.component';
import catalogoPuestos from '@static/catalogos/catalogoPuestos.json';


@Component({
  selector: 'app-comienza-tu-declaracion',
  templateUrl: './comienza-tu-declaracion.component.html',
  styleUrls: ['./comienza-tu-declaracion.component.scss'],
})

export class ComienzaTuDeclaracionComponent  {
  catPuestos=catalogoPuestos;
  ngOnInit(){
  }
 constructor(public dialog: MatDialog) {}

  openDialog() {
    //this.dialogRef.open(DialogElementsExampleDialog);
    let dialogRef = this.dialog.open(DialogElementsExampleDialog, {
      data: `Are you sure you want to delete?`
    })
    console.log("");
    dialogRef.afterClosed().subscribe((res: { data: any; }) => {
      console.log(res.data)
    })
  }
}