import { Catalogo, DomicilioExtranjero, DomicilioMexico, Monto, Superficie, Tercero, Transmisor } from './common.model';
import { FormaPago, ValorConformeA } from './types';
import { TipoOperacion } from './types';

export interface ValorDeclarante{
  indice: number;
  superficieConstruccion: number;
  superficieTerreno: number;
  valorAdquisicion: number;
  formaAdquisicion: string;
}

export interface BienInmueble {
  tipoOperacion?: TipoOperacion;
  tipoInmueble: Catalogo;
  titular: Catalogo[];
  porcentajePropiedad: number;
  superficieTerreno: Superficie;
  superficieConstruccion: Superficie;
  tercero: Tercero[];
  transmisor: Transmisor[];
  formaAdquisicion: Catalogo;
  formaPago: FormaPago;
  valorAdquisicion: Monto;
  fechaAdquisicion: string;
  datoIdentificacion: string;
  valorConformeA: ValorConformeA;
  domicilioMexico?: DomicilioMexico;
  domicilioExtranjero?: DomicilioExtranjero;
  motivoBaja?: Catalogo;
}

export interface BienesInmuebles {
  ninguno?: boolean;
  bienInmueble?: BienInmueble[];
  aclaracionesObservaciones?: string;
  valores?: ValorDeclarante[];
}
