import { Component, ElementRef, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Apollo } from 'apollo-angular';
import { bienesInmueblesMutation, bienesInmueblesQuery, lastBienesInmueblesQuery, lastInversionesCuentasValoresQuery } from '@api/declaracion';

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

import { BienInmueble, BienesInmuebles, Catalogo, DeclaracionOutput, ValorDeclarante, LastDeclaracionOutput } from '@models/declaracion';

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
  estado: Catalogo = null;
  editMode = false;
  editIndex: number = null;
  bienInmueble: BienInmueble[] = [];
  isLoading = false;
  varOtroTipoInmueble: string = null;
  varOtroRelacion: string = null;
  pushButtonSave: boolean = false;

  @ViewChild('otroTipoInmueble') otroTipoInmueble: ElementRef;
  @ViewChild('otroParentesco') otroParentesco: ElementRef;

  //@ViewChildren('otroTipoInmueble') otroTipoInmueble: QueryList<ElementRef>;


  tipoInmuebleCatalogo = TipoInmueble;
  formaAdquisicionCatalogo = FormaAdquisicion;
  titularBienCatalogo = TitularBien;
  formaPagoCatalogo = FormaPago;
  parentescoRelacionCatalogo = ParentescoRelacion;
  valorConformeACatalogo = ValorConformeA;
  estadosCatalogo = Estados;
  municipiosCatalogo = Municipios;
  paisesCatalogo = Paises;
  monedasCatalogo = Monedas;
  tipoOperacionCatalogo = TipoOperacion;
  tipoDeclaracion: string = null;
  tipoDomicilio = 'MEXICO';

  declaracionId: string = null;

  tooltipData = tooltipData;
  errorMatcher = new DeclarationErrorStateMatcher();

  minDate = new Date(1940, 1, 1);
  anio: number = new Date().getFullYear();
  mes: number = new Date().getMonth() + 1;
  dia: number = new Date().getDate();
  maxDate = new Date(this.anio, this.mes - 1, this.dia);

  valores: ValorDeclarante[] = [];

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

  addItem() {
    this.bienesInmueblesForm.reset();
    this.bienesInmueblesForm.get('ninguno').setValue(false);
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

  editItem(index: number) {
    this.setEditMode();
    this.fillForm(this.bienInmueble[index]);
    this.editIndex = index;
  }

  fillForm(bienInmueble: BienInmueble) {
    Object.keys(bienInmueble)
      .filter((field) => bienInmueble[field] !== null)
      .forEach((field) => this.bienesInmueblesForm.get(`bienInmueble.${field}`).patchValue(bienInmueble[field]));
    this.bienesInmueblesForm.get(`bienInmueble.tercero`).patchValue(bienInmueble.tercero[0]);
    this.bienesInmueblesForm.get(`bienInmueble.transmisor`).patchValue(bienInmueble.transmisor[0]);

    ifExistsEnableFields(bienInmueble.domicilioMexico, this.bienesInmueblesForm, 'bienInmueble.domicilioMexico');
    if (bienInmueble.domicilioMexico) {
      this.tipoDomicilio = 'MEXICO';
    }
    ifExistsEnableFields(
      bienInmueble.domicilioExtranjero,
      this.bienesInmueblesForm,
      'bienInmueble.domicilioExtranjero'
    );
    if (bienInmueble.domicilioExtranjero) {
      this.tipoDomicilio = 'EXTRANJERO';
    }

    this.setAclaraciones(this.aclaracionesText);
    this.setSelectedOptions();
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

  get finalBienInmuebleForm() {
    const form = JSON.parse(JSON.stringify(this.bienesInmueblesForm.value.bienInmueble)); // Deep copy

    if (form.tipoInmueble?.clave === 'OTRO') {
      form.tipoInmueble.valor = this.otroTipoInmueble.nativeElement.value.toUpperCase();
      //form.tipoInmueble.valor = document.querySelector<HTMLInputElement>('.OTI').value.toUpperCase();
    }
    if (form.transmisor.relacion?.clave === 'OTRO') {
      form.transmisor.relacion.valor = this.otroParentesco.nativeElement.value.toUpperCase();
    }

    return form;
  }

  inputsAreValid(): boolean {
    let result = true;
    const bienInmueble = this.bienesInmueblesForm.value.bienInmueble;

    if (bienInmueble.actividadLaboral?.clave === 'OTR') {
      //result = result && this.otroTipoInmueble.nativeElement.value?.match(/^\S.*\S$/);
    }
    if (bienInmueble.parentescoRelacion?.clave === 'OTRO') {
      result = result && this.otroParentesco.nativeElement.value?.match(/^\S.*\S$/);
    }

    console.log(result);
    return result;
  }

  formHasChanges() {
    let isDirty = this.bienesInmueblesForm.dirty;
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
        if (result) this.router.navigate(['/' + this.tipoDeclaracion + '/situacion-patrimonial/vehiculos']);
      });
    } else {
      this.router.navigate(['/' + this.tipoDeclaracion + '/situacion-patrimonial/vehiculos']);
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

  checkItems() {
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

  noProperty() {
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
        title: 'Operación exitosa',
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
        const bienInmueble = [...this.bienInmueble.slice(0, index), ...this.bienInmueble.slice(index + 1)];

        let array: any = [];
        array = this.deleteValoresDeclarante(bienInmueble);
        let valores = array;

        const aclaracionesObservaciones = this.bienesInmueblesForm.value.aclaracionesObservaciones;

        this.saveInfo({
          bienInmueble,
          aclaracionesObservaciones,
          valores,
        });
      }
    });
  }

  async saveInfo(form: BienesInmuebles) {
    try {
      console.log("length");
      console.log(form.bienInmueble.length);
      if (this.tipoPersona === "NINGUNO") {
        console.log("entra");
        console.log(this.tipoPersona);
        form.bienInmueble[2].tercero[0].tipoPersona='FISICA'
        
        //this.bienesInmueblesForm.get("bienInmueble.tercero.tipoPersona").setValue('FISICA');
        /*console.log("llega1")
        if (this.editIndex === null) {
          console.log("llega if 1")
          //form.bienInmueble[form.bienInmueble.length].tercero[0].tipoPersona='FISICA';
          this.bienesInmueblesForm.get("bienInmueble.tercero.tipoPersona").setValue('FISICA');
          console.log("llega if 2")
        } else {
          console.log("index");
          console.log(this.editIndex);
          console.log("llega else 1")
          //form.bienInmueble[this.editIndex].tercero[0].tipoPersona = 'FISICA'
          this.bienesInmueblesForm.get("bienInmueble.tercero.tipoPersona").setValue('FISICA');
          console.log("llega else 2")
        }*/
      }
      const declaracion = {
        bienesInmuebles: form,
      };
      console.log("form");
      console.log(form);
      console.log("this.editIndex")
      console.log(this.editIndex);
      console.log("this.bienInmueble")
      console.log(this.bienInmueble);

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
      this.openSnackBar('ERROR: No se guardaron los cambios', 'Aceptar');
    }
  }

  saveItem() {
    let bienInmueble = [...this.bienInmueble];
    const aclaracionesObservaciones = this.bienesInmueblesForm.value.aclaracionesObservaciones;
    //const newItem = this.bienesInmueblesForm.value.bienInmueble;
    const newItem = this.finalBienInmuebleForm;

    const valorTitular = JSON.parse(JSON.stringify(this.bienesInmueblesForm.value.bienInmueble));
    let valores = [...this.valores];
    let bandera = false;
    if (this.editIndex === null) {
      bienInmueble = [...bienInmueble, newItem];
      if (valorTitular.titular.clave === "DEC") {
        const valor = this.saveValoresDeclarante();
        valores = [...valores, valor];
      }
    } else {
      bienInmueble[this.editIndex] = newItem;
      bandera = true;
    }

    this.isLoading = true;

    if (bandera) {
      let array: any = [];
      array = this.updateValoresDeclarante(bienInmueble);
      valores = array;
    }

    this.saveInfo({
      bienInmueble,
      aclaracionesObservaciones,
      valores,
    });

    this.isLoading = false;
    this.pushButtonSave = true;
  }

  setAclaraciones(aclaraciones?: string) {
    this.bienesInmueblesForm.get('aclaracionesObservaciones').patchValue(aclaraciones || null);
    this.aclaracionesText = aclaraciones || null;
    this.toggleAclaraciones(!!aclaraciones);
  }

  setEditMode() {
    this.bienesInmueblesForm.reset();
    this.editMode = true;
    this.editIndex = null;
  }

  setSelectedOptions() {
    const { tipoInmueble, titular, formaAdquisicion, domicilioMexico } = this.bienesInmueblesForm.value.bienInmueble;

    const { relacion } = this.bienesInmueblesForm.value.bienInmueble.transmisor;

    if (tipoInmueble) {
      const optionTipoInmueble = this.tipoInmuebleCatalogo.filter((i: any) => i.clave === tipoInmueble.clave);
      this.bienesInmueblesForm.get('bienInmueble.tipoInmueble').setValue(optionTipoInmueble[0]);
      if (tipoInmueble.clave === 'OTRO') {
        this.varOtroTipoInmueble = tipoInmueble.valor;
      }
    }

    if (titular) {
      const optionTitular = this.titularBienCatalogo.filter((t: any) => t.clave === titular[0].clave);
      // this.bienesInmueblesForm.get('bienInmueble.titular').setValue(findOption(this.titularBienCatalogo, titular[0]));
      this.bienesInmueblesForm.get('bienInmueble.titular').setValue(optionTitular[0]);
    }
    if (formaAdquisicion) {
      const optFormaAdquision = this.formaAdquisicionCatalogo.filter((ad: any) => ad.clave === formaAdquisicion.clave);
      // this.bienesInmueblesForm.get('bienInmueble.formaAdquisicion').setValue(findOption(this.formaAdquisicionCatalogo, formaAdquisicion));
      this.bienesInmueblesForm.get('bienInmueble.formaAdquisicion').setValue(optFormaAdquision[0]);
    }

    if (relacion) {
      const optRelacion = this.parentescoRelacionCatalogo.filter((par: any) => par.clave === relacion.clave);
      // this.bienesInmueblesForm.get('bienInmueble.transmisor.relacion').setValue(findOption(this.parentescoRelacionCatalogo, relacion));
      this.bienesInmueblesForm.get('bienInmueble.transmisor.relacion').setValue(optRelacion[0]);
      if (relacion.clave === 'OTRO') {
        this.varOtroRelacion = relacion.valor;
      }
    }

    if (domicilioMexico) {
      const { entidadFederativa, municipioAlcaldia } = domicilioMexico;

      if (entidadFederativa) {
        const optEntidad = this.estadosCatalogo.filter((edo: any) => edo.clave === entidadFederativa.clave);
        this.bienesInmueblesForm.get('bienInmueble.domicilioMexico.entidadFederativa').setValue(optEntidad[0]);

        if (municipioAlcaldia) {
          const optMunicipio = this.municipiosCatalogo[optEntidad[0].clave].filter(
            (mun: any) => mun.clave === municipioAlcaldia.clave
          );
          this.bienesInmueblesForm.get('bienInmueble.domicilioMexico.municipioAlcaldia').setValue(optMunicipio[0]);
        }
      }
    }
  }

  setupForm(bienesInmuebles: BienesInmuebles) {
    this.bienInmueble = bienesInmuebles.bienInmueble;
    this.valores = bienesInmuebles.valores;

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

  saveValoresDeclarante() {

    const newItem = JSON.parse(JSON.stringify(this.bienesInmueblesForm.value.bienInmueble));
    const indice = this.bienInmueble.length >= 0 ? this.bienInmueble.length : 0;
    let valor = {
      "indice": indice,
      "superficieConstruccion": newItem.superficieConstruccion.valor,
      "superficieTerreno": newItem.superficieTerreno.valor,
      "valorAdquisicion": newItem.valorAdquisicion.valor,
      "formaAdquisicion": newItem.formaAdquisicion.clave,
    };
    return valor;
  }

  deleteValoresDeclarante(bienInmueble: any) {
    let valores: any = [];
    let valor = {};
    for (let i = 0; i < bienInmueble.length; i++) {
      if (bienInmueble[i].titular[0].clave === "DEC") {
        valor = {
          "indice": i,
          "superficieConstruccion": bienInmueble[i].superficieConstruccion.valor,
          "superficieTerreno": bienInmueble[i].superficieTerreno.valor,
          "valorAdquisicion": bienInmueble[i].valorAdquisicion.valor,
          "formaAdquisicion": bienInmueble[i].formaAdquisicion.clave,
        };
        valores.push(valor);
      }
    }
    return valores;
  }

  updateValoresDeclarante(bienInmueble: any) {
    let valores: any = [];
    let valor = {};
    for (let i = 0; i < bienInmueble.length; i++) {
      if (bienInmueble[i].titular.clave === "DEC") {
        valor = {
          "indice": i,
          "superficieConstruccion": bienInmueble[i].superficieConstruccion.valor,
          "superficieTerreno": bienInmueble[i].superficieTerreno.valor,
          "valorAdquisicion": bienInmueble[i].valorAdquisicion.valor,
          "formaAdquisicion": bienInmueble[i].formaAdquisicion.clave,
        };
        valores.push(valor);
      }
    }
    return valores;
  }

  radioChange(event: any) {
    if (event === "NINGUNO") {
      this.bienesInmueblesForm.get("bienInmueble.tercero.nombreRazonSocial").clearValidators();
      this.bienesInmueblesForm.get("bienInmueble.tercero.nombreRazonSocial").setValue(' ');
      this.bienesInmueblesForm.get("bienInmueble.tercero.nombreRazonSocial").updateValueAndValidity();
      this.bienesInmueblesForm.get("bienInmueble.tercero.nombreRazonSocial").disable();
      this.bienesInmueblesForm.get("bienInmueble.tercero.rfc").clearValidators();
      this.bienesInmueblesForm.get("bienInmueble.tercero.rfc").setValue(' ');
      this.bienesInmueblesForm.get("bienInmueble.tercero.rfc").updateValueAndValidity();
      this.bienesInmueblesForm.get("bienInmueble.tercero.rfc").disable();

      //this.bienesInmueblesForm.get("bienInmueble.tercero.tipoPersona").setValue('FISICA');
    }
    else {
      this.bienesInmueblesForm.get("bienInmueble.tercero.nombreRazonSocial").setValidators([Validators.required]);
      this.bienesInmueblesForm.get("bienInmueble.tercero.nombreRazonSocial").enable();
      this.bienesInmueblesForm.get("bienInmueble.tercero.nombreRazonSocial").updateValueAndValidity();
      this.bienesInmueblesForm.get("bienInmueble.tercero.rfc").setValidators([Validators.required]);
      this.bienesInmueblesForm.get("bienInmueble.tercero.rfc").enable();
      this.bienesInmueblesForm.get("bienInmueble.tercero.rfc").updateValueAndValidity();
    }
  }
}
