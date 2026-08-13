import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MaterialModule } from '@app/material.module';
import { LoaderComponent } from './loader/loader.component';

import { DialogComponent, DialogComponentMensaje } from './dialog/dialog.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { PaginatorComponent } from './paginator/paginator.component';
import { PreviewDeclarationComponent } from './preview-declaration/preview-declaration.component';
import { AgregarNotaAclaratoriaComponent } from './agregar-nota-aclaratoria/agregar-nota-aclaratoria.component';
import { ReplacePipe } from './pipes/replace.pipe';
import { ConfirmarPasswordComponent } from './confirmar-password/confirmar-password.component';

@NgModule({
  imports: [FlexLayoutModule, MaterialModule, CommonModule, FormsModule],
  declarations: [
    LoaderComponent,
    DialogComponent,
    DialogComponentMensaje,
    FooterComponent,
    HeaderComponent,
    PaginatorComponent,
    PreviewDeclarationComponent,
    AgregarNotaAclaratoriaComponent,
    ReplacePipe,
    ConfirmarPasswordComponent
  ],
  exports: [
    LoaderComponent,
    DialogComponent,
    DialogComponentMensaje,
    FooterComponent,
    HeaderComponent,
    PaginatorComponent,
    PreviewDeclarationComponent,
    AgregarNotaAclaratoriaComponent,
    ReplacePipe,
    FormsModule,
    ConfirmarPasswordComponent
  ],
})
export class SharedModule {}
