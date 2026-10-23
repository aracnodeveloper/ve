import React, { useState } from 'react';
import { calcularNoches, formatearFecha } from '../../../global/formatearFecha';
import { esOfertaAgotada, periodosAgotados, textoAgotada } from '../../../global/ofertasPricing';


const HotelRoomItem = ({date, oferta, index, selectedRooms, setSelectedRooms}) => {
    const [selectedOption, setSelectedOption] = useState(null);
    // Agotada si el día de check-in cae dentro de alguna de sus ventanas de agotamiento.
    const checkIn = date && date[0] && date[0].startDate;
    const agotada = esOfertaAgotada(oferta, checkIn);
    const ventanas = agotada ? periodosAgotados(oferta) : [];
    const handleChange = (event) => {
        const selectedValue = event.target.value;
        setSelectedOption(selectedValue);
        const lista=[...selectedRooms];
        lista[index]=selectedValue==""?0:parseInt(selectedValue);
        setSelectedRooms(lista)
    };
    return (
        <div>
            <div className='w-full bg-white border border-gray-300 p-3 flex flex-col gap-2'>
                <label className='font-semibold'>{oferta.TituloOferta}</label>
                {
                    agotada
                    ?<div className='flex flex-col gap-0.5'>
                        <div className='flex gap-1.5 items-center bg-red-100 border border-red-200 rounded-md px-2 py-0.5 w-fit'>
                            <span className="icon-[ri--prohibited-2-line] text-red-500 h-4 w-4"></span>
                            <label className='text-red-500 text-xs font-medium'>
                                {textoAgotada(oferta, checkIn)}
                            </label>
                        </div>
                        {ventanas.length > 1 && (
                            <label className='text-[10px] text-gray-400'>
                                Fechas no disponibles: {ventanas.join(" · ")}
                            </label>
                        )}
                    </div>
                    :<></>
                }
                {
                    oferta.AplicaEn!=null&&oferta.AplicaEn!=null
                    ?<div className='flex gap-2 items-center'>
                        <span className="icon-[material-symbols--calendar-month-outline] h-5 w-5"></span>
                        <label className='text-sm'>Aplica {oferta.AplicaEn.toLowerCase()}</label>
                    </div>
                    :<></>
                }
                <div className='flex gap-2 items-center'>
                    <span className="icon-[material-symbols--bed-outline] h-5 w-5"></span>
                    <label className='text-sm'>Acomodación {oferta.Acomodacion.toLowerCase()}</label>
                </div>
                <div className='flex gap-2 items-center'>
                    <span className="icon-[akar-icons--people-group] h-4 w-5"></span>
                    <label className='text-sm'>Aplica para {oferta.Adultos=="1"?"1 adulto":oferta.Adultos+" adultos"} {(oferta.Ninos!="0"&&oferta.Ninos!=null)?(oferta.Ninos=="1"?"y 1 niño":"y "+oferta.Ninos+" niños"):""}</label>
                </div>
                {
                    oferta.Incluye.map((item)=>(
                        <div className='flex gap-2 items-center'>
                            <span className="icon-[material-symbols--check-small] text-greenVE-500 w-[6%]"></span>
                            <label className='text-sm w-[96%]'>{item.Titulo}</label>
                        </div>
                    ))
                }
                <div >
                    <label className='text-sm'>Precio para {calcularNoches(date[0].startDate, date[0].endDate)} ({formatearFecha({ fecha: date[0].startDate, dia: true, mes: true })} - {formatearFecha({ fecha: date[0].endDate, dia: true, mes: true })})</label>
                    <div className=' flex gap-4 items-center'>
                        <label className='text-greenVE-500 line-through'>US ${oferta.Rack}</label>
                        <label className='text-orange-600 font-semibold text-lg'>US ${oferta.FinalSinImpuestos}</label>
                    </div>
                    <label className='text-sm'>+ US ${oferta.Impuestos} de impuestos y cargos</label>
                </div>
                <div>
                    <select
                        className={`w-full p-3 text-center rounded-md border ${agotada ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white border-greenVE-500'}`}
                        value={agotada ? "0" : selectedOption}
                        disabled={agotada}
                        onChange={handleChange}>
                        <option className='w-10' value="">Seleccione una opción</option>
                        <option value="0">0 Unidades</option>
                        <option value="1">1 Unidad</option>
                        <option value="2">2 Unidades</option>
                        <option value="3">3 Unidades</option>
                        <option value="4">4 Unidades</option>
                        <option value="5">5 Unidades</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default HotelRoomItem;