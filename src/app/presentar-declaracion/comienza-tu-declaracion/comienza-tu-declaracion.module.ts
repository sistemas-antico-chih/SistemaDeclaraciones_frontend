import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {NgIf} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

import { CoreModule } from '@core';
import { SharedModule } from '@shared';
//import { MatDialogModule  } from '@app/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ComienzaTuDeclaracionRoutingModule } from './comienza-tu-declaracion-routing';
import { ComienzaTuDeclaracionComponent } from './comienza-tu-declaracion.component';

@NgModule({
  declarations: [ComienzaTuDeclaracionComponent],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    NgIf,
    MatDialogModule,
    CommonModule,
    CoreModule,
    SharedModule,
    FlexLayoutModule,
    ComienzaTuDeclaracionRoutingModule,
  ],
})
export class ComienzaTuDeclaracionModule {}
