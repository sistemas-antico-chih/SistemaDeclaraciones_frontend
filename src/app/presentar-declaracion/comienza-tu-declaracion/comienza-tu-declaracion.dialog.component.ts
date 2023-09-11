import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '@shared/dialog/dialog.component';
import { Router } from '@angular/router';
//import { Catalogo, DatosDialog } from '@models/declaracion';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
//import { tooltipData } from '@static/tooltips/situacion-patrimonial/datos-empleo';
import { DeclarationErrorStateMatcher } from '@app/presentar-declaracion/shared-presentar-declaracion/declaration-error-state-matcher';
import { DatosDialog } from '@models/declaracion/datos-dialog.model';

import { Apollo } from 'apollo-angular';
//import { statsTipoQuery, declaracionMutation } from '@api/declaracion';
import gql from 'graphql-tag';

import puesto from '@static/catalogos/catalogoPuestos.json';
import tipoDeclaracion from '@static/catalogos/tipoDeclaracion.json';
import { tooltipData } from '@static/tooltips/situacion-patrimonial/crear_declaracion';



@Component({
  selector: 'comienza-tu-declaracion.dialog',
  templateUrl: './comienza-tu-declaracion.dialog.component.html',
  //styleUrls: ['./comienza-tu-declaracion.component.scss'],
})

export class DialogElementsExampleDialog implements OnInit {

  declaraciones = 0;
  declaracionesIniciales = 0;
  declaracionesModificacion = 0;
  declaracionesFinales = 0;

  datosDialogForm: FormGroup;

  tooltipData = tooltipData;
  errorMatcher = new DeclarationErrorStateMatcher();

  tipoDeclaracion: String = null;
  tipoDeclaracionCatalogo = tipoDeclaracion;
  puestoCatalogo = puesto;
  isLoading = false;

  anios: number[] = [];
  minDate = new Date(1980, 1, 1);
  anio: number = new Date().getFullYear();
  mes: number = new Date().getMonth() + 1;
  dia: number = new Date().getDate();
  maxDate = new Date(this.anio, this.mes, this.dia);

  isDisabledCheckBoxInicial: boolean = true;
  isDisabledCheckBoxModificacion: boolean = true;
  isDisabledCheckBoxConclusion: boolean = true;

