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

  cbInicial = document.getElementById('cbInicialSimplificada') as HTMLInputElement | null;
  cbModificacion = document.getElementById('cbModificacionSimplificada') as HTMLInputElement | null;
  cbConclusion = document.getElementById('cbConclusionSimplificada') as HTMLInputElement | null;
  btnInicialSimple = document.getElementById('btnInicialSimple') as HTMLInputElement | null;
  btnInicialCompleta = document.getElementById('btnInicialCompleta') as HTMLInputElement | null;
  btnModificacionSimple = document.getElementById('btnModificacionSimple') as HTMLInputElement | null;
  btnModificacionCompleta = document.getElementById('btnModificacionCompleta') as HTMLInputElement | null;
  btnConclusionSimple = document.getElementById('btnConclusionSimple') as HTMLInputElement | null;
  btnConclusionCompleta = document.getElementById('btnConclusionCompleta') as HTMLInputElement | null;
  
  cbInicialSimplificada=true
  cbModificacionSimplificada=false;
  cbConclusionSimplificada=false;

  isDisabledInicialSimple: boolean = false;

  isDisabledInicialCompleta: boolean = true;
  isDisabledModificacionSimple: boolean = true;
  isDisabledModificacionCompleta: boolean = true;
  isDisabledConclusionSimple: boolean = true;
  isDisabledConclusionCompleta: boolean = true;
  isDisabledCheckBoxInicial: boolean = true;
  isDisabledCheckBoxModificacion: boolean = true;
  isDisabledCheckBoxConclusion: boolean = true;

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
    console.log('tipoDeclaracion ' + tipo);
    console.log('puesto ' + puesto);
    console.log('btnInicialSimple '+ this.btnInicialSimple.id);
    console.log('btnInicialCompleta '+ this.btnInicialCompleta.id);
    console.log('cbInicial '+ this.cbInicial.id);
    console.log('cbInicial '+ this.cbInicial.value);


    if (tipo === "INICIAL") {
      this.btnInicialSimple.disabled=false;
      this.btnInicialCompleta.disabled=false;
      this.btnModificacionSimple.disabled=true;
      this.btnModificacionCompleta.disabled=true;
      this.btnConclusionSimple.disabled=true;
      this.btnConclusionCompleta.disabled=true;
      if (puesto === "OPERATIVO") {
        this.cbInicial.checked=true;
      }
    }
    else if (tipo === "MODIFICACIÓN") {
      this.btnModificacionSimple.disabled=false;
      this.btnModificacionCompleta.disabled=false;
      if (puesto === "OPERATIVO") {
        this.btnModificacionSimple.disabled=false;
        this.btnModificacionCompleta.disabled=false;
      }
    }
    else if (tipo === "CONCLUSIÓN") {
      this.btnConclusionSimple.disabled=false;
      this.btnConclusionCompleta.disabled=false;
      if (puesto === "OPERATIVO") {
        this.btnConclusionSimple.disabled=false;
        this.btnConclusionCompleta.disabled=false;
      }
      else {
        this.cbInicial.disabled=true;
        this.cbModificacion.disabled=true;
        this.cbConclusion.disabled=true;
      }
    }
  }

  ngOnInit() {
    this.datosDialogForm = this.formBuilder.group({
      tipoDeclaracion: [null, [Validators.required]],
      fechaTomaPosesion: [null, [Validators.required]],
      puesto: [null, [Validators.required]],
    });
    this.btnInicialSimple.disabled=true;
    this.btnInicialCompleta.disabled=true;
    this.btnModificacionSimple.disabled=true;
    this.btnModificacionCompleta.disabled=true;
    this.btnConclusionSimple.disabled=true;
    this.btnConclusionCompleta.disabled=true;
    this.cbInicial.checked=false;
    this.cbModificacion.checked=false;
    this.cbConclusion.checked=false;
    this.cbInicial.disabled=true;
    this.cbModificacion.disabled=true;
    this.cbConclusion.disabled=true; 
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
