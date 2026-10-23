import "react-multi-carousel/lib/styles.css";
import WineOfferItem from "./WineOfferItem";
import React, { useEffect, useMemo, useState } from "react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { getWineOffers } from "../../../core/vinoApiService";
import { getOfferTypeConfig } from "../../../core/offertTypeConfig";
import { cumpleFiltrosVino } from "../../../core/filtrosVino";
import WineOfferItemSkeleton from "./WineOfferItemSkeleton";
import CreateOfferModal from "../admin/CreateoffertsModal";

const normalizeType = (type) => {
  if (!type || !type.trim()) return "rutas";
  const key = type.toLowerCase().trim();
  if (key === "vinos") return "rutas";
  return key;
};

const WineOffersBanner = ({ filters, offerType = 'rutas' }) => {
  const typeConfig = getOfferTypeConfig(offerType);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const isAdmin = () => {
    try {
      const idUsuario = localStorage.getItem('id_usuario');
      if (idUsuario) return idUsuario.toString() === '412';
      const datos = JSON.parse(localStorage.getItem('datos') || '{}');
      const idFromDatos = datos?.data?.id_usuario || datos?.id_usuario;
      return idFromDatos?.toString() === '412';
    } catch (e) {
      return false;
    }
  };

  const fetchData = async () => {
    try {
      const result = await getWineOffers();
      if (result) {
        const normalizedOfferType = normalizeType(offerType);
        const filtered = result.filter(o => normalizeType(o.type) === normalizedOfferType);
        setData(filtered);
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
      setError("No se pudieron cargar las ofertas");
    }
  };

  // ✅ FIX: resetea estado y vuelve a fetchear cada vez que cambia offerType
  useEffect(() => {
    setData(null);
    setError(null);
    fetchData();
  }, [offerType]);

  const handleOfferCreated = () => {
    fetchData();
  };

  // Lo que se muestra: las ofertas del tipo que cumplen los filtros de la barra de
  // búsqueda (ciudad o país, día y hora, calificación), con la misma regla que la
  // página de resultados.
  const visibles = useMemo(
    () => (data ? data.filter((o) => cumpleFiltrosVino(o, filters)) : null),
    [data, filters]
  );

  const CustomNextArrow = (props) => (
    <div
      className="-mr-3 absolute top-1/2 transform -translate-y-1/2 right-0 cursor-pointer rounded-full bg-gray-100 text-greenVE-600 text-lg h-8 w-8 flex items-center justify-center pl-1"
      onClick={props.onClick}
      style={{ filter: 'drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.5))' }}
    >
      <span className="icon-[material-symbols--arrow-forward-ios]"></span>
    </div>
  );

  const CustomPrevArrow = (props) => (
    <div
      className="-ml-3 z-40 absolute top-1/2 transform -translate-y-1/2 left-0 cursor-pointer rounded-full bg-gray-100 text-greenVE-600 text-lg pr-1 h-8 w-8 flex items-center justify-center"
      onClick={props.onClick}
      style={{ filter: 'drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.5))' }}
    >
      <span className="icon-[material-symbols--arrow-back-ios-new]"></span>
    </div>
  );

  const getSliderSettings = (itemCount) => ({
    dots: false,
    infinite: itemCount > 3,
    autoplay: itemCount > 3,
    autoplaySpeed: 5000,
    speed: 1000,
    rows: 1,
    slidesToShow: Math.min(3, itemCount),
    slidesToScroll: 1,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    responsive: [
      {
        breakpoint: 900,
        settings: {
          slidesToShow: Math.min(1, itemCount),
          infinite: itemCount > 1,
          autoplay: itemCount > 1,
        },
      },
      {
        breakpoint: 1150,
        settings: {
          slidesToShow: Math.min(2, itemCount),
          infinite: itemCount > 2,
          autoplay: itemCount > 2,
        },
      },
      {
        breakpoint: 1300,
        settings: {
          slidesToShow: Math.min(3, itemCount),
          infinite: itemCount > 3,
          autoplay: itemCount > 3,
        },
      },
    ],
  });

  const settings = getSliderSettings(visibles?.length || 0);

  return (
    <div className="pt-5 mx-5 md:mx-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {normalizeType(offerType) === 'tours' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${typeConfig.iconColor}`} viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${typeConfig.iconColor}`} viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 3l-.01 6.62c0 1.59.51 3.13 1.46 4.42l.05.07c.9 1.22 1.47 2.69 1.5 4.26V21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-2.63c.03-1.57.6-3.04 1.5-4.26l.05-.07c.95-1.29 1.46-2.83 1.46-4.42L17 3H6zm3.11 9.71l-.11.15c-.7.95-1.21 2.04-1.5 3.18-1.18-1.88-1.51-4.16-1.29-6.04h7.58c.22 1.88-.11 4.16-1.29 6.04-.29-1.14-.8-2.23-1.5-3.18l-.11-.15c-.52-.71-.89-1.54-.89-2.39V5h-2v5.33c0 .85-.37 1.68-.89 2.38z" />
            </svg>
          )}
          <h1 className="font-bold text-xl text-gray-800">
            {typeConfig.bannerTitle}
          </h1>
        </div>

        {isAdmin() && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-[#97C121] hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Nueva Oferta
          </button>
        )}
      </div>

      <div className="flex justify-between mb-4">
        <h6 className="text-md text-gray-600">
          {typeConfig.bannerSubtitle}
        </h6>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Skeleton mientras carga */}
      {!data && !error && (
        <div>
          <Slider {...getSliderSettings(5)}>
            {Array(5).fill(null).map((_, index) => (
              <div key={index} className="border-4 border-white">
                <WineOfferItemSkeleton />
              </div>
            ))}
          </Slider>
        </div>
      )}

      {/* Lista de ofertas. El key reinicia el carrusel al cambiar los resultados: si no,
          al pasar de muchas a pocas ofertas puede quedar parado en una posición vacía. */}
      {visibles && visibles.length > 0 && (
        <div>
          <Slider key={visibles.map((o) => o.id).join(",")} {...settings}>
            {visibles.map((offer, index) => (
              <div key={offer.id || index} className="border-4 border-white">
                <WineOfferItem offer={offer} />
              </div>
            ))}
          </Slider>
        </div>
      )}

      {/* Sin resultados */}
      {visibles && visibles.length === 0 && (
        <div className="text-center py-10 bg-amber-50 rounded-xl border border-amber-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-amber-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-600 font-medium">
            No se encontraron ofertas con los filtros seleccionados
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Intenta ajustar los filtros para ver más resultados
          </p>
        </div>
      )}

      {showCreateModal && (
        <CreateOfferModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleOfferCreated}
          offerType={offerType}
        />
      )}
    </div>
  );
};

export default WineOffersBanner;