  isCheckedCheckBoxInicial: boolean = false;
  isCheckedCheckBoxModificacion: boolean = false;
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
    private apollo: Apollo,
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
      this.isCheckedCheckBoxModificacion = false;
      this.isCheckedCheckBoxConclusion = false;
      this.isDisabledButtonInicialSimple = true;
      this.isDisabledButtonInicialCompleta = false;
      this.isDisabledButtonModificacionSimple = true;
      this.isDisabledButtonModificacionCompleta = true;
      this.isDisabledButtonConclusionSimple = true;
      this.isDisabledButtonConclusionCompleta = true;
    }
    else if (tipoDeclaracion === "inicial" && puesto === "OPERATIVO") {
      this.isCheckedCheckBoxInicial = true;
      this.isCheckedCheckBoxModificacion = false;
      this.isCheckedCheckBoxConclusion = false;
      this.isDisabledButtonInicialSimple = false;
      this.isDisabledButtonInicialCompleta = true;
      this.isDisabledButtonModificacionSimple = true;
      this.isDisabledButtonModificacionCompleta = true;
      this.isDisabledButtonConclusionSimple = true;
      this.isDisabledButtonConclusionCompleta = true;
    }
    else if (tipoDeclaracion === "modificacion" && puesto === "DIRECTIVO") {
      this.isCheckedCheckBoxModificacion = false;
      this.isCheckedCheckBoxInicial = false;
      this.isCheckedCheckBoxConclusion = false;
      this.isDisabledButtonInicialSimple = true;
      this.isDisabledButtonInicialCompleta = true;
      this.isDisabledButtonModificacionSimple = true;
      this.isDisabledButtonModificacionCompleta = false;
      this.isDisabledButtonConclusionSimple = true;
      this.isDisabledButtonConclusionCompleta = true;
    }
    else if (tipoDeclaracion === "modificacion" && puesto === "OPERATIVO") {
      this.isCheckedCheckBoxModificacion = true;
      this.isCheckedCheckBoxInicial = false;
      this.isCheckedCheckBoxConclusion = false;
      this.isDisabledButtonInicialSimple = true;
      this.isDisabledButtonInicialCompleta = true;
      this.isDisabledButtonModificacionSimple = false;
      this.isDisabledButtonModificacionCompleta = true;
      this.isDisabledButtonConclusionSimple = true;
      this.isDisabledButtonConclusionCompleta = true;
    }
    else if (tipoDeclaracion === "conclusion" && puesto === "DIRECTIVO") {
      this.isCheckedCheckBoxConclusion = false;
      this.isCheckedCheckBoxInicial = false;
      this.isCheckedCheckBoxModificacion = false;
      this.isDisabledButtonInicialSimple = true;
      this.isDisabledButtonInicialCompleta = true;
      this.isDisabledButtonModificacionSimple = true;
      this.isDisabledButtonModificacionCompleta = true;
      this.isDisabledButtonConclusionSimple = true;
      this.isDisabledButtonConclusionCompleta = false;
    }
    else if (tipoDeclaracion === "conclusion" && puesto === "OPERATIVO") {
      this.isCheckedCheckBoxConclusion = true;
      this.isCheckedCheckBoxInicial = false;
      this.isCheckedCheckBoxModificacion = false;
      this.isDisabledButtonInicialSimple = true;
      this.isDisabledButtonInicialCompleta = true;
      this.isDisabledButtonModificacionSimple = true;
      this.isDisabledButtonModificacionCompleta = true;
      this.isDisabledButtonConclusionSimple = false;
      this.isDisabledButtonConclusionCompleta = true;
    }
    else {
      this.isCheckedCheckBoxInicial = false;
      this.isCheckedCheckBoxModificacion = false;
      this.isCheckedCheckBoxConclusion = false;
      this.isDisabledButtonInicialSimple = true;
      this.isDisabledButtonInicialCompleta = true;
      this.isDisabledButtonModificacionSimple = true;
      this.isDisabledButtonModificacionCompleta = true;
      this.isDisabledButtonConclusionSimple = true;
      this.isDisabledButtonConclusionCompleta = true;
    }
  }

  validarFecha(value: any) {
    const fechaInicial = this.datosDialogForm.get('fechaInicial').value;
    const fechaModificacion = this.datosDialogForm.get('fechaModificacion').value;
    const fechaConclusion = this.datosDialogForm.get('fechaConclusion').value;

    switch (value) {
      case 'inicial':
        this.datosDialogForm.controls.fechaModificacion.setValue('');
        this.datosDialogForm.controls.fechaConclusion.setValue('');
        break;
      case 'modificacion':
        for (let i = 2019; this.anio > i; this.anio--) {
          this.anios.push(this.anio);
        }
        this.datosDialogForm.controls.fechaInicial.setValue('');
        this.datosDialogForm.controls.fechaConclusion.setValue('');
        break;
      case 'conclusion':
        this.datosDialogForm.controls.fechaInicial.setValue('');
        this.datosDialogForm.controls.fechaModificacion.setValue('');
        break;
      default:
        this.datosDialogForm.controls.fechaInicial.setValue('');
        this.datosDialogForm.controls.fechaModificacion.setValue('');
        this.datosDialogForm.controls.fechaConclusion.setValue('');
        break;
    }
  }

  ngOnInit(): void { }

  createForm() {
    this.datosDialogForm = this.formBuilder.group({
      tipoDeclaracion: [null, [Validators.required]],
      fechaInicial: [null, [Validators.required]],
      fechaModificacion: [null, [Validators.required]],
      fechaConclusion: [null, [Validators.required]],
      puesto: [null, [Validators.required]],
    });
  }

  async closeDialog() {
    var tipo = this.datosDialogForm.get('tipoDeclaracion').value;
    const puesto = this.datosDialogForm.get('puesto').value;

    if (await this.isValid()) {
      console.log("closeDiaglo isValid IF");
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
      switch (tipo) {
        case "inicial":
          const dialogRefInicial = this.dialog.open(DialogComponent, {
            height: '300px',
            width: '600px',
            data: {
              title: 'No es posible iniciar la declaración de tipo INICIAL',
              message: 'Es neceario que exista la declaración firmada de tipo CONCLUSIÓN correspondiente, en caso de alguna duda favor de dirigirse a su Órano Interno de Control.',
              trueText: 'Continuar',
            },
          });
          break;
        case "modificacion":
          const dialogRefModificacion = this.dialog.open(DialogComponent, {
            data: {
              title: 'No es posible iniciar la declaración de tipo MODIFICACIÓN',
              message: 'Actualmente existe firmada una declaración de tipo INICIAL, sin embargo no existe firmada la declaración de tipo CONCLUSIÓN correspondiente',
              trueText: 'Continuar',
            },
          });
          break;
        case "conclusion":
          const dialogRefConclusion = this.dialog.open(DialogComponent, {
            data: {
              title: 'No es posible iniciar la declaración de tipo CONCLUSIÓN',
              message: 'Es necesario que exista una declaración firmada de tipo INICIAL para poder realizar una declaración de tipo CONCLUSIÓN, en caso de alguna duda favor de dirigirse a su Órgano Interno de Control.',
              trueText: 'Continuar',
            },
          });
          break;
      }


      /*const dialogReff = this.dialog.open(DialogComponent, {
        data: {
          title: 'No es posible iniciar la declaración de tipo INICIAL',
          message: 'Actualmente existe firmada una declaración de tipo INICIAL, sin embargo no existe firmada la declaración de tipo CONCLUSIÓN correspondiente',   
          trueText: 'Continuar',
        },
      });*/
      //dialogReff.close({ data: '' })
    }

    //this.dialogRef.close({ data: '' })
  }

  async isValid() {
    var tipo = this.datosDialogForm.get('tipoDeclaracion').value;
    //console.log('tipoDeclaracion: ' + tipo);

    switch (tipo) {
      case 'inicial':
        const validaInicial = await this.verificarDeclaracionInicial();
        if (validaInicial)
          return true;
        else
          return false;
      case 'modificacion':
        console.log("llega switch modif");
        return false;
        break;
      case 'conclusion':
        const validaConclusion = await this.verificarDeclaracionConclusion();
        if (validaConclusion)
          return true;
        else
          return false
    }
    return true;
  }

  async verificarDeclaracionInicial() {
    console.log("llega a verificacionDeclaracionInicial()")
    try {
      const { data }: any = await this.apollo
        .query({
          // query: statsTipoQuery,
          query: gql`
            query statsTipo {
              statsTipo {
                counters{
                  tipoDeclaracion
                  count
                }
              }
            }
          `,

          /*variables: {
            tipoDeclaracion: tipo.toUpperCase(),
            //total: !this.declaracionSimplificada,
          },*/
        })
        .toPromise();
      this.declaraciones = data.statsTipo.total || 0;
      this.declaracionesIniciales = data.statsTipo.counters.find((d: any) => d.tipoDeclaracion === 'INICIAL')?.count || 0;
      this.declaracionesFinales = data.statsTipo.counters.find((d: any) => d.tipoDeclaracion === 'CONCLUSION')?.count || 0;

      console.log("declaracionesIniciales: " + this.declaracionesIniciales);
      console.log("declaracionesFinales: " + this.declaracionesFinales);
      console.log("declaraciones resta: " + (this.declaracionesIniciales - this.declaracionesFinales));

    } catch (error) {
      console.log(error);
      return 0;
    }
    //return  this.declaracionesIniciales - this.declaracionesFinales;
    if (this.declaracionesIniciales - this.declaracionesFinales === 0)
      return true;
    else
      return false;

  }

  async verificarDeclaracionConclusion() {
    console.log("llega a verificarDeclaracionConclusion()")
    try {
      const { data }: any = await this.apollo
        .query({
          // query: statsTipoQuery,
          query: gql`
            query statsTipo {
              statsTipo {
                counters{
                  tipoDeclaracion
                  count
                }
              }
            }
          `,

          /*variables: {
            tipoDeclaracion: tipo.toUpperCase(),
            //total: !this.declaracionSimplificada,
          },*/
        })
        .toPromise();
      this.declaraciones = data.statsTipo.total || 0;
      this.declaracionesIniciales = data.statsTipo.counters.find((d: any) => d.tipoDeclaracion === 'INICIAL')?.count || 0;
      this.declaracionesFinales = data.statsTipo.counters.find((d: any) => d.tipoDeclaracion === 'CONCLUSION')?.count || 0;

      console.log("declaracionesIniciales: " + this.declaracionesIniciales);
      console.log("declaracionesFinales: " + this.declaracionesFinales);
      console.log("declaraciones resta: " + (this.declaracionesIniciales - this.declaracionesFinales));

    } catch (error) {
      console.log(error);
      return 0;
    }
    //return  this.declaracionesIniciales - this.declaracionesFinales;
    if (this.declaracionesIniciales - this.declaracionesFinales === 0)
      return false;
    else
      return true;

  }
  /*
  async saveInfo() {
    try {
      this.isLoading = true;
      const declaracion = {
        datosEmpleoCargoComision: this.datosEmpleoCargoComisionForm.value,
      };

      const { errors } = await this.apollo
        .mutate({
          mutation: declaracionMutation,
          variables: {
            id: this.declaracionId,
            declaracion,
          },
        })
        .toPromise();

      if (errors) {
        throw errors;
      }

      this.isLoading = false;
      this.openSnackBar('Información actualizada', 'Aceptar');
    } catch (error) {
      console.log(error);
      this.openSnackBar('[ERROR: No se guardaron los cambios]', 'Aceptar');
    }
  }
  */



  fillForm(datosComponenteForm: DatosDialog | undefined) {
    this.datosDialogForm.patchValue(datosComponenteForm || {});

  }
  confirmSaveInfo() {
    console.log("boton guardar");
  }
}

