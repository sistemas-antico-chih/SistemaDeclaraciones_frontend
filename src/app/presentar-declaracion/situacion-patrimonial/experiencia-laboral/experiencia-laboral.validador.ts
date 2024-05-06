import { FormGroup, ValidationErrors, ValidatorFn, Date } from '@angular/forms';


export const validarFechas: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    console.log("llega¡¡");
    let fechaInicial = control.get('experiencia.fechaIngreso').split("/");
    let fechaFinal = control.get('experiencia.fechaEgreso').split("/");
  
    console.log("fechaInicial: "+fechaInicial);
    console.log("fechaFinal: "+fechaFinal);

    console.log("fechaInicial 1: "+fechaInicial[1]);
    console.log("fechaFinal 1: "+fechaFinal[1]);

    console.log("fechaInicial 2: "+fechaInicial[2]);
    console.log("fechaFinal 2: "+fechaFinal[2]);

    console.log("fechaInicial 3: "+fechaInicial[3]);
    console.log("fechaFinal 3: "+fechaFinal[3]);

    return fechaInicial[1] < fechaFinal[1] ? null : { 'fechaErronea': true };
  };
