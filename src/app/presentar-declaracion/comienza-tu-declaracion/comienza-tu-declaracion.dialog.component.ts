import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '@shared/dialog/dialog.component';
import { Router } from '@angular/router';
//import { Catalogo, DatosDialog } from '@models/declaracion';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
//import { tooltipData } from '@static/tooltips/situacion-patrimonial/datos-empleo';
import { DeclarationErrorStateMatcher } from '@app/presentar-declaracion/shared-presentar-declaracion/declaration-error-state-matcher';
import { DatosDialog } from '@models/declaracion/datos-dialog.model';

import puesto from '@static/catalogos/catalogoPuestos.json';
import tipoDeclaracion from '@static/catalogos/tipoDeclaracion.json';
import { tooltipData } from '@static/tooltips/situacion-patrimonial/crear_declaracion';



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
  tipoDeclaracion: String = null;
  tipoDeclaracionCatalogo = tipoDeclaracion;
  puestoCatalogo = puesto;
  isLoading = false;

  //fechaInicial: string = null;
  //fechaModificacion: string  = null;
  //fechaConclusion: string = null;

  anios: number[] = [];
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
    this.createForm();
  }

  cambioValores(value: any) {
    this.validarDeclaracion();
    //const tipoDeclaracion = this.datosDialogForm.get('tipoDeclaracion').value;
    if (value === 'inicial' || value === 'modificacion' || value === 'conclusion') {
      this.validarFecha(value);
    }
    //console.log(this.validarFecha)
  }

  validarDeclaracion() {
    const tipoDeclaracion = this.datosDialogForm.get('tipoDeclaracion').value;
    const puesto = this.datosDialogForm.get('puesto').value;

    if (tipoDeclaracion === "inicial" && puesto === "DIRECTIVO") {
      this.isCheckedCheckBoxInicial = false;
      this.isDisabledButtonInicialSimple = true;
      this.isDisabledButtonInicialCompleta = false;
      this.isDisabledButtonModificacionSimple = true;
      this.isDisabledButtonModificacionCompleta = true;
      this.isDisabledButtonConclusionSimple = true;
      this.isDisabledButtonConclusionCompleta = true;
    }
    else if (tipoDeclaracion === "inicial" && puesto === "OPERATIVO") {
      this.isCheckedCheckBoxInicial = true;
      this.isDisabledButtonInicialSimple = false;
      this.isDisabledButtonInicialCompleta = true;
      this.isDisabledButtonModificacionSimple = true;
      this.isDisabledButtonModificacionCompleta = true;
      this.isDisabledButtonConclusionSimple = true;
      this.isDisabledButtonConclusionCompleta = true;
    }
    else if (tipoDeclaracion === "modificacion" && puesto === "DIRECTIVO") {
      this.isCheckedCheckBoxModificacion = false;
      this.isDisabledButtonInicialSimple = true;
      this.isDisabledButtonInicialCompleta = true;
      this.isDisabledButtonModificacionSimple = true;
      this.isDisabledButtonModificacionCompleta = false;
      this.isDisabledButtonConclusionSimple = true;
      this.isDisabledButtonConclusionCompleta = true;
    }
    else if (tipoDeclaracion === "modificacion" && puesto === "OPERATIVO") {
      this.isCheckedCheckBoxModificacion = true;
      this.isDisabledButtonInicialSimple = true;
      this.isDisabledButtonInicialCompleta = true;
      this.isDisabledButtonModificacionSimple = false;
      this.isDisabledButtonModificacionCompleta = true;
      this.isDisabledButtonConclusionSimple = true;
      this.isDisabledButtonConclusionCompleta = true;
    }
    else if (tipoDeclaracion === "conclusion" && puesto === "DIRECTIVO") {
      this.isCheckedCheckBoxConclusion = false;
      this.isDisabledButtonInicialSimple = true;
      this.isDisabledButtonInicialCompleta = true;
      this.isDisabledButtonModificacionSimple = true;
      this.isDisabledButtonModificacionCompleta = true;
      this.isDisabledButtonConclusionSimple = true;
      this.isDisabledButtonConclusionCompleta = false;
    }
    else if (tipoDeclaracion === "conclusion" && puesto === "OPERATIVO") {
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

  validarFecha(value: any) {
    console.log("llega validarFecha "+value);
    const fechaInicial = this.datosDialogForm.get('fechaInicial').value;
    const fechaModificacion = this.datosDialogForm.get('fechaModificacion').value;
    const fechaConclusion = this.datosDialogForm.get('fechaConclusion').value;
    console.log('fechaInicial '+fechaInicial);
    console.log('fechaModificacion '+fechaModificacion);
    console.log('fechaConclusion '+fechaConclusion);


   /* const tipoDeclaracion = this.datosDialogForm.get('tipoDeclaracion');
    const groupInicial = tipoDeclaracion.get('inicial');
    const groupModificacion = tipoDeclaracion.get('modificacion');;
    const groupConclusion = tipoDeclaracion.get('conclusion');;
    */
    switch (value) {
      case 'inicial':
        console.log("llega switch " + value);
        this.datosDialogForm.controls.fechaModificacion.setValue('');
        this.datosDialogForm.controls.fechaConclusion.setValue('');
        /*
        groupInicial.reset();
        groupInicial.enable();
        groupModificacion.disable();
        groupConclusion.disable();
        */
        break;
      case 'modificacion':
        console.log("llega switch " + value);
        for(let i=2019; i<=this.anio; i++){
          this.anios.push(i);
        }
        console.log('this.anios: '+this.anios);
        this.datosDialogForm.controls.fechaInicial.setValue('');
        this.datosDialogForm.controls.fechaConclusion.setValue('');
        /*
        groupInicial.disable();
        groupModificacion.reset();
        groupModificacion.enable();
        groupConclusion.disable();
        */
        break;
      case 'conclusion':
        console.log("llega switch " + value);
        this.datosDialogForm.controls.fechaInicial.setValue('');
        this.datosDialogForm.controls.fechaModificacion.setValue('');
        /*
        groupInicial.disable();
        groupModificacion.disable();
        groupConclusion.reset();
        groupConclusion.enable();
        */
        break;
      default:
        console.log("llega break " + value);
        this.datosDialogForm.controls.fechaInicial.setValue('');
        this.datosDialogForm.controls.fechaModificacion.setValue('');
        this.datosDialogForm.controls.fechaConclusion.setValue('');
        break;
    }
  }

  ngOnInit(): void {}

  createForm() {
    this.datosDialogForm = this.formBuilder.group({
      tipoDeclaracion: [null, [Validators.required]],
      //fechaTomaPosesion: [null, [Validators.required]],
      fechaInicial: [null, [Validators.required]],
      fechaModificacion: [null, [Validators.required]],
      fechaConclusion: [null, [Validators.required]],
      puesto: [null, [Validators.required]],
    });
  }

  closeDialog() {
    var tipo = this.datosDialogForm.get('tipoDeclaracion').value;
    const puesto = this.datosDialogForm.get('puesto').value;
    console.log('puesto: ' + puesto);

    if (this.isValid()) {
      let url = '/' + tipo;
      if (puesto === "OPERATIVO") {
        url += '/simplificada';
        this.dialogRef.close({ data: '' })
      } else {
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

  isValid() {
    return true;
  }

  fillForm(datosComponenteForm: DatosDialog | undefined) {
    this.datosDialogForm.patchValue(datosComponenteForm || {});

  }
  confirmSaveInfo() {
    console.log("boton guardar");
  }
}

