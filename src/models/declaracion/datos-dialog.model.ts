import { DomicilioExtranjero, DomicilioMexico } from './common.model';
import { AmbitoPublico, NivelOrdenGobierno, TipoOperacion } from './types';



export interface DatosDialog {
  declaracion: string;
  fechaInicioConclusion: string;
  anio: string;
  datosEmpleo: string;
  formaDeclaracion: boolean;
}
