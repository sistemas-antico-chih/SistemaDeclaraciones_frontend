import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DatosGeneralesComponent } from './datos-generales/datos-generales.component';
import { DomicilioDeclaranteComponent } from './domicilio-declarante/domicilio-declarante.component';
import { DatosEmpleoComponent } from './datos-empleo/datos-empleo.component';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { Shell } from '@app/shell/shell.service';

const modules:Routes = [
    {
      path: 'datos-generales',
      component: DatosGeneralesComponent,
      data: { title: marker('Datos Generales') },
    },
    {
      path: 'domicilio-declarante',
      component: DomicilioDeclaranteComponent,
      data: { title: marker('Domicilio Declarante') },
    },
    {
      path: 'datos-empleo',
      component: DatosEmpleoComponent,
      data: { title: marker('Datos Empleo') },
    },
];

const routes: Routes = [
  Shell.childRoutes([
    {
      path: 'aviso',
      children: [{ path: '', redirectTo: '/aviso/datos-generales', pathMatch: 'full' }, ...modules],
    },
    {
      path: 'aviso',
      children: [
        { path: '', redirectTo: '/aviso/domicilio-declarante', pathMatch: 'full' },
        ...modules,
      ],
    },
    {
      path: 'aviso',
      children: [
        { path: '', redirectTo: '/aviso/datos-empleo', pathMatch: 'full' },
        ...modules,
      ],
    },
  ]),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class AvisoRoutingModule {}
