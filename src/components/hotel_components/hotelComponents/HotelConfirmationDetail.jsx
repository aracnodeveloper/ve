import { useState } from "react";
import { createReservation } from "../../../controllers/establecimiento/establecimientoController";
import { Spinner } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";

const HotelConfirmationDetail = ({ Ofertas, isOpen, Establecimiento, Fechas, Valores, OnClose, Opciones, WineOffer }) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const formatDate = (date) => {
        if (!date) return '-';
        const options = { weekday: 'short', day: '2-digit', month: 'short' };
        try {
            return new Date(date).toLocaleDateString('es-ES', options);
        } catch (e) {
            return '-';
        }
    };

    function formatDateToAAAAMMDD(date) {
        if (!date) return '';
        try {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}/${month}/${day}`;
        } catch (e) {
            return '';
        }
    }

    const getWineOfferInfo = () => {
        if (!WineOffer) return null;
        return {
            titulo: WineOffer.TituloOferta || WineOffer.title || 'Oferta Ruta del Vino',
            precio: parseFloat(WineOffer.price || WineOffer.Precio || 0),
            inventarios: WineOffer.inventories || WineOffer.Inventarios || [],
        };
    };

    const wineOfferInfo = getWineOfferInfo();

    const getWineOfferPrice = () => {
        if (!wineOfferInfo) return 0;
        return isNaN(wineOfferInfo.precio) ? 0 : wineOfferInfo.precio;
    };

    const getTotalConWineOffer = () => {
        const subtotalHospedaje = Valores.SinImpuestos || 0;
        const impuestos = Valores.Impuestos || 0;
        const wineOfferPrice = getWineOfferPrice();
        return subtotalHospedaje + impuestos + wineOfferPrice;
    };

    const handleClickAceptar = async () => {
        if (!isLoading) {
            if (!Fechas || !Fechas[0]) {
                console.error('Fechas is not defined. Cannot create reservation.');
                return;
            }
            setIsLoading(true);
            var correcto = true;
            try {
                for (const oferta of Ofertas) {
                    await createReservation(oferta.Id, Opciones.adult, Opciones.children, oferta.TotalOfertas, formatDateToAAAAMMDD(Fechas[0].startDate), formatDateToAAAAMMDD(Fechas[0].endDate), Opciones.childrenAges)
                        .then((res) => {
                            if (res) {
                                if (res == 401) {
                                    localStorage.removeItem("datos");
                                    window.location.reload();
                                }
                            } else {
                                correcto = false;
                            }
                        }).catch((error) => { console.error('createReservation error', error); });
                }
                setIsLoading(false);
                if (correcto) {
                    navigate("/historial");
                }
            } catch (e) {
                console.error(e);
                setIsLoading(false);
            }
        }
    };

    const Section = ({ icon, title, children }) => (
        <div className="rounded-xl border border-gray-100 overflow-hidden mb-3 shadow-sm">
            <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5 flex items-center gap-2">
                <span className={`${icon} h-4 w-4 text-greenVE-600`}></span>
                <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
            </div>
            <div className="p-4">{children}</div>
        </div>
    );

    return (
        <div className="space-y-1 mb-4">
            {/* Detalles del hotel */}
            <Section icon="icon-[mdi--hotel]" title="Detalles del hotel">
                <div className="p-3 space-y-2">
                    <p className="text-sm font-bold text-center">{Establecimiento.Titulo}</p>
                    <div className="flex flex-wrap justify-center gap-5">
                        <div className="flex items-center justify-center gap-1 text-greenVE-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs">{Establecimiento.Ciudad}</p>
                        </div>
                        <div className="flex justify-center gap-0.5">
                            {Array(+(Establecimiento.Catalogacion)).fill(null).map((item, index) => (
                                <svg key={index} height="14px" width="14px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="fill-current text-amber-400">
                                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                </svg>
                            ))}
                        </div>
                        </div>
                    <p className="text-xs text-center text-gray-600">{Establecimiento.Direccion}</p>
                </div>
            </Section>

            {/* Detalles de la reserva */}
            <Section icon="icon-[mdi--calendar-check]" title="Detalles de la reserva">
                    <div className="flex justify-start gap-10">
                        <div className="flex flex-wrap gap-3">
                            <p className="text-xs font-medium text-gray-600">Entrada:</p>
                            <p className="text-xs font-semibold">{formatDate(Fechas?.[0]?.startDate)}</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <p className="text-xs font-medium text-gray-600">Salida:</p>
                            <p className="text-xs font-semibold">{formatDate(Fechas?.[0]?.endDate)}</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                        <p className="text-xs font-medium mb-1">Habitaciones:</p>
                        {Ofertas.map((item, index) => (
                            <p key={index} className="text-xs text-gray-600 mb-1">
                                <span className="bg-greenVE-100 text-greenVE-700 font-semibold px-1.5 py-0.5 rounded mr-1">{item.NumOfertas}x</span>
                                {item.TituloOferta}
                            </p>
                        ))}
                    </div>
                    
                    {wineOfferInfo && (
                        <div className="pt-2 border-t border-amber-200">
                            <p className="text-xs font-medium text-amber-700 mb-1 flex items-center gap-1">
                                Ruta del Vino:
                            </p>
                            <p className="text-xs text-amber-600 font-medium ml-4">{wineOfferInfo.titulo}</p>
                            {wineOfferInfo.inventarios.length > 0 && (
                                <p className="text-xs text-gray-500 ml-4">
                                    🎁 {wineOfferInfo.inventarios.map(i => i.name).join(', ')}
                                </p>
                            )}
                        </div>
                    )}
            </Section>

            {/* Desglose de precios */}
            <Section icon="icon-[mdi--cash-multiple]" title="Desglose de precios">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal hospedaje/{wineOfferInfo && getWineOfferPrice() > 0 && (     <span> Vino</span>    )}:</span>
                        <span className="font-semibold">${Valores.SinImpuestos}</span>
                    </div>
                    
             
                    
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Impuestos / servicios:</span>
                        <span className="font-semibold">${Valores.Impuestos}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm border-t border-greenVE-200 pt-2">
                        <span className="font-bold text-greenVE-700">Total a pagar:</span>
                        <span className="font-bold text-greenVE-700">${Valores.SinImpuestos + Valores.Impuestos}</span>
                    </div>
                </div>
            </Section>
        </div>
    );
};

export default HotelConfirmationDetail;