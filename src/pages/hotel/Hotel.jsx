import { useLocation, useParams } from 'react-router-dom';
import { getResultadoFiltro } from "../../controllers/establecimiento/establecimientoController";
import React, { Suspense, lazy, useEffect, useState, useRef } from "react";
import Filtro from "../../models/Filtro";
import { format } from "date-fns";
import { NavbarSkeleton } from '../../components/global_components/Skeleton/Loadingkeleton';
import { getWineOffers } from "../../core/vinoApiService";
import { precargarBeneficios, esOneShot } from "../../global/oneShot";
import { contarPendientes, TYPE_CERTIFICADO } from "../../controllers/certificado/certificadoController";
import { sessionStatus } from "../../global/util";
import PendingBenefitsModal from "../../components/booking_history_components/PendingBenefitsModal";

// Desktop Components
const Navbar = lazy(() => import("../../components/global_components/navbar/Navbar"));
const Footer = lazy(() => import("../../components/global_components/footer/Footer"));
const HotelBanner = lazy(() => import("../../components/hotel_components/hotelComponents/HotelBanner"));
const HotelGallery = lazy(() => import("../../components/hotel_components/hotelComponents/HotelGallery"));
const HotelAdress = lazy(() => import("../../components/hotel_components/hotelComponents/HotelAdress"));
const HotelDetails = lazy(() => import("../../components/hotel_components/hotelComponents/HotelDetails2"));
const HotelContacts = lazy(() => import("../../components/hotel_components/hotelComponents/HotelContacts"));
const HotelRecommended = lazy(() => import("../../components/hotel_components/hotelComponents/HotelRecommended"));
const HotelOfertas = lazy(() => import("../../components/hotel_components/hotelComponents/HotelOfertas"));
const SearchBar = lazy(() => import("../../components/global_components/searchBar/searchBar"));

// Mobile Components
const HotelBannerMobile = lazy(() => import("../../components/hotel_components/hotelMobile/HotelBanner"));
const HotelSearch = lazy(() => import("../../components/hotel_components/hotelMobile/HotelSearch"));
const HotelMap = lazy(() => import("../../components/hotel_components/hotelMobile/HotelMap"));
const HotelServicesMain = lazy(() => import("../../components/hotel_components/hotelMobile/HotelServicesMain"));
const HotelDescription = lazy(() => import("../../components/hotel_components/hotelMobile/HotelDescription"));

// Shared Component
const WineOfferRecommended = lazy(() => import("../../components/restaurants_components/WineOfferRecommended"));

