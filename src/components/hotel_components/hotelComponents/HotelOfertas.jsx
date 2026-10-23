import React, { useState, useEffect } from 'react';
import { Accordion, AccordionBody, AccordionHeader } from '@material-tailwind/react';
import Icons from '../../../global/icons';
import HotelConfirmation from './HotelConfirmation';
import Alert from '../../global_components/alert/Alert';
import { useNavigate } from 'react-router-dom';
import { getIcon } from '../../../global/icons2';
import HotelExpress from './HotelExpress';
import HotelExpressConfirmacion from './HotelExpressConfirmacion';
import AlertExpress from '../../global_components/alert/AlertExpress';
import { contarNoches, construirOfertasMostradas, esOfertaAgotada, periodosAgotados, textoAgotada } from '../../../global/ofertasPricing';

const HotelOfertas = (props) => {
  const { Establecimiento, Noches, Fechas, Opciones, clickRecomendados, SetRecomendados, OfertaSeleccionada, includeWineOffer = true, setIncludeWineOffer } = props;
  const icons = new Icons();
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpressOpen, setIsExpressOpen] = useState(false);
  const [isAlertLoginOpen, setIsAlertLoginOpen] = useState(false);
  const [ofertas, setOfertas] = useState([]);
  const [desExpress, setDescExpress] = useState();
  const [alerta, setAlerta] = useState("");
  const [correcto, setCorrecto] = useState();

  // Estado local solo si no viene controlado desde el padre
  const [localIncludeWineOffer, setLocalIncludeWineOffer] = useState(!!OfertaSeleccionada);

  // Usar el estado del padre si está disponible, sino usar el local
  const wineOfferIncluded = setIncludeWineOffer ? includeWineOffer : localIncludeWineOffer;

  // Si viene una oferta seleccionada desde la página anterior, inicializamos su control de cantidad
  useEffect(() => {
    if (OfertaSeleccionada) {
      setSelectedOptions((prev) => ({ ...(prev || {}), ['oferta-selected']: 0 }));
      if (!setIncludeWineOffer) {
        setLocalIncludeWineOffer(true);
      }
    }
  }, [OfertaSeleccionada]);

  const session = JSON.parse(localStorage.getItem("datos"));
  const nivel = session ? session.data.nivel : "visitante";
  const navigate = new useNavigate();

  // Obtener los nombres de los días exactos en el rango de fechas seleccionado
  const getDiasSeleccionados = () => {
    if (!Fechas || !Fechas[0]?.startDate || !Fechas[0]?.endDate) return [];

    const start = new Date(Fechas[0].startDate);
    const end = new Date(Fechas[0].endDate);

    const nombresDias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const diasSet = new Set();

    const current = new Date(start);
    while (current <= end) {
      diasSet.add(nombresDias[current.getDay()]);
      current.setDate(current.getDate() + 1);
    }

    return Array.from(diasSet);
  };

  const diasSeleccionados = getDiasSeleccionados();

  // Mapeo de nombres de días con y sin tilde para comparación
  const normalizarDia = (texto) => {
    return texto
      .replace(/á/g, 'a')
      .replace(/é/g, 'e')
      .replace(/í/g, 'i')
      .replace(/ó/g, 'o')
      .replace(/ú/g, 'u');
  };

  // Todos los días de la semana para detectar si una oferta menciona días específicos
  const todosDias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  const frasesConDias = ['entre semana', 'fin de semana', 'lunes a jueves', 'viernes a domingo'];

  // Expandir frases a días individuales
  const expandirFrase = (frase) => {
    if (frase === 'entre semana' || frase === 'lunes a jueves') return ['lunes', 'martes', 'miércoles', 'jueves'];
    if (frase === 'fin de semana' || frase === 'viernes a domingo') return ['viernes', 'sábado', 'domingo'];
    return [];
  };

  // Filtrar ofertas según los días exactos seleccionados
  const ofertasFiltradas = (Establecimiento?.Ofertas || []).filter((oferta) => {
    if (diasSeleccionados.length === 0) return true;

    const aplicaEn = (oferta.AplicaEn || '').toLowerCase().trim();

    // Si no tiene restricción de día, mostrar siempre
    if (!aplicaEn) return true;

    const aplicaEnNorm = normalizarDia(aplicaEn);

    // Recopilar todos los días que la oferta cubre
    const diasOferta = new Set();

    // Verificar días individuales mencionados
    for (const dia of todosDias) {
      if (aplicaEnNorm.includes(normalizarDia(dia))) {
        diasOferta.add(dia);
      }
    }

    // Verificar frases que implican grupos de días
    for (const frase of frasesConDias) {
      if (aplicaEnNorm.includes(normalizarDia(frase))) {
        for (const dia of expandirFrase(frase)) {
          diasOferta.add(dia);
        }
      }
    }

    // Si la oferta no menciona ningún día reconocido, se asume que aplica todos los días
    if (diasOferta.size === 0) return true;

    // La oferta debe cubrir al menos uno de los días seleccionados por el usuario
    return diasSeleccionados.some(dia => diasOferta.has(dia));
  });

  const openModal = () => {
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (clickRecomendados) {
      function fetchData() {
        const nuevoEstado = {};
        for (const recomendado of Establecimiento.Recomendados) {
          nuevoEstado[recomendado.Id] = recomendado.NumOfertas;
        }
        setSelectedOptions(nuevoEstado);
      }
      fetchData();
    }
    SetRecomendados(false);
  }, [clickRecomendados]);

  function Icon({ id, open }) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className={`${id === open ? 'rotate-180' : ''} h-5 w-5 transition-transform`}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    );
  }

  const [open, setOpen] = useState(0);
  const [count, setCount] = useState(0);
  const handleOpen = (value) => setOpen(open === value ? 0 : value);
  const options = [0, 1, 2, 3, 4, 5];
  const [total, setTotal] = useState(0);
  const [impuestos, setImpuestos] = useState(0);

  // Agotada si su día de reactivación es posterior al día de check-in elegido
  // (ver esOfertaAgotada en ofertasPricing.js).
  const checkIn = Fechas && Fechas[0] && Fechas[0].startDate;
  const esAgotada = (oferta) => esOfertaAgotada(oferta, checkIn);

  // Desglose de noches (entre semana / fin de semana) y ofertas a mostrar:
  // si la estancia cruza ambos tipos, se fusionan las ofertas pareja (mismo
  // título + acomodación) en una con precio mezclado (ver ofertasPricing.js).
  const splitNoches = contarNoches(Fechas);
  const ofertasMostradas = construirOfertasMostradas(ofertasFiltradas, splitNoches, esAgotada);

  const handleSelectChange = (event, key) => {
    setAlerta("");
    const newSelectedOptions = { ...selectedOptions };
    newSelectedOptions[key] = event.target.value;
    setSelectedOptions(newSelectedOptions);
  };

  // Obtener el precio de la WineOffer
  const getWineOfferPrice = () => {
    if (!OfertaSeleccionada || !wineOfferIncluded) return 0;
    const price = parseFloat(OfertaSeleccionada.price || OfertaSeleccionada.Precio || 0);
    return isNaN(price) ? 0 : price;
  };

  // Obtener los regalos de la WineOffer
  const getWineOfferGifts = () => {
    if (!OfertaSeleccionada || !wineOfferIncluded) return [];
    return OfertaSeleccionada.inventories || OfertaSeleccionada.Inventarios || [];
  };

  const calcularTotal = () => {
    let total = {
      SinImpuestos: 0,
      Impuestos: 0,
      WineOffer: 0,
    };
    for (const id in selectedOptions) {
      const selectedValue = selectedOptions[id];

      const objeto = ofertasMostradas.find((oferta) => oferta.Id.toString() === id.toString());
      if (objeto && !esAgotada(objeto)) {
        total.SinImpuestos += objeto.FinalSinImpuestos * selectedValue;
        total.Impuestos += objeto.Impuestos * selectedValue;
      }
    }



    return total;
  };

  const handleClickReservar = () => {
    setAlerta("");
    if (!(nivel == "suscriptor" || nivel == "visitante" || nivel == "express" || nivel == "gratuito")) {
      setIsAlertLoginOpen(true);
      return;
    }

    var descuento = 0;
    let capacidadAdultos = 0; // plazas de adultos de las habitaciones elegidas
    let capacidadNinos = 0;   // plazas de niños de las habitaciones elegidas
    const ofertasList = [];

    for (const id in selectedOptions) {
      if (selectedOptions[id] != 0) {
        const objeto = ofertasMostradas.find((oferta) => oferta.Id.toString() === id.toString());
        if (!objeto || esAgotada(objeto)) continue;   // no reservar ofertas agotadas
        const cantidad = parseInt(selectedOptions[id]);

        // Una oferta mezclada se reserva como dos lineas (entre semana + fin
        // de semana); las demas como una linea.
        const lineas = objeto._mezcla ? objeto._partes : [objeto];
        lineas.forEach((linea) => {
          const copia = { ...linea };
          copia.NumOfertas = cantidad;
          copia.TotalOfertas = (copia.Final / ((nivel == "visitante" || nivel == "express" || nivel == "gratis") ? copia.Base + 10 : copia.Base)) * cantidad;
          ofertasList.push(copia);
        });

        // Huespedes y descuento se cuentan una sola vez por habitacion.
        descuento += 10 * cantidad;
        capacidadAdultos += parseInt(objeto.Adultos || 0) * cantidad;
        capacidadNinos += parseInt((objeto.Ninos != "" && objeto.Ninos != null) ? objeto.Ninos : 0) * cantidad;
      }
    }

    setOfertas(ofertasList);
    setDescExpress(descuento * Noches);

    // Las habitaciones elegidas deben cubrir a TODOS los huespedes del search:
    // suficientes plazas de adultos y, si se pidieron niños, suficientes plazas
    // de niños (es decir, habitaciones que admitan niños).
    const reqAdultos = parseInt(Opciones.adult || 0);
    const reqNinos = parseInt(Opciones.children || 0);
    const faltanAdultos = Math.max(0, reqAdultos - capacidadAdultos);
    const faltanNinos = Math.max(0, reqNinos - capacidadNinos);
    const totalPlazas = capacidadAdultos + capacidadNinos;

    if (totalPlazas === 0) {
      setAlerta("Selecciona al menos una habitación para continuar.");
      return;
    }

    if (faltanAdultos === 0 && faltanNinos === 0) {
      (nivel == "visitante" || nivel == "express" || nivel == "gratuito") ? setIsAlertLoginOpen(true) : setIsModalOpen(true);
      return;
    }

    const partes = [];
    if (faltanNinos > 0) partes.push(`${faltanNinos} ${faltanNinos === 1 ? "niño" : "niños"}`);
    if (faltanAdultos > 0) partes.push(`${faltanAdultos} ${faltanAdultos === 1 ? "adulto" : "adultos"}`);
    setAlerta(`Todavía necesitas espacio para ${partes.join(" y ")}. Elige más habitaciones${reqNinos > 0 ? " que admitan niños" : ""}.`);
  };

  const handleClickCancelar = () => {
    setIsModalOpen(false);
    setIsExpressOpen(false);
  };

  const handleClickBack = () => {
    setIsExpressOpen(false);
    setIsAlertLoginOpen(true);
  };

  const handleClickLoginAlertAceptar = () => {
    setIsAlertLoginOpen(false);
    navigate("/login");
  };

  const handleClickLoginAlertCancelar = () => {
    setIsAlertLoginOpen(false);
  };

  const handleClickReservaExpress = () => {
    setIsAlertLoginOpen(false);
    setIsExpressOpen(true);
  };

  return (
    <>
      <HotelExpressConfirmacion isOpen={correcto} OnClose={() => setCorrecto(false)} />
      <HotelConfirmation
        Ofertas={ofertas}
        isOpen={isModalOpen}
        Establecimiento={Establecimiento}
        Fechas={Fechas}
        Valores={calcularTotal()}
        OnClose={() => handleClickCancelar()}
        Opciones={Opciones}
        WineOffer={wineOfferIncluded ? OfertaSeleccionada : null}
      />
      <HotelExpress
        Ofertas={ofertas}
        isOpen={isExpressOpen}
        Establecimiento={Establecimiento}
        Fechas={Fechas}
        Valores={calcularTotal()}
        OnClose={() => handleClickCancelar()}
        OnBack={() => handleClickBack()}
        Opciones={Opciones}
        setCorrecto={setCorrecto}
        correcto={correcto}
        WineOffer={wineOfferIncluded ? OfertaSeleccionada : null}
      />
      {
        (nivel == "visitante" || nivel == "express" || nivel == "gratuito")
          ? <AlertExpress
            Titulo={"Nueva Reserva"}
            Descripcion={"La reserva con cuentas gratuitas solo está disponible en la app móvil."}
            isOpen={isAlertLoginOpen} Aceptar={handleClickLoginAlertCancelar}
            Cancelar={handleClickReservaExpress}
            Subtotal={calcularTotal().SinImpuestos}
            Impuestos={calcularTotal().Impuestos}
            Descuento={desExpress} />
          : <AlertExpress
            Titulo={"Acción no permitida"}
            Descripcion={"La reserva con cuentas gratuitas solo está disponible en la app móvil."}
            isOpen={isAlertLoginOpen} Aceptar={handleClickLoginAlertCancelar}
            Cancelar={handleClickLoginAlertCancelar} />
      }

      <div className='relative w-full z-0'>
        {/* La WineOffer se muestra en HotelWineOffer, aquí solo calculamos el precio */}

        <div className='sticky top-0 z-10'>
          <div className='table-fixed w-full'>
            <table id={'tabla-ofertas'} className=" table-auto w-full">
              <thead className="bg-greenVE-600 sticky top-0 z-50">
                <tr>
                  <th className="border border-greenVE-600 px-2 text-gray-100 font-medium">Ofertas</th>
                  <th className="border border-greenVE-600 px-2 text-gray-100 font-medium">Personas</th>
                  <th className="border border-greenVE-600 px-2 text-gray-100 font-medium leading-4 py-1.5">
                    {
                      Establecimiento.IdEstablecimiento == "443"
                        ? "Precio por un día"
                        : Noches == 1 ?
                          `Precio por ${Noches} noche` : `Precio por ${Noches} noches`
                    }
                  </th>
                  <th className="border border-greenVE-600 px-2 text-gray-100 font-medium">Incluye</th>
                  <th className="border border-greenVE-600 px-2 text-gray-100 font-medium">Cantidad</th>
                  <th className="border border-greenVE-600 px-2 text-gray-100 font-medium">Total</th>
                </tr>
              </thead>
              {/* Indicador de filtro activo */}
              {diasSeleccionados.length > 0 && diasSeleccionados.length < 7 && (
                <caption className="caption-bottom mt-2 mb-1">
                  <div className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 rounded-md px-3 py-1.5">
                    <span className="icon-[material-symbols-light--filter-alt-outline] text-blue-500 h-4 w-4"></span>
                    <label className="text-blue-600 text-xs font-medium">
                      Mostrando ofertas que aplican en: {diasSeleccionados.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}
                    </label>
                    <label className="text-blue-400 text-xs">
                      ({ofertasMostradas.length} de {Establecimiento.Ofertas.length} ofertas)
                    </label>
                  </div>
                </caption>
              )}
              <tbody>
                {ofertasMostradas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="border text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <span className="icon-[material-symbols-light--calendar-month-rounded] text-gray-300 h-10 w-10"></span>
                        <label className="text-gray-500 font-medium text-sm">No hay ofertas disponibles para los días: {diasSeleccionados.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}</label>
                        <label className="text-gray-400 text-xs">Intenta seleccionar otras fechas en el buscador</label>
                      </div>
                    </td>
                  </tr>
                ) : ofertasMostradas.map((item, index) => (
                  <tr key={item.Id} className={esAgotada(item) ? "bg-gray-50" : ""}>
                    <td className="border">
                      <div className={`flex flex-col p-2 ${esAgotada(item) ? "opacity-60" : ""}`}>
                        <label className="font-semibold text-sm text-greenVE-600">{item.TituloOferta}</label>
                        {
                          item.Ganga ? (<div className="ml-5 flex items-center text-xs text-orange-600  bg-orange-100 rounded-md px-2 gap-1.5 py-0.5 mb-2 w-36 border border-orange-200">
                            <span className="icon-[ic--outline-local-offer] rotate-90 h-5 w-5"></span>
                            <label className="text-orange-500 text-xs font-medium">Precio ganga</label>
                          </div>) : (<></>)
                        }
                        {
                          esAgotada(item) ? (<div className="ml-5 flex flex-col mb-2 w-fit">
                            <div className="flex items-center text-xs bg-gray-100 rounded-md px-2 gap-1.5 py-0.5 border border-gray-200">
                              <span className="icon-[material-symbols-light--event-busy-outline-rounded] text-gray-400 h-4 w-4"></span>
                              <label className="text-gray-500 text-xs font-medium">
                                {textoAgotada(item, checkIn)}
                              </label>
                            </div>
                            {/* Con varias ventanas de agotamiento, el cartel explica la que
                                bloquea estas fechas y aquí se listan todas las demás. */}
                            {periodosAgotados(item).length > 1 && (
                              <label className="text-[10px] text-gray-400 mt-0.5 ml-1">
                                Fechas no disponibles: {periodosAgotados(item).join(" · ")}
                              </label>
                            )}
                          </div>) : (<></>)
                        }
                        <label className="ml-2 text-xs font-semibold text-gray-500">Aplica:</label>
                        <div className="flex ml-5 text-sm items-center gap-1">
                          <div className='flex items-center bg-blue-100 rounded-md px-1 py-1 border border-blue-200'>
                            <span className="icon-[material-symbols-light--calendar-month-rounded] text-[#3d82f5] h-5 w-5"></span>
                            <label className="text-blue-500 font-medium text-xs ">{item.AplicaEn} </label>
                          </div>
                        </div>
                        <label className="ml-2 text-xs font-semibold text-gray-500">Acomodación:</label>
                        {
                          Establecimiento.IdEstablecimiento == "443"
                            ? <div className="flex gap-1 ml-6 text-sm items-center">
                              <span className="icon-[ri--prohibited-2-line] text-[#3d82f5] h-5 w-5"></span>
                              <label className="text-gray-500 text-xs ">El establecimiento no ofrece hospedaje</label>
                            </div>
                            : <div className="flex gap-1 ml-6 text-sm items-center">
                              <span className="icon-[material-symbols--bed-outline-rounded] text-[#3d82f5] h-5 w-5"></span>
                              <label className="text-gray-500 text-xs ">{item.Acomodacion}</label>
                            </div>
                        }

                        <Accordion open={open === index + 1} icon={<Icon id={index + 1} open={open} />}>
                          <AccordionHeader className=" p-0 text-xs pl-2 border-0 w-auto font-semibold text-blue-500 mt-4" onClick={() => handleOpen(index + 1)}>
                            Ver servicios y otros detalles
                          </AccordionHeader>
                          <AccordionBody className="p-0 pl-5">
                            <div className="flex gap-2">
                              {item.NoIncluye && (
                                <div className="flex-1 border-r pr-1">
                                  <label className="text-xs font-semibold text-gray-500">No Incluye</label>
                                  {item.NoIncluye.map((itemNoIncluye, noIncluyeIndex) => (
                                    <div key={noIncluyeIndex} className="flex gap-2 items-center">
                                      {
                                        getIcon({ text: itemNoIncluye.Titulo, h: "h-5", w: "w-5", c: "text-[#3d82f5]" })
                                      }
                                      <p dangerouslySetInnerHTML={{ __html: itemNoIncluye.Titulo }} className="my-0.5 text-xs font-light text-gray-500 leading-3"></p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {item.Restricciones && (
                                <div className="flex-1 border-r pr-1">
                                  <label className="text-xs font-semibold text-gray-500">Restricciones</label>
                                  {item.Restricciones.map((itemRestricciones, restriccionesIndex) => (
                                    <div key={restriccionesIndex} className="flex gap-2 items-center">
                                      {
                                        getIcon({ text: itemRestricciones.Titulo, h: "h-5", w: "w-5", c: "text-[#3d82f5]" })
                                      }
                                      <p dangerouslySetInnerHTML={{ __html: itemRestricciones.Titulo }} className="text-sm my-0.5 text-xs leading-3 font-light text-gray-500"></p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {item.SistemaServicios && (
                                <div className="flex-1 pr-1">
                                  <label className="text-xs font-semibold text-gray-500">Sistema de Servicios</label>
                                  {item.SistemaServicios.map((itemSistemaServicios, sistemaServiciosIndex) => (
                                    <div key={sistemaServiciosIndex} className="flex gap-2 items-center">
                                      {
                                        getIcon({ text: itemSistemaServicios.Titulo, h: "h-5", w: "w-5", c: "text-[#3d82f5]" })
                                      }
                                      <p dangerouslySetInnerHTML={{ __html: itemSistemaServicios.Titulo }} className="text-sm my-0.5 text-xs leading-3 font-light text-gray-500"></p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </AccordionBody>
                        </Accordion>
                      </div>
                    </td>
                    <td className="border">
                      <div className={`flex items-end ${esAgotada(item) ? "opacity-60" : ""}`}>
                        <div className="flex ml-1 text-sm">
                          {
                            Array.from({ length: item.Adultos }).map((item) => (
                              <span className="icon-[solar--user-rounded-outline] h-4 w-4 text-[#3d82f5]"></span>
                            ))
                          }
                        </div>
                        {item.Ninos && (
                          <div className="flex items-end text-sm">
                            <label> +</label>
                            {
                              Array.from({ length: item.Ninos }).map((item) => (
                                <span className="icon-[solar--user-rounded-outline] h-3 w-3 text-[#3d82f5]"></span>
                              ))
                            }
                          </div>
                        )}
                      </div>

                    </td>
                    <td className="border text-center">
                      <div className={`flex flex-col p-2 items-center justify-center ${esAgotada(item) ? "opacity-60" : ""}`}>
                        <label className="font-semibold text-2xl">${item.FinalSinImpuestos}</label>
                        <label className="text-xs text-gray-500"> + ${item.Impuestos} de impuestos</label>
                        {item._mezcla && item._desglose && (
                          <div className="mt-1.5 text-[10px] text-gray-500 bg-blue-50 border border-blue-100 rounded-md px-2 py-1 leading-tight">
                            <div>{item._desglose.semana.noches} noche{item._desglose.semana.noches !== 1 ? 's' : ''} entre semana: <span className="font-semibold text-gray-700">${item._desglose.semana.precio}</span></div>
                            <div>{item._desglose.finde.noches} noche{item._desglose.finde.noches !== 1 ? 's' : ''} fin de semana: <span className="font-semibold text-gray-700">${item._desglose.finde.precio}</span></div>
                          </div>
                        )}
                        <label className="text-[10.5px] mt-1 text-red-500 line-through">Tarifa rack ${item.Rack} </label>
                      </div>
                    </td>
                    <td className="border p-2">
                      {(item.Incluye != null && item.Incluye.length > 0) ? (
                        <div className="flex-1 pr-1">
                          {item.Incluye.map((itemIncluye, incluyeIndex) => (
                            <div key={incluyeIndex} className="flex gap-2 items-center">
                              <div dangerouslySetInnerHTML={{ __html: icons.Data.Check }} />
                              <p dangerouslySetInnerHTML={{ __html: itemIncluye.Titulo }} className="my-0.5 text-xs leading-3 font-light text-greenVE-600 "></p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <></>
                      )}
                    </td>
                    <td className="border align-top pt-4">
                      <div key={item.Id} className="flex justify-center items-start space-x-2 mb-2">
                        <select
                          id={`combobox-${item.Id}`}
                          name={`combobox-${item.Id}`}
                          value={esAgotada(item) ? 0 : selectedOptions[item.Id]}
                          onChange={(event) => handleSelectChange(event, item.Id)}
                          disabled={esAgotada(item)}
                          title={esAgotada(item) ? "Oferta agotada temporalmente" : undefined}
                          className={`border rounded-md px-2 py-1 text-sm ${esAgotada(item) ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}`}
                        >
                          {options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    {index === 0 && (
                      <td className="border text-center align-top mt-2" rowSpan={ofertasMostradas.length}>
                        <div className="flex flex-col p-2 items-center gap-1 sticky top-20 bg-white">
                          <label className="font-semibold text-3xl text-center">${calcularTotal().SinImpuestos}</label>
                          <label className="text-xs text-gray-500 justify-center items-center">+ ${calcularTotal().Impuestos} de impuestos</label>

                          {/* Mostrar desglose de WineOffer si está incluida */}
                          {wineOfferIncluded && OfertaSeleccionada && calcularTotal().WineOffer > 0 && (
                            <div className="text-xs text-[#7C9539] bg-[#F0FFC6] px-2 py-1 rounded-md mt-1">
                              <span> Incluye: ${calcularTotal().WineOffer.toFixed(2)}</span>
                            </div>
                          )}

                          <button className="bg-greenVE-500 text-white py-1 px-2 rounded-lg border-greenVE-600 border-2" onClick={() => handleClickReservar()}>
                            Confirmar
                          </button>
                          <label className='text-xxs text-red-500 font-medium max-w-[110px]'>{alerta}</label>
                          {
                            alerta != ""
                              ? <label className='text-xxs text-blue-700 mt-5 font-medium max-w-[110px]'>Si necesitas ayuda, contáctate con nuestra central de reservas</label>
                              : <></>
                          }
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
};

export default HotelOfertas;