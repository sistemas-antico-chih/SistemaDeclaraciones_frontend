import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';


export const validarFechas: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    console.log("llega¡¡");
    let fechaIni = control.get('experiencia.fechaIngreso');
    let fechaFin = control.get('experiencia.fechaEgreso');
  
    console.log("fechaInicial: "+fechaIni);
    console.log("fechaFinal: "+fechaFin);

    let fechaInicial= new Date(fechaIni)
    let fechaFinal=new Date(fechaFin)

    console.log("fechaInicial 2: "+fechaInicial);
    console.log("fechaFinal 2: "+fechaFinal);

    return fechaInicial < fechaFinal ? null : { 'fechaErronea': true };
  };
