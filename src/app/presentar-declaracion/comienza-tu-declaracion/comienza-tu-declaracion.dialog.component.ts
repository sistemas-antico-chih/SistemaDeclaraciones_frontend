import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '@shared/dialog/dialog.component';
import { Router } from '@angular/router';
//import { Catalogo, DatosDialog } from '@models/declaracion';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { tooltipData } from '@static/tooltips/situacion-patrimonial/datos-empleo';
import { DeclarationErrorStateMatcher } from '@app/presentar-declaracion/shared-presentar-declaracion/declaration-error-state-matcher';
import { DatosDialog } from '@models/declaracion/datos-dialog.model';

import puesto from '@static/catalogos/catalogoPuestos.json';
import tipoDeclaracion from '@static/catalogos/tipoDeclaracion.json';
import { findOption } from '@utils/utils';
import { validarRFC } from '@app/auth/signup/signup.validador';


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
  fechaTomaPosesion: String = null;
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

  constructor(
    private dialog: MatDialog,
    private router: Router,
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
    const fechaTomaPosesion = this.datosDialogForm.get('fechaTomaPosesion');

    if (tipo === "inicial" && puesto === "DIRECTIVO") {
      this.isCheckedCheckBoxInicial = false;
      this.isDisabledButtonInicialSimple = true;
      this.isDisabledButtonInicialCompleta = false;
      this.isDisabledButtonModificacionSimple = true;
      this.isDisabledButtonModificacionCompleta = true;
      this.isDisabledButtonConclusionSimple = true;
      this.isDisabledButtonConclusionCompleta = true;
    }
    else if (tipo === "inicial" && puesto === "OPERATIVO") {
      this.isCheckedCheckBoxInicial = true;
      this.isDisabledButtonInicialSimple = false;
      this.isDisabledButtonInicialCompleta = true;
      this.isDisabledButtonModificacionSimple = true;
      this.isDisabledButtonModificacionCompleta = true;
      this.isDisabledButtonConclusionSimple = true;
      this.isDisabledButtonConclusionCompleta = true;
    }
    else if (tipo === "modificacion" && puesto === "DIRECTIVO") {
      this.isCheckedCheckBoxModificacion = false;
      this.isDisabledButtonInicialSimple = true;
      this.isDisabledButtonInicialCompleta = true;
      this.isDisabledButtonModificacionSimple = true;
      this.isDisabledButtonModificacionCompleta = false;
      this.isDisabledButtonConclusionSimple = true;
      this.isDisabledButtonConclusionCompleta = true;
    }
    else if (tipo === "modificacion" && puesto === "OPERATIVO") {
      this.isCheckedCheckBoxModificacion = true;
      this.isDisabledButtonInicialSimple = true;
      this.isDisabledButtonInicialCompleta = true;
      this.isDisabledButtonModificacionSimple = false;
      this.isDisabledButtonModificacionCompleta = true;
      this.isDisabledButtonConclusionSimple = true;
      this.isDisabledButtonConclusionCompleta = true;
    }
    else if (tipo === "conclusion" && puesto === "DIRECTIVO") {
      this.isCheckedCheckBoxConclusion = false;
      this.isDisabledButtonInicialSimple = true;
      this.isDisabledButtonInicialCompleta = true;
      this.isDisabledButtonModificacionSimple = true;
      this.isDisabledButtonModificacionCompleta = true;
      this.isDisabledButtonConclusionSimple = true;
      this.isDisabledButtonConclusionCompleta = false;
    }
    else if (tipo === "conclusion" && puesto === "OPERATIVO") {
      this.isCheckedCheckBoxConclusion = true;
      this.isDisabledButtonInicialSimple = false;
      this.isDisabledButtonInicialCompleta = true;
      this.isDisabledButtonModificacionSimple = true;
      this.isDisabledButtonModificacionCompleta = true;
      this.isDisabledButtonConclusionSimple = false;
      this.isDisabledButtonConclusionCompleta = true;
    }
    else {
      this.isDisabledButtonInicialSimple = true;
      this.isDisabledButtonInicialCompleta = true;
      this.isDisabledButtonModificacionSimple = true;
      this.isDisabledButtonModificacionCompleta = true;
      this.isDisabledButtonConclusionSimple = true;
      this.isDisabledButtonConclusionCompleta = true;
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
    var tipo = this.datosDialogForm.get('tipoDeclaracion').value;
    const puesto = this.datosDialogForm.get('puesto').value;
    console.log('puesto: '+puesto);

    if (this.isValid()) {
      let url = '/' + tipo;
      if (puesto === "OPERATIVO") {
        url += '/simplificada';
        this.dialogRef.close({ data: '' })
      }else{
        url = '/' + tipo;
      }
      this.router.navigate([url + '/situacion-patrimonial/datos-generales'])
      this.dialogRef.close({ data: '' })
    }
    else {
      const dialogReff = this.dialog.open(DialogComponent, {
        data: {
          title: 'No es posible iniciar la declaración',
          message: 'Es necesario que exista una declaración de tipo INICIAL',
          //falseText: 'Cancelar',
          trueText: 'Continuar',
        },
      });
      //dialogReff.close({ data: '' })
    }

    //this.dialogRef.close({ data: '' })
  }

  isValid(){
    return true;
  }

  fillForm(datosComponenteForm: DatosDialog | undefined) {
    this.datosDialogForm.patchValue(datosComponenteForm || {});

  }
  confirmSaveInfo() {
    console.log("boton guardar");
  }
}

