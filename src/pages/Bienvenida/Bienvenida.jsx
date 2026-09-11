import React, { useEffect, useState } from 'react';
import { gestionarSuscripcion, notificarPagoPayphone } from '../../controllers/suscripcion/suscripcionController';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/global_components/navbar/Navbar';
import DataSuscription from '../../components/suscription_components/data_suscription';
import { generarEsquemaSusDF } from '../../global/esquemaSuscripcionDF';
import DatafastController from '../../controllers/pago/datafast/datafastController';
import Footer from '../../components/global_components/footer/Footer';
import { generarEsquemaSusJA } from '../../global/esquemaSuscripcionJA';
import { generarEsquemaSusBP } from '../../global/esquemaSuscripcionBP';
import { generarEsquemaSusPP } from '../../global/esquemaSuscripcionPP';
import { generarEsquemaSusPayPal } from '../../global/esquemaSuscripcionPayPal';

var firstTime=true;
const Bienvenida = () => {
    const datafastController = new DatafastController({});
    const [loadingPago, setLoadingPago]=useState(false);
    const [errorPago, setErrorPago] = useState(false);
    const [errorCuenta, setErrorCuenta] = useState(false);
    const [msjErrorCuenta, setMsjErrorCuenta] = useState("");
    const [nombre, setNombre] = useState();
    const [msjErrorPago, setMsjErrorPago] = useState("");
    const [dataSuscription, setDataSuscription] =useState();
    const [producto, setProducto] = useState()
    const [suscripcion, setSuscripcion] = useState()
    const [tarjeta, setTarjeta] = useState();
    const [diferido, setDiferido] = useState();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Definir 768 como el punto de corte para móvil
    const location = useLocation();
    const state =location.state;
    // Parsea los parámetros de consulta de la URL
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id');
    const navigate = useNavigate();


    const hadleClickCreateSuscription=async ()=>{
        if(id!=null){
            setLoadingPago(true);
            const pagoValido = await datafastController.checkRemotePaymentV3(id);
            if(pagoValido){
                setLoadingPago(false);
                if(pagoValido.estado){
                    gestionarSuscripcion(generarEsquemaSusDF(pagoValido.data)).then((result)=>{
                        firstTime=true;
                        if(result){
                            setNombre(pagoValido.data["customer"]["givenName"])
                            if(result.estado){
                                setDataSuscription(result.data)
                            }else{
                                setErrorCuenta(true);
                            }
                        }else{
                            setErrorCuenta(true);
                        }
                    })
                }else{
                    setErrorPago(true);
                    setMsjErrorPago(pagoValido.msj)
                }
            }else{
                setLoadingPago(false);
                setErrorPago(true);
                setMsjErrorPago("Ha ocurrido un error desconocido. Si existen cargos a su tarjeta comuníquese a nuestra central de reservas. 1")
            }
        }else if(state!=null){
            var schema;
            if(state.pago.tipo_pago_boton!=null){
                switch (state.pago.tipo_pago_boton.toString()) {
                    case "7":
                        schema = generarEsquemaSusBP(state);
                        break;

                    case "8":
                        schema = generarEsquemaSusJA(state);
                        break;

                    case "9":
                        schema = generarEsquemaSusPayPal(state);
                        break;
                    default:
                        break;
                }
            }else{
                switch (state.pago.IdTipoBotonPago.toString()) {
                    case "4":
                        schema = generarEsquemaSusPP(state);
                        break;

                    case "5":
                        schema = generarEsquemaSusPP(state);
                        break;
                
                    default:
                        break;
                }
            }

            // Los botones 4 y 5 son el formulario de PayPhone: contabilidad solo
            // recibia el voucher que manda PayPhone, sin datos del cliente ni de
            // la compra. Se avisa aqui, con la suscripcion ya creada, para poder
            // incluir el codigo de suscriptor.
            const esPayphone = state.pago?.tipo_pago_boton == null
                && ["4", "5"].includes(String(state.pago?.IdTipoBotonPago));

            gestionarSuscripcion(schema).then((result)=>{
                firstTime=true;
                if(result && result.estado){
                    setNombre(state.persona.nombres)
                    setDataSuscription(result.data)
                    if (esPayphone) {
                        // Sin await: el correo no debe retrasar la bienvenida.
                        notificarPagoPayphone({ state, dataSuscripcion: result.data });
                    }
                    navigate(location.pathname, { replace: true, state: null });
                }else{
                    setErrorCuenta(true);
                    setMsjErrorCuenta("Ha ocurrido un error al crear tu cuenta, comunicate con nuestra central de reservas 2");
                }
            })
        }
    }

    useEffect(() => {
        const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
        };

        if(id!=null&&firstTime){
            firstTime=false;
            hadleClickCreateSuscription()
        }else if(state!=null &&firstTime){
            firstTime=false;
            hadleClickCreateSuscription()
        }

        window.addEventListener('resize', handleResize);

        return () => {
        window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div>
      
            <Navbar/>
        
            {
                id!=null&&loadingPago?
                    <div className="flex flex-col  mt-10 mx-auto mb-28 max-w-6xl py-6  sm:px-6 lg:px-8 items-center justify-center h-60">
                        <span className="icon-[eos-icons--bubble-loading] text-greenVE-500 h-14 w-14 mb-10"></span>
                        <label className='text-greenVE-600 font-medium text-lg'>Estamos verificando su pago.</label>
                        <label className='text-greenVE-600 font-medium text-lg'>No cierre esta ventana por favor.</label>
                    </div>
                :errorPago
                ?<div className="flex flex-col  mt-10 mx-auto mb-28 max-w-6xl py-6  sm:px-6 lg:px-8 items-center justify-center h-60">
                    <span className="icon-[material-symbols-light--credit-card-off-outline] text-red-600 h-14 w-14 mb-10"></span>
                    <label className='text-red-600 font-medium text-lg'>Error al procesar pago.</label>
                    <label className='text-red-600 font-medium text-lg'>{msjErrorPago}.</label>
                </div>
                :errorCuenta
                ?<div className="flex flex-col  mt-10 mx-auto mb-28 max-w-6xl py-6  sm:px-6 lg:px-8 items-center justify-center h-60">
                    <span className="icon-[material-symbols-light--credit-card-off-outline] text-red-600 h-14 w-14 mb-10"></span>
                    <label className='text-red-600 font-medium text-lg'>Error al crear cuenta.</label>
                    <label className='text-red-600 font-medium text-lg'>{msjErrorCuenta}.</label>
                </div>
                :<DataSuscription accountData={dataSuscription} nombre={nombre}/>
            }
        <Footer></Footer>
    </div>
    );
};

export default Bienvenida;