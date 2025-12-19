import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent, DialogComponentMensaje } from '@shared/dialog/dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  datosEmpleoCargoComisionQuery,
  //declaracionMutation,
  datosEmpleoCargoComisionMutation,
  lastDatosEmpleoCargoComisionQuery,
} from '@api/declaracion';
import { DeclarationErrorStateMatcher } from '@app/presentar-declaracion/shared-presentar-declaracion/declaration-error-state-matcher';
import { UntilDestroy, untilDestroyed } from '@core';
import { DeclaracionOutput, DatosEmpleo, LastDeclaracionOutput } from '@models/declaracion';
import { MenuStateService } from '@app/services/menu-state.service';

@UntilDestroy()
@Component({
  selector: 'app-datos-empleo-aviso',
  templateUrl: './datos-empleo.component.html',
  styleUrls: ['./datos-empleo.component.scss'],
})
export class DatosEmpleoAvisoComponent implements OnInit {
  datosEmpleoForm: FormGroup;
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

    console.log('🏗️ DatosEmpleo inicializado:', {
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
    this.datosEmpleoForm = this.formBuilder.group({
      nivelOrdenGobierno: [null, [Validators.required]],
      ambitoPublico: [null, [Validators.required]],
      nombreEntePublico: [null, [Validators.required, Validators.pattern(/^\S.*$/)]],
      areaAdscripcion: [null, [Validators.required, Validators.pattern(/^\S.*$/)]],
      empleoCargoComision: [null, [Validators.required, Validators.pattern(/^\S.*$/)]],
      funcionPrincipal: [null, [Validators.required, Validators.pattern(/^\S.*$/)]],
      fechaTomaPosesion: [null, [Validators.required]],
      // Agregar más campos según tu formulario
    });
  }

  fillForm(datosEmpleo: DatosEmpleo) {
    this.datosEmpleoForm.patchValue(datosEmpleo || {});
  }

  async getLastUserInfo() {
    try {
      const { data, errors } = await this.apollo
        .query<LastDeclaracionOutput>({
          query: lastDatosEmpleoCargoComisionQuery,
        })
        .toPromise();

      if (errors) {
        throw errors;
      }
      
      console.log('⚪ Cargando datos del REGISTRO ANTERIOR - datos-empleo');
      this.isFromPreviousRecord = true;
      this.fillForm(data?.lastDeclaracion.datosEmpleo);
      
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
          query: datosEmpleoCargoComisionQuery,
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
      
      if (data?.declaracion.datosEmpleo === null) {
        console.log('⚪ No hay datos en registro actual, cargando del anterior');
        await this.getLastUserInfo();
      } else {
        console.log('🔵 Hay datos en REGISTRO ACTUAL - datos-empleo');
        this.isFromPreviousRecord = false;
        this.fillForm(data?.declaracion.datosEmpleo);

        // ✅ Marcar como guardado - debe aparecer en AZUL
        console.log('🔵 Marcando como guardado → aparece en AZUL');
        this.menuStateService.markSectionAsSaved(
          '/datos-empleo',
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
    // Navegar a la siguiente sección o finalizar
    let url = '/aviso/finalizar'; // O la siguiente sección
    let isDirty = this.datosEmpleoForm.dirty;
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
        datosEmpleo: this.datosEmpleoForm.value,
      };

      const { errors } = await this.apollo
        .mutate({
          mutation: datosEmpleoCargoComisionMutation,
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
      console.log('✅ Guardando información en REGISTRO ACTUAL - datos-empleo');
      console.log('🔵 Marcando como guardado → cambia a AZUL');
      
      this.menuStateService.markSectionAsSaved(
        '/datos-empleo',
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
