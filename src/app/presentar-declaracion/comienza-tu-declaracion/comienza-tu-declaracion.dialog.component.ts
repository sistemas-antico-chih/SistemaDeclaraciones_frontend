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
import { DeclaracionOutput } from '@models/declaracion';
import { datosGeneralesQuery } from '@api/declaracion';

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
  declaracionesModificacionCompleta = 0;
  declaracionesModificacionSimple = 0;
  declaracionesFinales = 0;

  declaracionSimplificada = false;
  declaracionId: string = null;
  anio_ejercicio: number = new Date().getFullYear();



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
  maxDate = new Date(this.anio, this.mes - 1, this.dia);

  ngOnInit(): void { }

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private dialogRef: MatDialogRef<DialogElementsExampleDialog>,
    private apollo: Apollo,
    @Inject(MAT_DIALOG_DATA) public data: any

  ) {
  }

  async closeDialog(route: string) {
    var splits = route.split("/");
    var tipoDeclaracion = splits[1];
    var formaDeclaracion = splits[2];

    if (splits[2] == "simplificada") {
      formaDeclaracion = 'simplificada';
    }
    else {
      formaDeclaracion = "completa";
    }

    if (await this.isValid(tipoDeclaracion, formaDeclaracion)) {
      this.router.navigate([`/${route}`], { replaceUrl: true });
      this.dialogRef.close({ data: '' })
    }

    else {
      switch (tipoDeclaracion) {
        case "inicial":
          const dialogRefInicial = this.dialog.open(DialogComponent, {
            height: '240px',
            width: '600px',
            data: {
              title: 'No es posible iniciar la declaración de tipo INICIAL',
              message: 'Ya cuenta con una declaración INICIAL firmada o no existe una declaración firmada de tipo CONCLUSIÓN correspondiente, en caso de alguna duda favor de dirigirse a su Órgano Interno de Control.',
              trueText: 'Continuar',
            },
          });
          break;
        case "modificacion":
          const fechaModificacion = this.anio;
          const dialogRefModificacion = this.dialog.open(DialogComponent, {
            height: '240px',
            width: '600px',
            data: {
              title: 'No es posible iniciar la declaración de tipo MODIFICACIÓN',
              message: `No cuenta con una declaración de tipo INICIAL o ya se encuentra firmada una declaración de tipo MODIFICACIÓN para el año ${fechaModificacion}, en caso de alguna duda favor de dirigirse a su Órgano Interno de Control.`,
              trueText: 'Continuar',
            },
          });
          break;
        case "conclusion":
          const dialogRefConclusion = this.dialog.open(DialogComponent, {
            height: '240px',
            width: '600px',
            data: {
              title: 'No es posible iniciar la declaración de tipo CONCLUSIÓN',
              message: 'Es necesario que exista una declaración firmada de tipo INICIAL para poder realizar una declaración de tipo CONCLUSIÓN, en caso de alguna duda favor de dirigirse a su Órgano Interno de Control.',
              trueText: 'Continuar',
            },
          });
          break;
      }
    }
  }

  async isValid(tipoDeclaracion: string, formaDeclaracion: string) {
    switch (tipoDeclaracion) {
      case 'inicial':
        const validaInicial = await this.verificarDeclaracionInicial(tipoDeclaracion, formaDeclaracion);
        if (validaInicial)
          return true;
        else
          return false;
      case 'modificacion':
        if (formaDeclaracion === "completa") {
          console.log("llega switch")
          const validaModificacion = await this.verificarDeclaracionModificacionCompleta(this.anio, tipoDeclaracion, formaDeclaracion);
          if (validaModificacion)
            return true;
          else
            return false
        }
        if (formaDeclaracion === "simplificada") {
          const validaModificacion = await this.verificarDeclaracionModificacionSimple(this.anio, tipoDeclaracion, formaDeclaracion);
          if (validaModificacion)
            return true;
          else
            return false
        }
      case 'conclusion':
        const validaConclusion = await this.verificarDeclaracionConclusion(tipoDeclaracion, formaDeclaracion);
        if (validaConclusion)
          return true;
        else
          return false
    }
    return true;
  }

  async verificarDeclaracionInicial(tipoDeclaracion: string, formaDeclaracion: string) {
    try {
      const { data }: any = await this.apollo
        .query({
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
        })
        .toPromise();
      this.declaraciones = data.statsTipo.counters.count || 0;
      this.declaracionesIniciales = data.statsTipo.counters.find((d: any) => d.tipoDeclaracion === 'INICIAL')?.count || 0;
      this.declaracionesFinales = data.statsTipo.counters.find((d: any) => d.tipoDeclaracion === 'CONCLUSION')?.count || 0;

    } catch (error) {
      console.log(error);
      return false;
    }
    if (this.declaracionesIniciales - this.declaracionesFinales === 0) {
      await this.crearDeclaracion(tipoDeclaracion, formaDeclaracion);
      return true;
    }
    else
      return false;
  }

  async verificarDeclaracionConclusion(tipoDeclaracion: string, formaDeclaracion: string) {
    try {
      const { data }: any = await this.apollo
        .query({
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
        })
        .toPromise();
      this.declaraciones = data.statsTipo.counters.count || 0;
      this.declaracionesIniciales = data.statsTipo.counters.find((d: any) => d.tipoDeclaracion === 'INICIAL')?.count || 0;
      this.declaracionesFinales = data.statsTipo.counters.find((d: any) => d.tipoDeclaracion === 'CONCLUSION')?.count || 0;

    } catch (error) {
      console.log(error);
      return false;
    }
    if (this.declaracionesIniciales - this.declaracionesFinales === 0)
      return false;
    else {
      await this.crearDeclaracion(tipoDeclaracion, formaDeclaracion);
      return true;
    }
  }

  async verificarDeclaracionModificacionCompleta(fechaModificacion: any,
    tipoDeclaracion: string, formaDeclaracion: string) {
    try {
      console.log("llega verficacion");
      const { data }: any = await this.apollo
        .query({
          query: gql`
            query statsModif {
              statsModif {
                counters{
                  anioEjercicio
                  declaracionCompleta
                  count
                }
              }
            }
          `,
        })
        .toPromise();

        console.log("llega verficacion 2");

      this.declaraciones = data.statsModif.counters.count || 0;
      this.declaracionesModificacionCompleta = data.statsModif.counters.find((d: any) => d.anioEjercicio === fechaModificacion && d.declaracionCompleta === true)?.count || 0;
      
      const { dataTipo }: any = await this.apollo
        .query({
          query: gql`
            query statsTipoDec {
              statsTipoDec {
                counters{
                  tipoDeclaracion
                  count
                }
              }
            }
          `,
        })
        .toPromise();
        console.log("llega verficacion 3");

      this.declaracionesIniciales = dataTipo.statsTipoDec.counters.find((d: any) => d.tipoDeclaracion === 'INICIAL')?.count || 0;
      this.declaracionesFinales = dataTipo.statsTipoDec.counters.find((d: any) => d.tipoDeclaracion === 'CONCLUSION')?.count || 0;
      console.log("declaraciones: " + this.declaraciones);
      console.log("declaracionesModificacion: " + this.declaracionesModificacionCompleta);
      console.log("declaracionesIniciales: " + this.declaracionesIniciales);
      console.log("declaracionesFinales: " + this.declaracionesFinales);
    } catch (error) {
      console.log(error);
      return false;
    }
    if (this.declaracionesModificacionCompleta === 0 && (this.declaracionesIniciales - this.declaracionesFinales) > 0) {
      console.log("llega creacion");
      await this.crearDeclaracion(tipoDeclaracion, formaDeclaracion);
      return true;
    }
    else
      console.log("llega false");
    return false;
  }

  async verificarDeclaracionModificacionSimple(fechaModificacion: any,
    tipoDeclaracion: string, formaDeclaracion: string) {
    try {
      const { data }: any = await this.apollo
        .query({
          query: gql`
            query statsModif {
              statsModif {
                counters{
                  anioEjercicio
                  declaracionCompleta
                  count
                }
              }
            }
          `,
        })
        .toPromise();
        this.declaraciones = data.statsModif.counters.count || 0;
        this.declaracionesModificacionCompleta = data.statsModif.counters.find((d: any) => d.anioEjercicio === fechaModificacion && d.declaracionCompleta === true)?.count || 0;
        const { dataTipo }: any = await this.apollo
          .query({
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
          })
          .toPromise();
        this.declaracionesIniciales = dataTipo.statsTipo.counters.find((d: any) => d.tipoDeclaracion === 'INICIAL')?.count || 0;
        this.declaracionesFinales = dataTipo.statsTipo.counters.find((d: any) => d.tipoDeclaracion === 'CONCLUSION')?.count || 0;
        console.log("declaraciones: " + this.declaraciones);
        console.log("declaracionesModificacion: " + this.declaracionesModificacionCompleta);
        console.log("declaracionesIniciales: " + this.declaracionesIniciales);
        console.log("declaracionesFinales: " + this.declaracionesFinales);
      } catch (error) {
        console.log(error);
        return false;
      }
      if (this.declaracionesModificacionCompleta === 0 && (this.declaracionesIniciales - this.declaracionesFinales) > 0) {
        console.log("llega creacion");
        await this.crearDeclaracion(tipoDeclaracion, formaDeclaracion);
        return true;
      }
      else
        console.log("llega false");
      return false;
    }

  async crearDeclaracion(tipoDeclaracion: string, formaDeclaracion: string) {
    try {
      if (formaDeclaracion === "completa") {
        this.declaracionSimplificada = false;
      }
      else {
        this.declaracionSimplificada = true
      }

      const { data, errors } = await this.apollo
        .query<DeclaracionOutput>({
          query: datosGeneralesQuery,
          variables: {
            tipoDeclaracion: tipoDeclaracion.toUpperCase(),
            declaracionCompleta: !this.declaracionSimplificada,
            anioEjercicio: this.anio_ejercicio
          },
        })
        .toPromise();

      if (errors) {
        throw errors;
      }

      this.declaracionId = data?.declaracion._id;
      this.anio_ejercicio = data?.declaracion.anioEjercicio;
    } catch (error) {
      console.log(error);
    }
  }

  confirmSaveInfo() {
    console.log("boton guardar");
  }
}