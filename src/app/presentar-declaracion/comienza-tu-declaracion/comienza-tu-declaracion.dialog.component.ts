import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
//import { Catalogo, DatosDialog } from '@models/declaracion';
import { FormGroup, FormBuilder, Validators  } from '@angular/forms';
import { tooltipData } from '@static/tooltips/situacion-patrimonial/datos-empleo';
import { DeclarationErrorStateMatcher } from '@app/presentar-declaracion/shared-presentar-declaracion/declaration-error-state-matcher';
import { DatosDialog } from '@models/declaracion/datos-dialog.model';

import catalogoPuestos from '@static/catalogos/catalogoPuestos.json';
import AmbitoPublico from '@static/catalogos/ambitoPublico.json';
import tipoDeclaracion from '@static/catalogos/tipoDeclaracion.json';
import entePublico from '@static/catalogos/entePublico.json';

@Component({
  selector: 'comienza-tu-declaracion.dialog',
  templateUrl: './comienza-tu-declaracion.dialog.component.html',
  //styleUrls: ['./comienza-tu-declaracion.component.scss'],
})

export class DialogElementsExampleDialog implements OnInit{
  catalogoPuestos=catalogoPuestos;
  datosDialogForm: FormGroup;

  tooltipData = tooltipData;
  errorMatcher = new DeclarationErrorStateMatcher();

  entePublicoCatalogo = entePublico;
  tipoDeclaracionCatalogo = tipoDeclaracion;
  ambitoPublicoCatalogo = AmbitoPublico;
  isLoading = false;

  minDate = new Date(1980, 1, 1);
  anio: number = new Date().getFullYear();
  mes: number = new Date().getMonth() + 1;
  dia: number = new Date().getDate();
  maxDate = new Date(this.anio, this.mes, this.dia);

   isDisabledModificacion: boolean = true;

  //constructor(public dialog: MatDialog) {}
  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<DialogElementsExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
    
  ) {
    //this.createForm();
  }
  
  ngOnInit(){
    this.datosDialogForm = this.formBuilder.group({
      nivelOrdenGobierno: [null, [Validators.required]],
      ambitoPublico: [null, [Validators.required]],
      nombreEntePublico: [null, [Validators.required, Validators.pattern(/^\S.*\S$/)]],
      fechaTomaPosesion: [null, [Validators.required]],
    });
  }
  closeDialog() {
    this.dialogRef.close({ data: '' })
  }

  createForm() {
    this.datosDialogForm = this.formBuilder.group({
      nivelOrdenGobierno: [null, [Validators.required]],
      ambitoPublico: [null, [Validators.required]],
      nombreEntePublico: [null, [Validators.required, Validators.pattern(/^\S.*\S$/)]],
      fechaTomaPosesion: [null, [Validators.required]],
    });
    //catalogoPuestos: [null, [Validators.required, Validators.pattern(/^\S.*\S$/)]],
  }

  fillForm(datosComponenteForm: DatosDialog | undefined) {
    this.datosDialogForm.patchValue(datosComponenteForm || {});

  }
  confirmSaveInfo() {
    console.log("boton guardar");
  }
}