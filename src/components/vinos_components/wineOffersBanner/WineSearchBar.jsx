import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ClickAwayListener } from "@mui/material";
import MenuTabs from "../../global_components/menu_tabs/MenuTabs";
import DateTimePicker from "./DateTimePicker";
import { getWineOffers } from "../../../core/vinoApiService";
import { normalizarTexto } from "../../../core/filtrosVino";

// ─── Ratings ────────────────────────────────────────────────────────────────
const RATINGS = [
  { value: 0, label: "Todas las calificaciones" },
  { value: 5, label: "⭐⭐⭐⭐⭐ 5 estrellas" },
  { value: 4, label: "⭐⭐⭐⭐ 4+ estrellas" },
  { value: 3, label: "⭐⭐⭐ 3+ estrellas" },
  { value: 2, label: "⭐⭐ 2+ estrellas" },
  { value: 1, label: "⭐ 1+ estrella" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getNow = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// ─── Ubicaciones ─────────────────────────────────────────────────────────────
// Las ciudades del buscador salen de las propias ofertas (ciudad y país de cada
// establecimiento), así aparece cualquier ciudad que tenga algo y ninguna vacía.

/**
 * [{ city, country }] únicos, ordenados por país y ciudad. Si una ciudad aparece con
 * distintos países (p. ej. un "Ecuadpr" mal escrito) se queda con el más frecuente,
 * para no mostrar el error como una opción aparte.
 */
export const ubicacionesDesdeOfertas = (ofertas) => {
  const porCiudad = new Map();
  (ofertas || []).forEach((o) => {
    const est = (o && o.establishment) || {};
    const city = (est.city || "").trim();
    const country = (est.country || "").trim();
    if (!city) return;
    const clave = normalizarTexto(city);
    if (!porCiudad.has(clave)) porCiudad.set(clave, { city, paises: new Map() });
    const paises = porCiudad.get(clave).paises;
    if (country) paises.set(country, (paises.get(country) || 0) + 1);
  });

  return [...porCiudad.values()]
    .map(({ city, paises }) => ({
      city,
      country: [...paises.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "",
    }))
    .sort((a, b) => a.country.localeCompare(b.country, "es") || a.city.localeCompare(b.city, "es"));
};

// Una sola descarga de ofertas para todos los buscadores de la página que no las reciben.
let ubicacionesEnCurso = null;
const cargarUbicaciones = () => {
  if (!ubicacionesEnCurso) {
    ubicacionesEnCurso = getWineOffers()
      .then((r) => ubicacionesDesdeOfertas(Array.isArray(r) ? r : (r && r.data) || []))
      .catch(() => {
        ubicacionesEnCurso = null;   // permite reintentar en el próximo montaje
        return [];
      });
  }
  return ubicacionesEnCurso;
};

// Devuelve sugerencias filtradas por lo que el usuario escribió: ciudades y luego países.
const buildSuggestions = (query, ubicaciones) => {
  const q = normalizarTexto(query);
  const results = [];

  (ubicaciones || []).forEach(({ city, country }) => {
    if (!q || normalizarTexto(city).includes(q) || normalizarTexto(country).includes(q)) {
      results.push({ type: "city", label: city, sublabel: country, country, city });
    }
  });

  [...new Set((ubicaciones || []).map((u) => u.country).filter(Boolean))].forEach((country) => {
    if (!q || normalizarTexto(country).includes(q)) {
      results.push({ type: "country", label: country, sublabel: null, country, city: "" });
    }
  });

  // El desplegable tiene scroll: se muestran todas las que coinciden.
  return results;
};

// ─── Iconos ───────────────────────────────────────────────────────────────────
const CityIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#9CA3AF"/>
  </svg>
);

const CountryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="#9CA3AF"/>
  </svg>
);

// ─── LocationField ────────────────────────────────────────────────────────────
// IMPORTANTE: este componente está definido FUERA de WineSearchBar.
// Si se definiera adentro, React lo destruiría y recrearía en cada render,
// haciendo que el input pierda el foco cada vez que el usuario escribe.
const LocationField = ({ inputClassName = "", externalFilters, onSelect, ubicaciones }) => {
  const inputRef = useRef(null);

  const getDisplayValue = () => {
    if (externalFilters.city && externalFilters.country)
      return `${externalFilters.city}, ${externalFilters.country}`;
    if (externalFilters.city) return externalFilters.city;
    if (externalFilters.country) return externalFilters.country;
    return "";
  };

  const [inputValue, setInputValue] = useState(getDisplayValue);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState(() => buildSuggestions("", ubicaciones));

  // Sincronizar cuando los filtros cambian desde afuera (p.ej. limpiar filtros)
  useEffect(() => {
    setInputValue(getDisplayValue());
  }, [externalFilters.country, externalFilters.city]);

  // Las ubicaciones llegan después de montar (cuando cargan las ofertas).
  useEffect(() => {
    setSuggestions(buildSuggestions(inputValue, ubicaciones));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ubicaciones]);

  const handleChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    setSuggestions(buildSuggestions(val, ubicaciones));
    setOpen(true);
  };

  const handleFocus = () => {
    setSuggestions(buildSuggestions(inputValue, ubicaciones));
    setOpen(true);
  };

  const handleSelect = (s) => {
    const display = s.type === "city" ? `${s.city}, ${s.country}` : s.country;
    setInputValue(display);
    setOpen(false);
    onSelect(s);
  };

  // Resalta la parte del texto que coincide con lo escrito
  const highlight = (text, query) => {
    if (!query.trim()) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase().trim());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="font-semibold text-gray-900">{text.slice(idx, idx + query.trim().length)}</span>
        {text.slice(idx + query.trim().length)}
      </>
    );
  };

  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <div className="relative w-full">
        {/* Container clickable - activa el input sin importar donde se toque */}
        <div onClick={handleContainerClick} className="cursor-text">
          {/* Label + icono */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <g stroke="#929292" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                <path d="M14.5 9a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0m3.722 8c1.395 1.988 2.062 3.047 1.665 3.9a2 2 0 0 1-.14.247c-.575.853-2.06.853-5.03.853H9.283c-2.97 0-4.454 0-5.029-.853a2 2 0 0 1-.14-.247C3.717 20.047 4.384 18.988 5.778 17"/>
                <path d="M13.257 17.494a1.813 1.813 0 0 1-2.514 0C7.654 14.501 3.515 11.158 5.533 6.304 6.626 3.679 9.246 2 12 2s5.375 1.68 6.467 4.304c2.016 4.847-2.113 8.207-5.21 11.19"/>
              </g>
            </svg>
            <label className="text-sm font-normal text-gray-600 cursor-text select-none">
              Ciudad o País
            </label>
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            autoComplete="off"
            placeholder="¿A dónde vas?"
            className={`w-full focus:outline-none placeholder-gray-400 bg-transparent ${inputClassName}`}
            value={inputValue}
            onChange={handleChange}
            onFocus={handleFocus}
          />
        </div>

        {/* Dropdown */}
        {open && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl z-[999] border border-gray-100 overflow-y-auto" style={{ maxHeight: "224px" }}>
            {suggestions.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-4 py-3 hover:bg-amber-50 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors"
                // onMouseDown en lugar de onClick para que no pierda el foco antes del click
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(s);
                }}
              >
                <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100">
                  {s.type === "city" ? <CityIcon /> : <CountryIcon />}
                </span>
                <div className="min-w-0">
                  <div className="text-sm text-gray-700 truncate">
                    {highlight(s.label, inputValue)}
                  </div>
                  {s.sublabel && (
                    <div className="text-xs text-gray-400 truncate">{s.sublabel}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ClickAwayListener>
  );
};

// ─── Componente principal ────────────────────────────────────────────────────
// ofertas: si la página ya las tiene (WineSearch), las pasa y no se descargan de nuevo;
// null mientras la página las carga. Sin la prop (Restaurant), el buscador las pide solo.
const WineSearchBar = ({ type = 0, onFilterChange, initialFilters, offerType = "vinos", ofertas }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [ubicaciones, setUbicaciones] = useState([]);
  useEffect(() => {
    if (ofertas !== undefined) {
      setUbicaciones(ubicacionesDesdeOfertas(ofertas));
      return undefined;
    }
    let vigente = true;
    cargarUbicaciones().then((u) => vigente && setUbicaciones(u));
    return () => { vigente = false; };
  }, [ofertas]);

  const [filters, setFilters] = useState(
    initialFilters || { country: "", city: "", scheduleDateTime: "", rate: 0 }
  );
  const [pickerValue, setPickerValue] = useState(getNow());
  const [openRate, setOpenRate] = useState(false);

  const handleFilterChange = (field, value) => {
    if (field === "scheduleDateTime") {
      setPickerValue(value);
      const next = { ...filters, scheduleDateTime: value || "" };
      setFilters(next);
      if (onFilterChange) onFilterChange(next);
      return;
    }
    const next = { ...filters, [field]: value };
    if (field === "country") next.city = "";
    setFilters(next);
    if (onFilterChange) onFilterChange(next);
  };

  // La fecha solo aplica a tours: en vinos y promociones no se muestra ni filtra. Si
  // quedó una puesta (link viejo o cambio de tours a rutas en la sidebar), se quita.
  const conFecha = (offerType || "").toLowerCase().trim() === "tours";
  useEffect(() => {
    if (!conFecha && filters.scheduleDateTime) handleFilterChange("scheduleDateTime", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conFecha]);

  const handleLocationSelect = (suggestion) => {
    const next = { ...filters, country: suggestion.country, city: suggestion.city };
    setFilters(next);
    if (onFilterChange) onFilterChange(next);
  };

  const handleSearch = () => {
    if (onFilterChange) {
      onFilterChange(filters);
      const params = new URLSearchParams();
      if (filters.country) params.set("country", filters.country);
      if (filters.city) params.set("city", filters.city);
      if (filters.scheduleDateTime) params.set("scheduleDateTime", filters.scheduleDateTime);
      if (filters.rate > 0) params.set("rate", String(filters.rate));
      if (offerType) params.set("type", offerType);
      navigate("/busqueda-beneficios?" + params.toString());
    }
  };

  const handleClearFilters = () => {
    const empty = { country: "", city: "", scheduleDateTime: "", rate: 0 };
    setFilters(empty);
    setPickerValue(getNow());
    if (onFilterChange) onFilterChange(empty);
  };

  const getScheduleDateLabel = () => {
    if (!filters.scheduleDateTime) return "Cualquier día";
    const d = new Date(filters.scheduleDateTime);
    const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const date = d.toLocaleDateString("es-EC", { day: "2-digit", month: "short" });
    const time = d.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit", hour12: false });
    return `${dias[d.getDay()]} ${date} · ${time}`;
  };

  const busqueda =
    location.pathname.includes("busqueda") ||
    location.pathname.includes("hotel") ||
    location.pathname.includes("/busqueda-beneficios");
  const isMobile = window.innerWidth < 768;

  // ─── DESKTOP (type 0 o 1) ──────────────────────────────────────────────────
  if (type === 0 || type === 1) {
    return (
      <div className={`${busqueda ? "mt-[50px]" : "-mt-3"} relative`}>
        {!busqueda && !isMobile && <MenuTabs />}
        <div className="bg-white relative rounded-lg  w-full mt-1 shadow-lg border-2 border-amber-400">
          <div className="grid lg:grid-cols-12 md:grid-cols-12 grid-flow-row border-b border-gray-200">

            {/* Campo unificado Ciudad / País */}
            <div className={`${conFecha ? "col-span-4" : "col-span-6"} border-r border-gray-200 px-4 py-2 relative`}>
              <LocationField
                inputClassName="text-xs"
                externalFilters={filters}
                onSelect={handleLocationSelect}
                ubicaciones={ubicaciones}
              />
            </div>

            {/* Disponibilidad (solo tours) */}
            {conFecha && (
              <div className="col-span-3 border-r border-gray-200 px-4 py-2 relative">
                <DateTimePicker
                  value={pickerValue}
                  onChange={(val) => handleFilterChange("scheduleDateTime", val)}
                />
              </div>
            )}

            {/* Rating */}
            <div className={`${conFecha ? "col-span-3" : "col-span-4"} px-4 py-2 relative`}>
              <ClickAwayListener onClickAway={() => setOpenRate(false)}>
                <div className="cursor-pointer" onClick={() => setOpenRate(!openRate)}>
                  <div className="flex flex-row gap-3 items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1024 1024">
                      <path fill="#929292" d="m512 77.488 137.472 285.088L962.08 409.04 735.664 634.88l7.616 45.311 45.28 270.16-276.607-148.784L235.36 950.415l45.295-270.224 7.584-45.311L61.904 409.008l312.592-46.464L395.04 320zm-.017-61.936c-28.656 0-54.784 16.176-66.977 41.456l-115.904 240.64-266.704 39.664c-27.391 4.096-50.143 22.8-58.975 48.384-8.817 25.664-2.145 53.904 17.199 73.152l195.408 195.2-45.328 270.656c-4.56 27.28 7.232 54.624 30.368 70.576 12.72 8.737 27.664 13.153 42.624 13.153 12.32 0 24.64-2.992 35.793-8.977l232.496-125.184 232.512 125.184a75.853 75.853 0 0 0 35.776 8.977c14.96 0 29.905-4.416 42.657-13.153 23.103-15.952 34.91-43.295 30.319-70.576l-45.344-270.656 195.504-195.2c19.344-19.248 25.968-47.504 17.152-73.152-8.848-25.616-31.6-44.32-58.976-48.385l-266.656-39.664-115.968-240.64c-12.112-25.311-38.256-41.455-66.976-41.455z"/>
                    </svg>
                    <div>
                      <label className="text-sm font-normal block">Calificación</label>
                      <div className="text-xs">
                        {filters.rate > 0 ? RATINGS.find((r) => r.value === filters.rate)?.label : "Todas"}
                      </div>
                    </div>
                  </div>
                  {openRate && (
                    <div className="absolute top-16 right-0 w-48 bg-white rounded-md shadow-xl z-50 border border-gray-200">
                      {RATINGS.map((rating, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-2 hover:bg-amber-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFilterChange("rate", rating.value);
                            setOpenRate(false);
                          }}
                        >
                          {rating.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ClickAwayListener>
            </div>

            {/* Botón Buscar - Desktop */}
            <div
              onClick={handleSearch}
              className="col-span-2 cursor-pointer hidden lg:flex justify-center items-center bg-greenVE-600 hover:bg-greenVE-700 rounded-r-lg"
            >
              <button className="w-full text-white font-semibold rounded-lg transition-colors">
                Buscar
              </button>
            </div>
          </div>

          {/* Botón Buscar - Móvil */}
          <div onClick={handleSearch} className="lg:hidden cursor-pointer px-4 pb-3">
            <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 rounded-md transition-colors flex items-center justify-center gap-2">
              Buscar
            </button>
          </div>

          {/* Tags de filtros activos */}
          {(filters.country || filters.city || filters.scheduleDateTime || filters.rate > 0) && (
            <div className="flex flex-wrap gap-2 px-4 pb-3 pt-1">
              {filters.city && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">
                  {filters.city}
                  <button onClick={() => handleFilterChange("city", "")} className="hover:text-amber-600 font-bold">×</button>
                </span>
              )}
              {filters.country && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">
                  {filters.country}
                  <button onClick={() => handleFilterChange("country", "")} className="hover:text-amber-600 font-bold">×</button>
                </span>
              )}
              {filters.scheduleDateTime && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">
                  📅 {getScheduleDateLabel()}
                  <button onClick={() => handleFilterChange("scheduleDateTime", "")} className="hover:text-amber-600 font-bold">×</button>
                </span>
              )}
              {filters.rate > 0 && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">
                  {filters.rate}+ ⭐
                  <button onClick={() => handleFilterChange("rate", 0)} className="hover:text-amber-600 font-bold">×</button>
                </span>
              )}
              <button className="text-amber-600 hover:text-amber-800 text-xs font-medium" onClick={handleClearFilters}>
                Limpiar todo
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── MÓVIL (type 3 o 4) ────────────────────────────────────────────────────
  if (type === 3 || type === 4) {
    return (
      <div>
        <div className="bg-white rounded-lg shadow-lg border-2 border-amber-400 overflow-visible">

          {/* Campo unificado */}
          <div className="relative border-b border-gray-200 px-4 py-3">
            <LocationField
              inputClassName="text-sm"
              externalFilters={filters}
              onSelect={handleLocationSelect}
              ubicaciones={ubicaciones}
            />
          </div>

          {/* Disponibilidad (solo tours) */}
          {conFecha && (
            <div className="relative border-b border-gray-200 px-4 py-3">
              <DateTimePicker
                value={pickerValue}
                onChange={(val) => handleFilterChange("scheduleDateTime", val)}
              />
            </div>
          )}

          {/* Rating */}
          <div className="relative border-b border-gray-200">
            <ClickAwayListener onClickAway={() => setOpenRate(false)}>
              <div className="px-4 py-3 cursor-pointer" onClick={() => setOpenRate(!openRate)}>
                <div className="flex flex-row gap-1 items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1024 1024">
                    <path fill="#929292" d="m512 77.488 137.472 285.088L962.08 409.04 735.664 634.88l7.616 45.311 45.28 270.16-276.607-148.784L235.36 950.415l45.295-270.224 7.584-45.311L61.904 409.008l312.592-46.464L395.04 320zm-.017-61.936c-28.656 0-54.784 16.176-66.977 41.456l-115.904 240.64-266.704 39.664c-27.391 4.096-50.143 22.8-58.975 48.384-8.817 25.664-2.145 53.904 17.199 73.152l195.408 195.2-45.328 270.656c-4.56 27.28 7.232 54.624 30.368 70.576 12.72 8.737 27.664 13.153 42.624 13.153 12.32 0 24.64-2.992 35.793-8.977l232.496-125.184 232.512 125.184a75.853 75.853 0 0 0 35.776 8.977c14.96 0 29.905-4.416 42.657-13.153 23.103-15.952 34.91-43.295 30.319-70.576l-45.344-270.656 195.504-195.2c19.344-19.248 25.968-47.504 17.152-73.152-8.848-25.616-31.6-44.32-58.976-48.385l-266.656-39.664-115.968-240.64c-12.112-25.311-38.256-41.455-66.976-41.455z"/>
                  </svg>
                  <div>
                    <label className="text-sm font-normal block">Calificación</label>
                    <div className="text-xs">
                      {filters.rate > 0 ? RATINGS.find((r) => r.value === filters.rate)?.label : "Todas las calificaciones"}
                    </div>
                  </div>
                </div>
                {openRate && (
                  <div className="absolute top-full left-0 right-0 bg-white shadow-2xl z-50 border-t border-gray-200">
                    {RATINGS.map((rating, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-3 hover:bg-amber-50 active:bg-amber-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFilterChange("rate", rating.value);
                          setOpenRate(false);
                        }}
                      >
                        {rating.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ClickAwayListener>
          </div>

          {/* Tags de filtros activos */}
          {(filters.country || filters.city || filters.scheduleDateTime || filters.rate > 0) && (
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex flex-wrap gap-2">
                {filters.city && (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium">
                    {filters.city}
                    <button onClick={() => handleFilterChange("city", "")} className="hover:text-amber-600 font-bold text-base">×</button>
                  </span>
                )}
                {filters.country && (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium">
                    {filters.country}
                    <button onClick={() => handleFilterChange("country", "")} className="hover:text-amber-600 font-bold text-base">×</button>
                  </span>
                )}
                {filters.scheduleDateTime && (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium">
                    📅 {getScheduleDateLabel()}
                    <button onClick={() => handleFilterChange("scheduleDateTime", "")} className="hover:text-amber-600 font-bold text-base">×</button>
                  </span>
                )}
                {filters.rate > 0 && (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium">
                    {filters.rate}+ ⭐
                    <button onClick={() => handleFilterChange("rate", 0)} className="hover:text-amber-600 font-bold text-base">×</button>
                  </span>
                )}
              </div>
              <button className="text-amber-600 hover:text-amber-800 text-sm font-medium mt-2" onClick={handleClearFilters}>
                Limpiar todos los filtros
              </button>
            </div>
          )}

          {/* Botón de búsqueda */}
          <div onClick={handleSearch} className="px-4 cursor-pointer pb-4 pt-3">
            <button className="w-full bg-greenVE-600 hover:bg-gray-600 cursor-pointer text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
              Buscar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default WineSearchBar;