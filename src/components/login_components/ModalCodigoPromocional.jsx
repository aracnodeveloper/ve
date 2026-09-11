import { useState } from "react";
import { Spinner } from "@material-tailwind/react";
import { validatePromocionalCode } from "../../controllers/suscripcion/suscripcionCodigoPromocional";

/**
 * Pide el código promocional al registrarse con Google o Facebook.
 *
 * Es el equivalente web del diálogo "Ingrese código promocional" que la app
 * muestra en fb_registration_ui.dart y google_registration_ui.dart: el código
 * es opcional, se valida antes de continuar y viaja como `cp` en el params de
 * loginpost. El backend solo lo aplica cuando crea el usuario
 * (subscriber.php -> createUsuario), asi que a quien ya tiene cuenta se le
 * ignora sin efecto.
 *
 * Aparece al tocar el botón de inicio rápido y, al continuar u omitir, es el
 * propio onConfirmar el que abre la ventana de Google/Facebook.
 *
 * @param {boolean}  abierto
 * @param {string}   proveedor      "google" | "facebook", para nombrarlo en el botón
 * @param {string}   codigoInicial  código que ya viene puesto (link compartido)
 * @param {Function} onConfirmar recibe el código validado ("" si se omitió)
 * @param {Function} onCancelar  cierra sin continuar el login
 */
const ModalCodigoPromocional = ({ abierto, proveedor, onConfirmar, onCancelar, codigoInicial = "" }) => {
    // Se siembra una sola vez: si el usuario llegó por un link con código, lo
    // encuentra ya escrito y solo tiene que continuar.
    const [codigo, setCodigo] = useState(codigoInicial);
    const [validando, setValidando] = useState(false);
    const [error, setError] = useState(null);

    if (!abierto) return null;

    const bloqueado = validando;
    const nombreProveedor = proveedor === "facebook" ? "Facebook" : "Google";

    const continuar = async () => {
        const limpio = codigo.trim();

        // Sin código es un caso válido: equivale a omitir.
        if (limpio === "") {
            onConfirmar("");
            return;
        }

        setError(null);
        setValidando(true);
        const res = await validatePromocionalCode(limpio);
        setValidando(false);

        // validatePromocionalCode devuelve la respuesta si el código existe,
        // false si no, y undefined si la petición falló.
        if (res && res.data) {
            onConfirmar(limpio);
        } else if (res === false) {
            setError("El código ingresado no existe.");
        } else {
            setError("No se pudo verificar el código. Intenta nuevamente.");
        }
    };

    const omitir = () => {
        setCodigo("");
        setError(null);
        onConfirmar("");
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <span className="icon-[iconamoon--certificate-badge] h-6 w-6 text-greenVE-600"></span>
                    <label className="font-semibold text-lg text-greenVE-700">
                        Código promocional
                    </label>
                </div>

                <label className="text-sm text-gray-600 leading-relaxed">
                    Si alguien te recomendó, ingresa su código para vincular tu cuenta y
                    obtener sus beneficios. Es opcional: al continuar te llevamos a
                    {" " + nombreProveedor} para iniciar sesión.
                </label>

                <input
                    autoFocus
                    type="text"
                    value={codigo}
                    disabled={bloqueado}
                    onChange={(e) => { setCodigo(e.target.value); setError(null); }}
                    onKeyDown={(e) => { if (e.key === "Enter" && !bloqueado) continuar(); }}
                    placeholder="Código opcional"
                    className="border-2 border-greenVE-500 rounded-md px-3 py-2 outline-none uppercase disabled:bg-gray-100"
                />

                {error && (
                    <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        <span className="icon-[fluent--error-circle-24-regular] text-red-500 h-4 w-4 flex-shrink-0"></span>
                        <label className="text-xs text-red-600 font-medium">{error}</label>
                    </div>
                )}

                <div className="flex gap-2 mt-1">
                    <button
                        disabled={bloqueado}
                        onClick={omitir}
                        className="flex-1 border border-gray-300 text-gray-600 rounded-md py-2 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
                    >
                        Omitir
                    </button>
                    <button
                        disabled={bloqueado}
                        onClick={continuar}
                        className="flex-1 bg-greenVE-500 hover:bg-greenVE-600 text-white rounded-md py-2 text-sm font-semibold flex justify-center items-center disabled:opacity-50"
                    >
                        {bloqueado ? <Spinner color="white" className="h-5 w-5" /> : "Continuar"}
                    </button>
                </div>

                <button
                    disabled={bloqueado}
                    onClick={onCancelar}
                    className="text-xs text-gray-400 hover:text-gray-600 mt-1 disabled:opacity-50"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
};

export default ModalCodigoPromocional;
