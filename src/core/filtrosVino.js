/**
 * Filtros de la barra de búsqueda de vinos (ciudad o país, día y hora, calificación).
 *
 * Los usan la página de resultados (WineSearch) y el banner de la página de vinos
 * (WineOffersBanner), para que una oferta aparezca o no con la misma regla en los dos.
 */

/** Minúsculas, sin tildes y sin espacios sobrantes: "Baños " y "banos" coinciden. */
export const normalizarTexto = (t) =>
  (t || "").toString().normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/** La oferta atiende el día elegido (lunes = 1 ... domingo = 7). Sin horarios, siempre. */
const atiendeEseDia = (offer, scheduleDateTime) => {
  if (!scheduleDateTime) return true;
  const schedules = offer.schedules || [];
  if (schedules.length === 0) return true;

  const jsDay = new Date(scheduleDateTime).getDay();
  const isoDay = jsDay === 0 ? 7 : jsDay;
  return schedules.some((s) => isoDay >= s.day_start && isoDay <= s.day_end);
};

/**
 * ¿La oferta cumple los filtros de la barra?
 * Con una ciudad elegida manda la ciudad: así un país mal escrito en el establecimiento
 * ("Ecuadpr") no lo esconde. Sin ciudad, se filtra por país.
 */
export const cumpleFiltrosVino = (offer, filters) => {
  if (!filters) return true;
  const est = (offer && offer.establishment) || {};

  if (filters.city) {
    if (normalizarTexto(est.city) !== normalizarTexto(filters.city)) return false;
  } else if (filters.country && !normalizarTexto(est.country).includes(normalizarTexto(filters.country))) {
    return false;
  }
  if (filters.rate > 0 && (est.rate || 0) < filters.rate) return false;
  return atiendeEseDia(offer, filters.scheduleDateTime);
};
