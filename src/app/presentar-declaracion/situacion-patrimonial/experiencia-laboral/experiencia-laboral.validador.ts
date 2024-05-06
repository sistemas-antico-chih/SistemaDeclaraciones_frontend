import { FormControl } from '@angular/forms';


export function validarFechas(control: FormControl) {
    console.log ("llega aqui");
    let fechaInicial = control.get('experiencia.fechaIngreso');
    let fechaFinal = control.get('experiencia.fechaEgreso');
    console.log("control 2: " + fechaInicial.value);
    console.log("control 3: " + fechaFinal.value);
    if (!fechaFinal)
        return false;
    /*console.log("control 2: " + control.value);
    console.log("xx: "+ fechaInicial);

    let fechaFinal = control.value;
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
    */
}

