import { Component, ElementRef, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Apollo } from 'apollo-angular';
import { 
  bienesInmueblesMutation, 
  bienesInmueblesQuery, 
  lastBienesInmueblesQuery,
} from '@api/declaracion';

import { MatDialog } from '@angular/material/dialog';
import { DialogComponent, DialogComponentMensaje } from '@shared/dialog/dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

import { UntilDestroy, untilDestroyed } from '@core';

import TipoInmueble from '@static/catalogos/tipoInmueble.json';
import FormaAdquisicion from '@static/catalogos/formaAdquisicion.json';
import TitularBien from '@static/catalogos/titularBien.json';
import FormaPago from '@static/catalogos/formaPago.json';
import ParentescoRelacion from '@static/catalogos/parentescoRelacion.json';
import ValorConformeA from '@static/catalogos/valorConformeA.json';
import Estados from '@static/catalogos/estados.json';
import Municipios from '@static/catalogos/municipios.json';
import Paises from '@static/catalogos/paises.json';
import Monedas from '@static/catalogos/monedas.json';
import TipoOperacion from '@static/catalogos/tipoOperacion.json';
import { tooltipData } from '@static/tooltips/situacion-patrimonial/bien-inmueble';

import { 
  BienInmueble, 
  BienesInmuebles, 
  Catalogo, 
  DeclaracionOutput, 
  LastDeclaracionOutput,
} from '@models/declaracion';

import ActividadLaboral from '@static/catalogos/actividadLaboral.json';
import AmbitoPublico from '@static/catalogos/ambitoPublico.json';
import AmbitoSector from '@static/catalogos/ambitoSector.json';
import LugarDondeReside from '@static/catalogos/lugarDondeReside.json';
import NivelOrdenGobierno from '@static/catalogos/nivelOrdenGobiernoOtro.json';
import Sector from '@static/catalogos/sector.json';


import { findOption, ifExistsEnableFields } from '@utils/utils';

import { DeclarationErrorStateMatcher } from '@app/presentar-declaracion/shared-presentar-declaracion/declaration-error-state-matcher';

@UntilDestroy()
@Component({
  selector: 'app-bienes-inmuebles',
  templateUrl: './bienes-inmuebles.component.html',
  styleUrls: ['./bienes-inmuebles.component.scss'],
})
export class BienesInmueblesComponent implements OnInit {
  aclaraciones = false;
  aclaracionesText: string = null;
  bienesInmueblesForm: FormGroup;
  bienInmueble: BienInmueble[] = [];
  editMode = false;
  estado: Catalogo = null;
  editIndex: number = null;
  isLoading = false;

  @ViewChild('otroActividadLaboral') otroActividadLaboral: ElementRef;
  @ViewChild('otroParentesco') otroParentesco: ElementRef;
  @ViewChild('otroSector') otroSector: ElementRef;

  tipoInmuebleCatalogo = TipoInmueble;
  formaAdquisicionCatalogo = FormaAdquisicion;
  titularBienCatalogo = TitularBien;
  formaPagoCatalogo = FormaPago;
  parentescoRelacionCatalogo = ParentescoRelacion;
  valorConformeACatalogo = ValorConformeA;

  actividadLaboralCatalogo = ActividadLaboral;
  ambitoPublicoCatalogo = AmbitoPublico;
  ambitoSectorCatalogo = AmbitoSector;
  estadosCatalogo = Estados;
  lugarDondeResideCatalogo = LugarDondeReside;
  monedasCatalogo = Monedas;
  municipiosCatalogo = Municipios;
  nivelOrdenGobiernoCatalogo = NivelOrdenGobierno;
  paisesCatalogo = Paises;
  sectorCatalogo = Sector;
  tipoOperacionCatalogo = TipoOperacion;
  tipoDeclaracion: string = null;
  tipoDomicilio: string = null;

  declaracionId: string = null;

  tooltipData = tooltipData;
  errorMatcher = new DeclarationErrorStateMatcher();

  minDate = new Date(1960, 1, 1);
  anio: number = new Date().getFullYear();
  mes: number = new Date().getMonth() + 1;
  dia: number = new Date().getDate();
  maxDate = new Date(this.anio, this.mes, this.dia);

  hidden: string = 'false';

  extranjero: boolean;
  active: boolean;

  tipoPersona: string;


  constructor(
    private apollo: Apollo,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.tipoDeclaracion = this.router.url.split('/')[1];
    this.createForm();
    this.getUserInfo();
  }

