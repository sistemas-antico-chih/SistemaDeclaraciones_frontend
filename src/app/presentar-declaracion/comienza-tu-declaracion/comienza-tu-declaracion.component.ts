import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from "@angular/material";

@Component({
  selector: 'app-comienza-tu-declaracion',
  templateUrl: './comienza-tu-declaracion.component.html',
  styleUrls: ['./comienza-tu-declaracion.component.scss'],
})
export class ComienzaTuDeclaracionComponent implements OnInit {
  //constructor() {}

  ngOnInit(): void {}
  constructor(private dialog: MatDialog) { }
  openDialog() {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    this.dialog.open(ComienzaTuDeclaracionComponent, dialogConfig);
  }
}
