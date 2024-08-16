import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Apollo } from 'apollo-angular';
import { 
  participacionTomaDecisionesMutation, 
  participacionTomaDecisionesQuery, 
  lastParticipacionTomaDecisionesQuery
} from '@api/declaracion';

import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '@shared/dialog/dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

import { UntilDestroy, untilDestroyed } from '@core';

import Relacion from '@static/catalogos/tipoRelacion.json';
import Institucion from '@static/catalogos/tipoInstitucion.json';
import Extranjero from '@static/catalogos/extranjero.json';
import Paises from '@static/catalogos/paises.json';
import Estados from '@static/catalogos/estados.json';

import { tooltipData } from '@static/tooltips/intereses/toma-descisiones';
import TipoOperacion from '@static/catalogos/tipoOperacion.json';
import { 
  DeclaracionOutput, 
  ParticipacionTD, 
  ParticipacionTomaDecisiones,
  LastDeclaracionOutput 
} from '@models/declaracion';

import { findOption, ifExistsEnableFields } from '@utils/utils';

import { DeclarationErrorStateMatcher } from '@app/presentar-declaracion/shared-presentar-declaracion/declaration-error-state-matcher';

@UntilDestroy()
@Component({
  selector: 'app-toma-decisiones',
  templateUrl: './toma-decisiones.component.html',
  styleUrls: ['./toma-decisiones.component.scss'],
})
export class TomaDecisionesComponent implements OnInit {
  aclaraciones = false;
  participacion: ParticipacionTD[] = [];
  participacionTomaDecisionesForm: FormGroup;
  editMode = false;
  editIndex: number = null;
  estado: string = null;
  isLoading = false;

  relacionCatalogo = Relacion;
  institucionCatalogo = Institucion;
  extranjeroCatalogo = Extranjero;
  paisesCatalogo = Paises;
  estadosCatalogo = Estados;
  tipoOperacionCatalogo = TipoOperacion;
  tipoDeclaracion: string = null;
  tipoDomicilio = 'MEXICO';

  declaracionId: string = null;

  tooltipData = tooltipData;
  errorMatcher = new DeclarationErrorStateMatcher();

