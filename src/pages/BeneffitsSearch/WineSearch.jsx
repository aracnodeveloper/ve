import { useEffect, useState, useMemo } from "react";
import { Suspense, lazy } from "react";
import { useLocation } from "react-router-dom";
import { getWineOffers } from "../../core/vinoApiService";
import { getOfferTypeConfig } from "../../core/offertTypeConfig";
import WineSearchItem from "../../components/global_components/Beneffits/WineSearchItem";
import WineSearchItemSkeleton from "../../components/global_components/Beneffits/WineSearchItemSkeleton";
import WineSearchBar from "../../components/vinos_components/wineOffersBanner/WineSearchBar";
import { cumpleFiltrosVino } from "../../core/filtrosVino";
import CreateOfferModal from "../../components/vinos_components/admin/CreateoffertsModal";
import BenefitsSidebar from "../../components/global_components/Beneffits/BenefitsSideBar";
import LeafletMap from "../../components/global_components/maps/LeafletMap";

const Navbar = lazy(() => import("../../components/global_components/navbar/Navbar"));
const Footer = lazy(() => import("../../components/global_components/footer/Footer"));
const MapScreen = lazy(() => import("../../components/search_components/MapScreen"));

const SORT_OPTIONS = [
  { id: "default", label: "Por defecto" },
  { id: "price_asc", label: "Precio (menor a mayor)" },
  { id: "price_desc", label: "Precio (mayor a menor)" },
  { id: "name_asc", label: "Nombre (A - Z)" },
  { id: "name_desc", label: "Nombre (Z - A)" },
];

/**
 * Normaliza el campo type de una oferta.
 * "" | null | undefined | "vinos" → "rutas" (fallback por defecto).
 */
const normalizeOfferType = (type) => {
  if (!type || !type.trim()) return "rutas";
  const key = type.toLowerCase().trim();
  if (key === "vinos") return "rutas";
  return key;
};

/**
 * Parsea coordenadas que pueden venir con coma decimal o punto.
 */
const parseCoord = (value) => {
  if (!value) return null;
  const num = parseFloat(String(value).replace(",", "."));
  return isNaN(num) ? null : num;
};

