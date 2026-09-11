import { Suspense, useCallback, useEffect, useState } from "react";
import Footer from "../../components/global_components/footer/Footer";
import Navbar from "../../components/global_components/navbar/Navbar";
import {
    getCertificadosUsuario,
    getTicketsUsuario,
    marcarCertificadoUsado,
    eliminarCertificado,
    CERT_USADO,
    TYPE_CERTIFICADO,
    TYPE_TICKET,
} from "../../controllers/certificado/certificadoController";
import CertificateItem from "../../components/booking_history_components/CertificateItem";
import HistoryItemSkeleton from "../../components/booking_history_components/HistoryItemSkeleton";
import HistoryTabs from "../../components/booking_history_components/HistoryTabs";
import { invalidarBeneficios } from "../../global/oneShot";
import { sessionStatus } from "../../global/util";
import { Navigate, useLocation } from "react-router-dom";
import { NavbarSkeleton } from "../../components/global_components/Skeleton/Loadingkeleton";

const TABS = [
    {
        id: TYPE_CERTIFICADO,
        label: "Historial de certificados",
        titulo: "Historial de certificados",
        sustantivo: "certificado",
        vacio: "Aún no tienes certificados",
        ayuda: "Los certificados que generes al reservar un hospedaje aparecerán aquí.",
        icono: "icon-[ph--certificate-bold]",
        // Endpoint obtenerCertificado: resuelve establecimiento y oferta contra VE.
        fetch: (pagina, cantidad) => getCertificadosUsuario(pagina, cantidad, TYPE_CERTIFICADO),
    },
    {
        id: TYPE_TICKET,
        label: "Historial de tickets",
        titulo: "Historial de tickets",
        sustantivo: "ticket",
        vacio: "Aún no tienes tickets",
        ayuda: "Los tickets que generes al reservar en un restaurante aparecerán aquí.",
        icono: "icon-[ph--ticket-bold]",
        // Endpoint obtenerTicket (original): los ids son UUIDs de vino_api.
        fetch: (pagina, cantidad) => getTicketsUsuario(pagina, cantidad),
    },
];

const BookHistory = () => {
    const location = useLocation();
    // Tab inicial: si se llega desde el modal de pendientes, abre en ese tipo.
    const tabInicial = TABS.some((t) => t.id === location.state?.tab)
        ? location.state.tab
        : TYPE_CERTIFICADO;
    const [tab, setTab] = useState(tabInicial);
    // Un cache por tipo para no re-consultar al alternar entre tabs.
    const [datos, setDatos] = useState({});

    const tabActual = TABS.find((t) => t.id === tab);
    const lista = datos[tab];

    const fetchData = useCallback(async (tipo) => {
        const config = TABS.find((t) => t.id === tipo);
        const res = await config.fetch(1, 20);
        if (res === 401) {
            localStorage.removeItem("datos");
            window.location.reload();
            return;
        }
        setDatos((prev) => ({ ...prev, [tipo]: res?.lista ?? [] }));
    }, []);

    useEffect(() => {
        if (datos[tab] === undefined) fetchData(tab);
    }, [tab, datos, fetchData]);

    const actualizarLista = (fn) =>
        setDatos((prev) => ({ ...prev, [tab]: fn(prev[tab] ?? []) }));

    const handleMarcarUsado = async (id) => {
        const ok = await marcarCertificadoUsado(id);
        if (ok) {
            // Se acaba de consumir un beneficio: el cache de OneShot quedo viejo.
            invalidarBeneficios();
            actualizarLista((items) =>
                items.map((c) =>
                    c.id_tbl_certificado === id
                        ? { ...c, is_active: CERT_USADO, used_at: new Date().toISOString() }
                        : c
                )
            );
        }
        return ok;
    };

    const handleEliminar = async (id) => {
        const ok = await eliminarCertificado(id);
        if (ok) {
            actualizarLista((items) => items.filter((c) => c.id_tbl_certificado !== id));
        }
        return ok;
    };

    if (!sessionStatus()) return <Navigate to="/" />;

    const isVinos = location.pathname === "/vinos";


    return (
        <div>
            <Suspense fallback={<NavbarSkeleton />}>
                {isVinos ? (<Navbar activo={4} />)
                    : (<Navbar activo={1} />)}
            </Suspense>


            <HistoryTabs
                tabs={TABS.map(({ id, label }) => ({ id, label }))}
                activo={tab}
                onChange={setTab}
            />

            <div className="flex flex-col mx-5 md:mx-auto max-w-6xl py-6 sm:px-6 lg:px-8 gap-7">
                <div className="flex flex-col gap-3">
                    <h1 className="font-semibold text-3xl">{tabActual.titulo}</h1>

                    <div className="bg-greenVE-50 border border-greenVE-100 rounded-xl p-4 flex gap-3">
                        <span className="icon-[mdi--information-outline] h-5 w-5 text-greenVE-600 flex-shrink-0 mt-0.5"></span>
                        <div className="text-sm text-gray-600 leading-relaxed space-y-2">
                            <p>
                                Te pedimos gestionar tus {tabActual.sustantivo}s para dar veracidad a
                                las reservas y garantizar que cada beneficio se use de forma real.
                            </p>
                            <div className="flex items-start gap-2">
                                <span className="icon-[mdi--check-circle-outline] h-4 w-4 text-greenVE-600 flex-shrink-0 mt-0.5"></span>
                                <p>
                                    <span className="font-semibold text-gray-700">Marcar como usado:</span> confirma
                                    que ya utilizaste tu {tabActual.sustantivo}. Al hacerlo, tu reserva
                                    queda registrada como válida. Esta acción no se puede deshacer.
                                </p>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="icon-[mdi--close-circle-outline] h-4 w-4 text-red-500 flex-shrink-0 mt-0.5"></span>
                                <p>
                                    <span className="font-semibold text-gray-700">Eliminar:</span> solo disponible
                                    si aún no lo has usado. Úsalo únicamente si generaste el {tabActual.sustantivo} por
                                    error. Una vez marcado como usado ya no se puede eliminar.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-5">
                    {lista === undefined ? (
                        Array.from({ length: 5 }, (_, index) => <HistoryItemSkeleton key={index} />)
                    ) : lista.length === 0 ? (
                        <div className="flex flex-col items-center text-center gap-2 py-16 border border-dashed rounded-lg">
                            <span className={`${tabActual.icono} h-10 w-10 text-gray-300`}></span>
                            <p className="font-medium text-gray-600">{tabActual.vacio}</p>
                            <p className="text-sm text-gray-400">{tabActual.ayuda}</p>
                        </div>
                    ) : (
                        lista.map((item) => (
                            <CertificateItem
                                key={item.id_tbl_certificado}
                                certificado={item}
                                onMarcarUsado={handleMarcarUsado}
                                onEliminar={handleEliminar}
                            />
                        ))
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default BookHistory;
