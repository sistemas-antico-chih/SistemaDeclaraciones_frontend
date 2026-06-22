import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { environment } from '@env/environment';
import { Logger, UntilDestroy, untilDestroyed } from '@core';
import { AuthenticationService } from '../authentication.service';

import { MatSnackBar } from '@angular/material/snack-bar';
import { CatalogosService } from '@app/services/catalogos.service';
//import InstitucionesCatalogo from '@static/custom/instituciones.json';

import { validarCURP, validarRFC } from '../signup/signup.validador';

const log = new Logger('Signup');

@UntilDestroy()
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit, OnDestroy {
  version: string | null = environment.version;
  error: string | undefined;
  signupForm!: FormGroup;
  isLoading = false;

  institucionesCatalogo: any[];

  private dominiosSugeridos = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmal.com': 'gmail.com',
    'hotnail.com': 'hotmail.com',
    'hotmai.com': 'hotmail.com',
    'outlok.com': 'outlook.com'
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private _snackBar: MatSnackBar,
    private catalogoService: CatalogosService
  ) {
    this.createForm();
    this.loadInstituciones();
  }

  ngOnInit() {
    this.signupForm.valueChanges.subscribe(() => {
      console.log(this.signupForm.errors);
    });
  }

  ngOnDestroy() { }

  async loadInstituciones() {
    this.institucionesCatalogo = await this.catalogoService.getInstituciones().then((data) => data);
    if (this.institucionesCatalogo?.length) {
      this.signupForm.get('institucion').enable();
    }
  }

  signup() {
    this.isLoading = true;

    const signupForm = {
      ...this.signupForm.value,
      nombre: this.signupForm.value.nombre?.trim(),
      primerApellido: this.signupForm.value.primerApellido?.trim(),
      segundoApellido: this.signupForm.value.segundoApellido?.trim(),
      username: this.signupForm.value.username
        ?.trim()
        .toLowerCase()
    };

    if (this.institucionesCatalogo?.length) {
      signupForm.institucion = {
        clave: signupForm.institucion.clave,
        valor: signupForm.institucion.valor,
      };
    }

    const signup$ = this.authenticationService.signup(signupForm);
    signup$
      .pipe(
        finalize(() => {
          this.signupForm.markAsPristine();
          this.isLoading = false;
        }),
        untilDestroyed(this)
      )
      .subscribe(
        (success) => {
          if (success) {
            log.debug(`successfully signed up`);
            this.openSnackBar('Usuario registrado exitosamente', 'Aceptar');
            this.router.navigate([this.route.snapshot.queryParams.redirect || '/'], { replaceUrl: true });
          } else {
            //this.openSnackBar('No se pudo completar el registro', 'Aceptar');
            this.openSnackBar('Usuario ya registrado', 'Aceptar');
          }
        },
        (error) => {
          log.debug(`Signup error: ${error}`);
          this.error = error;
          this.openSnackBar('Ocurrió un error', 'Aceptar');
        }
      );
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 3000,
    });
  }

  private createForm() {
    this.signupForm.valueChanges.subscribe(() => {
      this.signupForm.updateValueAndValidity({ onlySelf: false, emitEvent: false });
    });
    this.signupForm = this.formBuilder.group({
      //nombre: ['', Validators.required,
      nombre: ['',
        Validators.pattern(/^[a-z\s\u00E0-\u00FC\u00f1\u00d1]*$/i),
      ],
      primerApellido: ['',
        Validators.pattern(/^[a-z\s\u00E0-\u00FC\u00f1\u00d1]*$/i),
      ],
      segundoApellido: ['', Validators.pattern(/^[a-z\s\u00E0-\u00FC\u00f1\u00d1]*$/i)],
      username: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i
          ),
        ],
      ],
      confirmarCorreo: [
        '',
        [
          Validators.required
        ]
      ],
      curp: [
        '',
        [
          Validators.required,
          validarCURP,
          Validators.pattern(
            /^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/i
          ),
        ],
      ], updatedOn: 'change',
      rfc: [
        '',
        [
          Validators.required,
          validarRFC,
          Validators.pattern(
            /^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/i
          ),
        ],
      ],
      contrasena: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16)]],
      confirmarContrasena: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16)]],
      institucion: [{ disabled: true, value: null }, [Validators.required]],
    },
      {
        validators: this.validarCorreosCoinciden
      });
  }

  validarDominioCorreo() {

    const correo = this.signupForm.get('username')?.value;

    if (!correo || correo.indexOf('@') === -1) {
      return;
    }

    const partes = correo.toLowerCase().split('@');

    const dominio = partes[1];

    if (this.dominiosSugeridos[dominio]) {

      this.openSnackBar(
        `¿Quiso decir ${partes[0]}@${this.dominiosSugeridos[dominio]} ?`,
        'Aceptar'
      );

    }

  }

  validarCorreosCoinciden(
    control: AbstractControl
  ): ValidationErrors | null {

    const username = control.get('username');
    const confirmarCorreo = control.get('confirmarCorreo');

    if (!username || !confirmarCorreo) {
      return null;
    }

    if (
      username.value &&
      confirmarCorreo.value &&
      username.value !== confirmarCorreo.value
    ) {
      return { correoNoCoincide: true };
    }

    return null;
  }

}
