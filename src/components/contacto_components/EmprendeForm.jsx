import { useState } from "react";
import { Spinner } from "@material-tailwind/react";
import { enviarContacto } from "../../controllers/contacto/contactoController";

const VACIO = { ci: "", nombres: "", email: "", telefonos: "" };

// La imagen de marketing va de fondo (guardala en public/img/emprende-fondo.jpg).
const FONDO = "https://visitaecuador.com/img/web/emprende-fondo.png";

const CampoEmprende = ({ label, name, value, onChange, placeholder, type = "text" }) => (
    <div className="mb-3">
        <label className="block text-gray-700 text-xs font-bold mb-1">
            {label} <span className="text-red-500">*</span>
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 outline-none
                       focus:border-greenVE-500 focus:ring-1 focus:ring-greenVE-300"
        />
    </div>
);

/**
 * "Emprende con Nosotros" (tab 4). La imagen de marketing es el fondo; encima
 * solo se muestra la tarjeta con los campos. Envia con tipo "emprendedor".
 */
const EmprendeForm = () => {
    const [datos, setDatos] = useState(VACIO);
    const [enviando, setEnviando] = useState(false);
    const [resultado, setResultado] = useState(null); // "ok" | "error" | null
    const [error, setError] = useState("");

    const onChange = (e) => setDatos((d) => ({ ...d, [e.target.name]: e.target.value }));

    const validar = () => {
        if (!datos.ci.trim()) return "Coloca tu cédula de identidad.";
        if (!datos.nombres.trim()) return "Ingresa tus nombres y apellidos.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email.trim())) return "Ingresa un email válido.";
        if (!datos.telefonos.trim()) return "Ingresa tu número de celular.";
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
        const ok = await enviarContacto(
            {
                ...datos,
                mensaje:
                    `Nuevo interesado en emprender:\n` +
                    `Identidad: ${datos.ci}\n` +
                    `Nombres: ${datos.nombres}\n` +
                    `Email: ${datos.email}\n` +
                    `Móvil: ${datos.telefonos}`,
            },
            "emprendedor"
        );
        setEnviando(false);
        if (ok) {
            setResultado("ok");
            setDatos(VACIO);
        } else {
            setResultado("error");
        }
    };

    return (
        // -m-5 / -m-8 para ocupar todo el padding del contenedor de la pestaña.
        <div
            className="-m-5 md:-m-8 rounded-2xl overflow-hidden bg-greenVE-600 bg-cover bg-center flex items-center
                       min-h-[520px] md:min-h-0 md:aspect-[1535/1024]"
            style={{ backgroundImage: `url("${FONDO}")` }}
        >
            {/* Tarjeta del formulario, sobre el fondo, a la izquierda. */}
            <div className="w-full sm:w-[380px] m-4 sm:ml-8 md:ml-12 bg-transparent  rounded-2xl p-5 ">
                <h3 className="text-white font-bold text-lg mb-1">Ingresa tus datos</h3>


                {resultado === "ok" ? (
                    <div className="text-center py-6">
                        <span className="icon-[mdi--check-circle] h-10 w-10 text-green-500 mx-auto block"></span>
                        <p className="text-gray-800 font-bold mt-2">¡Datos enviados!</p>
                        <p className="text-gray-500 text-sm mt-1">Pronto nos pondremos en contacto contigo.</p>
                        <button
                            onClick={() => setResultado(null)}
                            className="mt-3 text-greenVE-700 text-sm font-medium hover:text-greenVE-800"
                        >
                            Enviar otro
                        </button>
                    </div>
                ) : (
                    <>
                        <CampoEmprende label="Identidad" name="ci" value={datos.ci} onChange={onChange} placeholder="Coloca tu cédula de identidad" />
                        <CampoEmprende label="Nombres Apellidos" name="nombres" value={datos.nombres} onChange={onChange} placeholder="Nombres y Apellidos" />
                        <CampoEmprende label="Email" name="email" value={datos.email} onChange={onChange} type="email" placeholder="Email" />
                        <CampoEmprende label="Móvil" name="telefonos" value={datos.telefonos} onChange={onChange} placeholder="Número de teléfono celular" />

                        {(error || resultado === "error") && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2 mb-3">
                                {error || "No se pudo enviar. Intenta nuevamente."}
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={enviando}
                            className="w-full inline-flex items-center justify-center gap-2 bg-[#96C121] hover:bg-[#7faf0d]
                                       disabled:opacity-60 text-white font-semibold rounded-md px-6 py-2.5 text-sm transition-all active:scale-95"
                        >
                            {enviando ? (
                                <>
                                    <Spinner color="white" className="h-4 w-4" />
                                    <span>Enviando...</span>
                                </>
                            ) : (
                                "Iniciar Ahora"
                            )}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default EmprendeForm;
