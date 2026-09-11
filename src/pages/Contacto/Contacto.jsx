import React, { Suspense, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../../components/global_components/navbar/Navbar";
import Footer from "../../components/global_components/footer/Footer";
import ContactForm from "../../components/contacto_components/ContactForm";
import OficinasMap from "../../components/contacto_components/OficinasMap";
import EmprendeForm from "../../components/contacto_components/EmprendeForm";
import DirectorioContactos from "../../components/contacto_components/DirectorioContactos";

const TABS = [
    { id: "contacto", label: "Contacto", icono: "icon-[ph--phone-bold]" },
    { id: "directorio", label: "Directorio Club Visita", icono: "icon-[ph--address-book-bold]" },
    { id: "oficinas", label: "Oficinas", icono: "icon-[ph--map-pin-bold]" },
    { id: "emprende", label: "Emprende con Nosotros", icono: "icon-[ph--rocket-launch-bold]" },
];

const Contacto = () => {
    const location = useLocation();

    const getTabFromLocation = () => {
        const searchParams = new URLSearchParams(location.search);
        const queryTab = searchParams.get("tab");
        if (queryTab && TABS.some((t) => t.id === queryTab)) {
            return queryTab;
        }
        const hashTab = location.hash.replace("#", "");
        if (hashTab && TABS.some((t) => t.id === hashTab)) {
            return hashTab;
        }
        return "contacto";
    };

    const [tab, setTab] = useState(getTabFromLocation);

    useEffect(() => {
        setTab(getTabFromLocation());
    }, [location.search, location.hash]);

    return (
        <>
            <Suspense><Navbar activo={7} /></Suspense>

            <div className="max-w-6xl mx-auto px-4 py-4">
                {/* Tabs */}
                <nav className="flex flex-wrap gap-1 border-b border-gray-200 mb-6">
                    {TABS.map((t) => {
                        const activo = t.id === tab;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px
                                    ${activo
                                        ? "border-greenVE-600 text-greenVE-700"
                                        : "border-transparent text-gray-500 hover:text-greenVE-600"}`}
                            >
                                <span className={`${t.icono} h-4 w-4`}></span>
                                {t.label}
                            </button>
                        );
                    })}
                </nav>

                {/* Contenido */}
                <div className="bg-white border border-greenVE-500 rounded-2xl shadow-sm p-3 md:p-4">
                    {tab === "contacto" && (
                        <ContactForm
                            tipo="contactoWeb"
                            titulo="Envíanos un mensaje"
                            subtitulo="Tu mensaje es bienvenido. Completa el formulario y te contactaremos si es necesario."
                        />
                    )}

                    {tab === "directorio" && <DirectorioContactos />}

                    {tab === "oficinas" && <OficinasMap />}

                    {tab === "emprende" && <EmprendeForm />}
                </div>
            </div>

            <Footer />
        </>
    );
};

export default Contacto;
