import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { CoreModule } from '@core';
import { SharedModule } from '@shared';
import { MaterialModule } from '@app/material.module';
//import { SharedPresentarDeclaracionModule } from '/shared-presentar-declaracion/shared-presentar-declaracion.module';
import { SharedPresentarDeclaracionModule } from '../presentar-declaracion/shared-presentar-declaracion/shared-presentar-declaracion.module';
import { AvisoRoutingModule } from './aviso-routing.module';

import { DatosGeneralesComponent } from './datos-generales/datos-generales.component';
import { DomicilioDeclaranteComponent } from './domicilio-declarante/domicilio-declarante.component';
import { DatosEmpleoComponent } from './datos-empleo/datos-empleo.component';

import { CatalogosService } from '../../services/catalogos.service';

@NgModule({
  declarations: [
    DatosGeneralesComponent,
    DomicilioDeclaranteComponent,
    DatosEmpleoComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    CoreModule,
    SharedModule,
    FlexLayoutModule,
    MaterialModule,
    SharedPresentarDeclaracionModule,
    AvisoRoutingModule,
  ],
  providers: [CatalogosService],
})
export class AvisoModule {}
