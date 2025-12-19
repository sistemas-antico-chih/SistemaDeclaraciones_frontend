import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormGroup, FormBuilder, Validators, FormControl,
  AbstractControl, ValidatorFn, ValidationErrors
} from '@angular/forms';
import * as moment from 'moment';
import { Router } from '@angular/router';

import { MatSelect } from '@angular/material/select';
import { Apollo } from 'apollo-angular';

import { MatDialog } from '@angular/material/dialog';
import { DialogComponent, DialogComponentMensaje } from '@shared/dialog/dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  datosEmpleoCargoComisionQuery,
  datosEmpleoCargoComisionMutation,
  lastDatosEmpleoCargoComisionQuery,
} from '@api/declaracion';
import { DeclarationErrorStateMatcher } from '@app/presentar-declaracion/shared-presentar-declaracion/declaration-error-state-matcher';
import { Catalogo, DatosEmpleoCargoComision, DeclaracionOutput, LastDeclaracionOutput } from '@models/declaracion';
import AmbitoPublico from '@static/catalogos/ambitoPublicoMunicipal.json';
import Estados from '@static/catalogos/estados.json';
import EstadoFijo from '@static/catalogos/estadoFijo.json';
import Municipios from '@static/catalogos/municipios.json';
import NivelOrdenGobierno from '@static/catalogos/nivelOrdenGobiernoEmpleo.json';
import Paises from '@static/catalogos/paises.json';
import entePublico from '@static/catalogos/entePublico_municipios.json';
import { tooltipData } from '@static/tooltips/situacion-patrimonial/datos-empleo';
import { findOption } from '@utils/utils';
import { UntilDestroy, untilDestroyed } from '@app/@core';
import { MenuStateService } from '@app/services/menu-state.service';

@UntilDestroy()
@Component({
  selector: 'app-datos-empleo',
  templateUrl: './datos-empleo.component.html',
  styleUrls: ['./datos-empleo.component.scss'],
})
export class DatosEmpleoAvisoComponent implements OnInit {

  orden: string;
  ambito: string;
  aclaraciones = false;
  datosEmpleoCargoComisionForm: FormGroup;
  estado: Catalogo = null;
  isLoading = false;
  entePublicoCatalogo = entePublico;
  entePublicoFiltrado = entePublico;
  entesFiltrados: any = [];
  pushButtonSave: boolean = false;
  entePublicoInicia: String = null;

  @ViewChild('tipoDomicilioInput') tipoDomicilioInput: MatSelect;

  nivelOrdenGobiernoCatalogo = NivelOrdenGobierno;
  ambitoPublicoCatalogo = AmbitoPublico;
  estadosCatalogo = EstadoFijo;
  municipiosCatalogo = Municipios;
  paisesCatalogo = Paises;

  declaracionSimplificada = false;
  tipoDeclaracion: string = null;
  tipoDomicilio: string = null;

  declaracionId: string = null;

  tooltipData = tooltipData;
  errorMatcher = new DeclarationErrorStateMatcher();

  minDate = new Date(1980, 1, 1);
  anio: number = new Date().getFullYear();
  mes: number = new Date().getMonth() + 1;
  dia: number = new Date().getDate();
  maxDate = new Date(this.anio, this.mes - 1, this.dia);
  minDateInicio = new Date();

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
    console.log('🏗️ DatosEmpleoAvisoComponent constructor');
    console.log('📦 MenuStateService inyectado:', this.menuStateService);

    // Exponer globalmente para debug
    (window as any).debugMenuService = this.menuStateService;
    (window as any).debugSaveSection = () => {
      console.log('🔧 Guardando desde window.debugSaveSection()');
      this.menuStateService.markSectionAsSaved(
        '/datos-empleo',
        'aviso',
        this.tipoDeclaracion,
        this.declaracionSimplificada
      );
    };

    const urlChunks = this.router.url.split('/');
    this.declaracionSimplificada = urlChunks[2] === 'simplificada';
    this.tipoDeclaracion = urlChunks[1] || null;

