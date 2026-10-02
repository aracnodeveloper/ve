import React, { useState } from 'react';
import { CheckPromocionalCode } from '../../../controllers/suscripcion/suscripcionCodigoPromocional';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const Promociones = ({setProductos, setOpcion, setCodigo, setReferedCode, referedCode, setProducto}) => {
    const [errorCode, setErrorCode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState(localStorage.getItem('codigo')?localStorage.getItem('codigo'):null);
    const { codigo } = useParams();
    const navigate = useNavigate();

    const handleClickVerificar=()=>{
        setErrorCode(false);
        setLoading(true);
        // Se llega con referedCode solo desde un link (?codigo=XXXX). Despues de
        // la primera verificacion se limpia, asi que un codigo escrito a mano
        // no entra aqui.
        const vieneDeLink = referedCode != null;
        try{
            CheckPromocionalCode({codigo:(code==null&&referedCode)?referedCode:code, convenio: codigo}).then((result)=>{
                if(result){
                    if(code){
                        navigate(`?codigo=${code}`, { replace: true });
                    }
                    setProductos(result.productos);
                    setCodigo(result.codigo);
                    console.log(result.codigo)
                    setReferedCode()
                    // Link de un codigo con un solo paquete: no hay nada que
                    // elegir en el paso 2, se preselecciona y se va al 3.
                    // Si el link ya trae ?producto=, lo resuelve el paso 2 con
                    // su propia logica (precio y tiempo adicional por URL).
                    const productoEnUrl = new URLSearchParams(window.location.search).get("producto");
                    if (vieneDeLink && setProducto && !productoEnUrl
                        && Array.isArray(result.productos) && result.productos.length === 1) {
                        setProducto(result.productos[0])
                        setOpcion(3)
                    } else {
                        setOpcion(2)
                    }
                }else{
                    setErrorCode(true);
                }
                setLoading(false);
            })
        }catch(e){
            setErrorCode(true);
            setLoading(false);
        }
    }

    useState(()=>{
        if(referedCode!=null){
            setCode(referedCode)
            handleClickVerificar();
        }
    }, referedCode);


    const handleChangeCode=(event)=>{
        setCode(event.target.value)
    }

    return (
        <div className='flex flex-col bg-gray-200 p-3 rounded-lg w-full'>
            <label className='font-semibold text-xl md:text-2xl'>Código Promocional</label>
            <label className='text-xs md:text-sm font-light text-gray-500 italic'>Ingresa el código promocional, que te obsequia tiempo extra en tu suscripción.</label>
            <div className='border-b border-gray-400 my-2'></div>
            <div className='flex flex-col md:flex-row  mt-2 items-center mb-3 w-full'>
                <div className='flex flex-col w-full md:w-7/12 gap-3 order-2 md:order-1'>
                    <label className='text-sm'>Código Promocional (Opcional)</label>
                    <input value={code} className={`w-full border ${errorCode?"border-red-500":"border-gray-400"} px-2 py-1 rounded-md` }onChange={handleChangeCode}></input>
                    <label className={`text-[9px] -mt-3 ${errorCode?"text-red-500":"text-gray-200"}`}>* El código no es válido</label>
                    <button className='bg-greenVE-500 text-white rounded-md flex items-center justify-center cursor-pointer py-1 font font-semibold' onClick={()=>handleClickVerificar()}>
                        {
                            loading
                            ?<span className="icon-[line-md--loading-twotone-loop] h-7 w-7"></span>
                            :<>
                                Continuar
                                <span className="icon-[ic--round-navigate-next] h-7 w-7"></span>
                            </>
                        }
                    </button>
                </div>
                <div className='md:w-5/12 px-12 h-36 md:h-52 order-1 md:order-2'>
                    <img src='https://visitaecuador.com/img/diseno/compra/codigopromocional.png' className='md:w-auto w-32'/>
                </div>
            </div>
        </div>
    );
};

export default Promociones;