  minDate = new Date(1960, 1, 1);
  anio: number = new Date().getFullYear();
  mes: number = new Date().getMonth() + 1;
  dia: number = new Date().getDate();
  maxDate = new Date(this.anio, this.mes-1, this.dia);

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
    this.participacionTomaDecisionesForm.reset();
    this.editMode = true;
    this.editIndex = null;
  }

  locationChanged(value: string) {
    const localizacion = this.participacionTomaDecisionesForm.get('participacion').get('ubicacion');
    const pais = localizacion.get('pais');
    const entidadFederativa = localizacion.get('entidadFederativa');
    if (value === 'EX') {
      pais.enable();
      entidadFederativa.disable();
      entidadFederativa.reset();
      this.tipoDomicilio = 'EXTRANJERO';
    } else {
      pais.disable();
      entidadFederativa.enable();
      pais.reset();
      this.tipoDomicilio = 'MEXICO';
    }
  }

  cancelEditMode() {
    this.editMode = false;
    this.editIndex = null;
  }

  createForm() {
    this.participacionTomaDecisionesForm = this.formBuilder.group({
      ninguno: [false],
      participacion: this.formBuilder.group({
        tipoOperacion: [null, [Validators.required]],
        tipoRelacion: ['', Validators.required],
        tipoInstitucion: ['', [Validators.required]],
        nombreInstitucion: ['', [Validators.required, Validators.pattern(/^\S.*\S?$/)]],
        rfc: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/i
            ),
          ],
        ],
        puestoRol: ['', Validators.pattern(/^\S.*\S?$/)],
        fechaInicioParticipacion: ['', [Validators.required]],
        recibeRemuneracion: [false, Validators.required],
        montoMensual: this.formBuilder.group({
          valor: [0, [Validators.required, Validators.pattern(/^\d+\.?\d{0,2}$/), Validators.min(0)]],
          moneda: ['MXN'],
        }),
        ubicacion: this.formBuilder.group({
          pais: ['', [Validators.required]],
          entidadFederativa: ['', [Validators.required]],
        }),
      }),
      aclaracionesObservaciones: [{ disabled: true, value: '' }, [Validators.required, Validators.pattern(/^\S.*\S$/)]],
    });

    const montoMensual = this.participacionTomaDecisionesForm.get('participacion').get('montoMensual');
    this.participacionTomaDecisionesForm
      .get('participacion')
      .get('recibeRemuneracion')
      .valueChanges.pipe(untilDestroyed(this))
      .subscribe((x) => {
        x ? montoMensual.enable() : montoMensual.disable();
      });
  }

  editItem(index: number) {
    this.setEditMode();
    this.fillForm(this.participacion[index]);
    this.editIndex = index;
  }

  fillForm(participacion: ParticipacionTD) {
    Object.keys(participacion)
      .filter((field) => participacion[field] !== null)
      .forEach((field) =>
        this.participacionTomaDecisionesForm.get(`participacion.${field}`).patchValue(participacion[field])
      );

    ifExistsEnableFields(
      participacion.ubicacion.entidadFederativa,
      this.participacionTomaDecisionesForm,
      'participacion.ubicacion.entidadFederativa'
    );

    if (participacion.ubicacion.entidadFederativa) {
      this.tipoDomicilio = 'MEXICO';
    }

    ifExistsEnableFields(
      participacion.ubicacion.pais,
      this.participacionTomaDecisionesForm,
      'participacion.ubicacion.pais'
    );
    if (participacion.ubicacion.pais) {
      this.tipoDomicilio = 'EXTRANJERO';
    }

    this.setSelectedOptions();
  }

  async getLastUserInfo() {
    try {
      const { data, errors } = await this.apollo
        .query<LastDeclaracionOutput>({
          query: lastParticipacionTomaDecisionesQuery,
        })
        .toPromise();

      if (errors) {
        throw errors;
      }

      this.setupForm(data?.lastDeclaracion.participacionTomaDecisiones);
    } catch (error) {
      console.warn('El usuario probablemente no tienen una declaración anterior', error.message);
      // this.openSnackBar('[ERROR: No se pudo recuperar la información]', 'Aceptar');
    }
  }

  async getUserInfo() {
    try {
      const { data } = await this.apollo
        .query<DeclaracionOutput>({
          query: participacionTomaDecisionesQuery,
          variables: {
            tipoDeclaracion: this.tipoDeclaracion.toUpperCase(),
          },
        })
        .toPromise();

      this.declaracionId = data.declaracion._id;
      if (data.declaracion.participacionTomaDecisiones === null) {
        this.getLastUserInfo();
      } else {
        this.setupForm(data.declaracion.participacionTomaDecisiones);
      }
    } catch (error) {
      console.error(error);
      this.openSnackBar('[ERROR: No se pudo recuperar la información]', 'Aceptar');
    }
  }


  formHasChanges() {
    let isDirty = this.participacionTomaDecisionesForm.dirty;
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
        if (result) this.router.navigate(['/' + this.tipoDeclaracion + '/intereses/apoyos-publicos']);
      });
    } else {
      this.router.navigate(['/' + this.tipoDeclaracion + '/intereses/apoyos-publicos']);
    }
  }

  ngOnInit(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: 'Guarde la información de cada sección',
        //message: '',
        trueText: 'Aceptar',
        falseText: '',
      },
    });
}

  noTomaDecisiones() {
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
        const participacion = [...this.participacion.slice(0, index), ...this.participacion.slice(index + 1)];
        const aclaracionesObservaciones = this.participacionTomaDecisionesForm.value.aclaracionesObservaciones;
        this.saveInfo({
          participacion,
          aclaracionesObservaciones,
        });
      }
    });
  }

  async saveInfo(form: ParticipacionTomaDecisiones) {
    try {
      const declaracion = {
        participacionTomaDecisiones: form,
      };

      const { data } = await this.apollo
        .mutate<DeclaracionOutput>({
          mutation: participacionTomaDecisionesMutation,
          variables: {
            id: this.declaracionId,
            declaracion,
          },
        })
        .toPromise();

      this.editMode = false;
      if (data.declaracion.participacionTomaDecisiones) {
        this.setupForm(data.declaracion.participacionTomaDecisiones);
      }
      this.presentSuccessAlert();
    } catch (error) {
      console.log(error);
      this.openSnackBar('ERROR: No se guardaron los cambios', 'Aceptar');
    }
  }

  saveItem() {
    let participacion = [...this.participacion];
    const aclaracionesObservaciones = this.participacionTomaDecisionesForm.value.aclaracionesObservaciones;
    const newItem = this.participacionTomaDecisionesForm.value.participacion;

    if (this.editIndex === null) {
      participacion = [...participacion, newItem];
    } else {
      participacion[this.editIndex] = newItem;
    }

    this.isLoading = true;

    this.saveInfo({
      participacion,
      aclaracionesObservaciones,
    });

    this.isLoading = false;
  }

  setEditMode() {
    this.participacionTomaDecisionesForm.reset();
    this.editMode = true;
    this.editIndex = null;
  }

  setSelectedOptions() {
    const { tipoInstitucion } = this.participacionTomaDecisionesForm.value.participacion;
    const { entidadFederativa } = this.participacionTomaDecisionesForm.value.participacion.ubicacion;

    if (tipoInstitucion) {
      this.participacionTomaDecisionesForm
        .get('participacion.tipoInstitucion')
        .setValue(findOption(this.institucionCatalogo, tipoInstitucion));
    }

    if (entidadFederativa) {
      this.participacionTomaDecisionesForm
        .get('participacion.ubicacion.entidadFederativa')
        .setValue(findOption(this.estadosCatalogo, entidadFederativa));
    }
  }

  setupForm(participacion: ParticipacionTomaDecisiones) {
    this.participacion = participacion.participacion;
    const aclaraciones = participacion.aclaracionesObservaciones;

    if (participacion.ninguno) {
      this.participacionTomaDecisionesForm.get('ninguno').patchValue(true);
    }

    if (aclaraciones) {
      this.participacionTomaDecisionesForm.get('aclaracionesObservaciones').patchValue(aclaraciones);
      this.toggleAclaraciones(true);
    }

    // this.editMode = !!!this.experiencia.length;
  }

  toggleAclaraciones(value: boolean) {
    const aclaraciones = this.participacionTomaDecisionesForm.get('aclaracionesObservaciones');
    if (value) {
      aclaraciones.enable();
    } else {
      aclaraciones.disable();
      aclaraciones.reset();
    }
    this.aclaraciones = value;
  }
}
