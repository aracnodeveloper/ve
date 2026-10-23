import { useState } from "react";
import { Spinner } from "@material-tailwind/react";
import { enviarContacto } from "../../controllers/contacto/contactoController";

const VACIO = {
    ci: "",
    nombres: "",
    email: "",
    telefonos: "",
    direccion: "",
    ciudad: "",
    pais: "",
    mensaje: "",
};

const Campo = ({ label, name, value, onChange, required, type = "text", placeholder }) => (
    <div className="flex flex-col items-start gap-1">
        <label className="text-sm text-gray-600 sm:text-right">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm outline-none transition-all
                       focus:border-greenVE-400 focus:ring-1 focus:ring-greenVE-200"
        />
    </div>
);

/**
 * Formulario de contacto reutilizable.
 * tipo: "contactoWeb" (tab Contacto) o "emprendedor" (tab Emprende con Nosotros). El backend
 * decide destinatarios y asunto segun el tipo. El mapa de Puntos de Carga tiene su propio
 * formulario (puntos_carga/SolicitudPuntoCarga).
 * textoBoton / textoExito permiten adaptar los textos sin duplicar el formulario.
 */
const ContactForm = ({
    tipo = "contactoWeb",
    titulo,
    subtitulo,
    textoBoton = "Enviar contacto",
    textoExito = "Gracias por escribirnos. Nos pondremos en contacto contigo si es necesario.",
    onCancelar,
}) => {
    const [datos, setDatos] = useState(VACIO);
    const [enviando, setEnviando] = useState(false);
    const [resultado, setResultado] = useState(null); // "ok" | "error" | null
    const [error, setError] = useState("");

    const onChange = (e) => setDatos((d) => ({ ...d, [e.target.name]: e.target.value }));

    const validar = () => {
        if (!datos.ci.trim()) return "Ingresa tu CI.";
        if (!datos.nombres.trim()) return "Ingresa tus nombres y apellidos.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email.trim())) return "Ingresa un email válido.";
        if (!datos.mensaje.trim()) return "Escribe tu mensaje.";
        return "";
    };

    const handleSubmit = async () => {
        if (enviando) return;
        const err = validar();
        if (err) {
            setError(err);
            return;
        }
        setError("");
        setEnviando(true);
        const ok = await enviarContacto(datos, tipo);
        setEnviando(false);
        if (ok) {
            setResultado("ok");
            setDatos(VACIO);
        } else {
            setResultado("error");
        }
    };

    const limpiar = () => {
        setDatos(VACIO);
        setError("");
        setResultado(null);
    };

    if (resultado === "ok") {
        return (
            <div className="flex flex-col items-center text-center gap-3 py-12">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="icon-[mdi--check-bold] h-7 w-7 text-green-600"></span>
                </div>
                <h3 className="font-bold text-lg text-gray-800">¡Mensaje enviado!</h3>
                <p className="text-sm text-gray-500 max-w-sm">{textoExito}</p>
                <button
                    onClick={() => setResultado(null)}
                    className="mt-2 text-sm font-medium text-greenVE-700 hover:text-greenVE-800"
                >
                    Enviar otro mensaje
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-5  p-3 rounded-lg">
            {/* Encabezado */}
            <div className="flex items-start gap-3">
                <div>
                    <h2 className="text-lg font-bold text-greenVE-800">{titulo}</h2>
                    <p className="text-sm text-gray-500">{subtitulo}</p>
                </div>
            </div>

            <div className="border-t border-gray-100"></div>

            {/* Campos + mensaje */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <Campo label="CI" name="ci" value={datos.ci} onChange={onChange} required placeholder="Cédula" />
                    <Campo label="Nombres / Apellidos" name="nombres" value={datos.nombres} onChange={onChange} required placeholder="Tus nombres" />
                    <Campo label="Email" name="email" value={datos.email} onChange={onChange} required type="email" placeholder="correo@ejemplo.com" />
                    <Campo label="Teléfonos" name="telefonos" value={datos.telefonos} onChange={onChange} placeholder="Teléfono de contacto" />
                    <Campo label="Dirección" name="direccion" value={datos.direccion} onChange={onChange} placeholder="Tu dirección" />
                    <Campo label="Ciudad" name="ciudad" value={datos.ciudad} onChange={onChange} placeholder="Ciudad" />
                    <Campo label="País" name="pais" value={datos.pais} onChange={onChange} placeholder="País" />
                </div>

                <div className="flex flex-col">
                    <label className="text-sm text-gray-600 mb-1">
                        Mensaje<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <textarea
                        name="mensaje"
                        value={datos.mensaje}
                        onChange={onChange}
                        placeholder="Escribe tu mensaje..."
                        className={`w-full flex-1 min-h-[200px] border border-gray-400 rounded-lg px-3 py-2 text-sm outline-none transition-all
                                   focus:border-greenVE-400 focus:ring-1 focus:ring-greenVE-200 resize-y`}
                    />
                </div>
            </div>

            {error && (
                <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {error}
                </div>
            )}
            {resultado === "error" && (
                <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    No se pudo enviar el mensaje. Intenta nuevamente.
                </div>
            )}

            {/* Botones */}
            <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                    onClick={handleSubmit}
                    disabled={enviando}
                    className="flex items-center justify-center gap-2 bg-greenVE-600 hover:bg-greenVE-700 disabled:opacity-60
                               text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 text-sm"
                >
                    {enviando ? (
                        <>
                            <Spinner color="white" className="h-4 w-4" />
                            <span>Enviando...</span>
                        </>
                    ) : (
                        <>
                            <span className="icon-[mdi--send] h-4 w-4"></span>
                            <span>{textoBoton}</span>
                        </>
                    )}
                </button>
                <button
                    onClick={onCancelar || limpiar}
                    disabled={enviando}
                    className="py-2.5 px-6 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-all"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
};

export default ContactForm;
