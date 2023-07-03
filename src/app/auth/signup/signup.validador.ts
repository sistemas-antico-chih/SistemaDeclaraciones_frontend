import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

export class validadores {
  static validarCURP(curp: FormControl){
    console.log(curp);  


  if (curp == "JUAS820710HCHRRL04" )
    return false;

  return ({validarCURP: true}); //Validado
  }
}
