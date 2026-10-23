/**
 * Configuración centralizada de tipos de oferta.
 * Cada tipo define su label, colores, iconos, textos y subTypes.
 *
 * - type   → categoría principal (se guarda en Offert.type)
 * - subType → sub-categoría dentro del type (se guarda en Offert.subType)
 */

export const OFFER_TYPES = {
  rutas: {
    key: 'rutas',
    label: 'Rutas',
    route: '/rutas',
    searchRoute: '/busqueda-beneficios',
    bannerTitle: 'Rutas del Vino',
    bannerSubtitle: 'Descubre promociones especiales con regalos incluidos de nuestros establecimientos asociados',
    priceLabel: 'Precio Descorche',
    reserveLabel: 'Reservar',
    accentColor: 'amber',
    badgeBg: 'bg-amber-500',
    badgeText: 'text-white',
    borderColor: 'border-amber-400',
    headerGradient: 'from-amber-500 to-amber-600',
    tagBg: 'bg-amber-50',
    tagText: 'text-amber-700',
    tagBorder: 'border-amber-300',
    iconColor: 'text-amber-600',
    subTypes: [
      { value: 'ruta_del_vino', label: 'Ruta del vino' },
      { value: 'ruta_de_los_volcanes', label: 'Ruta de los Volcanes' },
      { value: 'ruta_del_spondylus', label: 'Ruta del Spondylus' },
      { value: 'ruta_de_las_cascadas', label: 'Ruta de las Cascadas' },
    ],
  },
  promociones: {
    key: 'promociones',
    label: 'Promociones',
    route: '/promociones',
    searchRoute: '/busqueda-beneficios',
    bannerTitle: 'Promociones Exclusivas',
    bannerSubtitle: 'Aprovecha las mejores promociones en nuestros establecimientos asociados, con descuentos y regalos especiales',
    priceLabel: 'Precio con Descuento',
    reserveLabel: 'Aprovechar Descuento',
    accentColor: 'rose',
    badgeBg: 'bg-rose-500',
    badgeText: 'text-white',
    borderColor: 'border-rose-400',
    headerGradient: 'from-rose-500 to-rose-600',
    tagBg: 'bg-rose-50',
    tagText: 'text-rose-700',
    tagBorder: 'border-rose-300',
    iconColor: 'text-rose-600',
    subTypes: [
      { value: 'burgerKing', label: 'Burger King' },
      { value: 'bares', label: 'Bares & Lounges' },
      { value: 'vinotecas', label: 'Vinotecas' },
    ],
  },
  tours: {
    key: 'tours',
    label: 'Tours',
    route: '/Tours',
    searchRoute: '/busqueda-beneficios',
    bannerTitle: 'Tours & Experiencias',
    bannerSubtitle: 'Descubre tours y experiencias únicas con nuestros operadores asociados',
    priceLabel: 'Precio por persona',
    reserveLabel: 'Reservar Tour',
    accentColor: 'emerald',
    badgeBg: 'bg-emerald-500',
    badgeText: 'text-white',
    borderColor: 'border-emerald-400',
    headerGradient: 'from-emerald-500 to-emerald-600',
    tagBg: 'bg-emerald-50',
    tagText: 'text-emerald-700',
    tagBorder: 'border-emerald-300',
    iconColor: 'text-emerald-600',
    subTypes: [
      { value: 'tour', label: 'Tours' },
      { value: 'gastronomico', label: 'Gastronómicos' },
      { value: 'aventura', label: 'Aventura' },
      { value: 'cultural', label: 'Cultural' },
    ],
  },
  experiencias: {
    key: 'experiencias',
    label: 'Experiencias',
    route: '/experiencias',
    searchRoute: '/busqueda-beneficios',
    bannerTitle: 'Experiencias Únicas',
    bannerSubtitle: 'Vive momentos inolvidables con actividades y experiencias cuidadosamente seleccionadas para ti',
    priceLabel: 'Precio por experiencia',
    reserveLabel: 'Reservar Experiencia',
    accentColor: 'violet',
    badgeBg: 'bg-violet-500',
    badgeText: 'text-white',
    borderColor: 'border-violet-400',
    headerGradient: 'from-violet-500 to-violet-600',
    tagBg: 'bg-violet-50',
    tagText: 'text-violet-700',
    tagBorder: 'border-violet-300',
    iconColor: 'text-violet-600',
    subTypes: [
      { value: 'cata', label: 'Catas' },
      { value: 'maridaje', label: 'Maridajes' },
      { value: 'clase_cocina', label: 'Clases de Cocina' },
      { value: 'spa', label: 'Spa & Bienestar' },
    ],
  },
};

/** Devuelve la config del tipo, con fallback a 'rutas' */
export const getOfferTypeConfig = (type) => {
  if (!type) return OFFER_TYPES.rutas;
  const key = type.toLowerCase().trim();
  // Compatibilidad: si llega "vinos" lo mapeamos a "rutas"
  if (key === 'vinos') return OFFER_TYPES.rutas;
  return OFFER_TYPES[key] || OFFER_TYPES.rutas;
};

/** Lista de tipos para selectores (ej: crear oferta) */
export const OFFER_TYPE_OPTIONS = Object.values(OFFER_TYPES).map((cfg) => ({
  value: cfg.key,
  label: cfg.label,
}));

/**
 * Lista de subTypes para un type dado.
 * Útil en formularios de creación/edición de ofertas.
 */
export const getSubTypeOptions = (type) => {
  const config = getOfferTypeConfig(type);
  return config.subTypes || [];
};

export default OFFER_TYPES;