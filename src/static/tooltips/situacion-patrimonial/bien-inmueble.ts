const tooltipData = {
  tipInmueble:
    'Seleccionar el tipo de bien inmueble que se declara: casa, departamento, edificio, local comercial, bodega, palco, rancho, terreno y otro, especifique.',
  titular: 'Seleccionar alguna de las opciones del catálogo desplegable.',
  tercero: 'En caso de copropiedad con un tercero, seleccionar si es persona física o persona moral.',
  nombreTercero:
    'En caso de copropiedad, escribir el nombre o nombres completos, así como apellidos completos sin abreviaturas y sin acentos ni signos especiales. Si se trata de persona moral deberá proporcionar la denominación o razón social de la institución tal y como se encuentra en el documento con el que se acredita la adquisición.',
  rfc: 'Proporcionar los trece dígitos.',
  porcentajePropiedad:
    'En caso de que el Declarante sea el único dueño deberá poner el cien por ciento, de no ser así señalará el porcentaje que le corresponda, de acuerdo a la escritura o contrato.',
  superficieTerreno: 'Señalar en metros cuadrados la superficie total del terreno.',
  superficieConstruccion: 'Señalar en metros cuadrados la superficie total de construcción.',
  formaAdquisicion: 'Seleccionar alguna de las opciones del catálogo.',
  formaPago:
    'Seleccionar la forma en que realizó el pago para adquirir el inmueble, en caso de que no haya pagado por el mismo, indicará no aplica.',
  transmisorPropiedad: 'Seleccionar si es persona física o persona moral.',
  nombreRazonSocialTransmisor:
    'Escribir el nombre o nombres completos, así como apellidos completos sin abreviaturas y sin acentos ni signos especiales. Si se trata de persona moral deberá proporcionar la denominación o razón social de la institución tal y como se encuentra en el documento con el que se acredita la adquisición.',
  rfcTransmisor: 'Señalar los trece dígitos.',
  relacionTransmisorTitular:
    'Seleccionar alguna de las opciones del catálogo desplegable y en caso de seleccionar otro especificar.',
  valorAdquisicion:
    'Proporcionar el monto de adquisición, conforme al documento con el que se acredita la compra del bien inmueble.',
  valorAdquisicionInmueble: 'Seleccionar si fue conforme a escritura pública, conforme a sentencia o contrato.',
  tipoMoneda: 'Seleccionar la moneda relativa al valor de adquisición.',
  fechaAdquisicionInmueble:
    'Señalar la fecha de adquisición del inmueble, conforme al documento con el que se acredita la propiedad.',
  datosRegistroPublicoPropiedad:
    'folio real u otro dato que permita su identificación. Señalar el número de escritura pública, folio real o cualquier dato que lo identifique.',
  ubicacionInmueble:
    'Proporcionar los datos relativos al lugar donde se ubica el inmueble declarado. Seleccionando si es en México o en el extranjero.',
  bajaInmueble: 'Elegir la razón por la cual se da de baja venta, donación, siniestro u otro. Especifique.',
  aclaracionesObservaciones:
    'En este espacio el Declarante podrá realizar las aclaraciones u observaciones que considere pertinentes respecto de alguno o algunos de los incisos de este apartado.',

    nombre:
    'Escribir el nombre o los nombres completos, así como los apellidos completos, sin abreviaturas, sin acentos, ni signos especiales. Si se tiene un solo apellido deberá colocarse en el espacio del primer apellido y dejar el espacio del segundo apellido en blanco.',
  fechaNacimiento: 'Señalar la fecha de nacimiento del dependiente económico en el formato de día, mes y año.',
  //rfc: 'Escribir los diez caracteres básicos.',
  relacionDeclarante: 'Seleccionar de la lista desplegable el parentesco o tipo de relación con el Declarante.',
  ciudadanoExtranjero: 'Deberá indicar sí o no, según el caso.',
  curp: 'Escribir los dieciocho caracteres como la emitió la Secretaría de Gobernación. En caso de no contar con ella, podrá consultarla en la página de la Secretaría de Gobernación, en el apartado de Trámites.',
  habitaDomicilioDeclarante: 'Indicar sí o no, el dependiente económico vive en el domicilio del Declarante.',
  lugarDondeReside: 'Indicar si vive en México, en el extranjero o si se desconoce.',
  actividadLaboral:
    'Indicar si el dependiente económico, se encuentra trabajando actualmente, seleccionando alguno de los siguientes campos: privado, público, otro (especificar) o ninguno.',
  sectorPublico: {
    nivelOrdenGobierno:
      'Seleccionar el orden de gobierno en el que se encuentra: federal, estatal o municipal/alcaldía.',
    ambitoPublico:
      'Señalar la naturaleza jurídica al que pertenece: ejecutivo, legislativo, judicial u órgano autónomo.',
    nombreEntePublico: 'Señalar el Ente Público al cual se encontró adscrita la plaza.',
    areaAdscripcion:
      'Especificar el nombre de la Unidad Administrativa u homóloga superior inmediata en la que estuvo adscrito. (Superior jerárquico).',
    empleoCargoComision:
      'Señalar el nombre del empleo, cargo o comisión que se estableció en su recibo de nómina, nombramiento, contrato u oficio de comisión.',
    especifiqueFuncionPrincipal: 'Señalar cual es la función o actividad principal que desempeñó.',
    salarioMensualNeto: 'Especificar el monto mensual neto, sin centavos, que percibe el dependiente económico.',
    fechaIngreso: 'Señalar la fecha en que inició empleo, cargo o comisión.',
  },
  sectorPrivado: {
    nombreEmpresaSociedadAsociacion: 'Proporcionar el nombre de la empresa, sociedad o asociación en la que laboró.',
    empleoCargoComision: 'Proporcionar el nombre del puesto que desempeña.',
    rfc: 'Proporcionar los 12 dígitos de la empresa en que laboró.',
    fechaIngreso: 'Señalar la fecha en que inició empleo, cargo o comisión.',
    sectorPertenece:
      'Elegir el sector al que pertenece la empresa, sociedad o asociación. En caso de señalar otros, especifique.',
    salarioMensualNeto: 'Especificar el monto mensual neto, sin centavos, que percibe el dependiente económico.',
    proveedorContratistaGobierno:
      ' Señalar sí o no, el dependiente económico vende o presta algún servicio al gobierno.',
  },

};

export { tooltipData };
