import React, { useEffect, useMemo, useState } from 'react';
import { Spinner } from '@material-tailwind/react';
import { getCashbackInformation } from '../../../controllers/perfil/perfilController';
import { fechaToString } from '../../../global/formatearFecha';

/**
 * Tabla de suscriptores de la red, agrupada por nivel.
 *
 * Es el equivalente web de "Mis suscriptores" de la app (cashback_friends.dart)
 * y sale de la misma fuente: getRedPorCliente devuelve data.red como lista
 * plana, con el nivel en cada fila. La web ya pedia esa lista para las cuatro
 * tarjetas de totales, pero al pintarla ignoraba el nivel y el nombre del
 * suscriptor; aqui se muestran los dos.
 *
 * Los colores de nivel son los mismos de la app para que quien use ambas no
 * tenga que reaprenderlos.
 */
const NIVELES = {
    1: { color: '#00D7FA', nombre: 'Nivel 1' },
    2: { color: '#0B8CE3', nombre: 'Nivel 2' },
    3: { color: '#8101FA', nombre: 'Nivel 3' },
};

const ESTADOS = {
    Cobrado: { texto: 'Facturado', fondo: '#E7F4D9', tinta: '#4B7A1E' },
    EnProceso: { texto: 'En proceso', fondo: '#FDF0D5', tinta: '#9A6A00' },
    PorFacturar: { texto: 'Por facturar', fondo: '#E3F0FB', tinta: '#1666A8' },
};

const infoNivel = (nivel) => NIVELES[parseInt(nivel)] || NIVELES[1];
const infoEstado = (estado) => ESTADOS[estado] || ESTADOS.PorFacturar;

/** "412 - Juan Perez" -> "Juan Perez". Sin guion, devuelve el texto tal cual. */
const nombreSuscriptor = (texto) => {
    const t = String(texto || '');
    const i = t.indexOf('-');
    return i >= 0 ? t.substring(i + 1).trim() : t.trim();
};

/** El id del suscriptor es lo que va antes del guion. */
const idSuscriptor = (texto) => {
    const t = String(texto || '');
    const i = t.indexOf('-');
    return i >= 0 ? t.substring(0, i).trim() : '';
};

const Punto = ({ color, className = '' }) => (
    <span
        className={`inline-block h-2.5 w-2.5 rounded-full flex-shrink-0 ${className}`}
        style={{ backgroundColor: color }}
    />
);