  /*actividadLaboralChanged(value: any) {
    const actividadLaboralSectorPublico = this.bienesInmueblesForm.get(
      'bienInmueble.actividadLaboralSectorPublico'
    );

    const actividadLaboralSectorPrivadoOtro = this.bienesInmueblesForm.get(
      'bienInmueble.actividadLaboralSectorPrivadoOtro'
    );

    const clave = value?.clave || null;

    if (clave === 'PUB') {
      actividadLaboralSectorPublico.enable();
      actividadLaboralSectorPrivadoOtro.disable();
    } else if (clave === 'PRI' || clave === 'OTR') {
      actividadLaboralSectorPublico.disable();
      actividadLaboralSectorPrivadoOtro.enable();
    } else {
      actividadLaboralSectorPublico.disable();
      actividadLaboralSectorPrivadoOtro.disable();
    }
  }*/

  addItem() {
    this.bienesInmueblesForm.reset();
    this.bienesInmueblesForm.get('ninguno').patchValue(false);
    this.setAclaraciones(this.aclaracionesText);
    this.editMode = true;
    this.editIndex = null;
  }

  cancelEditMode() {
    this.editMode = false;
    this.editIndex = null;
  }

  createForm() {
    this.bienesInmueblesForm = this.formBuilder.group({
      ninguno: [false],
      bienInmueble: this.formBuilder.group({
        tipoOperacion: [null, [Validators.required]],
        tipoInmueble: [null, [Validators.required]],
        titular: [[], [Validators.required]],
        porcentajePropiedad: [
          0,
          [Validators.required, Validators.pattern(/^\d+\.?\d{0,4}$/), Validators.min(0), Validators.max(100)],
        ],
        superficieTerreno: this.formBuilder.group({
          valor: [0, [Validators.pattern(/^\d+\.?\d{0,2}$/), Validators.min(0)]],
          unidad: ['m'],
        }),
        superficieConstruccion: this.formBuilder.group({
          valor: [0, [Validators.pattern(/^\d+\.?\d{0,2}$/), Validators.min(0)]],
          unidad: ['m'],
        }),
        tercero: this.formBuilder.group({
          tipoPersona: [null],
          nombreRazonSocial: [null, [Validators.pattern(/^\S.*\S?$/)]],
          rfc: [
            null,
            [
              Validators.pattern(
                /^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/i
              ),
            ],
          ],
        }),
        transmisor: this.formBuilder.group({
          tipoPersona: [null, [Validators.required]],
          nombreRazonSocial: [null, [Validators.required, Validators.pattern(/^\S.*\S?$/)]],
          rfc: [
            null,
            [
              Validators.required,
              Validators.pattern(
                /^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/i
              ),
            ],
          ],
          relacion: [null, [Validators.required]],
        }),
        formaAdquisicion: [null, [Validators.required]],
        formaPago: [null, [Validators.required]],
        valorAdquisicion: this.formBuilder.group({
          valor: [0, [Validators.required, Validators.pattern(/^\d+\.?\d{0,2}$/), Validators.min(0)]],
          moneda: ['MXN', [Validators.required]],
        }),
        fechaAdquisicion: [null, [Validators.required]],
        datoIdentificacion: [null, [Validators.required, Validators.pattern(/^\S.*\S?$/)]],
        valorConformeA: [null, [Validators.required]],
        domicilioMexico: this.formBuilder.group({
          calle: [null, [Validators.required, Validators.pattern(/^\S.*$/)]],
          numeroExterior: [null, [Validators.required, Validators.pattern(/^\S.*$/)]],
          numeroInterior: [null, [Validators.pattern(/^\S.*$/)]],
          coloniaLocalidad: [null, [Validators.required, Validators.pattern(/^\S.*\S$/)]],
          municipioAlcaldia: [{ disabled: true, value: null }, [Validators.required]],
          entidadFederativa: [null, [Validators.required]],
          codigoPostal: [null, [Validators.required, Validators.pattern(/^\d{5}$/i)]],
        }),
        domicilioExtranjero: this.formBuilder.group({
          calle: [null, [Validators.required, Validators.pattern(/^\S.*$/)]],
          numeroExterior: [null, [Validators.required, Validators.pattern(/^\S.*$/)]],
          numeroInterior: [null, [Validators.pattern(/^\S.*$/)]],
          ciudadLocalidad: [null, [Validators.required, Validators.pattern(/^\S.*\S$/)]],
          estadoProvincia: [null, [Validators.required]],
          pais: [null, [Validators.required]],
          codigoPostal: [null, [Validators.required, Validators.pattern(/^\d{5}$/i)]],
        }),
      }),
      aclaracionesObservaciones: [{ disabled: true, value: '' }, [Validators.required, Validators.pattern(/^\S.*\S$/)]],
    });

    this.bienesInmueblesForm.get('bienInmueble').get('domicilioExtranjero').disable();

    const domicilioMexico = this.bienesInmueblesForm.get('bienInmueble').get('domicilioMexico');
    const estado = domicilioMexico.get('entidadFederativa');
    estado.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      const municipio = domicilioMexico.get('municipioAlcaldia');

      if (value) {
        municipio.enable();
      } else {
        municipio.disable();
        municipio.reset();
      }
      this.estado = value;
    });
  }

  radioChange(event: any) {
    
    this.hidden = event;
    this.active = this.bienesInmueblesForm.get('bienInmueble.extranjero').value;
    
    if (this.active == false) {
      
      this.bienesInmueblesForm.get("bienInmueble.rfc").setValidators([Validators.required]);
      this.bienesInmueblesForm.get("bienInmueble.rfc").enable();
      this.bienesInmueblesForm.get("bienInmueble.rfc").updateValueAndValidity();
      this.bienesInmueblesForm.get("bienInmueble.curp").setValidators([Validators.required]);
      this.bienesInmueblesForm.get("bienInmueble.curp").enable();
      this.bienesInmueblesForm.get("bienInmueble.curp").updateValueAndValidity();
    } else {
      
      //console.log(this.active)
      this.bienesInmueblesForm.get("bienInmueble.rfc").clearValidators();
      this.bienesInmueblesForm.get("bienInmueble.rfc").updateValueAndValidity();
      this.bienesInmueblesForm.get("bienInmueble.rfc").disable();

      this.bienesInmueblesForm.get("bienInmueble.curp").clearValidators();
      this.bienesInmueblesForm.get("bienInmueble.curp").updateValueAndValidity();
      this.bienesInmueblesForm.get("bienInmueble.curp").disable();

      
    }
    //console.log("Requerido", this.bienesInmueblesForm.errors);
  }

  editItem(index: number) {
    this.setEditMode();
    this.fillForm(this.bienInmueble[index]);
    this.editIndex = index;
  }

  fillForm(bienInmueble: BienInmueble) {
    Object.keys(bienInmueble)
      .filter((field) => bienInmueble[field] !== null)
      .forEach((field) => this.bienesInmueblesForm.get(`bienInmueble.${field}`).patchValue(bienInmueble[field]));
    
    const bienInmuebleForm = this.bienesInmueblesForm.get('bienInmueble');

    /*bienInmuebleForm.patchValue(bienInmueble || {});

    this.tipoDomicilio = bienInmueble.lugarDondeReside;

    if (!bienInmueble.domicilioExtranjero) {
      bienInmuebleForm.get('domicilioExtranjero').disable();
    }
    if (!bienInmueble.domicilioMexico) {
      bienInmuebleForm.get('domicilioMexico').disable();
    }
    if (bienInmueble.actividadLaboral?.clave === 'OTR') {
      this.otroActividadLaboral.nativeElement.value = bienInmueble.actividadLaboral?.valor;
    }
    if (bienInmueble.parentescoRelacion?.clave === 'OTRO') {
      console.log("otroParentesco")
      console.log(this.otroParentesco)
      this.otroParentesco.nativeElement.value = bienInmueble.parentescoRelacion?.valor;
      console.log(this.otroParentesco)
    }
    if (bienInmueble.actividadLaboralSectorPrivadoOtro?.sector?.clave === 'OTRO') {
      this.otroSector.nativeElement.value = bienInmueble.actividadLaboralSectorPrivadoOtro?.sector?.valor;
    }

    this.setAclaraciones(this.aclaracionesText);
    this.setSelectedOptions();
    */
  }

  async getLastUserInfo() {
    try {
      const { data, errors } = await this.apollo
        .query<LastDeclaracionOutput>({
          query: lastBienesInmueblesQuery,
        })
        .toPromise();

      if (errors) {
        throw errors;
      }

      if (data?.lastDeclaracion.bienesInmuebles) {
        this.setupForm(data?.lastDeclaracion.bienesInmuebles);
      }
    } catch (error) {
      console.warn('El usuario probablemente no tienen una declaración anterior', error.message);
      // this.openSnackBar('[ERROR: No se pudo recuperar la información]', 'Aceptar');
    }
  }

  async getUserInfo() {
    try {
      const { data, errors } = await this.apollo
        .query<DeclaracionOutput>({
          query: bienesInmueblesQuery,
          variables: {
            tipoDeclaracion: this.tipoDeclaracion.toUpperCase(),
          },
        })
        .toPromise();

      if (errors) {
        throw errors;
      }

      this.declaracionId = data.declaracion._id;
      if (data.declaracion.bienesInmuebles === null) {
        this.getLastUserInfo();
      } else {
        this.setupForm(data.declaracion.bienesInmuebles);
      }
    } catch (error) {
      console.error(error);
      this.openSnackBar('[ERROR: No se pudo recuperar la información]', 'Aceptar');
    }
  }
  
  inputsAreValid(): boolean {
    let result = true;
    const bienInmueble = this.bienesInmueblesForm.value.bienInmueble;

    if (bienInmueble.actividadLaboral?.clave === 'OTR') {
      result = result && this.otroActividadLaboral.nativeElement.value?.match(/^\S.*\S$/);
    }
    if (bienInmueble.parentescoRelacion?.clave === 'OTRO') {
      result = result && this.otroParentesco.nativeElement.value?.match(/^\S.*\S$/);
    }
    if (bienInmueble.actividadLaboralSectorPrivadoOtro?.sector?.clave === 'OTRO') {
      result = result && this.otroSector.nativeElement.value?.match(/^\S.*\S$/);
    }

    console.log("result");
    console.log(result);
    return result;
  }

  lugarDondeResideChanged(value: string) {
    const domicilioMexico = this.bienesInmueblesForm.get('bienInmueble.domicilioMexico');
    const domicilioExtranjero = this.bienesInmueblesForm.get('bienInmueble.domicilioExtranjero');

    switch (value) {
      case 'MEXICO':
        domicilioMexico.enable();
        domicilioExtranjero.disable();
        break;
      case 'EXTRANJERO':
        domicilioMexico.disable();
        domicilioExtranjero.enable();
        break;
      default:
        domicilioMexico.disable();
        domicilioExtranjero.disable();
        break;
    }

    this.tipoDomicilio = value;
  }

  formHasChanges() {
    let isDirty = this.bienesInmueblesForm.dirty;
    if (isDirty) {
      const dialogRef = this.dialog.open(DialogComponent, {
        data: {
          title: 'Tienes cambios sin guardar',
          message: '¿Deseas continuar?',
          falseText: 'Cancelar',
          trueText: 'Continuar',
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) this.router.navigate(['/' + this.tipoDeclaracion + '/situacion-patrimonial/ingresos-netos']);
      });
    } else {
      this.router.navigate(['/' + this.tipoDeclaracion + '/situacion-patrimonial/ingresos-netos']);
    }
  }

  ngOnInit(): void {
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

  checkItems() {
    //let depEconomico = this.bienesInmueblesForm.get('bienInmueble');
    let bienInmueble = [...this.bienInmueble];
    if (bienInmueble.length === 0) {
      this.saveInfo({ ninguno: true });
    } else {
      for (let i = 0; i < bienInmueble.length; i++) {
        bienInmueble[i].tipoOperacion = 'SIN_CAMBIOS';
      }
      const aclaracionesObservaciones = this.bienesInmueblesForm.value.aclaracionesObservaciones;
      this.isLoading = true;
      this.saveInfo({
        bienInmueble,
        aclaracionesObservaciones,
      });
      this.isLoading = false;
    }
  }

  noDependent() {
    this.saveInfo({ ninguno: true });
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

  removeItem(index: number) {
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
        const bienInmueble = [
          ...this.bienInmueble.slice(0, index),
          ...this.bienInmueble.slice(index + 1),
        ];

        const aclaracionesObservaciones = this.bienesInmueblesForm.value.aclaracionesObservaciones;
        this.saveInfo({
          bienInmueble,
          aclaracionesObservaciones,
        });
      }
    });
  }

  async saveInfo(form: BienesInmuebles) {
    try {
      const declaracion = {
        bienesInmuebles: form,
      };

      const { data, errors } = await this.apollo
        .mutate<DeclaracionOutput>({
          mutation: bienesInmueblesMutation,
          variables: {
            id: this.declaracionId,
            declaracion,
          },
        })
        .toPromise();

      if (errors) {
        throw errors;
      }

      this.editMode = false;
      if (data?.declaracion.bienesInmuebles) {
        this.setupForm(data?.declaracion.bienesInmuebles);
      }
      this.presentSuccessAlert();
    } catch (error) {
      console.log(error);
      this.openSnackBar('[ERROR: No se guardaron los cambios]', 'Aceptar');
    }
  }

  saveItem() {
    /*let bienInmueble = [...this.bienInmueble];
    const aclaracionesObservaciones = this.bienesInmueblesForm.value.aclaracionesObservaciones;
    const newItem = this.finalBienInmuebleForm;

    if (this.editIndex === null) {
      bienInmueble = [...bienInmueble, newItem];
    } else {
      bienInmueble[this.editIndex] = newItem;
    }

    this.isLoading = true;

    this.saveInfo({
      bienInmueble,
      aclaracionesObservaciones,
    });

    this.isLoading = false;
    */
  }

  get finalBienInmuebleForm() {
   /* const form = JSON.parse(JSON.stringify(this.bienesInmueblesForm.value.bienInmueble)); // Deep copy

    if (form.tipoInmueble?.clave === 'OTRO') {
      form.tipoInmueble.valor = this.otroTipoInmueble.nativeElement.value.toUpperCase();
      //form.tipoInmueble.valor = document.querySelector<HTMLInputElement>('.OTI').value.toUpperCase();
    }
    if (form.transmisor.relacion?.clave === 'OTRO') {
      form.transmisor.relacion.valor = this.otroParentesco.nativeElement.value.toUpperCase();
    }
    */
    return ;
  }

  setAclaraciones(aclaraciones?: string) {
    this.bienesInmueblesForm.get('aclaracionesObservaciones').patchValue(aclaraciones || null);
    this.aclaracionesText = aclaraciones || null;
    this.toggleAclaraciones(!!aclaraciones);
  }

  setEditMode() {
    this.bienesInmueblesForm.reset();
    this.bienesInmueblesForm.get('ninguno').setValue(false);
    this.editMode = true;
    this.editIndex = null;
  }

  setSelectedOptions() {
    const { actividadLaboral, parentescoRelacion, domicilioExtranjero, domicilioMexico } =
      this.bienesInmueblesForm.value.bienInmueble;

    if (actividadLaboral) {
      this.bienesInmueblesForm
        .get('bienInmueble.actividadLaboral')
        .setValue(findOption(this.actividadLaboralCatalogo, actividadLaboral.clave));
    }
    if (parentescoRelacion) {
      this.bienesInmueblesForm
        .get('bienInmueble.parentescoRelacion')
        .setValue(findOption(this.parentescoRelacionCatalogo, parentescoRelacion.clave));
    }
    if (actividadLaboral.clave == 'PRI' || actividadLaboral.clave === 'OTR') {
      const { sector } =
        this.bienesInmueblesForm.value.bienInmueble.actividadLaboralSectorPrivadoOtro;
      if (sector) {
        this.bienesInmueblesForm
          .get('bienInmueble.actividadLaboralSectorPrivadoOtro.sector')
          .setValue(findOption(this.sectorCatalogo, sector.clave));
      }
    }

    if (domicilioMexico) {
      this.bienesInmueblesForm
        .get('bienInmueble.domicilioMexico.entidadFederativa')
        .setValue(findOption(this.estadosCatalogo, domicilioMexico.entidadFederativa.clave));
      this.bienesInmueblesForm
        .get('bienInmueble.domicilioMexico.municipioAlcaldia')
        .setValue(
          findOption(this.municipiosCatalogo[this.estado?.clave] || [], domicilioMexico.municipioAlcaldia.clave)
        );
      this.lugarDondeResideChanged('MEXICO');
    } else if (domicilioExtranjero) {
      this.bienesInmueblesForm
        .get('bienInmueble.domicilioExtranjero.pais')
        .setValue(findOption(this.paisesCatalogo, domicilioExtranjero.pais).clave);
      this.lugarDondeResideChanged('EXTRANJERO');
    }
  }

  setupForm(bienesInmuebles: BienesInmuebles) {
    this.bienInmueble = bienesInmuebles.bienInmueble;
    const aclaraciones = bienesInmuebles.aclaracionesObservaciones;

    if (bienesInmuebles.ninguno) {
      this.bienesInmueblesForm.get('ninguno').patchValue(true);
    }

    if (aclaraciones) {
      this.setAclaraciones(aclaraciones);
    }
  }

  toggleAclaraciones(value: boolean) {
    const aclaraciones = this.bienesInmueblesForm.get('aclaracionesObservaciones');
    if (value) {
      aclaraciones.enable();
    } else {
      aclaraciones.disable();
      aclaraciones.reset();
    }
    this.aclaraciones = value;
  }

  tipoDomicilioChanged(value: any) {
    this.tipoDomicilio = value;

    const notSelectedType = this.tipoDomicilio === 'MEXICO' ? 'domicilioExtranjero' : 'domicilioMexico';
    const selectedType = this.tipoDomicilio === 'EXTRANJERO' ? 'domicilioExtranjero' : 'domicilioMexico';
    const bienInbueble = this.bienesInmueblesForm.get('bienInmueble');

    const notSelected = bienInbueble.get(notSelectedType);

    notSelected.disable();
    notSelected.reset();

    bienInbueble.get(selectedType).enable();
  }
}
