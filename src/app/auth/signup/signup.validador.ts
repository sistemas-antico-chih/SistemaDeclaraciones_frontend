import { AbstractControl, ValidatorFn } from '@angular/forms';

export function validarCURP(curp_recibida: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
        

        
        if (curp_recibida="JUAS820710HCHRRL02") {
            return { 'curpValida': true };
        }
        return null;
    };
}
/*export function ageRangeValidator(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
        if (control.value !== undefined && (isNaN(control.value) || control.value < min || control.value > max)) {
            return { 'ageRange': true };
        }
        return null;
    };
}*/