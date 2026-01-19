import { Component, ElementRef, OnInit, ViewChildren, QueryList } from '@angular/core'; 
import { FormArray, FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import * as moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent, DialogComponentMensaje } from '@shared/dialog/dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { declaracionMutation, actividadAnualAnteriorQuery } from '@api/declaracion';
import { DeclarationErrorStateMatcher } from '@app/presentar-declaracion/shared-presentar-declaracion/declaration-error-state-matcher';
import { UntilDestroy, untilDestroyed } from '@core';
import {
  ActividadAnualAnterior,
  ActividadFinanciera,
  ActividadIndustrial,
  DeclaracionOutput,
  EnajenacionBienes,
  OtrosIngresos,
  ServiciosProfesionales,
} from '@models/declaracion';
import TipoBienEnajenado from '@static/catalogos/tipoBienEnajenacionBienes.json';
import TipoInstrumento from '@static/catalogos/tipoInstrumento.json';
import { tooltipData } from '@static/tooltips/situacion-patrimonial/anio-anterior';
import { findOption } from '@utils/utils';
import { MenuStateService } from '@app/services/menu-state.service';

@UntilDestroy()
@Component({
  selector: 'app-servidor-publico',
  templateUrl: './servidor-publico.component.html',
  styleUrls: ['./servidor-publico.component.scss'],
})
export class ServidorPublicoComponent implements OnInit {
  index: number = 0;
  arrayOtroTipoInstrumento: any = [];
  arrayHTMLOtroTipoInstrumento: any = [];
  ingresoActividad: any = [];
  pushButtonSave: boolean = false;

  //@Output("otroTipoInstrumento") ids: any = [];
  @ViewChildren('otroTipoInstrumento') otroTipoInstrumento: QueryList<ElementRef>;

  aclaraciones = false;
  actividadAnualAnteriorForm: FormGroup;
  isLoading = false;
  userId: string = null;

  ingresoNetoDeclarante = 0;
  ingresosTotales = 0;
  otrosIngresosDeclarante = 0;

  secciones = [
    'actividadIndustrialComercialEmpresarial',
    'actividadFinanciera',
    'enajenacionBienes',
    'otrosIngresos',
    'serviciosProfesionales',
  ];

  tipoInstrumentoCatalogo = TipoInstrumento;
  tipoBienEnajenadoCatalogo = TipoBienEnajenado;

  declaracionSimplificada = false;
  tipoDeclaracion: string = null;

  declaracionId: string = null;

  tooltipData = tooltipData;
  errorMatcher = new DeclarationErrorStateMatcher();

  minDate = new Date(2010, 1, 1);
  anio: number = new Date().getFullYear();
  mes: number = new Date().getMonth() + 1;
  dia: number = new Date().getDate();
  //maxDate = new Date(this.anio - 1, this.mes - 1, this.dia);
  //minDateFinal = new Date(2010, 1, 1);
  //maxDateFinal = new Date(this.anio, this.mes - 1, this.dia);

  isFromPreviousRecord = false;

  constructor(
    private apollo: Apollo,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private menuStateService: MenuStateService // ← AGREGAR
  ) {
    const urlChunks = this.router.url.split('/');
    this.declaracionSimplificada = urlChunks[2] === 'simplificada';
    this.tipoDeclaracion = urlChunks[1] || null;
    this.createForm();
    this.getUserInfo();
  }

  addActividadFinanciera() {
    this.actividadFinanciera.push(
      this.formBuilder.group({
        remuneracion: this.formBuilder.group({
          valor: [0, [Validators.required, Validators.pattern(/^\d+$/), Validators.min(0)]],
          moneda: ['MXN'],
        }),
        tipoInstrumento: [null, [Validators.required]],
      })
    );
  }

  addActividadIndustrialComercialEmpresarial() {
    this.actividadIndustrialComercialEmpresarial.push(
      this.formBuilder.group({
        remuneracion: this.formBuilder.group({
          valor: [0, [Validators.required, Validators.pattern(/^\d+$/), Validators.min(0)]],
          moneda: ['MXN'],
        }),
        nombreRazonSocial: [null, [Validators.required, Validators.pattern(/^\S.*\S$/)]],
        tipoNegocio: [null, [Validators.required, Validators.pattern(/^\S.*\S$/)]],
      })
    );
  }

