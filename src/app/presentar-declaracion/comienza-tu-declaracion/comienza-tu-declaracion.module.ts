import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CoreModule } from '@core';
import { SharedModule } from '@shared';
import { MaterialModule } from '@app/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { ComienzaTuDeclaracionRoutingModule } from './comienza-tu-declaracion-routing';
import { ComienzaTuDeclaracionComponent } from './comienza-tu-declaracion.component';
import { DialogElementsExampleDialog } from './comienza-tu-declaracion.dialog.component';


@NgModule({
  declarations: [ComienzaTuDeclaracionComponent, DialogElementsExampleDialog],
  imports: [
    CommonModule,
    CoreModule,
    SharedModule,
    FlexLayoutModule,
    MaterialModule,
    MatCardModule,
    ReactiveFormsModule,
    FormsModule,
    ComienzaTuDeclaracionRoutingModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

export class ComienzaTuDeclaracionModule {}
