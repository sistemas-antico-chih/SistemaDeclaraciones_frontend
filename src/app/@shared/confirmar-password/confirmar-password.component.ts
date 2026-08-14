import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmar-password',
  templateUrl: './confirmar-password.component.html',
  styleUrls: ['./confirmar-password.component.scss']
})
export class ConfirmarPasswordComponent {

  password = '';

  constructor(
    private dialogRef: MatDialogRef<ConfirmarPasswordComponent>
  ) {}

  confirmar(): void {

    if (!this.password) {
      return;
    }

    this.dialogRef.close(this.password);
  }

  cancelar(): void {
    this.dialogRef.close();
  }

}