import { FormControl } from '@angular/forms';

/*export function validarFechaInicial(control: FormControl) {
    var fechaIncial = control.value;
    console.log("control 1: " + control.value);
    if (!fechaIncial)
        return false;
}
*/

export function validarFechas(fechaInicial:string, control: string) {
    console.log("control 2: " + control);
    console.log("xx: "+ fechaInicial);

    let fechaFinal = control;
    console.log("fechaInicial: " + this.fechaInicial);

    if ( !fechaFinal)
        return false;


    function comparar(fechaInicial: any, fechaFinal: any) {
        
        if (Date.parse(fechaInicial) < Date.parse(fechaFinal)) {
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
