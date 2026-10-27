import React, { useState, useEffect } from 'react';
import HotelConfirmation from './HotelConfirmation';
import Alert from '../../global_components/alert/Alert';
import { useNavigate } from 'react-router-dom';
import { getIcon } from '../../../global/icons2';
import HotelExpress from './HotelExpress';
import HotelExpressConfirmacion from './HotelExpressConfirmacion';
import AlertExpress from '../../global_components/alert/AlertExpress';
import { contarNoches, construirOfertasMostradas, esOfertaAgotada, periodosAgotados, textoAgotada } from '../../../global/ofertasPricing';

/** Dos decimales como máximo, sin ceros de más: 48 → "48", 47.5 → "47.5". */
const redondear = (n) => {
  const v = Math.round((parseFloat(n) || 0) * 100) / 100;
  return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/0$/, "");
};

/** Icono y color del recuadro según la acomodación, como en el diseño de referencia. */
const estiloAcomodacion = (acomodacion) => {
  const a = String(acomodacion || "").toLowerCase();
  if (a.includes("sencilla") || a.includes("simple") || a.includes("individual"))
    return { icono: "icon-[ph--bed]", color: "text-greenVE-600", fondo: "bg-greenVE-50" };
  if (a.includes("matrimonial"))
    return { icono: "icon-[ph--users]", color: "text-pink-500", fondo: "bg-pink-50" };
  if (a.includes("triple"))
    return { icono: "icon-[ph--users-three]", color: "text-purple-500", fondo: "bg-purple-50" };
  if (a.includes("cuádruple") || a.includes("cuadruple") || a.includes("familiar") || a.includes("suite"))
    return { icono: "icon-[ph--users-four]", color: "text-amber-500", fondo: "bg-amber-50" };
  if (a.includes("doble"))
    return { icono: "icon-[ph--users]", color: "text-blue-500", fondo: "bg-blue-50" };
  return { icono: "icon-[ph--bed]", color: "text-gray-500", fondo: "bg-gray-100" };
};

const Estrellas = ({ cantidad }) => {
  const n = Math.max(0, Math.min(5, parseInt(cantidad) || 0));
  if (!n) return null;
  return (
    <span className="flex items-center" aria-label={`${n} estrellas`}>
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="icon-[ph--star-fill] h-4 w-4 text-amber-400"></span>
      ))}
    </span>
  );
};

// Días por getDay() (0 = domingo) y en orden de semana, sin tildes.
const DIAS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
const ORDEN_SEMANA = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

// Para mostrar: los días se comparan sin tildes pero se escriben con ellas.
const nombreDia = (d) => ({ miercoles: 'Miércoles', sabado: 'Sábado' }[d] || d.charAt(0).toUpperCase() + d.slice(1));

const sinTildes = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/**
 * Días en que aplica una oferta según su texto "Aplica en". Devuelve un Set de días
 * (sin tildes) o null si aplica todos los días o el texto no nombra ninguno.
 *
 *   "Lunes a viernes"                → lunes…viernes (rango, no solo esos dos días)
 *   "Fin de semana Sábado y Domingo" → sábado, domingo (manda lo que nombra)
 *   "Fin de semana" / "Entre semana" → viernes–domingo / lunes–jueves
 *   "Aplica todos los días"          → null
 */
const diasDeAplicaEn = (aplicaEn) => {
  const t = sinTildes(aplicaEn);
  if (!t.trim() || /todos\s+los\s+dias/.test(t)) return null;

  const dias = new Set();
  const nombres = ORDEN_SEMANA.join('|');

  // Rangos "X a Y" (también cruzando el domingo: "viernes a lunes").
  const rangos = new RegExp(`(${nombres})\\s+(?:a|al|hasta)\\s+(${nombres})`, 'g');
  let m;
  while ((m = rangos.exec(t)) !== null) {
    let i = ORDEN_SEMANA.indexOf(m[1]);
    const fin = ORDEN_SEMANA.indexOf(m[2]);
    for (let n = 0; n < 7; n++) {
      dias.add(ORDEN_SEMANA[i]);
      if (i === fin) break;
      i = (i + 1) % 7;
    }
  }

  // Días sueltos.
  ORDEN_SEMANA.forEach((d) => { if (new RegExp(`\\b${d}\\b`).test(t)) dias.add(d); });

  // Frases genéricas, solo si el texto no nombra días concretos.
  if (dias.size === 0) {
    if (t.includes('entre semana')) ['lunes', 'martes', 'miercoles', 'jueves'].forEach((d) => dias.add(d));
    if (t.includes('fin de semana')) ['viernes', 'sabado', 'domingo'].forEach((d) => dias.add(d));
  }

  return dias.size ? dias : null;
};

