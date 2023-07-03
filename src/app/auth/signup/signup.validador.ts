import { FormGroup, FormBuilder } from '@angular/forms';

export class validadores {
  static validarCURP(fc: FormBuilder){

  //Validar que coincida el dígito verificador
  function digitoVerificador(curp17: any) {
    //Fuente https://consultas.curp.gob.mx/CurpSP/
    var diccionario = "0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ",
      lngSuma = 0.0,
      lngDigito = 0.0;
    for (var i = 0; i < 17; i++)
      lngSuma = lngSuma + diccionario.indexOf(curp17.charAt(i)) * (18 - i);
    lngDigito = 10 - lngSuma % 10;
    if (lngDigito == 10) return 0;
    return lngDigito;
  }
  console.log("exito");
  console.log(validado);
  if (validado[2] != digitoVerificador(validado[1]))
    return false;

  return ({validarCURP: true}); //Validado
  }
}
