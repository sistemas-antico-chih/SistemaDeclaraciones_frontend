import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent, DialogComponentMensaje } from '@shared/dialog/dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { declaracionMutation, datosGeneralesQuery, lastDeclaracionDatosGenerales } from '@api/declaracion';
import { DeclarationErrorStateMatcher } from '@app/presentar-declaracion/shared-presentar-declaracion/declaration-error-state-matcher';
import { UntilDestroy, untilDestroyed } from '@core';
import { DeclaracionOutput, DatosGenerales, LastDeclaracionOutput } from '@models/declaracion';
import { MenuStateService } from '@app/services/menu-state.service';

@UntilDestroy()
@Component({
  selector: 'app-datos-generales-aviso',
  templateUrl: './datos-generales.component.html',
  styleUrls: ['./datos-generales.component.scss'],
})
export class DatosGeneralesAvisoComponent implements OnInit {
  datosGeneralesForm: FormGroup;
  isLoading = false;
  pushButtonSave: boolean = false;
  
  declaracionSimplificada = false;
  tipoDeclaracion: string = null;
  declaracionId: string = null;
  
  errorMatcher = new DeclarationErrorStateMatcher();
  
  // Flag para determinar si la información es de un registro anterior
  isFromPreviousRecord = false;

  constructor(
    private apollo: Apollo,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private menuStateService: MenuStateService
  ) {
    const urlChunks = this.router.url.split('/');
    this.declaracionSimplificada = urlChunks[2] === 'simplificada';
    this.tipoDeclaracion = urlChunks[1] || null;

    console.log('🏗️ DatosGenerales inicializado:', {
      tipoDeclaracion: this.tipoDeclaracion,
      declaracionSimplificada: this.declaracionSimplificada,
      url: this.router.url
    });

    this.createForm();
    this.getUserInfo();
  }

  confirmSaveInfo() {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: 'Guardar cambios',
        message: '',
        trueText: 'Guardar',
        falseText: 'Cancelar',
      },
    });

    this.pushButtonSave = true;

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.saveInfo();
      }
    });
  }

  createForm() {
    this.datosGeneralesForm = this.formBuilder.group({
      nombre: [null, [Validators.required, Validators.pattern(/^\S.*$/)]],
      primerApellido: [null, [Validators.required, Validators.pattern(/^\S.*$/)]],
      segundoApellido: [null, [Validators.pattern(/^\S.*$/)]],
      curp: [null, [Validators.required, Validators.pattern(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/)]],
      rfc: [null, [Validators.required, Validators.pattern(/^[A-Z]{4}\d{6}[A-Z0-9]{3}$/)]],
      // Agregar más campos según tu formulario
    });
  }

  fillForm(datosGenerales: DatosGenerales) {
    this.datosGeneralesForm.patchValue(datosGenerales || {});
  }

  async getLastUserInfo() {
    try {
      const { data, errors } = await this.apollo
        .query<LastDeclaracionOutput>({
          query: lastDeclaracionDatosGenerales,
        })
        .toPromise();

      if (errors) {
        throw errors;
      }
      
      console.log('⚪ Cargando datos del REGISTRO ANTERIOR - datos-generales');
      this.isFromPreviousRecord = true;
      this.fillForm(data?.lastDeclaracion.datosGenerales);
      
      // ❌ NO marcar como guardado - debe aparecer en GRIS
      console.log('⚪ NO se marca como guardado → aparece en GRIS');
    } catch (error) {
      console.warn('⚠️ El usuario probablemente no tiene una declaración anterior:', error.message);
    }
  }

  async getUserInfo() {
    try {
      const { data, errors } = await this.apollo
        .query<DeclaracionOutput>({
          query: datosGeneralesQuery,
          variables: {
            tipoDeclaracion: this.tipoDeclaracion.toUpperCase(),
            declaracionCompleta: !this.declaracionSimplificada,
          },
        })
        .toPromise();

      if (errors) {
        throw errors;
      }

      this.declaracionId = data?.declaracion._id;
      
      if (data?.declaracion.datosGenerales === null) {
        console.log('⚪ No hay datos en registro actual, cargando del anterior');
        await this.getLastUserInfo();
      } else {
        console.log('🔵 Hay datos en REGISTRO ACTUAL - datos-generales');
        this.isFromPreviousRecord = false;
        this.fillForm(data?.declaracion.datosGenerales);

        // ✅ Marcar como guardado - debe aparecer en AZUL
        console.log('🔵 Marcando como guardado → aparece en AZUL');
        this.menuStateService.markSectionAsSaved(
          '/datos-generales',
          'aviso',
          this.tipoDeclaracion,
          this.declaracionSimplificada
        );
      }
    } catch (error) {
      console.error('❌ Error al obtener información:', error);
      this.openSnackBar('[ERROR: No se pudo recuperar la información]', 'Aceptar');
    }
  }

  formHasChanges() {
    let url = '/aviso/domicilio-declarante';
    let isDirty = this.datosGeneralesForm.dirty;
    console.log('📝 Form dirty:', isDirty);

    if (isDirty && !this.pushButtonSave) {
      const dialogRef = this.dialog.open(DialogComponent, {
        data: {
          title: 'Tienes cambios sin guardar',
          message: '¿Deseas continuar?',
          falseText: 'Cancelar',
          trueText: 'Continuar',
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) this.router.navigate([`${url}`], { replaceUrl: true });
      });
    } else {
      this.router.navigate([url]);
    }
  }

  ngOnInit(): void {
    this.pushButtonSave = false;
    const dialogRef = this.dialog.open(DialogComponentMensaje, {
      data: {
        title: '',
        messageAviso: `Recuerde Guardar la información del registro,`,
        messageAviso2: `dando clic en el botón correspondiente`,
        trueText: 'Aceptar',
      },
    });
  }

  openSnackBar(message: string, action: string = null) {
    this.snackBar.open(message, action, {
      duration: 5000,
    });
  }

  async saveInfo() {
    try {
      this.isLoading = true;

      const declaracion = {
        datosGenerales: this.datosGeneralesForm.value,
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

      // ✅ SIEMPRE marcar como guardado después de guardar exitosamente
      // Esto cambiará el color del menú de GRIS a AZUL
      console.log('✅ Guardando información en REGISTRO ACTUAL - datos-generales');
      console.log('🔵 Marcando como guardado → cambia a AZUL');
      
      this.menuStateService.markSectionAsSaved(
        '/datos-generales',
        'aviso',
        this.tipoDeclaracion,
        this.declaracionSimplificada
      );

      // Marcar que ya no es del registro anterior
      this.isFromPreviousRecord = false;

      this.openSnackBar('Información actualizada', 'Aceptar');
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      this.openSnackBar('[ERROR: No se guardaron los cambios]', 'Aceptar');
    }
  }
}