import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button'


@Component({
  selector: 'app-comienza-tu-declaracion',
  templateUrl: './comienza-tu-declaracion.component.html',
  styleUrls: ['./comienza-tu-declaracion.component.scss'],
})

export class ComienzaTuDeclaracionComponent implements OnInit {
  //constructor() {}

  //ngOnInit(): void {}
  constructor(public dialog: MatDialog) {}

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(DialogAnimationsExampleDialog, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }
  ngOnInit(): void {}
}

@Component({
  selector: 'comienza-tu-declaracion.dialog',
  templateUrl: 'comienza-tu-declaracion.dialog.html',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
})

export class DialogAnimationsExampleDialog {
  constructor(public dialogRef: MatDialogRef<DialogAnimationsExampleDialog>) {}
}
