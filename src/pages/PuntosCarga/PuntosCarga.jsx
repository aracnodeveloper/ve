import React, { Suspense } from "react";
import Navbar from "../../components/global_components/navbar/Navbar";
import PuntosCargaMap from "../../components/puntos_carga/PuntosCargaMap";

/**
 * Pagina a pantalla completa: la navbar arriba y el mapa ocupando todo el
 * alto restante. Sin footer, para que el mapa no quede cortado.
 */
const PuntosCarga = () => {
    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <div className="flex-shrink-0">
                <Suspense><Navbar activo={8} /></Suspense>
            </div>

            <div className="flex-1 min-h-0">
                <PuntosCargaMap />
            </div>
        </div>
    );
};

export default PuntosCarga;
