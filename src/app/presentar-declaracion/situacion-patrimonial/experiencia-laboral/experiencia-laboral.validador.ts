import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';


export const validarFechas: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    console.log("llega¡¡");
    let fechaInicial = control.get('experiencia.fechaIngreso');
    let fechaFinal = control.get('experiencia.fechaEgreso');
  
    console.log("fechaInicial: "+fechaInicial);
    console.log("fechaFinal: "+fechaFinal);

    fechaInicial= new Date(fechaInicial)
    fechaFinal=new Date(fechaFinal)

    console.log("fechaInicial 2: "+fechaInicial);
    console.log("fechaFinal 2: "+fechaFinal);

    return fechaInicial < fechaFinal ? null : { 'fechaErronea': true };
  };
