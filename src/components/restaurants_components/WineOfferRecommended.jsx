import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// Mapa inline de subTypes — no depende de imports externos
const SUBTYPE_LABELS = {
  ruta_del_vino: 'Ruta del vino',
  ruta_de_los_volcanes: 'Ruta de los Volcanes',
  ruta_del_spondylus: 'Ruta del Spondylus',
  ruta_de_las_cascadas: 'Ruta de las Cascadas',
  restaurantes: 'Restaurantes',
  bares: 'Bares & Lounges',
  vinotecas: 'Vinotecas',
  tour: 'Tours',
  gastronomico: 'Gastronómicos',
  aventura: 'Aventura',
  cultural: 'Cultural',
  cata: 'Catas',
  maridaje: 'Maridajes',
  clase_cocina: 'Clases de Cocina',
  spa: 'Spa & Bienestar',
};

const slugify = (text) => {
  if (!text) return "";
  const slug = text.toLowerCase().replaceAll(" - ", "-").replaceAll(" ", "-").replace(/[^a-z0-9\-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return encodeURIComponent(slug);
};

const WineOfferRecommended = ({ ofertaSeleccionada, establecimiento, includeInReservation, setIncludeInReservation, showCheckbox, onReservar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const _qp = new URLSearchParams(location.search);
  const scheduleDateTime = _qp.get('scheduleDateTime') || '';
  const [imageLoaded, setImageLoaded] = useState(false);
  const [expandedDescription, setExpandedDescription] = useState(true);

  const offer = ofertaSeleccionada;

  // Soporte para días 0-6 (Dom=0) y 1-7 (Lun=1, Dom=7)
  const DAY_NAMES_0 = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const DAY_NAMES_1 = ["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const formatDayRange = (start, end) => {
    const useBase1 = start > 6 || end > 6;
    const names = useBase1 ? DAY_NAMES_1 : DAY_NAMES_0;
    const s = names[start] ?? start;
    const e = names[end] ?? end;
    return s === e ? s : `${s} – ${e}`;
  };

  const formatTime = (timeValue) => {
    if (!timeValue) return '';
    const str = typeof timeValue === 'string' ? timeValue : new Date(timeValue).toISOString();
    const timePart = str.includes('T') ? str.split('T')[1] : str;
    const [hh, mm] = timePart.split(':');
    const h = parseInt(hh, 10);
    const period = h >= 12 ? 'pm' : 'am';
    const h12 = h % 12 || 12;
    return `${h12}:${mm}${period}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      timeZone: 'UTC'
    });
  };

  const getDaysRemaining = () => {
    if (!offer.date_ed) return 0;
    const now = new Date();
    const endDate = new Date(offer.date_ed);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = getDaysRemaining();

  const handleClickReservar = () => {
    // Si viene un callback onReservar (estamos dentro de Restaurants), se abre el ticket de la oferta
    if (onReservar) {
      onReservar();
      return;
    }

 
    // Si no, navegar a la página del establecimiento (comportamiento original)
    const wineEst = offer.wineEstablishment || {};
    const establishmentName = wineEst.name || establecimiento?.Titulo || offer.TituloOferta;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dateTmp = [{
      startDate: today.toISOString(),
      endDate: tomorrow.toISOString(),
      key: 'selection'
    }];

    const opts = { adult: 1, children: 0, childrenAges: [], room: 1 };
    const slug = slugify(establishmentName);
    const url = `/hotel/${slug}/`;

    navigate(url, {
      state: {
        OfertaSeleccionada: offer,
        options: opts,
        date: dateTmp,
        searchEstablishmentName: establishmentName,
        fromWineOffer: true,
        scheduleDateTime,
      }
    });
  };

  if (!offer) return null;

  const description = offer.Detalle || offer.description || '';
  const title = offer.TituloOferta || offer.title || '';
  const image = offer.FotoPrincipal || offer.image || '';
  const price = offer.FinalSinImpuestos || offer.price || 0;
  const taxes = offer.Impuestos || offer.taxes || 0;
  const inventories = offer.inventories || [];
  const schedules = offer.schedules || [];
  const subtypes = offer.subtype || '';
  const wineEst = offer.wineEstablishment || {};

  // type y subType vienen de la API de vinos (vinoApiService → /offerts)
  const ofertType = offer.type || '';
  const ofertSubType = offer.subType || '';
  console.log('[WineOfferRecommended] type:', ofertType, '| subType:', ofertSubType, '| offer keys:', Object.keys(offer));

  // Obtener el label legible del subType usando el mapa inline
  const subTypeLabel = ofertSubType ? (SUBTYPE_LABELS[ofertSubType] || ofertSubType) : '';
 const handleClickApple = () => {
     window.open("https://apps.apple.com/ec/app/visitaecuador-com/id1385161516")
  }

   const handleClickGoogle = () => {
     window.open("https://play.google.com/store/apps/details?id=com.visitaEcuador&hl=es")
  }

  return (
    <div className="rounded-xl w-full bg-white shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-greenVE-50 px-4 py-3 border-b border-amber-100 flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold text-lg text-greenVE-800 flex items-center gap-2">
          <span className="line-clamp-1">Recomendado · Parejas · Amigos</span>
        </h3>

        <div className="flex items-center gap-3">
          {/* Badge días restantes */}
          {daysRemaining > 0 && daysRemaining <= 7 && (
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
              ¡{daysRemaining} {daysRemaining === 1 ? 'día' : 'días'}!
            </span>
          )}

          {/* Checkbox incluir en reserva */}
          {showCheckbox && setIncludeInReservation && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeInReservation}
                onChange={(e) => setIncludeInReservation(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-greenVE-500 focus:ring-greenVE-500 cursor-pointer"
              />
              <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Incluir en reserva</span>
            </label>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col-reverse lg:flex-row">
        {/* Info principal */}
        <div className="lg:w-9/12 w-full flex flex-col sm:flex-row">
          {/* Imagen */}
          {image && (
            <div className="relative w-full sm:w-4/12 h-48 sm:h-auto overflow-hidden shrink-0">
              {!imageLoaded && (
                <div className="animate-pulse absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
              )}
              <img
                src={image}
                alt={title}
                className={`w-full h-48 object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
              />
              {/* Badge de regalos sobre la imagen */}
              {inventories.length > 0 && (
                <div className="absolute bottom-3 left-3">
                  <div className="flex items-center gap-1.5 bg-amber-500/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 7h-1.209A4.92 4.92 0 0 0 19 5.5C19 3.57 17.43 2 15.5 2c-1.622 0-2.705 1.482-3.404 3.085C11.407 3.57 10.269 2 8.5 2 6.57 2 5 3.57 5 5.5c0 .596.079 1.089.209 1.5H4c-1.103 0-2 .897-2 2v2c0 1.103.897 2 2 2v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7c1.103 0 2-.897 2-2V9c0-1.103-.897-2-2-2zm-4.5-3c.827 0 1.5.673 1.5 1.5C17 7 16.374 7 16 7h-2.478c.511-1.576 1.253-3 1.978-3zM7 5.5C7 4.673 7.673 4 8.5 4c.888 0 1.714 1.525 2.198 3H8c-.374 0-1 0-1-1.5zM4 9h7v2H4V9zm2 11v-7h5v7H6zm12 0h-5v-7h5v7zm-5-9V9h7l.001 2H13z" />
                    </svg>
                    <span className="text-white text-xs font-semibold">+{inventories.length} regalos</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Detalles */}
          <div className="p-4 flex flex-col gap-2 flex-1">

            {/* Título + badge de subType */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-md font-semibold text-gray-900">{title}</span>
              {subTypeLabel && (
                <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  {subTypeLabel}
                </span>
              )}
            </div>

            {/* Descripción */}
            {description && (
              <div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {expandedDescription
                    ? description
                    : description.length > 150
                      ? description.slice(0, 150) + "…"
                      : description}
                </p>
                {description.length > 150 && (
                  <button
                    onClick={() => setExpandedDescription((prev) => !prev)}
                    className="text-xs text-blue-500 hover:text-blue-600 font-medium mt-0.5 transition-colors"
                  >
                    {expandedDescription ? "Ver menos ▲" : "Ver más ▼"}
                  </button>
                )}
              </div>
            )}
{ ofertType !== "promociones" ? (
  <>
            {/* Horarios / Fechas */}
            {schedules.length > 0 ? (
              <div className="flex flex-col gap-1 mt-1">
                <span className="text-xs font-medium text-gray-500">Horarios disponibles:</span>
                <div className="flex flex-wrap gap-2">
                  {schedules.map((schedule, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-greenVE-50 px-2 py-1 rounded-md text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
                        <path d="M13 7h-2v5.414l3.293 3.293 1.414-1.414L13 11.586z" />
                      </svg>
                      <span className="font-medium text-greenVE-700">{formatDayRange(schedule.day_start, schedule.day_end)}</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-600">{formatTime(schedule.time_st)} – {formatTime(schedule.time_ed)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (offer.date_st || offer.date_ed) ? (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                </svg>
                <span>{formatDate(offer.date_st)} - {formatDate(offer.date_ed)}</span>
              </div>
            ) : null}
     </>     ): <div>
                    <p className="text-xs font-bold text-gray-500 leading-relaxed">Puedes acceder al beneficio desde nuestra app móvil</p>
                </div>}
            {/* Inventarios / Regalos detallados */}
            {inventories.length > 0 && (
              <div className="mt-1">
                <span className="text-xs font-medium text-gray-500">Incluye regalos:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {inventories.map((inv, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-md border border-green-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {inv.name || inv.title || `Regalo ${idx + 1}`}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel de precio y reserva */}
        <div className="border-b lg:border-b-0 lg:border-l border-gray-100 w-full lg:w-3/12 flex flex-row lg:flex-col p-5 items-center justify-center gap-3 bg-gradient-to-b from-gray-50 to-white">
          <div className="text-center">
            {price > 0 && ofertType !== "promociones" ? (
              <>
                <span className="font-bold text-3xl text-gray-900">${price}</span>
             {ofertSubType === "tour" ? (
                <p className="text-xs text-gray-400 mt-0.5">precio 2x1</p>
              ) : ofertSubType === "ruta_del_vino" ? (<p className="text-xs text-gray-400 mt-0.5">precio descorche</p>
              ) : ofertSubType === "burgerKing" ? (<p className="text-xs text-gray-400 mt-0.5">precio burger king</p>) : null}
                
              </>
            ) :  ofertType === "promociones" ? (
              <span className="font-bold text-lg text-greenVE-600 ">Accede al Beneficio</span>
            )  : (
              <span className="font-semibold text-lg text-gray-600">Consultar precio</span>
            )}
          </div>
           {/* Las promociones también generan ticket dentro del restaurante; fuera de él
               (página del hotel) siguen llevando a la app. */}
           {ofertType !== "promociones" || onReservar ? (
          <button
            className="bg-greenVE-500 hover:bg-greenVE-600 transition-colors text-white font-medium py-2 px-6 rounded-full shadow-sm hover:shadow-md"
            onClick={handleClickReservar}
          >
            {/* Dentro del restaurante abre el ticket; desde el hotel lleva a la página del restaurante. */}
            {onReservar ? "Generar ticket" : "Reservar"}
          </button>
            ) : (
              <div className='flex flex-col gap-1'>
                <button
                className='h-16 w-40'
                  onClick={handleClickGoogle}
                >
                  <img src="https://visitaecuador.com/img/web/google_store.png" className='h-16 w-40'/>
                </button>
                
                <button
                className='h-16 w-40'
                  onClick={handleClickApple}
                >
                  <img src="https://visitaecuador.com/img/web/apple_store.png" className='h-16 w-40'/>
                </button>
                </div>
             ) }
        </div>
      </div>
    </div>
  );
};

export default WineOfferRecommended;