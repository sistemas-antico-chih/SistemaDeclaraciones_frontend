import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DeclarationErrorStateMatcher } from '@app/presentar-declaracion/shared-presentar-declaracion/declaration-error-state-matcher';
import { Apollo } from 'apollo-angular';
import { DeclaracionOutput } from '@models/declaracion';
import { datosGeneralesQuery } from '@api/declaracion';
import { tooltipData } from '@static/tooltips/situacion-patrimonial/crear_declaracion';



@Component({
  selector: 'comienza-tu-declaracion.dialog',
  templateUrl: './comienza-tu-declaracion.dialog.component.html',
  //styleUrls: ['./comienza-tu-declaracion.component.scss'],
})

export class DialogElementsExampleDialog implements OnInit {

  declaracionSimplificada = false;
  declaracionId: string = null;
  anio_ejercicio: number = new Date().getFullYear();

  tooltipData = tooltipData;
  errorMatcher = new DeclarationErrorStateMatcher();

  tipoDeclaracion: String = null;
  isLoading = false;

  ngOnInit(): void { }

  constructor(
    private router: Router,
    private dialogRef: MatDialogRef<DialogElementsExampleDialog>,
    private apollo: Apollo,
    @Inject(MAT_DIALOG_DATA) public data: any

  ) {
  }

  async closeDialog(route: string) {

    const splits = route.split("/");
    const tipoDeclaracion = splits[1];

    let formaDeclaracion = "completa";

    if (splits[2] === "simplificada") {
      formaDeclaracion = "simplificada";
    }

    const creada = await this.crearDeclaracion(
      tipoDeclaracion,
      formaDeclaracion
    );

    if (creada) {

      this.router.navigate(
        [`/${route}`],
        { replaceUrl: true }
      );

      this.dialogRef.close({ data: '' });

    }

    this.dialogRef.close({ data: '' });

  }

  async crearDeclaracion(tipoDeclaracion: string, formaDeclaracion: string) {
    try {
      const creada = await this.crearDeclaracion(
        tipoDeclaracion,
        formaDeclaracion
      );

      if (creada) {

        this.router.navigate(
          [`/${route}`],
          { replaceUrl: true }
        );

        this.dialogRef.close({ data: '' });

      }

      catch (error) {
        console.log(error);
        return false;
      }
    }

  }
}