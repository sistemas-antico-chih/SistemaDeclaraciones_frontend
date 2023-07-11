import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

import { CoreModule } from '@core';
import { SharedModule } from '@shared';
import { MaterialModule } from '@app/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ComienzaTuDeclaracionRoutingModule } from './comienza-tu-declaracion-routing';
import { ComienzaTuDeclaracionComponent } from './comienza-tu-declaracion.component';

@NgModule({
  declarations: [ComienzaTuDeclaracionComponent],
  imports: [
    CommonModule,
    CoreModule,
    SharedModule,
    FlexLayoutModule,
    MaterialModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    NgIf,
    MatDialogModule,
    ComienzaTuDeclaracionRoutingModule,
  ],
})
export class ComienzaTuDeclaracionModule {}
