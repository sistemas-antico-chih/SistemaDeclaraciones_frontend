import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';


export const validarFechas: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    console.log("llega¡¡");
    let fechaIni = control.get('experiencia.fechaIngreso').value;
    let fechaFin = control.get('experiencia.fechaEgreso').value;
  
    //let fechaInicial = fechaIni.split("/")
    //let fechaFinal = fechaFin.split("/")

    console.log("fechaInicial: "+fechaIni);
    console.log("fechaFinal: "+fechaFin);

    /*console.log("fechaInicial 1: "+fechaInicial[1]);
    console.log("fechaFinal 1: "+fechaFinal[1]);

    console.log("fechaInicial 2: "+fechaInicial[2]);
    console.log("fechaFinal 2: "+fechaFinal[2]);

    console.log("fechaInicial 3: "+fechaInicial[3]);
    console.log("fechaFinal 3: "+fechaFinal[3]);
*/
    return 1 <= 1 ? null : { 'fechaErronea': true };
  };
