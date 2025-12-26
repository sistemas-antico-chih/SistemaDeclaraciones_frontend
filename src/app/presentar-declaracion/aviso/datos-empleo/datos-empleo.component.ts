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
  //declaracionMutation,
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
    const urlChunks = this.router.url.split('/');
    this.declaracionSimplificada = urlChunks[2] === 'simplificada';
    this.tipoDeclaracion = urlChunks[1] || null;

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

    // this.datosEmpleoCargoComisionForm.get('domicilioExtranjero').disable();

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

    // ❌ No permitir fechas futuras
    if (fechaControl && fechaControl.isAfter(fechaActual)) {
      return { fechaFutura: true };
    }

    // Si ambas fechas existen, validar orden
    if (fechaIni && fechaFin) {
      // ❌ Si la fecha de toma de posesión NO es posterior a la de conclusión
      if (!fechaIni.isAfter(fechaFin)) {
        return { ordenIncorrecto: true };
      }
    }

    // ✅ Todo correcto
    return null;
  }



  /*fillForm(datosEmpleoCargoComision: DatosEmpleoCargoComision | undefined) {
    this.datosEmpleoCargoComisionForm.patchValue(datosEmpleoCargoComision || {});

    if (datosEmpleoCargoComision?.aclaracionesObservaciones) {
      this.toggleAclaraciones(true);
    }
    this.setSelectedOptions(datosEmpleoCargoComision);
  }*/

  fillForm(datosEmpleoCargoComision: DatosEmpleoCargoComision | undefined) {
    if (!datosEmpleoCargoComision) return;

    // 🧠 Detectar si el registro ya está completo (ya tiene área de conclusión)
    const registroConcluido =
      !!datosEmpleoCargoComision.areaAdscripcionConcluye?.trim() ||
      !!datosEmpleoCargoComision.nivelEmpleoCargoComisionConcluye?.trim() ||
      !!datosEmpleoCargoComision.fechaConclusionEncargo;

    if (registroConcluido) {
      // ✅ Caso 1: Registro ya concluido → poblar todo sin modificar
      this.datosEmpleoCargoComisionForm.patchValue(datosEmpleoCargoComision);
    } else {
      // ✅ Caso 2: No hay registro previo → llenar con datos "de inicio"
      if (datosEmpleoCargoComision.areaAdscripcion) {
        datosEmpleoCargoComision.areaAdscripcionConcluye = datosEmpleoCargoComision.areaAdscripcion;
        datosEmpleoCargoComision.areaAdscripcion = '';
      }

      if (datosEmpleoCargoComision.nivelEmpleoCargoComision) {
        datosEmpleoCargoComision.nivelEmpleoCargoComisionConcluye =
          datosEmpleoCargoComision.nivelEmpleoCargoComision;
        datosEmpleoCargoComision.nivelEmpleoCargoComision = '';
      }

      // Limpiar fechas
      datosEmpleoCargoComision.fechaTomaPosesion = null;
      datosEmpleoCargoComision.fechaConclusionEncargo = null;

      // Conservar nombre del ente
      const nombreEnte = datosEmpleoCargoComision.nombreEntePublico;

      // Llenar formulario
      this.datosEmpleoCargoComisionForm.patchValue(datosEmpleoCargoComision);

      // Restaurar nombre del ente
      this.datosEmpleoCargoComisionForm.get('nombreEntePublico')?.setValue(nombreEnte);
    }

    // Mostrar aclaraciones si aplica
    if (datosEmpleoCargoComision.aclaracionesObservaciones) {
      this.toggleAclaraciones(true);
    }

    // Configurar selects u opciones de domicilio, etc.
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
      // this.openSnackBar('[ERROR: No se pudo recuperar la información]', 'Aceptar');
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
        await this.getLastUserInfo();
      } else {
        this.isFromPreviousRecord = false;
        this.fillForm(data?.declaracion.datosEmpleoCargoComision);
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
    //let url = '/aviso/datos-empleo';
    //if (this.declaracionSimplificada) url += '/simplificada';
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

      /*
      dialogRef.afterClosed().subscribe((result) => {
        if (result) this.router.navigate([url]);
      });
    } else {
      this.router.navigate([url]);
    */
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
        //falseText: '',
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
      console.log(error);
      this.openSnackBar('[ERROR: No se guardaron los cambios]', 'Aceptar');
    }
  }

  setSelectedOptions(datosEmpleoCargoComision: DatosEmpleoCargoComision) {
    const { domicilioExtranjero, domicilioMexico } = datosEmpleoCargoComision ?? {};

    if (domicilioMexico) {
      //this.datosEmpleoCargoComisionForm.get
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
    this.datosEmpleoCargoComisionForm.get('nombreEntePublico').setValue(value)
  }
}