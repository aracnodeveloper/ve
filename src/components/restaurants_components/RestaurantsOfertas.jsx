import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RestaurantsConfirmation from './RestaurantsConfirmation';
import { getOfferTypeConfig } from '../../core/offertTypeConfig';

/**
 * Ofertas de beneficio de un establecimiento (rutas, tours, promociones) en tarjetas.
 *
 * Cada tarjeta tiene su botón "Ticket": abre RestaurantsConfirmation, donde se elige la
 * cantidad de personas y se genera el ticket (ya no se reserva por WhatsApp).
 * solicitudTicket ({ id, n }) permite abrirlo desde fuera, p. ej. desde la oferta
 * recomendada de la página; `n` cambia en cada pedido para poder repetirlo.
 */

const DAY_NAMES_0 = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DAY_NAMES_1 = ["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const formatDayRange = (start, end) => {
  const useBase1 = start > 6 || end > 6;
  const names = useBase1 ? DAY_NAMES_1 : DAY_NAMES_0;
  const s = names[start] ?? start;
  const e = names[end] ?? end;
  return s === e ? s : `${s}–${e}`;
};

const formatTime = (timeValue) => {
  if (!timeValue) return '';
  const str = typeof timeValue === 'string' ? timeValue : new Date(timeValue).toISOString();
  const timePart = str.includes('T') ? str.split('T')[1] : str;
  const [hh, mm] = timePart.split(':');
  const h = parseInt(hh, 10);
  return `${h % 12 || 12}:${mm}${h >= 12 ? 'pm' : 'am'}`;
};

const idDe = (oferta) => (oferta.id || oferta.IdOferta || '').toString();

const Estrellas = ({ valor }) => {
  const llenas = Math.max(0, Math.min(5, Math.round(valor)));
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`icon-[ph--star-fill] h-3.5 w-3.5 ${i < llenas ? 'text-amber-400' : 'text-gray-200'}`}></span>
      ))}
    </span>
  );
};