    console.log('🔧 Configuración:', {
      tipoDeclaracion: this.tipoDeclaracion,
      declaracionSimplificada: this.declaracionSimplificada,
      url: this.router.url
    });

    this.createForm();
    this.getUserInfo();
  }

  confirmSaveInfo() {
    console.log('🔔 confirmSaveInfo() llamado');

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
      console.log('🔔 Diálogo cerrado, resultado:', result);
      if (result) {
        console.log('✅ Usuario confirmó, llamando saveInfo()...');
        this.saveInfo();
      } else {
        console.log('❌ Usuario canceló');
      }
    });
  }

  createForm() {
    this.datosEmpleoCargoComisionForm = this.formBuilder.group({
      nombreEntePublico: [null, [Validators.required, Validators.pattern(/^\S.*\S$/)]],
      areaAdscripcionConcluye: [null, [Validators.required, Validators.pattern(/^\S.*\S$/)]],
      nivelEmpleoCargoComisionConcluye: [null, [Validators.required, Validators.pattern(/^\S.*\S$/)]],
      fechaConclusionEncargo: [null, [Validators.required, this.validarFECHA]],
      areaAdscripcion: [null, [Validators.required, Validators.pattern(/^\S.*\S$/)]],
      funcionPrincipal: [null, [Validators.required, Validators.pattern(/^\S.*\S$/)]],
      empleoCargoComision: [null, [Validators.required, Validators.pattern(/^\S.*\S$/)]],
      fechaTomaPosesion: [null, [Validators.required, this.validarFECHA]],
      contratadoPorHonorarios: [null, [Validators.required]],
      nivelEmpleoCargoComision: [null, [Validators.required, Validators.pattern(/^\S.*\S$/)]],
      domicilioMexico: this.formBuilder.group({
        calle: [null, [Validators.required, Validators.pattern(/^\S.*$/)]],
        numeroExterior: [null, [Validators.required, Validators.pattern(/^\S.*$/)]],
        numeroInterior: [null, [Validators.pattern(/^\S.*$/)]],
        coloniaLocalidad: [null, [Validators.required, Validators.pattern(/^\S.*$/)]],
        municipioAlcaldia: [{ disabled: true, value: null }, [Validators.required]],
        entidadFederativa: [null, [Validators.required]],
        codigoPostal: [null, [Validators.required, Validators.pattern(/^\d{5}$/i)]],
      }),
      domicilioExtranjero: this.formBuilder.group({
        calle: [null, [Validators.required, Validators.pattern(/^\S.*$/)]],
        numeroExterior: [null, [Validators.required, Validators.pattern(/^\S.*$/)]],
        numeroInterior: [null, [Validators.pattern(/^\S.*$/)]],
        ciudadLocalidad: [null, [Validators.required, Validators.pattern(/^\S.*$/)]],
        estadoProvincia: [null, [Validators.required, Validators.pattern(/^\S.*$/)]],
        pais: [null, [Validators.required]],
        codigoPostal: [null, [Validators.required, Validators.pattern(/^\d{5}$/i)]],
      }),
      aclaracionesObservaciones: [
        { disabled: true, value: '' },
        [Validators.required, Validators.pattern(/^\S.*\S?$/)],
      ],
      cuentaConOtroCargoPublico: [
        { disabled: this.tipoDeclaracion !== 'modificacion', value: null },
        [Validators.required],
      ],
    });

    const estado = this.datosEmpleoCargoComisionForm.get('domicilioMexico').get('entidadFederativa');
    estado.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      const municipio = this.datosEmpleoCargoComisionForm.get('domicilioMexico').get('municipioAlcaldia');

      if (value) {
        municipio.enable();
      } else {
        municipio.disable();
        municipio.reset();
      }
      this.estado = value;
    });
  }

  validarFECHA(control: FormControl) {
    const fechaActual = moment().startOf('day');

    const fechaIni = control.root.get('fechaTomaPosesion')?.value
      ? moment(control.root.get('fechaTomaPosesion')?.value).startOf('day')
      : null;

    const fechaFin = control.root.get('fechaConclusionEncargo')?.value
      ? moment(control.root.get('fechaConclusionEncargo')?.value).startOf('day')
      : null;

    const fechaControl = control.value ? moment(control.value).startOf('day') : null;

    if (fechaControl && fechaControl.isAfter(fechaActual)) {
      return { fechaFutura: true };
    }

    if (fechaIni && fechaFin) {
      if (!fechaIni.isAfter(fechaFin)) {
        return { ordenIncorrecto: true };
      }
    }

    return null;
  }

  fillForm(datosEmpleoCargoComision: DatosEmpleoCargoComision | undefined) {
    if (!datosEmpleoCargoComision) return;

    // 🧠 Detectar si el registro ya está completo (ya tiene área de conclusión)
    const registroConcluido =
      !!datosEmpleoCargoComision.areaAdscripcionConcluye?.trim() ||
      !!datosEmpleoCargoComision.nivelEmpleoCargoComisionConcluye?.trim() ||
      !!datosEmpleoCargoComision.fechaConclusionEncargo;

    console.log('📋 Llenando formulario:', {
      registroConcluido,
      areaAdscripcionConcluye: datosEmpleoCargoComision.areaAdscripcionConcluye,
      declaracionId: this.declaracionId
    });

    if (registroConcluido) {
      // ✅ Caso 1: Registro ya concluido → poblar todo sin modificar
      console.log('✅ Registro COMPLETO - información del registro ACTUAL');
      this.datosEmpleoCargoComisionForm.patchValue(datosEmpleoCargoComision);
      this.isFromPreviousRecord = false; // Ya fue guardado en este registro

      // ✅ Marcar como guardado porque es del registro actual
      this.menuStateService.markSectionAsSaved(
        '/datos-empleo',
        'aviso',
        this.tipoDeclaracion,
        this.declaracionSimplificada
      );
    } else {
      // ⚠️ Caso 2: No hay registro previo → llenar con datos "de inicio"
      console.log('⚠️ Registro INCOMPLETO - información del registro ANTERIOR');

      if (datosEmpleoCargoComision.areaAdscripcion) {
        datosEmpleoCargoComision.areaAdscripcionConcluye = datosEmpleoCargoComision.areaAdscripcion;
        datosEmpleoCargoComision.areaAdscripcion = '';
      }

      if (datosEmpleoCargoComision.nivelEmpleoCargoComision) {
        datosEmpleoCargoComision.nivelEmpleoCargoComisionConcluye =
          datosEmpleoCargoComision.nivelEmpleoCargoComision;
        datosEmpleoCargoComision.nivelEmpleoCargoComision = '';
      }

      datosEmpleoCargoComision.fechaTomaPosesion = null;
      datosEmpleoCargoComision.fechaConclusionEncargo = null;

      const nombreEnte = datosEmpleoCargoComision.nombreEntePublico;
      this.datosEmpleoCargoComisionForm.patchValue(datosEmpleoCargoComision);
      this.datosEmpleoCargoComisionForm.get('nombreEntePublico')?.setValue(nombreEnte);

      this.isFromPreviousRecord = true; // Datos del registro anterior

      // ❌ NO marcar como guardado porque es del registro anterior
    }

    if (datosEmpleoCargoComision.aclaracionesObservaciones) {
      this.toggleAclaraciones(true);
    }

    this.setSelectedOptions(datosEmpleoCargoComision);
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

      this.isFromPreviousRecord = true;
      this.fillForm(data?.lastDeclaracion.datosEmpleoCargoComision);
    } catch (error) {
      console.warn('El usuario probablemente no tienen una declaración anterior', error.message);
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
      if (data?.declaracion.datosEmpleoCargoComision === null) {
        this.getLastUserInfo();
      } else {
        console.log('✅ Hay datos en registro actual - datos-empleo');
        this.fillForm(data?.declaracion.datosEmpleoCargoComision);
        this.isFromPreviousRecord = false; // Es del registro actual

        // ✅ Marcar como guardado porque ya existe en el registro actual
        this.menuStateService.markSectionAsSaved(
          '/datos-empleo',
          'aviso',
          this.tipoDeclaracion,
          this.declaracionSimplificada
        );
      }
    } catch (error) {
      console.error(error);
      this.openSnackBar('[ERROR: No se pudo recuperar la información]', 'Aceptar');
    }
  }

  formHasChanges() {
    let url = '/aviso/datos-empleo';
    let isDirty = this.datosEmpleoCargoComisionForm.dirty;
    console.log(isDirty);

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
        if (result) this.router.navigate([url + '/situacion-patrimonial/experiencia-laboral']);
      });
    } else {
      this.router.navigate([url + '/situacion-patrimonial/experiencia-laboral']);
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
        datosEmpleoCargoComision: this.datosEmpleoCargoComisionForm.value,
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

      // ✅ CRÍTICO: Solo marcar como guardado si NO es del registro anterior
      if (!this.isFromPreviousRecord) {
        console.log('✅ Guardando información del REGISTRO ACTUAL - datos-empleo');
        this.menuStateService.markSectionAsSaved(
          '/datos-empleo',
          'aviso',
          this.tipoDeclaracion,
          this.declaracionSimplificada
        );
      } else {
        console.log('⚠️ No marcar como guardado - es información del registro ANTERIOR');
      }

      // Marcar que ya no es del registro anterior después de guardar
      this.isFromPreviousRecord = false;

      this.openSnackBar('Información actualizada', 'Aceptar');
    } catch (error) {
      console.error('❌ Error en saveInfo:', error);
      this.openSnackBar('[ERROR: No se guardaron los cambios]', 'Aceptar');
    }
  }

  setSelectedOptions(datosEmpleoCargoComision: DatosEmpleoCargoComision) {
    const { domicilioExtranjero, domicilioMexico } = datosEmpleoCargoComision ?? {};

    if (domicilioMexico) {
      this.datosEmpleoCargoComisionForm
        .get('domicilioMexico.entidadFederativa')
        .setValue(findOption(this.estadosCatalogo, domicilioMexico.entidadFederativa?.clave));
      this.datosEmpleoCargoComisionForm
        .get('domicilioMexico.municipioAlcaldia')
        .setValue(
          findOption(this.municipiosCatalogo[this.estado?.clave] || [], domicilioMexico.municipioAlcaldia?.clave)
        );
      this.tipoDomicilioInput.writeValue('MEXICO');
      this.tipoDomicilioChanged('MEXICO');
    } else if (domicilioExtranjero) {
      this.tipoDomicilioInput.writeValue('EXTRANJERO');
      this.tipoDomicilioChanged('EXTRANJERO');
    }
  }

  tipoDomicilioChanged(value: string) {
    this.tipoDomicilio = value;
    const notSelectedType = this.tipoDomicilio === 'MEXICO' ? 'domicilioExtranjero' : 'domicilioMexico';
    const selectedType = this.tipoDomicilio === 'EXTRANJERO' ? 'domicilioExtranjero' : 'domicilioMexico';

    const notSelected = this.datosEmpleoCargoComisionForm.get(notSelectedType);
    notSelected.disable();
    notSelected.reset();

    this.datosEmpleoCargoComisionForm.get(selectedType).enable();
  }

  toggleAclaraciones(value: boolean) {
    const aclaraciones = this.datosEmpleoCargoComisionForm.get('aclaracionesObservaciones');
    if (value) {
      aclaraciones.enable();
    } else {
      aclaraciones.disable();
      aclaraciones.reset();
    }
    this.aclaraciones = value;
  }

  entePublicoChanged(value: string) {
    this.datosEmpleoCargoComisionForm.get('nombreEntePublico').setValue(value);
  }
}