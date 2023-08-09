import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
//import { Catalogo, DatosDialog } from '@models/declaracion';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { tooltipData } from '@static/tooltips/situacion-patrimonial/datos-empleo';
import { DeclarationErrorStateMatcher } from '@app/presentar-declaracion/shared-presentar-declaracion/declaration-error-state-matcher';
import { DatosDialog } from '@models/declaracion/datos-dialog.model';

import puesto from '@static/catalogos/catalogoPuestos.json';
import tipoDeclaracion from '@static/catalogos/tipoDeclaracion.json';
import { findOption } from '@utils/utils';


@Component({
  selector: 'comienza-tu-declaracion.dialog',
  templateUrl: './comienza-tu-declaracion.dialog.component.html',
  //styleUrls: ['./comienza-tu-declaracion.component.scss'],
})

export class DialogElementsExampleDialog implements OnInit {

  datosDialogForm: FormGroup;

  tooltipData = tooltipData;
  errorMatcher = new DeclarationErrorStateMatcher();

  //entePublicoCatalogo = entePublico;
  tipoDeclaracionCatalogo = tipoDeclaracion;
  puestoCatalogo = puesto;
  isLoading = false;


  minDate = new Date(1980, 1, 1);
  anio: number = new Date().getFullYear();
  mes: number = new Date().getMonth() + 1;
  dia: number = new Date().getDate();
  maxDate = new Date(this.anio, this.mes, this.dia);
  
  isDisabledCheckBoxInicial: boolean = true;
  isDisabledCheckBoxModificacion: boolean = true;
  isDisabledCheckBoxConclusion: boolean = true;

  isCheckedCheckBoxModificacion: boolean = false;
  isCheckedCheckBoxInicial: boolean = false;
  isCheckedCheckBoxConclusion: boolean = false;

  isDisabledButtonInicialSimple: boolean = true;
  isDisabledButtonInicialCompleta: boolean = true;
  isDisabledButtonModificacionSimple: boolean = true;
  isDisabledButtonModificacionCompleta: boolean = true;
  isDisabledButtonConclusionSimple: boolean = true;
  isDisabledButtonConclusionCompleta: boolean = true;


  /* comprobarMes() {
     if (this.mes === 5) {
       //this.isDisabledModificacion = false;
     }
   }
 */
  //constructor(public dialog: MatDialog) {}
  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<DialogElementsExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any

  ) {
    //this.createForm();
  }

  validarDeclaracion(value: any) {
    console.log('value ' + value);
    const tipo = this.datosDialogForm.get('tipoDeclaracion').value;
    const puesto = this.datosDialogForm.get('puesto').value;

    if (tipo === "INICIAL") {
      this.isDisabledButtonInicialSimple = false;
      this.isDisabledButtonInicialCompleta = false;
      this.isDisabledButtonModificacionSimple = true;
      this.isDisabledButtonModificacionCompleta = true;
      this.isDisabledButtonConclusionSimple = true;
      this.isDisabledButtonConclusionCompleta = true;
      if (puesto === "OPERATIVO") {
        this.isCheckedCheckBoxInicial = true;
        this.isCheckedCheckBoxModificacion = false;
        this.isCheckedCheckBoxConclusion = false;
      } 
      else {
        this.isCheckedCheckBoxInicial = false;
        this.isCheckedCheckBoxModificacion = false;
        this.isCheckedCheckBoxConclusion = false;
      }
    }
    else if (tipo === "MODIFICACIÓN") {
      this.isDisabledButtonInicialSimple = true;
      this.isDisabledButtonInicialCompleta = true;
      this.isDisabledButtonModificacionSimple = false;
      this.isDisabledButtonModificacionCompleta = false;
      this.isDisabledButtonConclusionSimple = true;
      this.isDisabledButtonConclusionCompleta = true;
      if (puesto === "OPERATIVO") {
        this.isCheckedCheckBoxInicial = false;
        this.isCheckedCheckBoxModificacion = true;
        this.isCheckedCheckBoxConclusion = false;
      } 
      else {
        this.isCheckedCheckBoxInicial = false;
        this.isCheckedCheckBoxModificacion = false;
        this.isCheckedCheckBoxConclusion = false;
      }
    }
    else if (tipo === "CONCLUSIÓN") {
      this.isDisabledButtonInicialSimple = true;
      this.isDisabledButtonInicialCompleta = true;
      this.isDisabledButtonModificacionSimple = true;
      this.isDisabledButtonModificacionCompleta = true;
      this.isDisabledButtonConclusionSimple = false;
      this.isDisabledButtonConclusionCompleta = false;
      if (puesto === "OPERATIVO") {
        this.isCheckedCheckBoxInicial = false;
        this.isCheckedCheckBoxModificacion = false;
        this.isCheckedCheckBoxConclusion = true;
      } 
      else {
        this.isCheckedCheckBoxInicial = false;
        this.isCheckedCheckBoxModificacion = false;
        this.isCheckedCheckBoxConclusion = false;
      }
    }
  }
    ngOnInit() {
      this.datosDialogForm = this.formBuilder.group({
        tipoDeclaracion: [null, [Validators.required]],
        fechaTomaPosesion: [null, [Validators.required]],
        puesto: [null, [Validators.required]],
      });
    }
    closeDialog() {
      this.dialogRef.close({ data: '' })
    }

    fillForm(datosComponenteForm: DatosDialog | undefined) {
      this.datosDialogForm.patchValue(datosComponenteForm || {});

    }
    confirmSaveInfo() {
      console.log("boton guardar");
    }
  }

function Input() {
  throw new Error('Function not implemented.');
}
