import React, { useState } from 'react';
import Promociones from './Promociones/promo';
import Suscripciones from './Suscripciones/Suscripciones';
import Informacion from './Informacion/Informacion';
import PayPhoneForm from './Payphone/PayPhoneForm';
import DataFast from './Datafast/DataFast';
import PayPhoneBP from './Payphone/PayPhoneBP.jsx';
import JardinAzuayo from './JardinAzuayo/JardinAzuayo.jsx';
import BancoAustroForm from './BancoAustro/BancoAustroForm.jsx';
import { useLocation } from 'react-router-dom';
import PayPal from './PayPal/PayPal.jsx';
import Transferencia from './Transferencia/Transferencia.jsx';

const StepsSuscription = () => {
    const [opcion, setOpcion] = useState(1)
    const [productos, setProductos] = useState()
    const [producto, setProducto] = useState();
    const [persona, setPersona] = useState();
    const [pago, setPago] = useState();
    const [codigo, setCodigo] = useState();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const [referedCode, setReferedCode] = useState(searchParams.get("codigo"));

    return (
        <div className='flex flex-col md:flex-row gap-8 w-full'>
            <div className='flex flex-col w-full'>
                <div className='flex justify-between items-center gap-1 md:gap-2 my-4 w-full'>
                    <button
                        className={`md:hidden flex flex-shrink-0 items-center justify-center p-1 rounded-lg font-semibold transition-all ${opcion > 1 ? "bg-gray-500 text-white hover:bg-gray-600 cursor-pointer" : "opacity-0 cursor-default pointer-events-none"}`}
                        onClick={() => { if (opcion > 1) setOpcion(opcion - 1) }}
                        disabled={opcion === 1}
                    >
                        <span className="icon-[ic--round-navigate-before] h-6 w-6 block"></span>
                    </button>

                    <div className='flex justify-center md:justify-start gap-1 md:gap-2 w-full overflow-x-auto overflow-y-hidden'>
                        <button className={`${opcion == 1 ? "bg-greenVE-600" : "bg-greenVE-500"} text-white px-2 py-1 rounded-lg cursor-pointer text-[10px] md:text-base whitespace-nowrap`} onClick={() => setOpcion(1)}>1. Promos</button>
                        <button className={`${opcion == 2 ? "bg-greenVE-600 text-white" : productos != null ? "bg-greenVE-500 text-white" : "bg-gray-100 text-gray-400"} px-2 py-1 rounded-lg cursor-pointer text-[10px] md:text-base whitespace-nowrap`} onClick={productos != null ? () => setOpcion(2) : null}>2. Suscripciones</button>
                        <button className={`${opcion == 3 ? "bg-greenVE-600 text-white" : producto != null ? "bg-greenVE-500 text-white" : "bg-gray-100 text-gray-400"}  px-2 py-1 rounded-lg cursor-pointer text-[10px] md:text-base whitespace-nowrap`} onClick={producto != null ? () => { setOpcion(3); setPago() } : null}>3. Información</button>
                        <button className={`${opcion == 4 ? "bg-greenVE-600 text-white" : "bg-gray-100 text-gray-400"} px-2 py-1 rounded-lg cursor-pointer text-[10px] md:text-base whitespace-nowrap`}>4. Pago</button>
                    </div>

                    <button
                        className={`md:hidden flex flex-shrink-0 items-center justify-center p-1 rounded-lg font-semibold transition-all ${(opcion === 1 && productos != null) ||
                                (opcion === 2 && producto != null) ||
                                (opcion === 3 && pago != null)
                                ? "bg-greenVE-500 text-white hover:bg-greenVE-600 cursor-pointer"
                                : "opacity-0 cursor-default pointer-events-none"
                            }`}
                        onClick={() => {
                            if (opcion === 1 && productos != null) setOpcion(2);
                            else if (opcion === 2 && producto != null) { setOpcion(3); setPago(); }
                            else if (opcion === 3 && pago != null) setOpcion(4);
                        }}
                        disabled={
                            (opcion === 1 && productos == null) ||
                            (opcion === 2 && producto == null) ||
                            (opcion === 3 && pago == null) ||
                            opcion === 4
                        }
                    >
                        <span className="icon-[ic--round-navigate-next] h-6 w-6 block"></span>
                    </button>
                </div>
                <div className='flex md:flex-row flex-col gap-4 items-start w-full'>
                    <div className='md:w-9/12 w-full order-2 md:order-1'>
                        {
                            opcion == 1
                                ? <Promociones setCodigo={setCodigo} setOpcion={setOpcion} setProductos={setProductos} setReferedCode={setReferedCode} referedCode={referedCode} setProducto={setProducto} />
                                : opcion == 2
                                    ? <Suscripciones productos={productos} setProducto={setProducto} setOpcion={setOpcion} codigo={codigo} setCodigo={setCodigo}></Suscripciones>
                                    : opcion == 3
                                        ? <Informacion setOpcion={setOpcion} persona={persona} setPersona={setPersona} setPago={setPago} />
                                        : opcion == 4
                                            ? !pago
                                                ? <></>
                                                : pago.IdTipoBotonPago == "4"
                                                    ? <PayPhoneForm persona={persona} producto={producto} pago={pago} codigo={codigo} />
                                                    : pago.IdTipoBotonPago == "5"
                                                        ? <BancoAustroForm persona={persona} producto={producto} pago={pago} codigo={codigo} />
                                                        : pago.IdTipoBotonPago == "6"
                                                            ? <DataFast persona={persona} producto={producto} pago={pago} codigo={codigo}></DataFast>
                                                            : pago.IdTipoBotonPago == "7"
                                                                ? <PayPhoneBP setOpcion={setOpcion} persona={persona} producto={producto} codigo={codigo}></PayPhoneBP>
                                                                : pago.IdTipoBotonPago == "8"
                                                                    ? <JardinAzuayo setOpcion={setOpcion} persona={persona} producto={producto} codigo={codigo}></JardinAzuayo>
                                                                    : pago.IdTipoBotonPago == "9"
                                                                        ? <PayPal setOpcion={setOpcion} persona={persona} producto={producto} codigo={codigo} pago={pago}></PayPal>
                                                                        : pago.IdTipoBotonPago == "10"
                                                                            ? <Transferencia persona={persona} producto={producto} pago={pago} codigo={codigo}></Transferencia>
                                                                            : <></>
                                            : <></>
                        }
                        <div className='hidden md:flex justify-between items-center w-full mt-6'>
                            <button
                                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-1 transition-all ${opcion > 1 ? "bg-gray-500 text-white hover:bg-gray-600 cursor-pointer" : "opacity-0 cursor-default pointer-events-none"}`}
                                onClick={() => { if (opcion > 1) setOpcion(opcion - 1) }}
                                disabled={opcion === 1}
                            >
                                <span className="icon-[ic--round-navigate-before] h-5 w-5"></span>
                                Volver
                            </button>

                            <button
                                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-1 transition-all ${(opcion === 1 && productos != null) ||
                                        (opcion === 2 && producto != null) ||
                                        (opcion === 3 && pago != null)
                                        ? "bg-greenVE-500 text-white hover:bg-greenVE-600 cursor-pointer"
                                        : "opacity-0 cursor-default pointer-events-none"
                                    }`}
                                onClick={() => {
                                    if (opcion === 1 && productos != null) setOpcion(2);
                                    else if (opcion === 2 && producto != null) { setOpcion(3); setPago(); }
                                    else if (opcion === 3 && pago != null) setOpcion(4);
                                }}
                                disabled={
                                    (opcion === 1 && productos == null) ||
                                    (opcion === 2 && producto == null) ||
                                    (opcion === 3 && pago == null) ||
                                    opcion === 4
                                }
                            >
                                Siguiente
                                <span className="icon-[ic--round-navigate-next] h-5 w-5"></span>
                            </button>
                        </div>
                    </div>
                    <div className='md:w-3/12 w-full flex justify-center md:flex-col gap-2 md:gap-3 order-1 md:order-2'>
                        {
                            producto &&
                            <div className='flex flex-col gap-3 shadow-xl rounded-xl p-3 w-1/2 md:w-full'>
                                <div className='flex  items-center gap-2 text-amber-500 '>
                                    <span className="icon-[mdi--cart] h-5 w-5"></span>
                                    <label className='text-sm md:text-lg font-semibold'>Resumen</label>
                                </div>
                                <label className='text-amber-500 font-semibold text-xxs md:text-xs'>{producto.Titulo}</label>
                                <div className='flex justify-between bg-gray-200 p-2 text-xs md:text-base'>
                                    <label className=''>Subtotal</label>
                                    <label>{((producto.PrecioProducto * 1.12) / 1.15).toFixed(2)}</label>
                                </div>
                                <div className='flex justify-between bg-gray-50 p-2 -mt-3 text-xs md:text-base'>
                                    <label>IVA 15%</label>
                                    <label>{((producto.PrecioProducto * 1.12) - ((producto.PrecioProducto * 1.12) / 1.15)).toFixed(2)}</label>
                                </div>
                                <div className='flex justify-between font-semibold bg-gray-200 p-2 -mt-3 text-sm md:text-xl'>
                                    <label>Total</label>
                                    <label>{(producto.PrecioProducto * 1.12).toFixed(2)}</label>
                                </div>
                            </div>
                        }
                        {
                            pago && pago.IdTipoBotonPago != "10" &&
                            <div className='flex flex-col gap-3 shadow-xl rounded-xl p-3 w-1/2 md:w-full'>
                                <div className='flex  items-center gap-2 text-amber-500 '>
                                    <span className="icon-[material-symbols--payments-outline-rounded] w-5 h-5"></span>
                                    <label className='text-sm md:text-lg font-semibold'>Forma de pago</label>
                                </div>
                                <div className='flex '>
                                    {
                                        pago.botonLogo && <div className='flex  justify-center items-center'>
                                            <img className='w-1/2' src={pago.botonLogo} />
                                        </div>
                                    }
                                    <div className='flex justify-center'>
                                        {
                                            pago.LogoBanco && <img className='w-1/2' src={pago.LogoBanco} />
                                        }
                                        <img className=' w-1/2' src={pago.LogoTarjeta} />
                                    </div>
                                </div>
                                <div className='flex justify-between bg-gray-200 p-2 text-xs md:text-base'>
                                    <label className=''>Cuotas</label>
                                    <label>{pago.Meses}</label>
                                </div>
                                <div className='flex justify-between bg-gray-50 p-2 -mt-3 text-xs md:text-base'>
                                    <label>Valor cuota</label>
                                    <label>{((producto.PrecioProducto * 1.12) / parseInt(pago.Meses)).toFixed(2)}</label>
                                </div>
                                <div className='flex justify-between  bg-gray-200 p-2 -mt-3 text-xs md:text-base'>
                                    <label>Intereses</label>
                                    <label>{pago.Intereses == "1" ? "Si" : "No"}</label>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StepsSuscription;
