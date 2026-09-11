import { useState } from "react";
import { createReservation, getCertificado, sendMailReservaExpress } from "../../../controllers/establecimiento/establecimientoController";
import { Spinner } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import Icons from "../../../global/icons";
import Config from "../../../global/config";
import HotelConfirmationDetail from "./HotelConfirmationDetail";
import { loginRemote } from "../../../controllers/suscripcion/suscripcionController";
import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { auth } from "../../../firebase";
import encodePass from "../../../global/encodePass";

const HotelExpress = ({ Ofertas, isOpen, Establecimiento, Fechas, Valores, OnClose, OnBack, Opciones, setCorrecto, correcto, WineOffer }) => {
    const contactosHotel = Establecimiento.Contactos;
    const contactosCentral = Establecimiento.ContactosCentral;
    const user = JSON.parse(localStorage.getItem('datos'));
    const id = user != null ? user.data.codigo : "";
    const nombre = user != null ? user.data.nombre : "";
    const nivel = user != null ? user.data.nivel : "";
    const ci = user != null ? user.data.ci : "";
    const email = user != null ? user.data.email : "";
    const celular = user != null ? user.data.celular : "";
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [cedula, setCedula] = useState(nivel == "express" ? ci : null);
    const [errorCedula, setErrorCedula] = useState(false);
    const [nombres, setNombres] = useState(nivel == "express" ? nombre : null);
    const [errorNombres, setErrorNombres] = useState(false);
    const [telefono, setTelefono] = useState(nivel == "express" ? celular : null);
    const [errorTelefono, setErrorTelefono] = useState(false);
    const [correo, setCorreo] = useState(nivel == "express" ? email : null);
    const [errorCorreo, setErrorCorreo] = useState(false);

    // Modal de login social como fallback
    const [showSocialLoginModal, setShowSocialLoginModal] = useState(false);
    const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
    const [isLoadingFB, setIsLoadingFB] = useState(false);
    const [socialLoginError, setSocialLoginError] = useState("");

    const gProvider = new GoogleAuthProvider();
    const fProvider = new FacebookAuthProvider();
    const icons = new Icons();

    // Obtener información de la WineOffer
    const getWineOfferInfo = () => {
        if (!WineOffer) return null;
        return {
            titulo: WineOffer.TituloOferta || WineOffer.title || 'Oferta Ruta del Vino',
            precio: parseFloat(WineOffer.price || WineOffer.Precio || 0),
            imagen: WineOffer.FotoPrincipal || WineOffer.image || '',
            descripcion: WineOffer.Detalle || WineOffer.description || '',
            idOferta: WineOffer.IdOferta || WineOffer.id,
            inventarios: WineOffer.inventories || WineOffer.Inventarios || [],
        };
    };

    const wineOfferInfo = getWineOfferInfo();

    function formatDateToAAAAMMDD(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    }

    if (!isOpen) return null;

    // ─── Lógica central de reserva (se llama después de tener sesión) ──────────
    const ejecutarReserva = async (correoReserva) => {
        var total = 0;
        var datosReserva = {
            id_tbl_estado_reserva: 1,
            id_empresa: 1,
        };

        var listaOfertas = [];
        for (const oferta of Ofertas) {
            listaOfertas.push({
                "id_tbl_establecimiento": oferta.IdEstablecimiento,
                "id_tbl_info_indice_oferta": oferta.Id,
                "adultos": oferta.Adultos,
                "ninos": oferta.Ninos ? oferta.Ninos : "0",
                "cantidad_ofertas": oferta.NumOfertas,
                "fecha_inicio": formatDateToAAAAMMDD(Fechas[0].startDate),
                "fecha_fin": formatDateToAAAAMMDD(Fechas[0].endDate),
                "precio_total": oferta.Final * parseInt(oferta.NumOfertas),
                "edades_ninos": Opciones.childrenAges.join(",")
            });
            total += oferta.Final * parseInt(oferta.NumOfertas);
        }

        if (wineOfferInfo) {
            datosReserva.wine_offer = {
                id_oferta_vino: wineOfferInfo.idOferta,
                titulo: wineOfferInfo.titulo,
                precio: wineOfferInfo.precio,
                regalos: wineOfferInfo.inventarios.map(i => ({
                    nombre: i.name,
                    precio: i.price || 0
                }))
            };
            total += wineOfferInfo.precio;
        }

        datosReserva.total_reserva = total;

        const res = await createReservation(datosReserva, listaOfertas);
        if (res && res.estado) {
            sendMailReservaExpress(correoReserva, res.data.id_tbl_reserva);
            setCorrecto(true);
            OnClose();
        } else {
            alert("Ha ocurrido un error, intente nuevamente o escriba a nuestra central de reservas");
        }
    };

    // ─── Login social → continuar reserva ─────────────────────────────────────
    const handleSocialLogin = async (provider, setLoadingFn, metodo, idMetodo) => {
        setSocialLoginError("");
        setLoadingFn(true);
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const random = () => Math.floor(Math.random() * 100);
            const randomStr = Array.from({ length: 7 }, () => random()).join('');
            const username = user.displayName ?? ('usuario' + randomStr.substring(0, 6));
            const userEmail = user.email ?? '';
            const uid = user.uid ?? randomStr;
            const pass = encodePass(userEmail);

            if (userEmail.trim() === '') {
                setSocialLoginError("Correo inválido, intente con otra cuenta.");
                setLoadingFn(false);
                return;
            }

            const params = {
                "id": uid,
                "pass": pass,
                "servicio": Config.SERVICIO,
                "metodo": metodo,
                "username": username,
                "nombre": username,
                "email": userEmail,
                "id_servicio": Config.IDSERVICIO,
                "id_metodo": idMetodo,
            };

            const loginResult = await loginRemote(params);
            if (loginResult) {
                setLoadingFn(false);
                setShowSocialLoginModal(false);
                // Continuar con la reserva usando el correo del usuario social
                await ejecutarReserva(userEmail);
                setIsLoading(false);
            } else {
                setSocialLoginError("Ha ocurrido un error al iniciar sesión. Intente nuevamente.");
                setLoadingFn(false);
            }
        } catch (error) {
            setSocialLoginError("Ha ocurrido un error. Intente nuevamente.");
            setLoadingFn(false);
        }
    };

    const handleClickGoogle = () =>
        handleSocialLogin(gProvider, setIsLoadingGoogle, Config.METODO_EX_GO, Config.IDMETODO_EX_GO);

    const handleClickFacebook = () =>
        handleSocialLogin(fProvider, setIsLoadingFB, Config.METODO_EX_FB, Config.IDMETODO_EX_FB);

    // ─── Flujo principal de reserva ───────────────────────────────────────────
    const handleClickReservar = () => {
        var error = false;
        if (!cedula) { setErrorCedula(true); error = true; } else { setErrorCedula(false); }
        if (!telefono) { setErrorTelefono(true); error = true; } else { setErrorTelefono(false); }
        if (!nombres) { setErrorNombres(true); error = true; } else { setErrorNombres(false); }
        if (!correo) { setErrorCorreo(true); error = true; } else { setErrorCorreo(false); }

        if (!error) {
            setIsLoading(true);
            var nom = "";
            var ape = "";
            var arrayNom = nombres.split(" ");

            if (arrayNom.length == 4) { nom = `${arrayNom[0]} ${arrayNom[1]}`; ape = `${arrayNom[2]} ${arrayNom[3]}`; }
            if (arrayNom.length == 3) { nom = `${arrayNom[0]}`; ape = `${arrayNom[1]} ${arrayNom[2]}`; }
            if (arrayNom.length == 2) { nom = `${arrayNom[0]}`; ape = `${arrayNom[1]}`; }

            const params = {
                "id": cedula,
                "pass": cedula.slice(0, 5),
                "servicio": Config.SERVICIO,
                "metodo": Config.METODO_EXPRESS,
                "username": nom,
                "nombre": nom,
                "apellido": ape,
                "email": correo,
                "identificacion": cedula,
                "telefono": telefono,
                "id_servicio": Config.IDSERVICIO,
                "id_metodo": Config.IDMETODO_EXPRESS,
                "id_lugar": 297
            };

            loginRemote(params)
                .then(async (result) => {
                    if (result) {
                        await ejecutarReserva(correo);
                        setIsLoading(false);
                    } else {
                        // loginRemote falló → mostrar modal de login social
                        setIsLoading(false);
                        setShowSocialLoginModal(true);
                    }
                })
                .catch(() => {
                    setIsLoading(false);
                    setShowSocialLoginModal(true);
                });
        }
    };

    return (
        <>
            <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => !isLoading && OnClose()}
                />

                {/* Modal */}
                <div className="relative w-full sm:w-3/4 lg:w-2/3 xl:w-1/2 2xl:w-5/12 mx-auto z-50
                                max-h-[95vh] sm:max-h-[90vh] flex flex-col
                                rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl bg-white">
                    
                    {/* ── Header ── */}
                    <div className="bg-greenVE-600 px-5 pt-4 pb-4 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {OnBack && (
                                    <button
                                        onClick={() => !isLoading && OnBack()}
                                        disabled={isLoading}
                                        className="bg-white/20 hover:bg-white/30 text-white rounded-full h-8 w-8 flex items-center justify-center transition-colors flex-shrink-0"
                                    >
                                        <span className="icon-[ep--back] w-4 h-4"></span>
                                    </button>
                                )}
                                <div>
                                    <h2 className="text-white text-lg font-bold leading-tight">Confirmar Reserva</h2>
                                    <p className="text-white/80 text-xs mt-0.5">Completa los datos para tu reserva</p>
                                </div>
                            </div>
                            <button
                                onClick={() => !isLoading && OnClose()}
                                disabled={isLoading}
                                className="bg-white/20 hover:bg-white/30 text-white rounded-full h-8 w-8 flex items-center justify-center transition-colors flex-shrink-0"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* ── Contenido scrollable ── */}
                    <div className="flex-1 overflow-y-auto px-4 py-4">

                            <HotelConfirmationDetail
                                Ofertas={Ofertas}
                                isOpen={isOpen}
                                Establecimiento={Establecimiento}
                                Fechas={Fechas}
                                Valores={Valores}
                                OnClose={OnClose}
                                Opciones={Opciones}
                                WineOffer={WineOffer}
                            />

                            {/* Sección de Wine Offer */}
                            {wineOfferInfo && (
                                <div className="border mb-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg overflow-hidden">
                                    <div className="bg-amber-500 px-3 py-2">
                                        <label className="text-white font-medium text-sm flex items-center gap-2">
                                            Oferta Ruta del Vino Incluida
                                        </label>
                                    </div>
                                    <div className="p-3">
                                        <div className="flex items-start gap-3">
                                            {wineOfferInfo.imagen && (
                                                <img
                                                    src={wineOfferInfo.imagen}
                                                    alt={wineOfferInfo.titulo}
                                                    className="w-14 h-14 object-cover rounded-lg"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-800 text-sm">{wineOfferInfo.titulo}</h4>
                                                {wineOfferInfo.inventarios.length > 0 && (
                                                    <div className="mt-1">
                                                        <span className="text-xs text-amber-700">🎁 Regalos: </span>
                                                        <span className="text-xs text-gray-600">
                                                            {wineOfferInfo.inventarios.map(i => i.name).join(', ')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            {wineOfferInfo.precio > 0 && (
                                                <div className="text-right">
                                                    <span className="text-lg font-bold text-amber-600">
                                                        ${wineOfferInfo.precio.toFixed(2)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="rounded-xl border border-gray-100 overflow-hidden mb-3 shadow-sm mt-2">
                                <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5 flex items-center gap-2">
                                    <span className="icon-[mdi--account] h-4 w-4 text-greenVE-600"></span>
                                    <h3 className="text-sm font-semibold text-gray-700">Datos del titular</h3>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input disabled={nivel == "express"} value={cedula} onChange={(e) => setCedula(e.target.value)} className={`${nivel == "express" ? "bg-gray-100 text-gray-500" : "bg-white"} border ${errorCedula ? "border-red-500" : "border-gray-200 focus:border-greenVE-500"} px-3 py-2 rounded-lg outline-none w-full text-sm`} type="text" placeholder="Cédula" />
                                        <input disabled={nivel == "express"} value={telefono} onChange={(e) => setTelefono(e.target.value)} className={`${nivel == "express" ? "bg-gray-100 text-gray-500" : "bg-white"} border ${errorTelefono ? "border-red-500" : "border-gray-200 focus:border-greenVE-500"} px-3 py-2 rounded-lg outline-none w-full text-sm`} type="text" placeholder="Teléfono o celular" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input disabled={nivel == "express"} value={nombres} onChange={(e) => setNombres(e.target.value)} className={`${nivel == "express" ? "bg-gray-100 text-gray-500" : "bg-white"} border ${errorNombres ? "border-red-500" : "border-gray-200 focus:border-greenVE-500"} px-3 py-2 rounded-lg outline-none w-full text-sm`} type="text" placeholder="Nombres y apellidos" />
                                        <input disabled={nivel == "express"} value={correo} onChange={(e) => setCorreo(e.target.value)} className={`${nivel == "express" ? "bg-gray-100 text-gray-500" : "bg-white"} border ${errorCorreo ? "border-red-500" : "border-gray-200 focus:border-greenVE-500"} px-3 py-2 rounded-lg outline-none w-full text-sm`} type="text" placeholder="Correo electrónico" />
                                    </div>
                                </div>
                            </div>

                    </div>
                    {/* ── Footer navegación ── */}
                    <div className="bg-white border-t border-gray-100 px-4 py-3 flex gap-3 flex-shrink-0 justify-end">
                        <button
                            className="bg-greenVE-500 hover:bg-greenVE-600 transition-colors px-6 py-2.5 text-white font-semibold rounded-xl w-full sm:w-auto shadow-md"
                            onClick={isLoading ? () => {} : handleClickReservar}
                        >
                            {isLoading ? (
                                <span className="icon-[line-md--loading-twotone-loop] h-5 w-5"></span>
                            ) : (
                                "Generar reserva"
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Modal de Login Social (fallback cuando loginRemote falla) ── */}
            {showSocialLoginModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-black opacity-60" onClick={() => setShowSocialLoginModal(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl p-8 mx-6 w-full max-w-sm z-10">

                        {/* Cerrar */}
                        <button
                            className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none"
                            onClick={() => setShowSocialLoginModal(false)}
                        >
                            ×
                        </button>

                        {/* Ícono y título */}
                        <div className="flex flex-col items-center gap-2 mb-6">
                            <div className="bg-amber-100 rounded-full p-3">
                                <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold text-gray-800 text-center">
                                Inicia sesión para continuar
                            </h2>
                            <p className="text-sm text-gray-500 text-center">
                                No encontramos tu cuenta. Inicia sesión con Google o Facebook para completar tu reserva.
                            </p>
                        </div>

                        {/* Botones sociales */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleClickGoogle}
                                disabled={isLoadingGoogle || isLoadingFB}
                                className="flex items-center justify-center gap-3 w-full border-2 border-gray-200 hover:border-greenVE-400 hover:bg-gray-50 rounded-xl px-4 py-3 transition-all disabled:opacity-50"
                            >
                                {isLoadingGoogle ? (
                                    <span className="icon-[line-md--loading-twotone-loop] h-5 w-5 text-greenVE-500"></span>
                                ) : (
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                )}
                                <span className="text-sm font-medium text-gray-700">Continuar con Google</span>
                            </button>

                            <button
                                onClick={handleClickFacebook}
                                disabled={isLoadingGoogle || isLoadingFB}
                                className="flex items-center justify-center gap-3 w-full border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl px-4 py-3 transition-all disabled:opacity-50"
                            >
                                {isLoadingFB ? (
                                    <span className="icon-[line-md--loading-twotone-loop] h-5 w-5 text-blue-600"></span>
                                ) : (
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                )}
                                <span className="text-sm font-medium text-gray-700">Continuar con Facebook</span>
                            </button>
                        </div>

                        {/* Error */}
                        {socialLoginError && (
                            <p className="mt-4 text-xs text-red-500 text-center">{socialLoginError}</p>
                        )}

                        <p className="mt-5 text-xs text-gray-400 text-center">
                            Al continuar, tu reserva se procesará automáticamente.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default HotelExpress;