const TarjetaOferta = ({ oferta, establecimiento, destacada, onTicket }) => {
  const config = getOfferTypeConfig(oferta.type);
  const subTipo = (config.subTypes || []).find((s) => s.value === oferta.subType)?.label || config.label;
  const titulo = oferta.title || oferta.TituloOferta;
  const descripcion = oferta.description || oferta.Detalle || '';
  const imagen = oferta.image || oferta.FotoPrincipal || '';
  const precio = parseFloat(oferta.price ?? oferta.FinalSinImpuestos ?? 0) || 0;
  // En Burger King el precio no es un precio: marca cuál de sus dos beneficios aplica
  // (misma regla que la tarjeta del banner de vinos).
  const beneficioBk = oferta.subType === 'burgerKing'
    ? (precio > 0 ? '15% de descuento' : 'Agrandado gratis')
    : null;
  const regalos = oferta.inventories || [];
  const horarios = oferta.schedules || [];
  const calificacion = Number(establecimiento.Catalogacion) || 0;
  const lugar = [establecimiento.Direccion, establecimiento.Ciudad].filter(Boolean).join(', ') || establecimiento.Titulo;

  return (
    <article
      className={`flex flex-col bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition-shadow
                  ${destacada ? 'border-greenVE-400 ring-2 ring-greenVE-200' : 'border-gray-100'}`}
    >
      <div className="relative h-44 bg-gray-100">
        {imagen ? (
          <img src={imagen} alt={titulo} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-4xl">🍷</div>
        )}
        {regalos.length > 0 && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-greenVE-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
            <span className="icon-[ph--gift-fill] h-3.5 w-3.5"></span>
            Incluye regalo
          </span>
        )}
        {destacada && (
          <span className="absolute top-3 right-3 bg-white/95 text-greenVE-700 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow">
            Recomendada
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 p-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-gray-900 text-[15px] leading-snug line-clamp-2">{titulo}</h3>
          {subTipo && (
            <span className="flex-shrink-0 text-[11px] font-semibold text-amber-700 border border-amber-300 bg-amber-50 rounded-full px-2 py-0.5">
              {subTipo}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 text-sm text-gray-600">
          <span className="flex items-center gap-1 min-w-0">
            <span className="icon-[ph--map-pin] h-4 w-4 text-blue-500 flex-shrink-0"></span>
            <span className="truncate">{lugar}</span>
          </span>
          {calificacion > 0 && (
            <span className="flex items-center gap-1.5 flex-shrink-0">
              <Estrellas valor={calificacion} />
              <span className="text-xs text-gray-600">{calificacion.toFixed(1)}</span>
            </span>
          )}
        </div>

        {descripcion && <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{descripcion}</p>}

        {horarios.length > 0 && (
          <p className="flex items-start gap-1 text-xs text-gray-500">
            <span className="icon-[ph--clock] h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-px"></span>
            <span>
              {horarios.map((h) => `${formatDayRange(h.day_start, h.day_end)} ${formatTime(h.time_st)}–${formatTime(h.time_ed)}`).join(' · ')}
            </span>
          </p>
        )}

        {regalos.length > 0 && (
          <p className="text-xs text-greenVE-700">🎁 {regalos.map((r) => r.name || r.title).join(', ')}</p>
        )}

        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
          {beneficioBk ? (
            <div className="leading-tight">
              <p className="text-[11px] text-gray-500">Beneficio</p>
              <p className="text-base font-bold text-gray-900">{beneficioBk}</p>
            </div>
          ) : precio > 0 ? (
            <div className="leading-tight">
              <p className="text-[11px] text-gray-500">{config.priceLabel}</p>
              <p className="text-lg font-bold text-gray-900">${precio}</p>
            </div>
          ) : (
            <span />
          )}
          <button
            onClick={() => onTicket(oferta)}
            className="inline-flex items-center gap-2 bg-greenVE-500 hover:bg-greenVE-600 text-white font-semibold text-sm rounded-xl px-5 py-2.5 shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <span className="icon-[ph--ticket-fill] h-5 w-5"></span>
            Ticket
          </button>
        </div>
      </div>
    </article>
  );
};

const RestaurantsOfertas = ({ Establecimiento, Ofertas, ofertaActiva, solicitudTicket }) => {
  const [ofertaTicket, setOfertaTicket] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const navigate = useNavigate();

  const session = JSON.parse(localStorage.getItem("datos"));
  const nivel = session ? session.data.nivel : "visitante";

  // Generar tickets es solo para suscriptores.
  const pedirTicket = (oferta) => {
    if (nivel === "suscriptor") setOfertaTicket(oferta);
    else setShowSubscriptionModal(true);
  };

  useEffect(() => {
    if (!solicitudTicket || !Ofertas) return;
    const oferta = Ofertas.find((o) => idDe(o) === String(solicitudTicket.id));
    if (oferta) pedirTicket(oferta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solicitudTicket]);

  // Objeto Establecimiento compatible con los subcomponentes
  const establecimientoData = {
    ...Establecimiento,
    Titulo: Establecimiento.name || Establecimiento.Titulo,
    Ciudad: Establecimiento.city || Establecimiento.Ciudad,
    Direccion: Establecimiento.address || Establecimiento.Direccion,
    Catalogacion: Establecimiento.rate || Establecimiento.Catalogacion || 0,
  };

  if (!Ofertas || Ofertas.length === 0) {
    return (
      <div className="w-full py-8 text-center text-gray-500">
        <span className="text-amber-500 text-4xl">🍷</span>
        <p className="mt-2">No hay ofertas disponibles en este momento.</p>
      </div>
    );
  }

  const idActiva = ofertaActiva ? idDe(ofertaActiva) : '';

  return (
    <>
      <RestaurantsConfirmation
        Ofertas={ofertaTicket ? [ofertaTicket] : []}
        isOpen={!!ofertaTicket}
        Establecimiento={establecimientoData}
        OnClose={() => setOfertaTicket(null)}
      />

      {/* ── Modal: se requiere suscripción ── */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setShowSubscriptionModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl mx-6 w-full max-w-sm z-10 overflow-hidden">
            <div className="bg-gradient-to-r from-greenVE-500 to-greenVE-600 px-6 pt-8 pb-6 flex flex-col items-center gap-2">
              <div className="bg-white/20 rounded-full p-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-white font-bold text-lg text-center">
                Acceso exclusivo para suscriptores
              </h2>
            </div>
            <div className="px-6 py-5 flex flex-col items-center gap-4">
              <p className="text-gray-600 text-sm text-center leading-relaxed">
                Para generar el ticket de este beneficio necesitas una suscripción activa en Visita Ecuador.
              </p>
              <div className="w-full flex flex-col gap-2">
                <button
                  onClick={() => { setShowSubscriptionModal(false); navigate("/suscripcion"); }}
                  className="w-full bg-greenVE-500 hover:bg-greenVE-600 text-white font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Ver planes de suscripción
                </button>
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="w-full border border-gray-200 hover:bg-gray-50 text-gray-500 font-medium py-2.5 rounded-xl transition-colors text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panel claro propio: en escritorio la página del restaurante tiene fondo oscuro. */}
      <section className="w-full bg-gray-50 rounded-2xl p-4 sm:p-5">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-800">Beneficios disponibles</h2>
          <p className="text-sm text-gray-500">Genera tu ticket y preséntalo en el establecimiento.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Ofertas.map((oferta) => (
            <TarjetaOferta
              key={idDe(oferta)}
              oferta={oferta}
              establecimiento={establecimientoData}
              destacada={Ofertas.length > 1 && idDe(oferta) === idActiva}
              onTicket={pedirTicket}
            />
          ))}
        </div>
      </section>
    </>
  );
};

export default RestaurantsOfertas;
