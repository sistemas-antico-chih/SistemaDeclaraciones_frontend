import { DomicilioExtranjero, DomicilioMexico } from './common.model';
import { AmbitoPublico, NivelOrdenGobierno, TipoOperacion } from './types';

interface TelefonoOficina {
  telefono: string;
  extension: string;
}

export interface DatosEmpleoCargoComision {
  tipoOperacion?: TipoOperacion;
  nivelOrdenGobierno: NivelOrdenGobierno;
  ambitoPublico?: AmbitoPublico;
  nombreEntePublico?: string;
  areaAdscripcion: string;
  areaAdscripcionConcluye?: string;//Agregado para aviso
  empleoCargoComision: string;
  contratadoPorHonorarios: boolean;
  nivelEmpleoCargoComision: string;
  nivelEmpleoCargoComisionConcluye?: string;//Agregado para aviso
  funcionPrincipal: string;
  fechaTomaPosesion: string;
  fechaConclusionEncargo?: string;//Agregado para aviso
  telefonoOficina: TelefonoOficina;
  domicilioMexico?: DomicilioMexico;
  domicilioExtranjero?: DomicilioExtranjero;
  aclaracionesObservaciones?: string;
  cuentaConOtroCargoPublico?: boolean;
}
