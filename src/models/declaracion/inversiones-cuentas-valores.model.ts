import { Catalogo, Monto, Tercero } from './common.model';
import { TipoOperacion } from './types';

interface LocalizacionInversion {
  pais: string;
  institucionRazonSocial: string;
  rfc: string;
}

export interface Inversion {
  tipoOperacion?: TipoOperacion;
  tipoInversion: Catalogo;
  subTipoInversion: Catalogo;
  titular: Catalogo[];
  tercero: Tercero[];
  numeroCuentaContrato: string;
  localizacionInversion: LocalizacionInversion;
  saldoSituacionActual: Monto;
}

export interface InversionesCuentasValores {
  ninguno?: boolean;
  inversion?: Inversion[];
  aclaracionesObservaciones?: string;
}