  addEnajenacionBienes() {
    this.enajenacionBienes.push(
      this.formBuilder.group({
        remuneracion: this.formBuilder.group({
          valor: [0, [Validators.required, Validators.pattern(/^\d+$/), Validators.min(0)]],
          moneda: ['MXN'],
        }),
        tipoBienEnajenado: [null, [Validators.required, Validators.pattern(/^\S.*\S$/)]],
      })
    );
  }

  addOtrosIngresos() {
    this.otrosIngresos.push(
      this.formBuilder.group({
        remuneracion: this.formBuilder.group({
          valor: [0, [Validators.required, Validators.pattern(/^\d+$/), Validators.min(0)]],
          moneda: ['MXN'],
        }),
        tipoIngreso: [null, [Validators.required, Validators.pattern(/^\S.*\S$/)]],
      })
    );
  }

  addServiciosProfesionales() {
    this.serviciosProfesionales.push(
      this.formBuilder.group({
        remuneracion: this.formBuilder.group({
          valor: [0, [Validators.required, Validators.pattern(/^\d+$/), Validators.min(0)]],
          moneda: ['MXN'],
        }),
        tipoServicio: [null, [Validators.required, Validators.pattern(/^\S.*\S$/)]],
      })
    );
  }

  calcOtrosIngresosDeclarante() {
    let total = 0;

    try {
      total = this.secciones.reduce(
        (accum: number, section: string) => accum + this.calcTotalAmountOfSection(section),
        0
      );
    } catch (error) {
      console.log(error);
    }

    return total;
  }

  calcTotalAmountOfSection(section: string) {
    let formArray: FormArray = null;

    switch (section) {
      case 'actividadIndustrialComercialEmpresarial':
        formArray = this.actividadIndustrialComercialEmpresarial;
        break;
      case 'actividadFinanciera':
        formArray = this.actividadFinanciera;
        break;
      case 'enajenacionBienes':
        formArray = this.enajenacionBienes;
        break;
      case 'otrosIngresos':
        formArray = this.otrosIngresos;
        break;
      case 'serviciosProfesionales':
        formArray = this.serviciosProfesionales;
        break;
      default:
        break;
    }

    let total = 0;

    try {
      total = formArray.value.reduce(
        (
          accum: number,
          current:
            | ActividadIndustrial
            | ActividadFinanciera
            | EnajenacionBienes
            | OtrosIngresos
            | ServiciosProfesionales
        ) => accum + current.remuneracion.valor,
        0
      );
    } catch (error) {
      console.log(error);
    }

    return total;
  }