const HotelOfertas = (props) => {
  const { Establecimiento, Noches, Fechas, Opciones, clickRecomendados, SetRecomendados, OfertaSeleccionada, includeWineOffer = true, setIncludeWineOffer } = props;
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

  // Noches de la estadía (sin el día de salida), igual que contarNoches de ofertasPricing:
  // del martes al miércoles es una sola noche, la del martes.
  const getDiasSeleccionados = () => {
    if (!Fechas || !Fechas[0]?.startDate || !Fechas[0]?.endDate) return [];

    const start = new Date(Fechas[0].startDate);
    const end = new Date(Fechas[0].endDate);
    const diasSet = new Set();

    const current = new Date(start);
    while (current < end) {
      diasSet.add(DIAS[current.getDay()]);
      current.setDate(current.getDate() + 1);
    }
    // Entrada y salida el mismo día: cuenta ese día.
    if (diasSet.size === 0) diasSet.add(DIAS[start.getDay()]);

    // Ordenados de lunes a domingo para el aviso "Mostrando ofertas que aplican en".
    return ORDEN_SEMANA.filter((d) => diasSet.has(d));
  };

  const diasSeleccionados = getDiasSeleccionados();

  // Una oferta se muestra si aplica en al menos una de las noches elegidas.
  const ofertasFiltradas = (Establecimiento?.Ofertas || []).filter((oferta) => {
    if (diasSeleccionados.length === 0) return true;
    const diasOferta = diasDeAplicaEn(oferta.AplicaEn);
    return diasOferta === null || diasSeleccionados.some((dia) => diasOferta.has(dia));
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

  const handleClickReservar = (opciones = selectedOptions) => {
    setAlerta("");
    if (!(nivel == "suscriptor" || nivel == "visitante" || nivel == "express" || nivel == "gratuito")) {
      setIsAlertLoginOpen(true);
      return;
    }

    var descuento = 0;
    let capacidadAdultos = 0; // plazas de adultos de las habitaciones elegidas
    let capacidadNinos = 0;   // plazas de niños de las habitaciones elegidas
    const ofertasList = [];

    for (const id in opciones) {
      if (opciones[id] != 0) {
        const objeto = ofertasMostradas.find((oferta) => oferta.Id.toString() === id.toString());
        if (!objeto || esAgotada(objeto)) continue;   // no reservar ofertas agotadas
        const cantidad = parseInt(opciones[id]);

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

  // Habitaciones elegidas (sin contar agotadas), para la barra de resumen.
  const habitacionesElegidas = ofertasMostradas.reduce(
    (n, o) => n + (esAgotada(o) ? 0 : parseInt(selectedOptions[o.Id] || 0)), 0);

  // "Reservar" de una tarjeta: reserva todo lo elegido; si esa tarjeta está en 0, con 1.
  const reservarDesdeTarjeta = (item) => {
    if (esAgotada(item)) return;
    const actual = parseInt(selectedOptions[item.Id] || 0);
    if (actual > 0) return handleClickReservar();
    const opciones = { ...selectedOptions, [item.Id]: 1 };
    setSelectedOptions(opciones);
    handleClickReservar(opciones);
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

      {/* Fondo propio: el de la página es transparente y con modo oscuro el título no se leía. */}
      <div className='relative w-full z-0 rounded-3xl p-4 md:p-6'>
        {/* La WineOffer se muestra en HotelWineOffer, aquí solo calculamos el precio */}

        {/* Encabezado: título a la izquierda, el hotel a la derecha */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 leading-tight">Ofertas de hospedaje</h2>
            <p className="text-gray-500 text-md">Elige la habitación ideal para tu estadía</p>
          </div>
          {Establecimiento?.Titulo && (
            <div className="md:text-right">
              <div className="flex md:justify-end items-center gap-1.5">
                <span className="icon-[ph--map-pin] h-5 w-5 text-[#3d82f5] flex-shrink-0"></span>
                <span className="font-semibold text-gray-800">{Establecimiento.Titulo}</span>
                <Estrellas cantidad={Establecimiento.Catalogacion} />
              </div>
              {Establecimiento.Direccion && (
                <p className="text-xs text-gray-500 mt-0.5 md:max-w-xs md:ml-auto">{Establecimiento.Direccion}</p>
              )}
            </div>
          )}
        </div>

        {/* Indicador de filtro activo */}
        {diasSeleccionados.length > 0 && diasSeleccionados.length < 7 && (
          <div className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-1.5 mb-3">
            <span className="icon-[material-symbols-light--filter-alt-outline] text-blue-500 h-4 w-4"></span>
            <label className="text-blue-600 text-xs font-medium">
              Mostrando ofertas que aplican en: {diasSeleccionados.map(nombreDia).join(', ')}
            </label>
            <label className="text-blue-400 text-xs">
              ({ofertasMostradas.length} de {Establecimiento.Ofertas.length} ofertas)
            </label>
          </div>
        )}

        {ofertasMostradas.length === 0 ? (
          <div className="flex flex-col items-center gap-2 border border-gray-100 rounded-2xl bg-white py-10">
            <span className="icon-[material-symbols-light--calendar-month-rounded] text-gray-300 h-10 w-10"></span>
            <label className="text-gray-500 font-medium text-sm">No hay ofertas disponibles para los días: {diasSeleccionados.map(nombreDia).join(', ')}</label>
            <label className="text-gray-400 text-xs">Intenta seleccionar otras fechas en el buscador</label>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {ofertasMostradas.map((item, index) => {
              const agotada = esAgotada(item);
              const cantidad = agotada ? 0 : parseInt(selectedOptions[item.Id] || 0);
              const elegida = cantidad > 0;
              const estilo = estiloAcomodacion(item.Acomodacion);
              const adultos = parseInt(item.Adultos || 0);
              const ninos = parseInt(item.Ninos || 0);
              const detallesAbiertos = open === index + 1;
              const tieneDetalles = (item.NoIncluye && item.NoIncluye.length) || (item.Restricciones && item.Restricciones.length) || (item.SistemaServicios && item.SistemaServicios.length);
              return (
                <div
                  key={item.Id}
                  className={`rounded-2xl border bg-white shadow-sm transition-colors
                    ${elegida ? "border-greenVE-400 ring-1 ring-greenVE-200 bg-greenVE-50/30" : "border-gray-200 hover:border-greenVE-300"}
                    ${agotada ? "bg-gray-50" : ""}`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4">
                    {/* Habitación */}
                    <div className={`md:col-span-4 flex gap-3 ${agotada ? "opacity-60" : ""}`}>
                      <div className={`h-14 w-14 flex-shrink-0 rounded-xl flex items-center justify-center ${estilo.fondo}`}>
                        <span className={`${estilo.icono} h-7 w-7 ${estilo.color}`}></span>
                      </div>
                      <div className="flex flex-col gap-1 min-w-0">
                        <h3 className="font-bold text-gray-900 leading-snug">{item.TituloOferta}</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {item.AplicaEn && (
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-md px-2 py-0.5 text-xs font-medium">
                              <span className="icon-[ph--calendar-blank] h-3.5 w-3.5"></span>
                              {item.AplicaEn}
                            </span>
                          )}
                          {item.Ganga && (
                            <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 border border-orange-200 rounded-md px-2 py-0.5 text-xs font-medium">
                              <span className="icon-[ic--outline-local-offer] rotate-90 h-3.5 w-3.5"></span>
                              Precio ganga
                            </span>
                          )}
                        </div>
                        {agotada && (
                          <div className="flex flex-col w-fit">
                            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 border border-gray-200 rounded-md px-2 py-0.5 text-xs font-medium">
                              <span className="icon-[material-symbols-light--event-busy-outline-rounded] h-4 w-4 text-gray-400"></span>
                              {textoAgotada(item, checkIn)}
                            </span>
                            {/* Con varias ventanas de agotamiento, el cartel explica la que
                                bloquea estas fechas y aquí se listan todas las demás. */}
                            {periodosAgotados(item).length > 1 && (
                              <span className="text-[10px] text-gray-400 mt-0.5 ml-1">
                                Fechas no disponibles: {periodosAgotados(item).join(" · ")}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          {Establecimiento.IdEstablecimiento == "443" ? (
                            <>
                              <span className="icon-[ri--prohibited-2-line] h-4 w-4 text-gray-400"></span>
                              El establecimiento no ofrece hospedaje
                            </>
                          ) : (
                            <>
                              <span className="icon-[material-symbols--bed-outline-rounded] h-4 w-4 text-gray-400"></span>
                              Acomodación: {item.Acomodacion}
                            </>
                          )}
                        </div>
                        {(adultos > 0 || ninos > 0) && (
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            {adultos > 0 && (
                              <span className="flex items-center gap-1">
                                <span className="icon-[ph--user] h-4 w-4 text-gray-400"></span>
                                {adultos} {adultos === 1 ? "adulto" : "adultos"}
                              </span>
                            )}
                            {ninos > 0 && (
                              <span className="flex items-center gap-1">
                                <span className="icon-[ph--user] h-3.5 w-3.5 text-gray-400"></span>
                                {ninos} {ninos === 1 ? "niño" : "niños"}
                              </span>
                            )}
                          </div>
                        )}
                        {tieneDetalles ? (
                          <button
                            type="button"
                            onClick={() => handleOpen(index + 1)}
                            className="self-start flex items-center gap-1 text-left whitespace-nowrap text-[13px] font-medium text-[#3d82f5] hover:text-blue-700 mt-0.5"
                          >
                            Ver servicios y otros detalles
                            <span className={`icon-[ph--caret-down] h-4 w-4 transition-transform ${detallesAbiertos ? "rotate-180" : ""}`}></span>
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {/* Incluye */}
                    <div className="md:col-span-3 md:border-l md:pl-4 border-gray-100">
                      <p className="text-xs font-bold text-gray-800 mb-1.5">Incluye</p>
                      {(item.Incluye != null && item.Incluye.length > 0) ? (
                        <ul className="flex flex-col gap-1.5">
                          {item.Incluye.map((itemIncluye, incluyeIndex) => (
                            <li key={incluyeIndex} className="flex gap-2 items-start">
                              <span className="icon-[ph--check-circle-fill] h-4 w-4 text-greenVE-500 flex-shrink-0 mt-px"></span>
                              <p dangerouslySetInnerHTML={{ __html: itemIncluye.Titulo }} className="text-xs text-gray-700 leading-snug"></p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-gray-400">—</p>
                      )}
                    </div>

                    {/* Precio por noche */}
                    <div className={`md:col-span-2 md:border-l md:pl-4 border-gray-100 ${agotada ? "opacity-60" : ""}`}>
                      <p className="text-xs text-gray-500 mb-1">
                        {Establecimiento.IdEstablecimiento == "443"
                          ? "Precio por un día"
                          : Noches == 1 ? `Precio por ${Noches} noche` : `Precio por ${Noches} noches`}
                      </p>
                      <p className="text-3xl font-extrabold text-gray-900 leading-none">${item.FinalSinImpuestos}</p>
                      <p className="text-xs text-gray-500 mt-1">+ ${item.Impuestos} de impuestos</p>
                      {item._mezcla && item._desglose && (
                        <div className="mt-1.5 text-[10px] text-gray-500 bg-blue-50 border border-blue-100 rounded-md px-2 py-1 leading-tight">
                          <div>{item._desglose.semana.noches} noche{item._desglose.semana.noches !== 1 ? 's' : ''} entre semana: <span className="font-semibold text-gray-700">${item._desglose.semana.precio}</span></div>
                          <div>{item._desglose.finde.noches} noche{item._desglose.finde.noches !== 1 ? 's' : ''} fin de semana: <span className="font-semibold text-gray-700">${item._desglose.finde.precio}</span></div>
                        </div>
                      )}
                      {item.Rack ? <p className="text-xs text-red-500 line-through mt-1">Tarifa rack ${item.Rack}</p> : null}
                    </div>

                    {/* Cantidad */}
                    <div className="md:col-span-1">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Cantidad</p>
                      <select
                        id={`combobox-${item.Id}`}
                        name={`combobox-${item.Id}`}
                        value={cantidad}
                        onChange={(event) => handleSelectChange(event, item.Id)}
                        disabled={agotada}
                        title={agotada ? "Oferta agotada temporalmente" : undefined}
                        className={`w-full md:w-auto border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-greenVE-200 ${agotada ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}`}
                      >
                        {options.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    {/* Total de esta oferta */}
                    <div className="md:col-span-2 md:border-l md:pl-4 border-gray-100 flex flex-col">
                      <p className="text-xs text-gray-500 mb-1">Total</p>
                      <p className="text-3xl font-extrabold text-gray-900 leading-none">${redondear(item.FinalSinImpuestos * cantidad)}</p>
                      <p className="text-xs text-gray-500 mt-1">+ ${redondear(item.Impuestos * cantidad)} de impuestos</p>
                      <button
                        type="button"
                        onClick={() => reservarDesdeTarjeta(item)}
                        disabled={agotada}
                        className="mt-3 w-full bg-greenVE-500 hover:bg-greenVE-600 text-white font-semibold rounded-lg py-2 shadow-sm transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Reservar
                      </button>
                    </div>
                  </div>

                  {/* Servicios y otros detalles */}
                  {detallesAbiertos && (
                    <div className="border-t border-gray-100 px-4 py-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[["No incluye", item.NoIncluye], ["Restricciones", item.Restricciones], ["Sistema de servicios", item.SistemaServicios]]
                        .filter(([, lista]) => lista && lista.length)
                        .map(([titulo, lista]) => (
                          <div key={titulo}>
                            <p className="text-xs font-bold text-gray-700 mb-1">{titulo}</p>
                            {lista.map((elemento, i) => (
                              <div key={i} className="flex gap-2 items-center">
                                {getIcon({ text: elemento.Titulo, h: "h-5", w: "w-5", c: "text-[#3d82f5]" })}
                                <p dangerouslySetInnerHTML={{ __html: elemento.Titulo }} className="my-0.5 text-xs text-gray-600 leading-snug"></p>
                              </div>
                            ))}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Resumen: se pueden reservar varias habitaciones a la vez */}
        {(habitacionesElegidas > 0 || alerta !== "") && (
          <div className="sticky bottom-4 z-20 mt-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3 rounded-2xl border border-greenVE-200 bg-white shadow-lg px-5 py-3">
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  {habitacionesElegidas} {habitacionesElegidas === 1 ? "habitación seleccionada" : "habitaciones seleccionadas"}
                </p>
                <p className="text-xl font-extrabold text-gray-900">
                  ${redondear(calcularTotal().SinImpuestos)}
                  <span className="text-xs font-normal text-gray-500"> + ${redondear(calcularTotal().Impuestos)} de impuestos</span>
                </p>
                {wineOfferIncluded && OfertaSeleccionada && calcularTotal().WineOffer > 0 && (
                  <span className="inline-block text-xs text-[#7C9539] bg-[#F0FFC6] px-2 py-0.5 rounded-md mt-1">
                    Incluye: ${calcularTotal().WineOffer.toFixed(2)}
                  </span>
                )}
                {alerta !== "" && (
                  <p className="text-xs text-red-500 font-medium mt-1">
                    {alerta} <span className="text-blue-700">Si necesitas ayuda, contáctate con nuestra central de reservas.</span>
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleClickReservar()}
                className="bg-greenVE-500 hover:bg-greenVE-600 text-white font-semibold rounded-lg px-6 py-2.5 shadow-sm transition-colors"
              >
                Confirmar reserva
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default HotelOfertas;