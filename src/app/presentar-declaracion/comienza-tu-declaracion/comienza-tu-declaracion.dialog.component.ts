import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import catalogoPuestos from '@static/catalogos/catalogoPuestos.json';

@Component({
  selector: 'comienza-tu-declaracion.dialog',
  templateUrl: './comienza-tu-declaracion.dialog.component.html',
  //styleUrls: ['./comienza-tu-declaracion.component.scss'],
})

export class DialogElementsExampleDialog implements OnInit{
  catPuestos=catalogoPuestos;

  //constructor(public dialog: MatDialog) {}
  constructor(
    private dialogRef: MatDialogRef<DialogElementsExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  
  ngOnInit(){

  }
  closeDialog() {
    this.dialogRef.close({ data: '' })
  }
}