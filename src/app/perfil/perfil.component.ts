import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Apollo } from 'apollo-angular';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogComponent } from '@shared/dialog/dialog.component';

import { changePassword, updateUserProfile, userProfileQuery } from '@api/user';

import { AuthenticationService } from '../auth/authentication.service';

import { CatalogosService } from '@app/services/catalogos.service';

import { validarCURP, validarRFC } from '../@shared/validators/signup.validador';


@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit {
  editMode = false;
  cambiarContrasena = false;
  changePasswordForm: FormGroup;
  profileForm: FormGroup;
  isLoading = false;

  user: any = null;

  institucionesCatalogo: any[];

  constructor(
    private apollo: Apollo,
    private authenticationService: AuthenticationService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private catalogoService: CatalogosService
  ) {
    this.createForms();
    this.loadInstituciones();
    this.getUserInfo();
  }

  async loadInstituciones() {
    this.institucionesCatalogo = await this.catalogoService.getInstituciones().then((data) => data);
    if (this.institucionesCatalogo?.length) {
      this.profileForm.get('institucion').enable();
    }
  }

  confirmChangePassword() {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: '¿Cambiar contraseña?',
        message: '',
        trueText: 'Aceptar',
        falseText: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.saveInfo();
      }
    });
  }

  confirmChangeProfile() {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: '¿Actualizar perfil?',
        message: '',
        trueText: 'Actualizar',
        falseText: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.saveInfoProfile();
      }
    });
  }

  createForms() {
    this.profileForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      primerApellido: ['', Validators.required],
      segundoApellido: ['', Validators.required],
      curp: ['', [Validators.required, validarCURP]],
      rfc: ['', [Validators.required, validarRFC]],
      institucion: [{ disabled: true, value: null }, [Validators.required]],
      username: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i
          ),
        ],
      ],
    });

    this.changePasswordForm = this.formBuilder.group({
      oldPassword: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
      newPassword: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
    });
  }

  changeEditMode() {
    this.editMode = !this.editMode;
  }

  async getUserInfo() {
    try {
      const { data }: any = await this.apollo
        .query({
          query: userProfileQuery,
        })
        .toPromise();

      this.user = data.userProfile || null;

      this.profileForm.patchValue(this.user);

      if (this.user.institucion) {
        const ins = this.user.institucion;
        const optTitular = this.institucionesCatalogo.filter((ti: any) => ti.clave === ins.clave);
        this.profileForm.get('institucion').setValue(optTitular[0]);
      }
    } catch (error) {
      console.log(error);
    }
  }

  logout() {
    this.authenticationService.logout().subscribe(() => this.router.navigate(['/login'], { replaceUrl: true }));
  }

  async saveInfo() {
    const passwords = this.changePasswordForm.value;
    try {
      this.isLoading = true;

      const result = await this.apollo
        .mutate({
          mutation: changePassword,
          variables: {
            oldPassword: passwords.oldPassword,
            newPassword: passwords.newPassword,
          },
        })
        .toPromise();

      this.isLoading = false;
      this.openSnackBar('Información actualizada', 'Aceptar');
      this.logout();
    } catch (error) {
      console.log(error);
      this.openSnackBar('ERROR: No se guardaron los cambios', 'Aceptar');
    }
  }

  async saveInfoProfile() {
    const profile = this.profileForm.value;

    if (this.institucionesCatalogo?.length) {
      profile.institucion = {
        clave: profile.institucion.clave,
        valor: profile.institucion.valor,
      };
    }

    try {
      this.isLoading = true;

      const result = await this.apollo
        .mutate({
          mutation: updateUserProfile,
          variables: {
            profile,
          },
        })
        .toPromise();

      this.isLoading = false;
      this.openSnackBar('Información actualizada', 'Aceptar');
      this.logout();
    } catch (error) {
      console.log(error);
      this.openSnackBar('ERROR: No se guardaron los cambios', 'Aceptar');
    }
  }

  ngOnInit(): void { }

  openSnackBar(message: string, action: string = null) {
    this.snackBar.open(message, action, {
      duration: 5000,
    });
  }

  toggleNuevaContrasena(value: boolean) {
    this.cambiarContrasena = value;
  }
}
