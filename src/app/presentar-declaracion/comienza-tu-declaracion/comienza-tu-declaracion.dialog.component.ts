import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { datosEmpleoCargoComisionQuery, declaracionMutation } from '@api/declaracion';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';



import catalogoPuestos from '@static/catalogos/catalogoPuestos.json';

@Component({
  selector: 'comienza-tu-declaracion.dialog',
  templateUrl: './comienza-tu-declaracion.dialog.component.html',
  styleUrls: ['./comienza-tu-declaracion.component.scss'],
})

export class DialogElementsExampleDialog implements OnInit{
  catalogoPuestos=catalogoPuestos;

  //constructor(public dialog: MatDialog) {}
  constructor(
    private dialogRef: MatDialogRef<DialogElementsExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.createForm();
  }
  
  ngOnInit(){

  }
  closeDialog() {
    this.dialogRef.close({ data: '' })
  }

  createForm() {
    //catalogoPuestos: [null, [Validators.required, Validators.pattern(/^\S.*\S$/)]],
  }
}