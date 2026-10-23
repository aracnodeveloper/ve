import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import EditOfferModal from "../admin/EditOfferModal";
import { getOfferTypeConfig } from "../../../core/offertTypeConfig";

const slugify = (text) => {
  if (!text) return "";
  const slug = text.toLowerCase().replaceAll(" - ", "-").replaceAll(" ", "-").replace(/[^a-z0-9\-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return encodeURIComponent(slug);
};

const WineOfferItem = ({ offer }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const typeConfig = getOfferTypeConfig(offer.type);
  // Leer scheduleDateTime de la URL actual para propagarlo al restaurante
  const _qp = new URLSearchParams(location.search);
  const scheduleDateTime = _qp.get('scheduleDateTime') || '';
  const [imageLoaded, setImageLoaded] = useState(false);
  const [openEditOffer, setOpenEditOffer] = useState(false);
  const [openEditInventory, setOpenEditInventory] = useState(false);
  const [inventoryToEdit, setInventoryToEdit] = useState(null);
  const [viewShare, setViewShare] = useState(false);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [shortUrl, setShortUrl] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [loadingShare, setLoadingShare] = useState(false);

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

  const handleClickWhatsapp = () => {
    const message = encodeURIComponent(
      "Descubre esta oferta: " +
        offer.title +
        " en VisitaEcuador.com ingresando aquí: " +
        shortUrl
    );
    const whatsappURL = `https://wa.me/?text=${message}`;
    window.open(whatsappURL);
  };

  const handleClickCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClickShare = (e) => {
    e.stopPropagation();
    setLoadingShare(true);
    if (shortUrl == null) {
      const tempShortUrl = window.location.origin + "/restaurante/" + offer.establishment.name;
      setViewShare(true);
      setShortUrl(tempShortUrl);
      setLoadingShare(false);
    } else {
      setViewShare(true);
      setLoadingShare(false);
    }
  };

  const handleClickAwayShare = (e) => {
    e.stopPropagation();
    setViewShare(false);
    setIsCopied(false);
  };

  const handleEditOffer = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenEditOffer(true);
  };

  const handleEditInventory = (e, inventory) => {
    e.preventDefault();
    e.stopPropagation();
    setInventoryToEdit(inventory);
    setOpenEditInventory(true);
  };

  const handleClickItem = () => {
    if (openEditOffer || openEditInventory) return;

    const establishment = offer.establishment || {};
    const establishmentName = establishment.name ;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const dateTmp = [{ 
      startDate: today.toISOString(), 
      endDate: tomorrow.toISOString(), 
      key: 'selection' 
    }];
    
    const opts = { adult: 1, children: 0, childrenAges: [], room: 1 };

    const mappedWineOffer = {
      TituloOferta: offer.title,
      FotoPrincipal: offer.image,
      Detalle: offer.description || offer.title,
      IdOferta: offer.id,
      id: offer.id,
      price: offer.price || 0,
      Precio: offer.price || 0,
      FinalSinImpuestos: offer.price || 0,
      Impuestos: offer.taxes || 0,
      date_st: offer.date_st,
      date_ed: offer.date_ed,
      inventories: offer.inventories || [],
      schedules: offer.schedules || [],
      type: offer.type || '',
      subType: offer.subType || '',
      wineEstablishment: {
        // UUID de vino_api: es el que se guarda en el ticket (tbl_certificado).
        id: establishment.id || offer.establishmentId,
        name: establishmentName,
        city: establishment.city,
        country: establishment.country
      }
    };

    const slug = slugify(establishmentName);
    const url = `/restaurante/${slug}/`;

    console.log('[WineOfferItem] Navegando al restaurante:', { 
      establishmentName, 
      slug,
      wineOffer: offer.title ,
      schedules: offer.schedules || [],
    });

    navigate(url, { 
      state: { 
        OfertaSeleccionada: mappedWineOffer,
        options: opts,
        date: dateTmp,
        searchEstablishmentName: establishmentName,
        fromWineOffer: true,
        scheduleDateTime,
      } 
    });
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

  // Soporte para días 0-6 (Dom=0) y 1-7 (Lun=1, Dom=7)
  const DAY_NAMES_0 = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const DAY_NAMES_1 = ["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const formatDayRange = (start, end) => {
    // Si algún valor es > 6 asumimos base 1 (1=Lun … 7=Dom)
    const useBase1 = start > 6 || end > 6;
    const names = useBase1 ? DAY_NAMES_1 : DAY_NAMES_0;
    const s = names[start] ?? start;
    const e = names[end] ?? end;
    return s === e ? s : `${s} – ${e}`;
  };

  const formatTime = (timeValue) => {
    if (!timeValue) return '';
    // Puede llegar como string "HH:MM:SS" o como Date ISO
    const str = typeof timeValue === 'string' ? timeValue : new Date(timeValue).toISOString();
    // Extraer HH:MM ya sea de "HH:MM:SS" o de la parte T de un ISO
    const timePart = str.includes('T') ? str.split('T')[1] : str;
    const [hh, mm] = timePart.split(':');
    const h = parseInt(hh, 10);
    const period = h >= 12 ? 'pm' : 'am';
    const h12 = h % 12 || 12;
    return `${h12}:${mm}${period}`;
  };

  const getDaysRemaining = () => {
    const now = new Date();
    const endDate = new Date(offer.date_ed);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <>
      {openEditOffer && (
        <EditOfferModal
          isOpen={openEditOffer}
          onClose={() => setOpenEditOffer(false)}
          offer={offer}
          onUpdated={(res) => {
            setOpenEditOffer(false);
            window.location.reload();
          }}
        />
      )}
      
      {openEditInventory && inventoryToEdit && (
        <EditOfferModal
          isOpen={openEditInventory}
          onClose={() => { setOpenEditInventory(false); setInventoryToEdit(null); }}
          mode="inventory"
          inventory={inventoryToEdit}
          onUpdated={() => { setOpenEditInventory(false); setInventoryToEdit(null); window.location.reload(); }}
        />
      )}

      {/* Overlay de fondo cuando el modal está abierto */}
      {viewShare && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={handleClickAwayShare}
        />
      )}

      <div
        className="bg-white rounded-xl border border-gray-200 hover:border-greenVE-400 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-visible group relative"
      >
        {/* Imagen con overlay de gradiente */}
        <div className="relative w-full md:h-52 h-40 overflow-hidden" onClick={handleClickItem}>
          {/* Skeleton loader */}
          {!imageLoaded && (
            <div className="animate-pulse absolute inset-0 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 h-full"></div>
          )}
          
          {/* Imagen */}
          <img
            src={offer.image}
            alt={offer.title}
            className={`absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Gradiente superior para mejor legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Badge de ubicación flotante */}
          {offer.establishment && (
            <div className="absolute top-3 left-3">
              <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-greenVE-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {offer.establishment.city ? (
                <span className="text-xs font-semibold text-gray-700">
                  {offer.establishment.city}
                </span>
                ): (
               <span className="text-xs font-semibold text-gray-700">
                  {offer.establishment.country}
                </span>
                )}
              </div>
            </div>
          )}

          {/* Badge de precio en la esquina superior derecha */}
          {offer.subType !== "burgerKing" ? (
            offer.price ? (
              <div className="absolute top-3 right-3">
                <div className={`${typeConfig.badgeBg} text-white px-3 py-1.5 rounded-full shadow-lg`}>
                  <span className="text-xs font-bold">{typeConfig.reserveLabel} ${offer.price}</span>
                </div>
              </div>
            ) : null
          ) : offer.subType === "burgerKing" ? (
            offer.price > 0 ? (
              <div className="absolute top-3 right-3">
                <div className={`${typeConfig.badgeBg} text-white px-3 py-1.5 rounded-full shadow-lg`}>
                  <span className="text-xs font-bold">15% de Descuento</span>
                </div>
              </div>
            ) : offer.price < 1 ? (
              <div className="absolute top-3 right-3">
                <div className={`${typeConfig.badgeBg} text-white px-3 py-1.5 rounded-full shadow-lg`}>
                  <span className="text-xs font-bold">Agrandado Gratis</span>
                </div>
              </div>
            ) : null
          ) : null}

          {/* Botón de editar admin */}
          {isAdmin() && (
            <button
              onClick={handleEditOffer}
              className="absolute bottom-3 right-3 bg-white/90 text-xs font-semibold py-1 px-2 rounded-md shadow-sm hover:bg-white z-10"
            >
              Editar
            </button>
          )}

          {/* Badge de días restantes */}
          {!isAdmin() && daysRemaining > 0 && daysRemaining <= 7 && (
            <div className="absolute bottom-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              ¡{daysRemaining} días!
            </div>
          )}

          {/* Badge de inventario/regalos */}
          {offer.inventories && offer.inventories.length > 0 && (
            <div className="absolute bottom-3 left-3">
              <div className="flex items-center gap-2 bg-amber-500/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 7h-1.209A4.92 4.92 0 0 0 19 5.5C19 3.57 17.43 2 15.5 2c-1.622 0-2.705 1.482-3.404 3.085C11.407 3.57 10.269 2 8.5 2 6.57 2 5 3.57 5 5.5c0 .596.079 1.089.209 1.5H4c-1.103 0-2 .897-2 2v2c0 1.103.897 2 2 2v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7c1.103 0 2-.897 2-2V9c0-1.103-.897-2-2-2zm-4.5-3c.827 0 1.5.673 1.5 1.5C17 7 16.374 7 16 7h-2.478c.511-1.576 1.253-3 1.978-3zM7 5.5C7 4.673 7.673 4 8.5 4c.888 0 1.714 1.525 2.198 3H8c-.374 0-1 0-1-1.5zM4 9h7v2H4V9zm2 11v-7h5v7H6zm12 0h-5v-7h5v7zm-5-9V9h7l.001 2H13z" />
                </svg>
                <span className="text-white text-xs font-semibold">
                  +{offer.inventories.length}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Contenido de la tarjeta */}
        <div className="p-4">
          {/* Nombre del establecimiento */}
          <div className="flex flex-wrap gap-2">
            
              {offer.establishment && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500 font-medium truncate">
                    {offer.establishment.name}
                  </span>
                </div>
              )}
              <div className="flex items-start gap-1">
                {Array(+(offer.establishment.rate)).fill(null).map((item, index) => (
                  <svg 
                    key={index} 
                    height="14px" 
                    width="14px" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    className="fill-current text-amber-400"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                ))}
              </div>
          </div>
          {/* Título de la oferta */}
          <h3 className="text-sm md:text-sm font-bold text-gray-800 line-clamp-2 min-h-[2.5rem] group-hover:text-greenVE-700 transition-colors">
            {offer.title}
          </h3>

          {/* Descripción expandible */}
          {offer.description && (
            <div className="-mt-2">
              <p className="text-xs text-gray-500 leading-relaxed">
                {expandedDescription
                  ? offer.description
                  : offer.description.length > 80
                  ? offer.description.slice(0, 80) + "…"
                  : offer.description}
              </p>
              {offer.description.length > 80 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedDescription((prev) => !prev);
                  }}
                  className="text-xs text-amber-600 hover:text-amber-700 font-semibold mt-0.5 transition-colors"
                >
                  {expandedDescription ? "Ver menos ▲" : "Ver más ▼"}
                </button>
              )}
            </div>
          )}
  { offer.subType != "burgerKing" && (
    <>
          {/* Schedules */}
          {offer.schedules && offer.schedules.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2.5">
              {offer.schedules.map((schedule, idx) => (
                <div key={idx} className={`flex items-center gap-1 ${offer.schedules.length > 1 ? 'text-[10px]' : 'text-xs'}  text-gray-600`}>
                  {/* Ícono reloj */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
                    <path d="M13 7h-2v5.414l3.293 3.293 1.414-1.414L13 11.586z"/>
                  </svg>
                  <span className="font-medium text-amber-700">
                    {formatDayRange(schedule.day_start, schedule.day_end)}
                  </span>
                  <span className="text-gray-400">·</span>
                  <span>
                    {formatTime(schedule.time_st)} – {formatTime(schedule.time_ed)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            /* Fallback: fechas si no hay schedules */
            <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
              </svg>
              <span>{formatDate(offer.date_st)} - {formatDate(offer.date_ed)}</span>
            </div>
          )}
      </>  )}
          {/* Separador sutil */}
          <div className="border-t border-gray-100 pt-3 mt-3">
            <div className="flex items-center justify-between relative">
              {/* Botón de compartir */}
              <button
                onClick={handleClickShare}
                className="flex items-center gap-1.5 text-gray-600 hover:text-greenVE-600 transition-colors relative z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span className="text-xs font-medium">Compartir</span>
              </button>

              {/* Modal de compartir */}
              {viewShare && (
                <div className="absolute right-0 -top-36 z-50">
                  <div className="bg-white border rounded-md shadow-xl p-2 w-56">
                    {/* Header con título y botón X */}
                    <div className="flex items-center justify-between mb-2 px-2">
                      <label className="font-semibold text-sm">
                        Compartir esta oferta
                      </label>
                      <button 
                        onClick={handleClickAwayShare}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    
                    {!isCopied ? (
                      <div
                        className="flex items-center gap-2 px-2 py-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClickCopy();
                        }}
                      >
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M21 8C21 6.34315 19.6569 5 18 5H10C8.34315 5 7 6.34315 7 8V20C7 21.6569 8.34315 23 10 23H18C19.6569 23 21 21.6569 21 20V8ZM19 8C19 7.44772 18.5523 7 18 7H10C9.44772 7 9 7.44772 9 8V20C9 20.5523 9.44772 21 10 21H18C18.5523 21 19 20.5523 19 20V8Z"
                            fill="#0F0F0F"
                          />
                          <path
                            d="M6 3H16C16.5523 3 17 2.55228 17 2C17 1.44772 16.5523 1 16 1H6C4.34315 1 3 2.34315 3 4V18C3 18.5523 3.44772 19 4 19C4.55228 19 5 18.5523 5 18V4C5 3.44772 5.44772 3 6 3Z"
                            fill="#0F0F0F"
                          />
                        </svg>
                        <label className="text-sm cursor-pointer">Copiar enlace</label>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-2 py-2 bg-green-50 rounded">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          stroke="#95c01f"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="#96c021"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M8.5 12.5L10.5 14.5L15.5 9.5"
                            stroke="#96c021"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <label className="text-sm text-greenVE-500">
                          Enlace copiado
                        </label>
                      </div>
                    )}
                    
                    <div
                      className="flex items-center gap-2 px-2 py-2 hover:bg-gray-50 rounded cursor-pointer mt-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClickWhatsapp();
                      }}
                    >
                      <svg
                        className="h-5 w-5"
                        fill="#000000"
                        viewBox="0 0 32 32"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M26.576 5.363c-2.69-2.69-6.406-4.354-10.511-4.354-8.209 0-14.865 6.655-14.865 14.865 0 2.732 0.737 5.291 2.022 7.491l-0.038-0.070-2.109 7.702 7.879-2.067c2.051 1.139 4.498 1.809 7.102 1.809h0.006c8.209-0.003 14.862-6.659 14.862-14.868 0-4.103-1.662-7.817-4.349-10.507l0 0zM16.062 28.228h-0.005c-0 0-0.001 0-0.001 0-2.319 0-4.489-0.64-6.342-1.753l0.056 0.031-0.451-0.267-4.675 1.227 1.247-4.559-0.294-0.467c-1.185-1.862-1.889-4.131-1.889-6.565 0-6.822 5.531-12.353 12.353-12.353s12.353 5.531 12.353 12.353c0 6.822-5.53 12.353-12.353 12.353h-0zM22.838 18.977c-0.371-0.186-2.197-1.083-2.537-1.208-0.341-0.124-0.589-0.185-0.837 0.187-0.246 0.371-0.958 1.207-1.175 1.455-0.216 0.249-0.434 0.279-0.805 0.094-1.15-0.466-2.138-1.087-2.997-1.852l0.010 0.009c-0.799-0.74-1.484-1.587-2.037-2.521l-0.028-0.052c-0.216-0.371-0.023-0.572 0.162-0.757 0.167-0.166 0.372-0.434 0.557-0.65 0.146-0.179 0.271-0.384 0.366-0.604l0.006-0.017c0.043-0.087 0.068-0.188 0.068-0.296 0-0.131-0.037-0.253-0.101-0.357l0.002 0.003c-0.094-0.186-0.836-2.014-1.145-2.758-0.302-0.724-0.609-0.625-0.836-0.637-0.216-0.010-0.464-0.012-0.712-0.012-0.395 0.010-0.746 0.188-0.988 0.463l-0.001 0.002c-0.802 0.761-1.3 1.834-1.3 3.023 0 0.026 0 0.053 0.001 0.079l-0-0.004c0.131 1.467 0.681 2.784 1.527 3.857l-0.012-0.015c1.604 2.379 3.742 4.282 6.251 5.564l0.094 0.043c0.548 0.248 1.25 0.513 1.968 0.74l0.149 0.041c0.442 0.14 0.951 0.221 1.479 0.221 0.303 0 0.601-0.027 0.889-0.078l-0.031 0.004c1.069-0.223 1.956-0.868 2.497-1.749l0.009-0.017c0.165-0.366 0.261-0.793 0.261-1.242 0-0.185-0.016-0.366-0.047-0.542l0.003 0.019c-0.092-0.155-0.34-0.247-0.712-0.434z" />
                      </svg>
                      <label className="text-sm cursor-pointer">Enviar por Whatsapp</label>
                    </div>
                  </div>
                </div>
              )}

              <div
                className="flex items-center gap-1.5 text-greenVE-600 font-semibold hover:gap-2 transition-all cursor-pointer"
                onClick={handleClickItem}
              >
                <span className="text-xs">Ver oferta</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WineOfferItem;