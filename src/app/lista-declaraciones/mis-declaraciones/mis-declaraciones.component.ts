import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '@shared/dialog/dialog.component';
import { PreviewDeclarationComponent } from '@shared/preview-declaration/preview-declaration.component';

import {
  deleteDeclaracion,
  myDeclaracionesMetadata,
  agregarNotaAclaratoria
} from '@api/declaracion';
import { DeclaracionMetadata, TipoDeclaracion } from '@models/declaracion';
import {
  AgregarNotaAclaratoriaComponent
} from '@shared/agregar-nota-aclaratoria/agregar-nota-aclaratoria.component';
import {
  ConfirmarPasswordComponent
} from '@shared/confirmar-password/confirmar-password.component';
import { Apollo } from 'apollo-angular';

@Component({
  selector: 'app-mis-declaraciones',
  templateUrl: './mis-declaraciones.component.html',
  styleUrls: ['./mis-declaraciones.component.scss'],
})

export class MisDeclaracionesComponent implements OnInit {
  password: string = '';
  currentTab: TipoDeclaracion = 'INICIAL';
  listaDeclaraciones: DeclaracionMetadata[] = [];

  constructor(private apollo: Apollo, private dialog: MatDialog, private router: Router) { }

  confirmDeleteDeclaration(id: string) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: '¿Eliminar declaración?',
        message: 'No podrás deshacer esta acción',
        trueText: 'Eliminar',
        falseText: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteDeclaration(id);
      }
    });
  }

  async deleteDeclaration(id: string) {
    try {
      const result = await this.apollo
        .mutate({
          mutation: deleteDeclaracion,
          variables: {
            id,
          },
        })
        .toPromise();

      this.presentAlert('Tu declaración ha sido eliminada', '');
    } catch (error) {
      console.log(error);
      this.presentAlert('Error', 'No se pudo eliminar la declaración');
    } finally {
      this.getList(this.currentTab);
    }
  }

  editDeclaration(declaracion: DeclaracionMetadata) {
    const tipoDeclaracion = declaracion.tipoDeclaracion.toLocaleLowerCase();

    if (tipoDeclaracion === 'aviso') {
      this.router.navigate(['/aviso'], { replaceUrl: true });
      return;
    }
    if (tipoDeclaracion !== 'AVISO') {
      const url = declaracion.declaracionCompleta
        ? `/${tipoDeclaracion}/situacion-patrimonial`
        : `/${tipoDeclaracion}/simplificada/situacion-patrimonial`;

      this.router.navigate([url], { replaceUrl: true });
      return;
    }

  }

  async getList(tipoDeclaracion: TipoDeclaracion = null) {
    try {
      const { data }: any = await this.apollo
        .query({
          query: myDeclaracionesMetadata,
          variables: {
            filter: {
              tipoDeclaracion,
            },
          },
        })
        .toPromise();

      this.listaDeclaraciones = data.myDeclaracionesMetadata.docs || [];
    } catch (error) {
      console.log(error);
    }
  }

  ngOnInit(): void {
    this.getList(this.currentTab);
  }

  onTabChanged(event: any) {
    const tabName = event.tab.textLabel;
    const tipoDeclaracionMap = {
      Inicial: 'INICIAL',
      Modificación: 'MODIFICACION',
      Conclusión: 'CONCLUSION',
      Avisos: 'AVISO'
    };

    this.currentTab = tipoDeclaracionMap[tabName];
    this.getList(tipoDeclaracionMap[tabName]);
  }

  presentAlert(title: string, message: string) {
    this.dialog.open(DialogComponent, {
      data: {
        title,
        message,
        trueText: 'Aceptar',
      },
    });
  }

  previewDeclaration(id: string, publicVersion: boolean = false) {
    const dialogRef = this.dialog.open(PreviewDeclarationComponent, {
      data: {
        id,
        publicVersion,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
      }
    });
  }

  async agregarNota(
    declaracion: DeclaracionMetadata
  ) {

    const dialogRef = this.dialog.open(
      AgregarNotaAclaratoriaComponent,
      {
        width: '600px',
        data: {
          secciones:
            this.obtenerSecciones(
              declaracion
            )
        }
      }
    );

    dialogRef.afterClosed()
      .subscribe(async resultado => {

        if (!resultado) {
          return;
        }

        // ============================================
        // SEGUNDO PASO: SOLICITAR CONTRASEÑA
        // ============================================

        const passwordDialogRef = this.dialog.open(
          ConfirmarPasswordComponent,
          {
            width: '450px'
          }
        );

        const password = await passwordDialogRef
          .afterClosed()
          .toPromise();

        if (!password) {
          return;
        }

        // ============================================
        // TERCER PASO: GUARDAR NOTA
        // ============================================

        try {

          await this.apollo.mutate({
            mutation: agregarNotaAclaratoria,
            variables: {
              id: declaracion._id,
              password,
              nota: {
                seccion: resultado.seccion,
                nota: resultado.nota
              }
            }
          }).toPromise();

          this.presentAlert(
            'Éxito',
            'Nota aclaratoria agregada correctamente'
          );

        } catch (error: any) {

          console.error(error);

          let mensaje = 'No fue posible guardar la nota';

          if (error?.graphQLErrors?.length > 0) {
            mensaje = error.graphQLErrors[0].message;
          } else if (error?.message) {
            mensaje = error.message;
          }

          this.presentAlert(
            'Error',
            mensaje
          );

        }

      });
  }

  private obtenerSecciones(
    declaracion: DeclaracionMetadata
  ): any[] {

    // Caso especial: AVISO
    if (declaracion.tipoDeclaracion === 'AVISO') {
      return [
        {
          valor: 'datosGenerales',
          descripcion: 'Datos Generales'
        },
        {
          valor: 'datosEmpleoCargoComision',
          descripcion: 'Empleo Cargo Comisión'
        },
        {
          valor: 'domicilioDeclarante',
          descripcion: 'Domicilio del Declarante'
        }
      ];
    }

    const secciones = [

      {
        valor: 'datosGenerales',
        descripcion: 'Datos Generales'
      },
      {
        valor: 'domicilioDeclarante',
        descripcion: 'Domicilio del Declarante'
      },
      {
        valor: 'datosCurricularesDeclarante',
        descripcion: 'Datos Curriculares'
      },
      {
        valor: 'datosEmpleoCargoComision',
        descripcion: 'Empleo Cargo Comisión'
      },
      {
        valor: 'experienciaLaboral',
        descripcion: 'Experiencia Laboral'
      },
      {
        valor: 'ingresos',
        descripcion: 'Ingresos'
      }

    ];

    if (
      declaracion.tipoDeclaracion === 'INICIAL' ||
      declaracion.tipoDeclaracion === 'FINAL'
    ) {

      secciones.push({
        valor: 'actividadAnualAnterior',
        descripcion: 'Actividad Anual Anterior'
      });

    }

    if (declaracion.declaracionCompleta) {

      secciones.push(
        {
          valor: 'datosPareja',
          descripcion: 'Datos Pareja'
        },
        {
          valor: 'datosDependientesEconomicos',
          descripcion: 'Dependientes Económicos'
        },
        {
          valor: 'bienesInmuebles',
          descripcion: 'Bienes Inmuebles'
        },
        {
          valor: 'vehiculos',
          descripcion: 'Vehículos'
        },
        {
          valor: 'bienesMuebles',
          descripcion: 'Bienes Muebles'
        },
        {
          valor: 'inversionesCuentasValores',
          descripcion: 'Inversiones'
        },
        {
          valor: 'adeudosPasivos',
          descripcion: 'Adeudos'
        },
        {
          valor: 'prestamoComodato',
          descripcion: 'Préstamo Comodato'
        },
        {
          valor: 'participacion',
          descripcion: 'Participaciones'
        },
        {
          valor: 'participacionTomaDecisiones',
          descripcion: 'Toma de Decisiones'
        },
        {
          valor: 'apoyos',
          descripcion: 'Apoyos'
        },
        {
          valor: 'representaciones',
          descripcion: 'Representaciones'
        },
        {
          valor: 'clientesPrincipales',
          descripcion: 'Clientes Principales'
        },
        {
          valor: 'beneficiosPrivados',
          descripcion: 'Beneficios Privados'
        },
        {
          valor: 'fideicomisos',
          descripcion: 'Fideicomisos'
        }
      );

    }

    return secciones;

  }
}
