import { AbstractControl, ValidatorFn, FormControl } from '@angular/forms';

export function validarFechas(control: FormControl) {
    console.log("control: "+control.value);
    
    let fechaInicial = this.experienciaLaboralForm.fechaIngreso;
    let fechaFinal = control.value.toUpperCase();
    console.log("fechaInicial: "+fechaInicial);
    
    if (!fechaInicial || !fechaFinal )
        return false;
    
    
    

    //Validar que coincida el dígito verificador
    function comparar( fechaInicial:any, fechaFinal:any) {
        //Fuente https://consultas.curp.gob.mx/CurpSP/
        if(Date.parse(fechaInicial) < Date.parse(fechaFinal)){
            return true;
        }
        else {
            return false;
        }
        
    }

    if (comparar)
        //return false;
        return { 'validarFechas': true };

    //return true; //Validado
    return null;
}

