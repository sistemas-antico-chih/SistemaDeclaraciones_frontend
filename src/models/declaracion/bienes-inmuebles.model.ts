import { Catalogo, DomicilioExtranjero, DomicilioMexico, Monto, Superficie, Tercero, Transmisor } from './common.model';
import { FormaPago, ValorConformeA } from './types';

interface valoresSuperficieConstruccion{
  indice: number;
  valor: number;
}

interface valoresSuperficieTerreno{
  indice: number;
  valor: number;
}

interface valoresAdquisicion{
  indice: number;
  valor: number;
}

export interface BienInmueble {
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
  bienesDeclarante?: number;
  superficieConstruccion?: valoresSuperficieConstruccion[];
  superficieTerreno?: valoresSuperficieTerreno[];
  valorAdquisicion?: valoresAdquisicion[];
}
