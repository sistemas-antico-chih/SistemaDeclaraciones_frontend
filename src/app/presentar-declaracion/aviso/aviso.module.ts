import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { CoreModule } from '@core';
import { SharedModule } from '@shared';
import { MaterialModule } from '@app/material.module';
//import { SharedPresentarDeclaracionModule } from '/shared-presentar-declaracion/shared-presentar-declaracion.module';
import { SharedPresentarDeclaracionModule } from '../shared-presentar-declaracion/shared-presentar-declaracion.module';
import { AvisoRoutingModule } from './aviso-routing.module';

import { DatosGeneralesAvisoComponent } from './datos-generales/datos-generales.component';
import { DomicilioDeclaranteAvisoComponent } from './domicilio-declarante/domicilio-declarante.component';
import { DatosEmpleoAvisoComponent } from './datos-empleo/datos-empleo.component';

import { CatalogosService } from '../../services/catalogos.service';

@NgModule({
  declarations: [
    DatosGeneralesAvisoComponent,
    DomicilioDeclaranteAvisoComponent,
    DatosEmpleoAvisoComponent,
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
