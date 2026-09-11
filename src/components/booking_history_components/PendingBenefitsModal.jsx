import { useNavigate } from "react-router-dom";
import { TYPE_TICKET } from "../../controllers/certificado/certificadoController";

/**
 * Modal bloqueante: si el usuario tiene certificados (tipo 1) o tickets (tipo 2)
 * en active=1 (sin marcar como usados ni eliminados), se le obliga a ir a
 * marcarlos antes de seguir en Hotel/Restaurant. No se puede cerrar: la unica
 * salida es ir al historial.
 *
 * tipo: 1 = certificados, 2 = tickets. cantidad = cuantos pendientes hay.
 */
const PendingBenefitsModal = ({ tipo, cantidad }) => {
    const navigate = useNavigate();
    const esTicket = Number(tipo) === TYPE_TICKET;

    const sustantivo = esTicket ? "ticket" : "certificado";
    const plural = cantidad === 1 ? sustantivo : `${sustantivo}s`;

    const irAMarcar = () => {
        // Se pasa el tab para que el historial abra directo en el tipo correcto.
        navigate("/historial", { state: { tab: Number(tipo) } });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div className="relative z-10 w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-amber-500 px-6 py-4 flex items-center gap-3">
                    <span className="icon-[mdi--alert-circle-outline] h-6 w-6 text-white flex-shrink-0"></span>
                    <h2 className="text-white font-bold text-base">
                        Tienes {plural} pendiente{cantidad === 1 ? "" : "s"}
                    </h2>
                </div>

                <div className="px-6 py-5">
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {cantidad === 1
                            ? `Tienes 1 ${sustantivo} generado que aún no has marcado como usado o no utilizado. `
                            : `Tienes ${cantidad} ${plural} generados que aún no has marcado como usados o no utilizados. `}
                        Debes gestionarlos en tu historial antes de continuar.
                    </p>
                </div>

                <div className="px-6 pb-5">
                    <button
                        onClick={irAMarcar}
                        className="w-full flex items-center justify-center gap-2 bg-greenVE-600 hover:bg-greenVE-700 text-white font-semibold py-3 rounded-xl transition-all active:scale-95"
                    >
                        <span className="icon-[mdi--clipboard-check-outline] h-5 w-5"></span>
                        Ir a gestionar {esTicket ? "mis tickets" : "mis certificados"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PendingBenefitsModal;