const WineSearch = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const location = useLocation();
  const _qp = new URLSearchParams(location.search);

  // type y subType controlados por la sidebar
  const [offerType, setOfferType] = useState(
    normalizeOfferType(_qp.get("type"))
  );
  const [offerSubType, setOfferSubType] = useState(null);

  const typeConfig = getOfferTypeConfig(offerType);

  const [filters, setFilters] = useState({
    country: _qp.get("country") || "",
    city: _qp.get("city") || "",
    scheduleDateTime: _qp.get("scheduleDateTime") || "",
    rate: Number(_qp.get("rate")) || 0,
  });
  const [sortBy, setSortBy] = useState("default");
  const [openSort, setOpenSort] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isAdmin = () => {
    try {
      const idUsuario = localStorage.getItem("id_usuario");
      if (idUsuario) return idUsuario.toString() === "412";
      const datos = JSON.parse(localStorage.getItem("datos") || "{}");
      const idFromDatos = datos?.data?.id_usuario || datos?.id_usuario;
      return idFromDatos?.toString() === "412";
    } catch {
      return false;
    }
  };

  const fetchData = async () => {
    try {
      const result = await getWineOffers();
      setData(result || []);
    } catch {
      setError("No se pudieron cargar las ofertas");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Handlers de la sidebar ──
  const handleTypeChange = (typeKey) => {
    setOfferType(typeKey);
    setOfferSubType(null); // reset subType al cambiar type
  };

  const handleSubTypeChange = (typeKey, subValue) => {
    if (offerType !== typeKey) setOfferType(typeKey);
    setOfferSubType(subValue); // null = todos del type
  };

  /**
   * Filtra por:
   *   1. offer.type normalizado === offerType (sidebar categoría)
   *   2. offer.subType === offerSubType (sidebar sub-item, si hay uno seleccionado)
   *   3. filtros de searchBar (country, city, rate, schedule)
   *   4. ordenamiento
   */
  const filteredData = useMemo(() => {
    if (!data) return null;

    let result = data.filter((offer) => {
      // ── Filtro por type ──
      const t = normalizeOfferType(offer.type);
      if (t !== offerType) return false;

      // ── Filtro por subType (si hay uno seleccionado) ──
      if (offerSubType) {
        const st = (offer.subType || "").toLowerCase().trim();
        if (st !== offerSubType) return false;
      }

      // ── Filtros de searchBar (misma regla que el banner, ver core/filtrosVino) ──
      return cumpleFiltrosVino(offer, filters);
    });

    // ── Ordenamiento ──
    switch (sortBy) {
      case "price_asc":
        result = [...result].sort(
          (a, b) => parseFloat(a.price || 0) - parseFloat(b.price || 0)
        );
        break;
      case "price_desc":
        result = [...result].sort(
          (a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0)
        );
        break;
      case "name_asc":
        result = [...result].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name_desc":
        result = [...result].sort((a, b) => b.title.localeCompare(a.title));
        break;
    }
    return result;
  }, [data, filters, sortBy, offerType, offerSubType]);

  // Coordenadas del primer establecimiento filtrado para centrar el mapa
  const mapCenter = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return null;
    for (const offer of filteredData) {
      const est = offer.establishment || {};
      const lat = parseCoord(est.latitude);
      const lng = parseCoord(est.altitude);
      if (lat !== null && lng !== null) return { latitude: lat, longitude: lng };
    }
    return null;
  }, [filteredData]);

  // Datos mapeados para el MapScreen modal
  const mapEstablishments = useMemo(() => {
    if (!filteredData) return [];
    return filteredData
      .filter((o) => {
        const est = o.establishment || {};
        return parseCoord(est.latitude) !== null && parseCoord(est.altitude) !== null;
      })
      .map((o) => {
        const est = o.establishment || {};
        return {
          Titulo: est.name || o.title,
          Latitud: parseCoord(est.latitude),
          Longitud: parseCoord(est.altitude),
          Ciudad: est.city || "",
          Pais: est.country || "",
          Direccion: est.address || "",
        };
      });
  }, [filteredData]);

  const hasActiveFilters =
    filters.country || filters.city || filters.scheduleDateTime || filters.rate > 0;
  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.id === sortBy)?.label || "Por defecto";

  // ── Header ──
  const Header = () => (
    <div className="flex items-center justify-between mb-4">
      {isAdmin() && (
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-[#97C121] hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nueva Oferta
        </button>
      )}
    </div>
  );

  // ── Sort bar ──
  const SortBar = () => (
    <div className="flex items-center justify-between mb-4">
      <div className="relative">
        <button
          onClick={() => setOpenSort(!openSort)}
          className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
          {currentSortLabel}
        </button>
        {openSort && (
          <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-amber-50 transition-colors ${
                  sortBy === opt.id ? "bg-amber-50 text-amber-700 font-medium" : "text-gray-700"
                }`}
                onClick={() => { setSortBy(opt.id); setOpenSort(false); }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500">
        {filteredData
          ? `${filteredData.length} ${filteredData.length === 1 ? "oferta encontrada" : "ofertas encontradas"}`
          : "Cargando..."}
      </p>
    </div>
  );

  // ── Empty states ──
  const EmptyFiltered = () => (
    <div className="text-center py-16 bg-amber-50 rounded-xl border border-amber-200">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-amber-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <p className="text-gray-600 font-medium">
        No se encontraron ofertas de tipo "{typeConfig.label}"
        {offerSubType && ` / ${offerSubType}`}
      </p>
      <p className="text-gray-400 text-sm mt-1">
        Intenta seleccionar otra categoría o ajustar los filtros
      </p>
    </div>
  );

  const EmptyAll = () => (
    <div className="text-center py-16">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 3l-.01 6.62c0 1.59.51 3.13 1.46 4.42l.05.07c.9 1.22 1.47 2.69 1.5 4.26V21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-2.63c.03-1.57.6-3.04 1.5-4.26l.05-.07c.95-1.29 1.46-2.83 1.46-4.42L17 3H6z" />
      </svg>
      <p className="text-gray-500">No hay ofertas disponibles en este momento</p>
      {isAdmin() && (
        <button onClick={() => setShowCreateModal(true)} className="mt-4 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
          Crear primera oferta
        </button>
      )}
    </div>
  );

  // ── Mapa miniatura ──
  const MiniMap = () => (
    <div className="relative h-44 mb-4 rounded-xl overflow-hidden z-0">
      <div className="absolute inset-0 z-10 bg-black/10 flex items-center justify-center">
        <button
          className="bg-[#97C121] hover:bg-[#85ab1c] text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-md transition-colors"
          onClick={() => setIsMapModalOpen(true)}
        >
          Ver en Mapa
        </button>
      </div>
      {mapCenter ? (
        <Suspense>
          <LeafletMap
            viewOptions={{ center: mapCenter, zoom: 13, mapTypeId: "aerialWithLabels" }}
            mapOptions={{ showZoomButtons: false, showMapTypeSelector: false, showBreadcrumb: false, showLocateMeButton: false }}
          />
        </Suspense>
      ) : (
        <>
          <img src="https://visitaecuador.com/img/web/map.svg" className="w-full h-full object-cover" alt="Mapa" />
          <div className="absolute inset-0 bg-black/20" />
        </>
      )}
    </div>
  );

  // ════════════════════════════════════════════════════════════
  // MOBILE
  // ════════════════════════════════════════════════════════════
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Suspense><Navbar /></Suspense>

        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <WineSearchBar type={3} onFilterChange={setFilters} initialFilters={filters} ofertas={data} offerType={offerType} />
        </div>

        <div className="p-4">
          <Header />
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
          <SortBar />

          {!data && !error && (
            <div>{Array(4).fill(null).map((_, i) => <WineSearchItemSkeleton key={i} />)}</div>
          )}
          {filteredData && filteredData.length > 0 && (
            <div>{filteredData.map((offer, idx) => <WineSearchItem key={offer.id} offer={offer} firstElement={idx === 0} />)}</div>
          )}
          {filteredData && filteredData.length === 0 && <EmptyFiltered />}
          {data && data.length === 0 && <EmptyAll />}
        </div>

        <Suspense><Footer /></Suspense>
        {showCreateModal && <CreateOfferModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreated={fetchData} offerType={offerType} />}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // DESKTOP
  // ════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-white">
      <Suspense><Navbar /></Suspense>

      <div className="bg-white sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <WineSearchBar type={0} onFilterChange={setFilters} initialFilters={filters} ofertas={data} offerType={offerType} />
        </div>
      </div>

      {/* Modal mapa fullscreen */}
      {filteredData && filteredData.length > 0 && (
        <Suspense>
          <MapScreen isOpen={isMapModalOpen} onClose={() => setIsMapModalOpen(false)} data={mapEstablishments} />
        </Suspense>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Header />
        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>}

        <div className="flex gap-8">
          {/* ── Columna izquierda: Mapa + Sidebar ── */}
          
          <div className="w-64 shrink-0">
            {filteredData?.some(o => o.type !== 'promociones') && (
            <MiniMap /> )}
            <BenefitsSidebar
              offers={data || []}
              activeType={offerType}
              activeSubType={offerSubType}
              onTypeChange={handleTypeChange}
              onSubTypeChange={handleSubTypeChange}
            />
          </div>
         
          {/* ── Resultados ── */}
          <div className="flex-1 min-w-0">
            <SortBar />

            {!data && !error && (
              <div>{Array(4).fill(null).map((_, i) => <WineSearchItemSkeleton key={i} />)}</div>
            )}
            {filteredData && filteredData.length > 0 && (
              <div>{filteredData.map((offer, idx) => <WineSearchItem key={offer.id} offer={offer} firstElement={idx === 0} />)}</div>
            )}
            {filteredData && filteredData.length === 0 && <EmptyFiltered />}
            {data && data.length === 0 && <EmptyAll />}
          </div>
        </div>
      </div>

      <Suspense><Footer /></Suspense>
      {showCreateModal && <CreateOfferModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreated={fetchData} offerType={offerType} />}
    </div>
  );
};

export default WineSearch;