  confirmSaveInfo() {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: '¿Guardar cambios?',
        message: '',
        trueText: 'Guardar',
        falseText: 'Cancelar',
      },
    });

    this.pushButtonSave = true;

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const form: ActividadAnualAnterior = this.actividadAnualAnteriorForm.value;
        if (form.servidorPublicoAnioAnterior) {
          //sections
          form.actividadIndustrialComercialEmpresarial.remuneracionTotal.valor = this.calcTotalAmountOfSection(
            'actividadIndustrialComercialEmpresarial'
          );
          form.actividadFinanciera.remuneracionTotal.valor = this.calcTotalAmountOfSection('actividadFinanciera');
          form.otrosIngresos.remuneracionTotal.valor = this.calcTotalAmountOfSection('otrosIngresos');
          form.enajenacionBienes.remuneracionTotal.valor = this.calcTotalAmountOfSection('enajenacionBienes');
          form.serviciosProfesionales.remuneracionTotal.valor = this.calcTotalAmountOfSection('serviciosProfesionales');
          //totals
          form.otrosIngresosTotal.valor = this.otrosIngresosDeclarante;
          form.ingresoNetoAnualDeclarante.valor = this.ingresoNetoDeclarante;
          form.totalIngresosNetosAnuales.valor = this.ingresosTotales;

          this.saveInfo(form);
        } else {
          this.saveInfo({
            servidorPublicoAnioAnterior: false,
            aclaracionesObservaciones: form.aclaracionesObservaciones,
          });
        }
      }
    });
  }

  createForm() {
    this.actividadAnualAnteriorForm = this.formBuilder.group({
      servidorPublicoAnioAnterior: [true, [Validators.required]],
      fechaIngreso: [null, [Validators.required, Validators.pattern(/^\S.*\S$/)], this.validarFECHA],
      fechaConclusion: [
        null, [Validators.required, Validators.pattern(/^\S.*\S$/), this.validarFECHA]
      ],
      remuneracionNetaCargoPublico: this.formBuilder.group({
        valor: [0, [Validators.required, Validators.pattern(/^\d+$/), Validators.min(0)]],
        moneda: ['MXN'],
      }),
      otrosIngresosTotal: this.formBuilder.group({
        valor: [0, [Validators.pattern(/^\d+$/), Validators.min(0)]],
        moneda: ['MXN'],
      }),
      actividadIndustrialComercialEmpresarial: this.formBuilder.group({
        remuneracionTotal: this.formBuilder.group({
          valor: [0, [Validators.pattern(/^\d+$/), Validators.min(0)]],
          moneda: ['MXN'],
        }),
        actividades: this.formBuilder.array([]),
      }),
      actividadFinanciera: this.formBuilder.group({
        remuneracionTotal: this.formBuilder.group({
          valor: [0, [Validators.pattern(/^\d+$/), Validators.min(0)]],
          moneda: ['MXN'],
        }),
        actividades: this.formBuilder.array([]),
      }),
      serviciosProfesionales: this.formBuilder.group({
        remuneracionTotal: this.formBuilder.group({
          valor: [0, [Validators.pattern(/^\d+$/), Validators.min(0)]],
          moneda: ['MXN'],
        }),
        servicios: this.formBuilder.array([]),
      }),
      enajenacionBienes: this.formBuilder.group({
        remuneracionTotal: this.formBuilder.group({
          valor: [0, [Validators.pattern(/^\d+$/), Validators.min(0)]],
          moneda: ['MXN'],
        }),
        bienes: this.formBuilder.array([]),
      }),
      otrosIngresos: this.formBuilder.group({
        remuneracionTotal: this.formBuilder.group({
          valor: [0, [Validators.required, Validators.pattern(/^\d+$/), Validators.min(0)]],
          moneda: ['MXN'],
        }),
        ingresos: this.formBuilder.array([]),
      }),
      ingresoNetoAnualDeclarante: this.formBuilder.group({
        valor: [0, [Validators.required, Validators.pattern(/^\d+$/), Validators.min(0)]],
        moneda: ['MXN'],
      }),
      ingresoNetoAnualParejaDependiente: this.formBuilder.group({
        valor: [0, [Validators.required, Validators.pattern(/^\d+$/), Validators.min(0)]],
        moneda: ['MXN'],
      }),
      totalIngresosNetosAnuales: this.formBuilder.group({
        valor: [0, [Validators.required, Validators.pattern(/^\d+$/), Validators.min(0)]],
        moneda: ['MXN'],
      }),
      aclaracionesObservaciones: [{ disabled: true, value: '' }, [Validators.required, Validators.pattern(/^\S.*\S$/)]],
    });



    this.actividadAnualAnteriorForm.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((form: ActividadAnualAnterior) => {
        if (form.servidorPublicoAnioAnterior) {
          this.otrosIngresosDeclarante = this.calcOtrosIngresosDeclarante();
          this.ingresoNetoDeclarante =
            (form.remuneracionNetaCargoPublico ? form.remuneracionNetaCargoPublico.valor : 0) +
            this.otrosIngresosDeclarante;
          this.ingresosTotales =
            this.ingresoNetoDeclarante +
            (form.ingresoNetoAnualParejaDependiente ? form.ingresoNetoAnualParejaDependiente.valor : 0);
        }
      });

    this.actividadAnualAnteriorForm
      .get('servidorPublicoAnioAnterior')
      .valueChanges.pipe(untilDestroyed(this))
      .subscribe((value) => {
        const formFields = [
          'fechaIngreso',
          'fechaConclusion',
          'remuneracionNetaCargoPublico',
          'otrosIngresosTotal',
          'actividadIndustrialComercialEmpresarial',
          'actividadFinanciera',
          'serviciosProfesionales',
          'enajenacionBienes',
          'otrosIngresos',
          'ingresoNetoAnualDeclarante',
          'ingresoNetoAnualParejaDependiente',
          'totalIngresosNetosAnuales',
        ];

        if (value) {
          formFields.forEach((field) => this.actividadAnualAnteriorForm.get(field).enable());
        } else {
          formFields.forEach((field) => this.actividadAnualAnteriorForm.get(field).disable());
        }
      });
  }

  validarFECHA(control: FormControl) {
    const fechaActual = moment().startOf('day');

    const fechaIni = control.root.get('fechaIngreso')?.value
      ? moment(control.root.get('fechaIngreso')?.value).startOf('day')
      : null;

    const fechaFin = control.root.get('fechaConclusion')?.value
      ? moment(control.root.get('fechaConclusion')?.value).startOf('day')
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


  deleteFormArrayItem(formArrayName: string, index: number) {
    let formArray: FormArray = null;

    switch (formArrayName) {
      case 'actividadIndustrialComercialEmpresarial':
        formArray = this.actividadIndustrialComercialEmpresarial;
        break;
      case 'actividadFinanciera':
        formArray = this.actividadFinanciera;
        break;
      case 'enajenacionBienes':
        formArray = this.enajenacionBienes;
        break;
      case 'otrosIngresos':
        formArray = this.otrosIngresos;
        break;
      case 'serviciosProfesionales':
        formArray = this.serviciosProfesionales;
        break;
      default:
        break;
    }

    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: 'Eliminar elemento',
        message: '¿Está seguro de eliminar este elemento?',
        trueText: 'Eliminar',
        falseText: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        formArray.removeAt(index);
      }
    });
  }

  fillFormArray(
    formArrayName: string,
    data: Array<ActividadIndustrial | ActividadFinanciera | EnajenacionBienes | OtrosIngresos | ServiciosProfesionales>
  ) {
    let formArray: FormArray = null;

    for (let [index, value] of data.entries()) {
      switch (formArrayName) {
        case 'actividadIndustrialComercialEmpresarial':
          this.addActividadIndustrialComercialEmpresarial();
          formArray = this.actividadIndustrialComercialEmpresarial;
          break;
        case 'actividadFinanciera':
          this.addActividadFinanciera();
          formArray = this.actividadFinanciera;
          break;
        case 'enajenacionBienes':
          this.addEnajenacionBienes();
          formArray = this.enajenacionBienes;
          break;
        case 'otrosIngresos':
          this.addOtrosIngresos();
          formArray = this.otrosIngresos;
          break;
        case 'serviciosProfesionales':
          this.addServiciosProfesionales();
          formArray = this.serviciosProfesionales;
          break;
        default:
          break;
      }
      formArray.at(index).patchValue(value);

      if (formArrayName === 'actividadFinanciera') {
        const { tipoInstrumento } = formArray.at(index).value;
        const optionTipoInstrumento = this.tipoInstrumentoCatalogo.filter((i: any) => i.clave === tipoInstrumento.clave);
        formArray.at(index).get('tipoInstrumento').setValue(optionTipoInstrumento[0]);
        if (tipoInstrumento.clave === 'OTRO') {
          this.ingresoActividad[index] = tipoInstrumento.valor;
        }
      }
    }
  }

  fillForm(actividadAnualAnterior: ActividadAnualAnterior) {
    this.actividadAnualAnteriorForm.patchValue(actividadAnualAnterior);

    this.secciones.forEach((section) => {
      const data = actividadAnualAnterior[section];
      this.actividadAnualAnteriorForm.get(section).patchValue(data);
      let dataArray = [];
      switch (section) {
        case 'actividadIndustrialComercialEmpresarial':
        case 'actividadFinanciera':
          dataArray = data?.actividades ?? [];
          break;
        case 'enajenacionBienes':
          dataArray = data?.bienes ?? [];
          break;
        case 'otrosIngresos':
          dataArray = data?.ingresos ?? [];
          break;
        case 'serviciosProfesionales':
          dataArray = data?.servicios ?? [];
        default:
          break;
      }
      this.fillFormArray(section, dataArray);
    });

    if (actividadAnualAnterior.aclaracionesObservaciones) {
      this.toggleAclaraciones(true);
    }
  }

  get actividadFinanciera() {
    return this.actividadAnualAnteriorForm.get('actividadFinanciera.actividades') as FormArray;
  }

  get actividadIndustrialComercialEmpresarial() {
    return this.actividadAnualAnteriorForm.get('actividadIndustrialComercialEmpresarial.actividades') as FormArray;
  }

  get enajenacionBienes() {
    return this.actividadAnualAnteriorForm.get('enajenacionBienes.bienes') as FormArray;
  }

  get otrosIngresos() {
    return this.actividadAnualAnteriorForm.get('otrosIngresos.ingresos') as FormArray;
  }

  get serviciosProfesionales() {
    return this.actividadAnualAnteriorForm.get('serviciosProfesionales.servicios') as FormArray;
  }

  async getUserInfo() {
    try {
      const { data, errors } = await this.apollo
        .query<DeclaracionOutput>({
          query: actividadAnualAnteriorQuery,
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
      if (data?.declaracion.actividadAnualAnterior) {
        await this.fillForm(data?.declaracion.actividadAnualAnterior);
        this.isFromPreviousRecord = false;

        this.menuStateService.markSectionAsSaved(
          '/servidor-publico',
          'situacionPatrimonial',
          this.tipoDeclaracion,
          this.declaracionSimplificada
        );
      }
      else {
        this.isFromPreviousRecord = false;
      }
    } catch (error) {
      console.log(error);
      this.openSnackBar('[ERROR: No se pudo recuperar la información]', 'Aceptar');
    }
  }

  formHasChanges() {
    let isDirty = this.actividadAnualAnteriorForm.dirty;
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
        if (result) this.router.navigate(['/' + this.tipoDeclaracion + '/situacion-patrimonial/bienes-inmuebles']);
      });
    } else {
      this.router.navigate(['/' + this.tipoDeclaracion + '/situacion-patrimonial/bienes-inmuebles']);
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

  presentSuccessAlert() {
    this.dialog.open(DialogComponent, {
      data: {
        title: 'Información actualizada',
        message: 'Se han guardado tus cambios',
        trueText: 'Aceptar',
      },
    });
  }

  get finalIngresosForm() {
    const form = JSON.parse(JSON.stringify(this.actividadAnualAnteriorForm.value)); // Deep copy
    let arreglo = this.otroTipoInstrumento.toArray();
    let obValores;
    let valorHtml;
    for (let j = 0; j < form.actividadFinanciera.actividades.length; j++) {
      if (form.actividadFinanciera.actividades[j].tipoInstrumento.clave === "OTRO") {
        this.otroTipoInstrumento.forEach(function (value: any) {
          if (value !== undefined) {
            obValores = arreglo[j].nativeElement.id;
            valorHtml = document.getElementById(obValores) as HTMLInputElement;
            form.actividadFinanciera.actividades[j].tipoInstrumento.valor = valorHtml.value.toUpperCase();
          }
        });
      }
    }
    return form;
  }

  async saveInfo(form: ActividadAnualAnterior) {
    try {
      this.isLoading = true;
      if (form.servidorPublicoAnioAnterior) {
        form = this.finalIngresosForm;
      }
      const declaracion = {
        actividadAnualAnterior: form,
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

      this.menuStateService.markSectionAsSaved(
        '/servidorublico',
        'situacionPatrimonial',
        this.tipoDeclaracion,
        this.declaracionSimplificada
      );
      this.isFromPreviousRecord = false;

      this.isLoading = false;
      this.presentSuccessAlert();
    } catch (error) {
      console.log(error);
      this.openSnackBar('[ERROR: No se guardaron los cambios]', 'Aceptar');
    }
  }

  toggleAclaraciones(value: boolean) {
    const aclaraciones = this.actividadAnualAnteriorForm.get('aclaracionesObservaciones');
    if (value) {
      aclaraciones.enable();
    } else {
      aclaraciones.disable();
      aclaraciones.reset();
    }
    this.aclaraciones = value;
  }
}
