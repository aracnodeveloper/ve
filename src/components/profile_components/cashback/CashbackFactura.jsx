import React from 'react';

const CashbackFactura = ({ total }) => {
    return (
        <div className='border rounded-xl p-3 flex flex-col gap-3'>
            <div className='flex items-center gap-2 w-full justify-center'>
                <span className="icon-[material-symbols--check-circle-outline] h-6 w-6 text-greenVE-500"></span>
                <label className='font-semibold'>Solicitud creada exitosamente</label>
            </div>
            <p>Para hacer efectivo su pago, llene la factura con los siguientes datos y envíe al whatsapp o al correo que aparecen en la parte inferior.</p>
            <div>
                <div>
                    <label className='font-semibold'>Razón social: </label>
                    <label>Aracno CIA. LTDA.</label>
                </div>
                <div>
                    <label className='font-semibold'>RUC: </label>
                    <label>0190167895001</label>
                </div>
                <div>
                    <label className='font-semibold'>Dirección: </label>
                    <label>Del Batán 5-137 y Esmeraldas</label>
                </div>
                <div>
                    <label className='font-semibold'>Email: </label>
                    <label>contabilidad3@visitaecuador.com</label>
                </div>
            </div>
            <div className='flex flex-col justify-end'>
                <table className='border-collapse border border-black'>
                    <thead >
                        <tr>
                            <th className='border border-black w-2/12  font-semibold'>Cantidad</th>
                            <th className='border border-black w-6/12  font-semibold'>Descripción</th>
                            <th className='border border-black w-2/12  font-semibold'>P. Unitario</th>
                            <th className='border border-black w-2/12 font-semibold'>P. Final</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className='border border-black w-2/12 text-center'>1</td>
                            <td className='border border-black w-6/12 text-center'>Comisiones</td>
                            <td className='border border-black w-2/12 text-center'>{(total / 1.15).toFixed(2)}</td>
                            <td className='border border-black w-2/12 text-center'>{(total / 1.15).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td className='border border-black w-2/12 font-semibold text-start pl-2'>IVA 12%:</td>
                            <td className='border border-black w-2/12 text-center'>{(total - (total / 1.15)).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td className='border border-black w-2/12 text-start pl-2 font-semibold'>Total:</td>
                            <td className='border border-black w-2/12 text-center'>{total.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className='flex gap-3 items-center justify-center'>
                <button className='bg-greenVE-500 text-white flex items-center justify-center w-36 rounded-full py-1' onClick={() => { window.open("https://api.whatsapp.com/send?phone=593997396731&text=Hola,%20adjunto%20la%20factura%20de%20mi%20solicitud.") }}><span className="icon-[logos--whatsapp-icon] mr-2" ></span> Whatsapp</button>
                <button className='bg-greenVE-500 text-white flex items-center justify-center w-36 rounded-full py-1' onClick={() => { window.open("mailto:contabilidad3@visitaecuador.com") }}><span className="icon-[fluent--mail-32-filled] mr-2" ></span> Correo</button>
            </div>
        </div>
    );
};

export default CashbackFactura;