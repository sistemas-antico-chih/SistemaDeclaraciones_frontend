import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DatosGeneralesAvisoComponent } from './datos-generales/datos-generales.component';
import { DomicilioDeclaranteAvisoComponent } from './domicilio-declarante/domicilio-declarante.component';
import { DatosEmpleoAvisoComponent } from './datos-empleo/datos-empleo.component';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { Shell } from '@app/shell/shell.service';

const modules = [
    {
      path: 'datos-generales',
      component: DatosGeneralesAvisoComponent,
      data: { title: marker('Datos Generales') },
    },
    {
      path: 'domicilio-declarante',
      component: DomicilioDeclaranteAvisoComponent,
      data: { title: marker('Domicilio Declarante') },
    },
    {
      path: 'datos-empleo',
      component: DatosEmpleoAvisoComponent,
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