const Hotel = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const { nombre } = useParams();
  
  const searchInitiated = useRef(false);
  
  const getInitialId = () => {
    try {
      const id = searchParams.get('id');
      if (!id) return null;
      try {
        return JSON.parse(decodeURIComponent(id));
      } catch {
        return id;
      }
    } catch {
      return null;
    }
  };

  const [idHotel, setIdHotel] = useState(getInitialId);
  const [establecimiento, setEstablecimiento] = useState(null);
  const [options, setOptions] = useState({ adult: 2, children: 0, childrenAges: [], room: 1 });
  const [date, setDate] = useState(null);
  const [destination, setDestination] = useState(null);
  const [openMap, setOpenMap] = useState(false);
  const [noches, setNoches] = useState(1);
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState(null);
  const [includeWineOffer, setIncludeWineOffer] = useState(true);
  const [clickRecomendados, setClickRecomendados] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [errorMessage, setErrorMessage] = useState(null);
  const [wineOfferLoading, setWineOfferLoading] = useState(false);
  
  const session = JSON.parse(localStorage.getItem("datos"));
  const nivel = session ? session.data.nivel : "visitante";
  const codigo = localStorage.getItem('codigo');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    // Actualiza opciones, fechas y URL cuando el usuario busca desde la searchBar del hotel
  return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Se precarga al entrar a la pagina, no al abrir el modal: asi el estado ya
  // esta resuelto cuando el usuario llega al boton de generar certificado.
  // No hace nada si el usuario no es OneShot.
  useEffect(() => {
    precargarBeneficios();
  }, []);

  // Certificados en active=1 (generados sin marcar): obligan a ir al historial.
  // Solo aplica al producto OneShot; el resto de usuarios no se ven afectados.
  const [certPendientes, setCertPendientes] = useState(0);
  useEffect(() => {
    if (!sessionStatus() || !esOneShot()) return;
    contarPendientes(TYPE_CERTIFICADO).then(setCertPendientes);
  }, []);

  // Función para buscar ofertas de vino relacionadas con el establecimiento
  const searchRelatedWineOffer = async (establishmentName, establishmentCity) => {
    if (!establishmentName) return null;
    
    try {
      setWineOfferLoading(true);
      const wineOffers = await getWineOffers();
      
      if (!wineOffers || wineOffers.length === 0) {
        return null;
      }

      // Normalizar el nombre del establecimiento para comparación
      const normalizedName = establishmentName.toLowerCase().trim();
      const normalizedCity = (establishmentCity || '').toLowerCase().trim();

      // Buscar oferta que coincida con el establecimiento
      const matchedOffer = wineOffers.find(offer => {
        const establishment = offer.establishment || {};
        const offerEstName = (establishment.name || '').toLowerCase().trim();
        const offerCity = (establishment.city || '').toLowerCase().trim();

        // Coincidencia por nombre exacto
        if (offerEstName === normalizedName) {
          return true;
        }

        // Coincidencia parcial del nombre (el nombre del establecimiento contiene o está contenido)
        if (offerEstName.includes(normalizedName) || normalizedName.includes(offerEstName)) {
          // Si además coincide la ciudad, es una mejor coincidencia
          if (normalizedCity && offerCity && offerCity.includes(normalizedCity)) {
            return true;
          }
          // Si no hay ciudad para comparar, aceptar coincidencia parcial de nombre
          if (!normalizedCity || !offerCity) {
            return true;
          }
        }

        return false;
      });

      if (matchedOffer) {
        // Mapear la oferta al formato esperado por HotelWineOffer
     const mappedOffer = {
        TituloOferta: matchedOffer.title,
        FotoPrincipal: matchedOffer.image,
        Detalle: matchedOffer.description || matchedOffer.title,
        IdOferta: matchedOffer.id,
        price: matchedOffer.price || 0,
        Precio: matchedOffer.price || 0,
        FinalSinImpuestos: matchedOffer.price || 0,
        Impuestos: matchedOffer.taxes || 0,
        date_st: matchedOffer.date_st,
        date_ed: matchedOffer.date_ed,
        inventories: matchedOffer.inventories || [],
        schedules: matchedOffer.schedules || [],  
        wineEstablishment: {
          name: matchedOffer.establishment?.name,
          city: matchedOffer.establishment?.city,
          country: matchedOffer.establishment?.country  
        }
      };
     console.log('schedules en matchedOffer:', matchedOffer);
        return mappedOffer;
      }

      return null;
    } catch (error) {
      console.error('[Hotel] Error buscando ofertas de vino:', error);
      return null;
    } finally {
      setWineOfferLoading(false);
    }
  };

  useEffect(() => {
    if (searchInitiated.current) return;
    searchInitiated.current = true;

    const initializeAndFetch = async () => {
      // Si viene una oferta seleccionada desde WineOfferItem, usarla
      if (location.state?.OfertaSeleccionada) {
        setOfertaSeleccionada(location.state.OfertaSeleccionada);
        setIncludeWineOffer(true);
      }

      // Siempre leer opciones desde URL primero (tiene los niños del buscador)
      const opcionesParamEarly = searchParams.get('opciones');
      if (opcionesParamEarly) {
        try {
          const parsedEarly = JSON.parse(decodeURIComponent(opcionesParamEarly));
          setOptions(parsedEarly);
        } catch {}
      } else if (location.state?.options) {
        setOptions(location.state.options);
      }
      if (location.state?.date) {
        const dates = location.state.date.map(d => ({
          startDate: new Date(d.startDate),
          endDate: new Date(d.endDate),
          key: d.key || 'selection'
        }));
        setDate(dates);
        if (dates[0]) {
          const n = Math.ceil(Math.abs(dates[0].endDate - dates[0].startDate) / (1000 * 60 * 60 * 24));
          setNoches(n || 1);
        }
      }

      if (location.state?.Establecimiento) {
        const est = location.state.Establecimiento;
        setEstablecimiento(est);
        if (location.state.destination) setDestination(location.state.destination);
        setOpenMap(location.state.openMap || false);
        
        // Si no viene oferta seleccionada, buscar una relacionada
        if (!location.state?.OfertaSeleccionada) {
          const relatedOffer = await searchRelatedWineOffer(est.Titulo, est.Ciudad);
          if (relatedOffer) {
            setOfertaSeleccionada(relatedOffer);
            setIncludeWineOffer(false); // Por defecto no incluir si se encontró automáticamente
          }
        }
        return;
      }

      let parsedOptions = location.state?.options || { adult: 2, children: 0, childrenAges: [], room: 1 };
      let parsedDate = null;

      try {
        const opcionesParam = searchParams.get('opciones');
        if (opcionesParam) {
          parsedOptions = JSON.parse(decodeURIComponent(opcionesParam));
          setOptions(parsedOptions);
        } else if (location.state?.options) {
          parsedOptions = location.state.options;
        }

        const fechasParam = searchParams.get('fechas');
        if (fechasParam && !location.state?.date) {
          const fechas = JSON.parse(decodeURIComponent(fechasParam));
          if (fechas?.[0]) {
            parsedDate = [{
              startDate: new Date(fechas[0].startDate),
              endDate: new Date(fechas[0].endDate),
              key: fechas[0].key || 'selection'
            }];
            setDate(parsedDate);
            const n = Math.ceil(Math.abs(parsedDate[0].endDate - parsedDate[0].startDate) / (1000 * 60 * 60 * 24));
            setNoches(n || 1);
          }
        }

        const destinoParam = searchParams.get('destino');
        if (destinoParam) {
          const dest = JSON.parse(decodeURIComponent(destinoParam));
          setDestination(dest);
        }
      } catch (error) {
        console.error("[Hotel] Error parsing URL params:", error);
      }

      const searchName = location.state?.searchEstablishmentName || 
                         nombre?.replaceAll("-", " ") ||            
                         null;

      if (!searchName && !idHotel) {
        setErrorMessage('No se pudo determinar el establecimiento a buscar');
        return;
      }

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      const searchDateStart = parsedDate?.[0]?.startDate || location.state?.date?.[0]?.startDate || today;
      const searchDateEnd = parsedDate?.[0]?.endDate || location.state?.date?.[0]?.endDate || tomorrow;

      const filtro = new Filtro();
      filtro.TipoDestino = "establecimiento";
      filtro.Fechas = {
        inicio: format(new Date(searchDateStart), "yyyy-MM-dd"),
        fin: format(new Date(searchDateEnd), "yyyy-MM-dd")
      };
      filtro.Pax = {
        adultos: parsedOptions.adult || 2,
        ninos: parsedOptions.children || 0,
        edadninos: parsedOptions.childrenAges || []
      };

      if (idHotel) {
        filtro.IdEstablecimiento = idHotel;
      } else {
        filtro.txtBusqueda = searchName;
      }

      try {
        const result = await getResultadoFiltro(filtro);
        
        if (result === 401) {
          localStorage.removeItem("datos");
          window.location.reload();
          return;
        }

        if (result?.Establecimientos?.length > 0) {
          let matchedEstablishment = result.Establecimientos[0];
          
          if (searchName && !idHotel) {
            const normalizedSearch = searchName.toLowerCase().trim();
            const exactMatch = result.Establecimientos.find(e => 
              e.Titulo?.toLowerCase().trim() === normalizedSearch
            );
            if (exactMatch) {
              matchedEstablishment = exactMatch;
            }
          }

          setEstablecimiento(matchedEstablishment);
          
          setDestination({
            Titulo: matchedEstablishment.Titulo,
            Tipo: 'establecimiento',
            Id: matchedEstablishment.IdEstablecimiento,
            Lugar: matchedEstablishment.Ciudad || matchedEstablishment.Lugar || ''
          });

          if (!idHotel) {
            setIdHotel(matchedEstablishment.IdEstablecimiento);
          }

          // Si no viene oferta seleccionada, buscar una relacionada
          if (!location.state?.OfertaSeleccionada) {
            const relatedOffer = await searchRelatedWineOffer(
              matchedEstablishment.Titulo, 
              matchedEstablishment.Ciudad
            );
            if (relatedOffer) {
              setOfertaSeleccionada(relatedOffer);
              setIncludeWineOffer(false); // Por defecto no incluir si se encontró automáticamente
            }
          }
        } else {
          setErrorMessage(`No se encontró el establecimiento "${searchName}"`);
        }
      } catch (error) {
        console.error('[Hotel] Error buscando establecimiento:', error);
        setErrorMessage('Error al buscar el establecimiento');
      }
    };

    initializeAndFetch();
  }, []);

  const dateCorrected = useRef(false);

  useEffect(() => {
    if (dateCorrected.current) return;
    if (date?.[0]?.startDate && new Date(date[0].startDate) < new Date()) {
      dateCorrected.current = true;
      const fechaActual = new Date();
      const fechaNueva = new Date(fechaActual);
      fechaNueva.setDate(fechaActual.getDate() + (noches || 1));

      setDate([{
        startDate: fechaActual,
        endDate: fechaNueva,
        key: date[0].key || 'selection'
      }]);
    }
  }, [date, noches]);

  if (!establecimiento) {
    return (
      <div className="h-screen w-screen flex flex-col justify-center items-center bg-white">
        {!codigo && (
          <img 
            src="https://visitaecuador.com/img/web/logo_verde.png" 
            style={{ width: "300px", height: "auto" }} 
            alt="Logo"
            className="mb-6"
          />
        )}
        
        {errorMessage ? (
          <div className="text-center px-4">
            <div className="text-red-500 text-lg mb-4">⚠️</div>
            <p className="text-gray-700 font-medium mb-2">{errorMessage}</p>
            <button 
              onClick={() => window.history.back()}
              className="mt-4 bg-greenVE-500 text-white px-6 py-2 rounded-lg hover:bg-greenVE-600"
            >
              Volver
            </button>
          </div>
        ) : (
          <>
            <div className="animate-spin w-14 h-14 border-t-4 border-greenVE-500 rounded-full"></div>
            <p className="text-gray-500 mt-4 text-sm">Cargando establecimiento...</p>
            
         
          </>
        )}
      </div>
    );
  }

  // Mobile View
  if (isMobile) {
    return (
      <div>
        {certPendientes > 0 && (
          <PendingBenefitsModal tipo={TYPE_CERTIFICADO} cantidad={certPendientes} />
        )}
        <Suspense><Navbar /></Suspense>
        
        {/* Banner Mobile */}
        <Suspense>
          <HotelBannerMobile 
            Titulo={establecimiento.Titulo}
            Catalogacion={establecimiento.Catalogacion}
            Galeria={establecimiento.Galeria} 
            Incluye={establecimiento.Incluye}
            NoIncluye={establecimiento.NoIncluye}
            Restricciones={establecimiento.Restricciones}
            SistemaServicios={establecimiento.SistemaServicios}
            esFavorito={establecimiento.Favorito === "false" ? false : true}
            IdEstablecimiento={establecimiento.IdEstablecimiento}
          />
        </Suspense>

        <div className='h-3 bg-gray-200' />

        {/* Wine Offer Mobile - Siempre que exista */}
        {ofertaSeleccionada && (
          <>
            <div className="px-3 py-4">
              <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse rounded-xl w-full"></div>}>
                <WineOfferRecommended
                  ofertaSeleccionada={ofertaSeleccionada}
                  establecimiento={establecimiento}
                  includeInReservation={includeWineOffer}
                  setIncludeInReservation={setIncludeWineOffer}
                  showCheckbox={true}
                />
              </Suspense>
            </div>
            <div className='h-3 bg-gray-200' />
          </>
        )}

        {/* Loading indicator para búsqueda de wine offer */}
        {wineOfferLoading && !ofertaSeleccionada && (
          <div className="px-3 py-4">
            <div className="h-32 bg-amber-50 animate-pulse rounded-xl w-full flex items-center justify-center">
              <span className="text-amber-600 text-sm">Buscando ofertas especiales...</span>
            </div>
          </div>
        )}

        {/* Search Mobile */}
        <Suspense>
          <HotelSearch 
            date={date} 
            options={options} 
            Establecimiento={establecimiento}
          />
        </Suspense>

        <div className='h-3 bg-gray-200' />

        {/* Map Mobile */}
        <Suspense>
          <HotelMap 
            className="z-10" 
            Latitud={establecimiento.Latitud} 
            Longitud={establecimiento.Longitud} 
            Direccion={establecimiento.Direccion} 
            Titulo={establecimiento.Titulo} 
            PrecioSinImpuestos={establecimiento.PrecioSinImpuestos}
          />
        </Suspense>

        <div className='h-3 bg-gray-200' />

        {/* Services Mobile */}
        <Suspense>
          <HotelServicesMain
            Titulo={establecimiento.Titulo}
            Incluye={establecimiento.Incluye}
            NoIncluye={establecimiento.NoIncluye}
            Restricciones={establecimiento.Restricciones}
            SistemaServicios={establecimiento.SistemaServicios}
            Adicionales={establecimiento.Adicionales}
          />
        </Suspense>

        <div className='h-3 bg-gray-200' />

        {/* Description Mobile */}
        <Suspense>
          <HotelDescription Descripcion={establecimiento.Descripcion} />
        </Suspense>

        <Suspense><Footer /></Suspense>
      </div>
    );
  }

  // Actualiza opciones, fechas y URL cuando el usuario busca desde la searchBar del hotel
  const handleSearchUpdate = ({ destination: newDest, date: newDate, options: newOptions }) => {
    setOptions(newOptions);
    setDate(newDate);
    if (newDest) setDestination(newDest);
    if (newDate?.[0]) {
      const n = Math.ceil(Math.abs(newDate[0].endDate - newDate[0].startDate) / (1000 * 60 * 60 * 24));
      setNoches(n || 1);
    }
    const newParams = new URLSearchParams(window.location.search);
    newParams.set('opciones', encodeURIComponent(JSON.stringify(newOptions)));
    newParams.set('fechas', encodeURIComponent(JSON.stringify(newDate)));
    window.history.replaceState(null, '', `${window.location.pathname}?${newParams.toString()}`);
  };

  // Desktop View
  return (
    <div>
      {certPendientes > 0 && (
        <PendingBenefitsModal tipo={TYPE_CERTIFICADO} cantidad={certPendientes} />
      )}
      <Suspense fallback={<NavbarSkeleton />}>
        <Navbar activo={1} />
      </Suspense>
      
      <div className="flex flex-col md:flex-row mx-auto max-w-6xl py-6 sm:px-6 lg:px-8">
        
        <div className="md:w-9/12">
          <Suspense><HotelGallery Galeria={establecimiento.Galeria} /></Suspense> 
        </div>
        <div className="md:w-3/12 ml-5 mb-5">
          <Suspense>
            <SearchBar type={2} Place={destination} Dates={date} Options={options} onSearch={handleSearchUpdate} />
          </Suspense>
          <Suspense>
            <HotelAdress Establecimiento={establecimiento} openMap={openMap} />
          </Suspense>
        </div>
      </div>
      <div className="flex mx-auto max-w-6xl py-0 sm:px-6 lg:px-8 ">
           <Suspense><HotelBanner Establecimiento={establecimiento} /></Suspense>
      </div>
      <div className="flex mx-auto max-w-6xl py-0 sm:px-6 lg:px-8 ">
        {establecimiento.Recomendados?.length > 0 && (
          <Suspense fallback={<div className="w-full h-32 bg-gray-100 animate-pulse rounded-lg"></div>}>
            <HotelRecommended
              Establecimiento={establecimiento}
              Noches={noches}
              Adultos={options?.adult || 2}
              Ninos={options?.children || 0}
              SetRecomendados={setClickRecomendados}
            />
          </Suspense>
        )}
      </div>
         {/* HotelWineOffer Desktop - Siempre que exista */}
      {ofertaSeleccionada && (
        <div className="flex justify-center w-full mx-auto max-w-6xl py-0 sm:px-6 lg:px-8">
          <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse rounded-xl w-full"></div>}>
            <WineOfferRecommended
              ofertaSeleccionada={ofertaSeleccionada}
              establecimiento={establecimiento}
              includeInReservation={includeWineOffer}
              setIncludeInReservation={setIncludeWineOffer}
              showCheckbox={true}
            />
          </Suspense>
        </div>
      )}

      {/* Loading indicator para búsqueda de wine offer */}
      {wineOfferLoading && !ofertaSeleccionada && (
        <div className="flex justify-center w-full mx-auto max-w-6xl py-4 sm:px-6 lg:px-8">
          <div className="h-20 bg-amber-50 animate-pulse rounded-xl w-full flex items-center justify-center border border-amber-200">
            <span className="text-amber-600 text-sm"> Buscando ofertas especiales de vino...</span>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row mx-auto max-w-6xl py-0 sm:px-6 lg:px-8">
        <div className="md:w-9/12 mt-5 mb-5">
          <Suspense><HotelDetails Establecimiento={establecimiento} /></Suspense>
        </div>
        <div className="flex flex-col md:w-3/12">
          {nivel === "suscriptor" && (
            <Suspense>
              <HotelContacts
                Contactos={establecimiento.Contactos}
                ContactosCentral={establecimiento.ContactosCentral}
              />
            </Suspense>
          )}
        </div>
      </div>

   

      <div className="flex mx-auto max-w-6xl py-0 sm:px-6 lg:px-8 mb-20">
        <Suspense>
          <HotelOfertas
            Establecimiento={establecimiento}
            Noches={noches}
            Fechas={date}
            Opciones={options}
            clickRecomendados={clickRecomendados}
            SetRecomendados={setClickRecomendados}
            OfertaSeleccionada={ofertaSeleccionada}
            includeWineOffer={includeWineOffer}
            setIncludeWineOffer={setIncludeWineOffer}
          />
        </Suspense>
      </div>

      <Suspense><Footer /></Suspense>
    </div>
  );
};

export default Hotel;