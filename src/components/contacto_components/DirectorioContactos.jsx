import { useMemo, useState } from "react";

// Directorio de extensiones. Lista estatica (no hay endpoint).
const CONTACTOS = [
    { cargo: "Recepción", ext: "100", nombre: "Paula Calle", correo: "recepcion@visitaecuador.com" },
    { cargo: "Gerencia", ext: "101", nombre: "Bernardo Polo", correo: "gerencia@visitaecuador.com" },
    { cargo: "Subgerencia", ext: "102", nombre: "María Andrea Cordero", correo: "subgerencia@visitaecuador.com" },
    { cargo: "Contabilidad 2", ext: "103", nombre: "Carla Moscoso", correo: "contabilidad2@visitaecuador.com" },
    { cargo: "Contabilidad", ext: "104", nombre: "Katherine Garcia", correo: "contabilidad3@visitaecuador.com" },
    { cargo: "Desarrollo", ext: "106", nombre: "Anthony Ramos", correo: "webdeveloper@visitaecuador.com" },
    { cargo: "Soporte informática", ext: "109", nombre: "Pablo Vicuña", correo: "soporte@visitaecuador.com" },
    { cargo: "Asistente de Gerencia", ext: "112", nombre: "Leonor Sarasti", correo: "asistente@visitaecuador.com" },
    { cargo: "Diseño", ext: "117", nombre: "Iván Sánchez", correo: "diseno@visitaecuador.com" },
    { cargo: "Jefe Ventas Sala", ext: "123", nombre: "Jimmy Rosero", correo: "gerencianorte@visitaecuador.com" },
    { cargo: "Gerente ventas", ext: "170", nombre: "Bernardo Andrés Polo", correo: "gventas@visitaecuador.com" },
    { cargo: "Reservas Gye", ext: "208", nombre: "Denisse Vallejo", correo: "reservasgye@visitaecuador.com" },
];

const DirectorioContactos = () => {
    const [q, setQ] = useState("");

    const filtrados = useMemo(() => {
        const t = q.trim().toLowerCase();
        if (!t) return CONTACTOS;
        return CONTACTOS.filter((c) =>
            [c.cargo, c.ext, c.nombre, c.correo].some((v) => v.toLowerCase().includes(t))
        );
    }, [q]);

    return (
        <div className="space-y-5">
            {/* Encabezado */}
            <div className="flex items-start gap-3">

                <div>
                    <h2 className="text-lg font-bold text-greenVE-800">Directorio Club Visita</h2>

                </div>
            </div>

            {/* Buscador */}
            <div className="relative max-w-md">
                <span className="icon-[ph--magnifying-glass] h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"></span>
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Buscar por nombre, cargo, extensión o correo..."
                    className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm outline-none transition-all
                               focus:border-greenVE-400 focus:ring-1 focus:ring-greenVE-200"
                />
            </div>

            {/* Tabla (desktop) */}
            <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-greenVE-50 text-greenVE-800">
                            <th className="text-left font-semibold px-4 py-2.5">Cargo</th>
                            <th className="text-left font-semibold px-4 py-2.5">Extensión</th>
                            <th className="text-left font-semibold px-4 py-2.5">Nombre</th>
                            <th className="text-left font-semibold px-4 py-2.5">Correo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtrados.map((c) => (
                            <tr key={c.ext} className="border-t border-gray-100 hover:bg-gray-50">
                                <td className="px-4 py-2.5 text-gray-700">{c.cargo}</td>
                                <td className="px-4 py-2.5">
                                    <span className="inline-flex items-center justify-center min-w-[40px] bg-greenVE-100 text-greenVE-700 font-bold rounded-full px-2 py-0.5">
                                        {c.ext}
                                    </span>
                                </td>
                                <td className="px-4 py-2.5 font-medium text-gray-800">{c.nombre}</td>
                                <td className="px-4 py-2.5">
                                    <a href={`mailto:${c.correo}`} className="text-greenVE-700 hover:text-greenVE-800 hover:underline">
                                        {c.correo}
                                    </a>
                                </td>
                            </tr>
                        ))}
                        {filtrados.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                                    Sin resultados
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Tarjetas (móvil) */}
            <div className="md:hidden space-y-2.5">
                {filtrados.map((c) => (
                    <div key={c.ext} className="border border-gray-200 rounded-xl p-3">
                        <div className="flex items-center justify-between">
                            <p className="font-bold text-gray-800 text-sm">{c.nombre}</p>
                            <span className="inline-flex items-center gap-1 bg-greenVE-100 text-greenVE-700 font-bold rounded-full px-2 py-0.5 text-xs">
                                <span className="icon-[ph--phone-fill] h-3 w-3"></span>
                                {c.ext}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{c.cargo}</p>
                        <a
                            href={`mailto:${c.correo}`}
                            className="inline-flex items-center gap-1 text-xs text-greenVE-700 mt-1.5"
                        >
                            <span className="icon-[ph--envelope-simple] h-3.5 w-3.5"></span>
                            {c.correo}
                        </a>
                    </div>
                ))}
                {filtrados.length === 0 && (
                    <p className="text-center text-gray-400 py-8">Sin resultados</p>
                )}
            </div>
        </div>
    );
};

export default DirectorioContactos;
