import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
//import { Catalogo, DatosDialog } from '@models/declaracion';
import { FormGroup, FormBuilder, Validators  } from '@angular/forms';
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

export class DialogElementsExampleDialog implements OnInit{
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

   isDisabledInicial: boolean = true;
   isDisabledModificacion: boolean = true;
   isDisabledConclusion: boolean = true;
   isDisabledCheckBoxInicial: boolean = true;
   isDisabledCheckBoxModificacion: boolean = true;
   isDisabledCheckBoxConclusion: boolean = true;
   

  comprobarMes(){
    if (this.mes===5){
      this.isDisabledModificacion = false;
    }
  }

  //constructor(public dialog: MatDialog) {}
  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<DialogElementsExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any

  ) {
    //this.createForm();
  }

  validarDeclaracion(value: any){
    console.log('value '+value);
    const tipo = this.datosDialogForm.get('tipoDeclaracion').value;
    const puesto = this.datosDialogForm.get('puesto').value;
    console.log('tipoDeclaracion '+ tipo);
    console.log('puesto '+ puesto);
    let cbInicial = document.getElementById('cbInicial') as HTMLInputElement | null;
    let cbModificacion = document.getElementById('cbModificacion') as HTMLInputElement | null;
    let cbConclusion = document.getElementById('cbConclusion') as HTMLInputElement | null;
    let btnInicialSimple = document.getElementById('btnInicialSimple') as HTMLInputElement | null;
    let btnInicialCompleta = document.getElementById('btnInicialCompleta') as HTMLInputElement | null;
    let btnModificacionSimple = document.getElementById('btnModificacionSimple') as HTMLInputElement | null;
    let btnModificacionCompleta = document.getElementById('btnModificacionCompleta') as HTMLInputElement | null;
    let btnConclusionSimple = document.getElementById('btnConclusionSimple') as HTMLInputElement | null;
    let btnConclusionCompleta = document.getElementById('btnConclusionCompleta') as HTMLInputElement | null;

    /*if(puesto === "DIRECTIVO"){

    }
    else if (puesto === "OPERATIVO"){

    }
    else{

    }*/
    if(tipo === "INICIAL"){
      btnInicialSimple?.removeAttribute('disabled');
      btnInicialCompleta?.removeAttribute('disabled');
      btnModificacionSimple?.setAttribute('disabled','');
      btnModificacionCompleta?.setAttribute('disabled','');
      btnConclusionSimple?.setAttribute('disabled','');
      btnConclusionCompleta?.setAttribute('disabled','');
    }
    else if (tipo === "MODIFICACIÓN"){
      btnModificacionSimple?.removeAttribute('disabled');
      btnModificacionCompleta?.removeAttribute('disabled');
      btnInicialSimple?.setAttribute('disabled','');
      btnInicialCompleta?.setAttribute('disabled','');
      btnConclusionSimple?.setAttribute('disabled','');
      btnConclusionCompleta?.setAttribute('disabled','');
    }
    else if (tipo === "CONCLUSIÓN"){
      btnConclusionSimple?.removeAttribute('disabled');
      btnConclusionCompleta?.removeAttribute('disabled');
      btnInicialSimple?.setAttribute('disabled','');
      btnInicialCompleta?.setAttribute('disabled','');
      btnConclusionSimple?.setAttribute('disabled','');
      btnConclusionCompleta?.setAttribute('disabled','');
    }
    else{
      btnInicialSimple?.setAttribute('disabled','');
      btnInicialCompleta?.setAttribute('disabled','');
      btnModificacionSimple?.setAttribute('disabled','');
      btnModificacionCompleta?.setAttribute('disabled','');
      btnConclusionSimple?.setAttribute('disabled','');
      btnConclusionCompleta?.setAttribute('disabled','');
    }
  }

  ngOnInit(){
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
