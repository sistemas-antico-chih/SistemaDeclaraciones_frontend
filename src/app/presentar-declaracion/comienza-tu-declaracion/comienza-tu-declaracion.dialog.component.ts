import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
//import { Catalogo, DatosDialog } from '@models/declaracion';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';



import catalogoPuestos from '@static/catalogos/catalogoPuestos.json';
import { DatosDialog } from '@models/declaracion/datos-dialog.model';

@Component({
  selector: 'comienza-tu-declaracion.dialog',
  templateUrl: './comienza-tu-declaracion.dialog.component.html',
  styleUrls: ['./comienza-tu-declaracion.component.scss'],
})

export class DialogElementsExampleDialog implements OnInit{
  catalogoPuestos=catalogoPuestos;
  datosComponenteForm: FormGroup;

  //constructor(public dialog: MatDialog) {}
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dialogRef: MatDialogRef<DialogElementsExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
    
  ) {
    //this.createForm();
  }
  
  ngOnInit(){

  }
  closeDialog() {
    this.dialogRef.close({ data: '' })
  }

  createForm() {
    this.datosComponenteForm = this.formBuilder.group({
    })
    //catalogoPuestos: [null, [Validators.required, Validators.pattern(/^\S.*\S$/)]],
  }

  fillForm(datosComponenteForm: DatosDialog | undefined) {
    this.datosComponenteForm.patchValue(datosComponenteForm || {});

  }
}