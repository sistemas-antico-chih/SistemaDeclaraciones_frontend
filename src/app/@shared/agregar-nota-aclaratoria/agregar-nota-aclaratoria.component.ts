import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';

@Component({
  selector: 'app-agregar-nota-aclaratoria',
  templateUrl: './agregar-nota-aclaratoria.component.html',
  styleUrls: ['./agregar-nota-aclaratoria.component.scss']
})
export class AgregarNotaAclaratoriaComponent {

  seccion = '';
  nota = '';

  secciones: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<AgregarNotaAclaratoriaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.secciones = data.secciones || [];

  }

  guardar() {

    if (!this.seccion || !this.nota.trim()) {
      return;
    }

    this.dialogRef.close({
      seccion: this.seccion,
      nota: this.nota.trim()
    });

  }

}