const MisSuscriptores = ({ fechas, cambiar }) => {
    const [red, setRed] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [nivelActivo, setNivelActivo] = useState(0); // 0 = todos

    useEffect(() => {
        setCargando(true);
        getCashbackInformation(
            fechaToString(new Date(fechas[0].startDate)),
            fechaToString(new Date(fechas[0].endDate)),
            'Total'
        ).then((resp) => {
            setRed(resp && resp.historial ? resp.historial : []);
            setCargando(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cambiar, fechas]);

    // Conteo y comision acumulada por nivel, para las pastillas de filtro.
    const resumen = useMemo(() => {
        const base = { 1: { n: 0, total: 0 }, 2: { n: 0, total: 0 }, 3: { n: 0, total: 0 } };
        (red || []).forEach((item) => {
            const nivel = parseInt(item.nivel) || 1;
            if (!base[nivel]) base[nivel] = { n: 0, total: 0 };
            base[nivel].n += 1;
            base[nivel].total += parseFloat(item.valor) || 0;
        });
        return base;
    }, [red]);

    const lista = useMemo(() => {
        const items = red || [];
        const filtrados = nivelActivo === 0
            ? items
            : items.filter((i) => (parseInt(i.nivel) || 1) === nivelActivo);
        // Nivel primero y, dentro de cada nivel, lo mas reciente arriba.
        return [...filtrados].sort((a, b) => {
            const na = parseInt(a.nivel) || 1;
            const nb = parseInt(b.nivel) || 1;
            if (na !== nb) return na - nb;
            return String(b.fecha || '').localeCompare(String(a.fecha || ''));
        });
    }, [red, nivelActivo]);

    const totalFiltrado = useMemo(
        () => lista.reduce((acc, i) => acc + (parseFloat(i.valor) || 0), 0),
        [lista]
    );

    return (
        <div className='flex flex-col border rounded-lg mt-4 overflow-hidden'>
            {/* Cabecera */}
            <div className='flex items-center justify-between gap-3 px-4 py-3 border-b flex-wrap'>
                <div className='flex items-center gap-2'>
                    <span className='icon-[akar-icons--people-group] h-5 w-5 text-greenVE-600'></span>
                    <label className='font-semibold text-lg'>Mis suscriptores</label>
                    {red && (
                        <span className='text-xs text-gray-500'>
                            ({red.length} {red.length === 1 ? 'suscripción' : 'suscripciones'})
                        </span>
                    )}
                </div>

                {/* Filtro por nivel */}
                <div className='flex gap-1.5 flex-wrap'>
                    <button
                        onClick={() => setNivelActivo(0)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${nivelActivo === 0
                            ? 'bg-greenVE-500 text-white border-greenVE-500'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                    >
                        Todos
                    </button>
                    {[1, 2, 3].map((n) => (
                        <button
                            key={n}
                            onClick={() => setNivelActivo(n)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${nivelActivo === n
                                ? 'text-white border-transparent'
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                            style={nivelActivo === n ? { backgroundColor: NIVELES[n].color } : undefined}
                        >
                            {nivelActivo !== n && <Punto color={NIVELES[n].color} />}
                            {NIVELES[n].nombre}
                            <span className={nivelActivo === n ? 'opacity-80' : 'text-gray-400'}>
                                {resumen[n] ? resumen[n].n : 0}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Resumen por nivel */}
            {!cargando && red && red.length > 0 && (
                <div className='grid grid-cols-3 divide-x border-b bg-gray-50'>
                    {[1, 2, 3].map((n) => (
                        <div key={n} className='flex flex-col items-center py-2 px-2'>
                            <div className='flex items-center gap-1.5'>
                                <Punto color={NIVELES[n].color} />
                                <label className='text-[11px] text-gray-500'>{NIVELES[n].nombre}</label>
                            </div>
                            <label className='font-semibold text-base'>
                                ${(resumen[n] ? resumen[n].total : 0).toFixed(2)}
                            </label>
                        </div>
                    ))}
                </div>
            )}

            {/* Tabla */}
            {cargando ? (
                <div className='flex flex-col items-center justify-center gap-2 py-10 text-gray-500'>
                    <Spinner className='h-8' />
                    <label className='text-sm'>Cargando tu red...</label>
                </div>
            ) : lista.length === 0 ? (
                <div className='flex flex-col items-center justify-center gap-1 py-10 px-6 text-center'>
                    <span className='icon-[akar-icons--people-group] h-10 w-10 text-gray-300'></span>
                    <label className='font-semibold text-gray-600'>
                        {red && red.length > 0
                            ? 'No hay suscriptores en este nivel'
                            : 'Aún no tienes suscriptores en tu red'}
                    </label>
                    <label className='text-xs text-gray-400'>
                        {red && red.length > 0
                            ? 'Prueba con otro nivel o cambia el rango de fechas.'
                            : 'Cuando alguien se suscriba con tu código, aparecerá aquí.'}
                    </label>
                </div>
            ) : (
                <div className='overflow-x-auto max-h-96 overflow-y-auto'>
                    <table className='w-full text-sm'>
                        <thead className='sticky top-0 bg-gray-50 z-10'>
                            <tr className='border-b'>
                                <th className='text-left font-semibold text-gray-600 px-3 py-2 whitespace-nowrap'>Nivel</th>
                                <th className='text-left font-semibold text-gray-600 px-3 py-2'>Suscriptor</th>
                                <th className='text-left font-semibold text-gray-600 px-3 py-2'>Producto</th>
                                <th className='text-left font-semibold text-gray-600 px-3 py-2 whitespace-nowrap'>Fecha</th>
                                <th className='text-left font-semibold text-gray-600 px-3 py-2 whitespace-nowrap'>Estado</th>
                                <th className='text-right font-semibold text-gray-600 px-3 py-2 whitespace-nowrap'>Comisión</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y'>
                            {lista.map((item, i) => {
                                const nivel = infoNivel(item.nivel);
                                const estado = infoEstado(item.estado);
                                const id = idSuscriptor(item.text);
                                return (
                                    <tr key={item.id_tbl_red_comision || i} className='hover:bg-gray-50'>
                                        <td className='px-3 py-2'>
                                            <div className='flex items-center gap-1.5'>
                                                <Punto color={nivel.color} />
                                                <label className='text-xs font-medium text-gray-600'>
                                                    {parseInt(item.nivel) || 1}
                                                </label>
                                            </div>
                                        </td>
                                        <td className='px-3 py-2'>
                                            <div className='flex flex-col'>
                                                <label className='font-medium text-gray-800'>
                                                    {nombreSuscriptor(item.text)}
                                                </label>
                                                {id !== '' && (
                                                    <label className='text-[11px] text-gray-400'>ID {id}</label>
                                                )}
                                            </div>
                                        </td>
                                        <td className='px-3 py-2 text-gray-600'>{item.producto}</td>
                                        <td className='px-3 py-2 text-gray-500 whitespace-nowrap'>{item.fecha}</td>
                                        <td className='px-3 py-2'>
                                            <span
                                                className='px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap'
                                                style={{ backgroundColor: estado.fondo, color: estado.tinta }}
                                            >
                                                {estado.texto}
                                            </span>
                                        </td>
                                        <td className='px-3 py-2 text-right font-semibold text-gray-800 whitespace-nowrap'>
                                            ${(parseFloat(item.valor) || 0).toFixed(2)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className='sticky bottom-0 bg-greenVE-50 border-t'>
                            <tr>
                                <td colSpan={5} className='px-3 py-2 text-right font-medium text-gray-600'>
                                    {nivelActivo === 0 ? 'Total de la red' : `Total ${NIVELES[nivelActivo].nombre}`}
                                </td>
                                <td className='px-3 py-2 text-right font-bold text-greenVE-700 whitespace-nowrap'>
                                    ${totalFiltrado.toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MisSuscriptores;
