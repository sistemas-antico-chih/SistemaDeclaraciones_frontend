import { Component } from '@angular/core';
import { MatDialog  } from '@angular/material/dialog';
import { DialogElementsExampleDialog } from './comienza-tu-declaracion.dialog.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-comienza-tu-declaracion',
  templateUrl: './comienza-tu-declaracion.component.html',
  styleUrls: ['./comienza-tu-declaracion.component.scss'],
})

export class ComienzaTuDeclaracionComponent  {
  ngOnInit(){
  }
 constructor(
  public dialog: MatDialog,
  private router: Router,
) {}

  openDialog() {
    //this.dialogRef.open(DialogElementsExampleDialog);
    let dialogRef = this.dialog.open(DialogElementsExampleDialog, {
      data: `Are you sure you want to delete?`
    })
    dialogRef.afterClosed().subscribe((res: { data: any; }) => {
      console.log(res.data)
    })
  }

  goTo(route: string) {
    this.router.navigate([`/${route}`], { replaceUrl: true });
  }
}