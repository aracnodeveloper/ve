import { set } from "date-fns";
import { useState } from "react";

const ProductItem = ({ Producto, setOpcion, setProducto, codigo, setCodigo }) => {
    const [copiado, setCopiado] = useState(false);
    const [tiempoAdicional, setTiempoAdicional] = useState(0);
    const getTiempo = (TipoTiempo) => {
        if (TipoTiempo == 1) {
            return "año(s)"
        }
        if (TipoTiempo == 2) {
            return "mes(es)"
        }
        if (TipoTiempo == 3) {
            return "día(s)"
        }
        if (TipoTiempo == 4) {
            return "hora(s)"
        }
        if (TipoTiempo == 5) {
            return "minuto(s)"
        }
    }

    const handleClick = () => {
        setOpcion(3);
        setProducto(Producto);
        if (checkPermission()) {
            changeTiempoAdicional();
        }
    }

    const changeTiempoAdicional = () => {
        if (tiempoAdicional > 0) {
            const porcentajeAdicional = ((tiempoAdicional / 12) / Producto.Tiempo) * 100;
            if (codigo.beneficio[0] && codigo.beneficio[0].length > 0) {
                codigo.beneficio[0].cantidad = porcentajeAdicional;
                setCodigo(codigo);
            }
            if (!Producto.Titulo.includes("+")) {
                Producto.Titulo += " + " + tiempoAdicional + " mes(es) adicionales";
            }
        } else {
            if (codigo.beneficio[0] && codigo.beneficio[0].length > 0) {
                codigo.beneficio[0].cantidad = 0;
                setCodigo(codigo);
            }
        }
    }

    const checkPermission = () => {
        const data = JSON.parse(localStorage.getItem("datos"));
        if (data) {
            if (data.data.permisos.perfil.suscripcionPersonalizada) {
                return true;
            }
        } else {
            return false;
        }
    }

    const handleCLickShare = () => {
        let currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('producto', Producto.IdProducto);
        if (checkPermission) {
            currentUrl.searchParams.set('value', Producto.PrecioProducto);
            currentUrl.searchParams.set('time', tiempoAdicional);
            if (codigo) {
                currentUrl.searchParams.set('codigo', codigo.codigo);
            }
        }
        navigator.clipboard.writeText(currentUrl.toString()).then(() => {
            setCopiado(true);
            setTimeout(() => {
                setCopiado(false);
            }, 2000);
        })
    }

    const handleChangePrice = (event) => {
        Producto.PrecioProducto = (event.target.value / 1.12).toFixed(2);
    }

    const OneShot = Producto.IdProductoSuscripcion == 522;
    const MDT = Producto.IdProductoSuscripcion == 523;
    const EMV = Producto.IdProductoSuscripcion == 524;


    console.log(OneShot);

    return (
        <div className="flex justify-between items-center  border rounded-md px-3 py-1 bg-white">
            <div className="w-1/6">
                <img className="h-10 md:h-20 object-contain" src="https://visitaecuador.com/img/web/suscription_card.png"></img>

            </div>
            <div className="w-5/6  flex justify-between items-center gap-1">
                <div className="flex flex-col w-full">
                    <label className="text-xxs md:text-xs text-greenVE-600 font-medium">{Producto.Titulo}</label>

                    {OneShot ? <label className="text-xxs md:text-xs text-greenVE-600 font-medium">{"One Shot - Suscripcion de un Uso sin limite de tiempo"}</label> :
                        MDT ? <label className="text-xxs md:text-xs font-medium">{"Suscripcion 100% de bonificada por 3 meses"}</label> :
                            EMV ? <label className="text-xxs md:text-xs font-medium">{"Programa de capacitación"}</label> :
                                <label className="text-xxs md:text-xs">{Producto.TiempoVendido + " " + getTiempo(Producto.TipoTiempo) + " de suscripción"}</label>}

                </div>
                {
                    checkPermission() ?
                        <div className="flex flex-col text-center gap-3 w-2/3">
                            <div className="flex  items-center gap-2">
                                <label className="text-xxs md:text-xs">Nuevo precio:</label>
                                <input className="w-20" type="number" defaultValue={(Producto.PrecioProducto * 1.12).toFixed(2)} onChange={handleChangePrice}></input>
                            </div>
                            <div className="flex  items-center gap-2">
                                <label className="text-xxs md:text-xs">Meses regalo:</label>
                                <input className="w-20" type="number" value={tiempoAdicional} onChange={(event) => { setTiempoAdicional(event.target.value) }}></input>
                            </div>
                        </div>
                        : <></>
                }
                <div className="flex flex-col text-center">
                    <label className="text-xs md:text-base font-semibold text-greenVE-600 ">{"$" + (Producto.PrecioProducto * 1.12).toFixed(2)}</label>

                    <button className="text-xxs md:text-xs text-white font-semibold bg-greenVE-500 px-2 py-0.5 rounded-lg" onClick={handleClick}>Comprar</button>
                </div>
                <div title="Compartir" className="pl-4  cursor-pointer" onClick={() => handleCLickShare()}>
                    {
                        copiado
                            ? <span className="icon-[octicon--check-circle-fill-12] h-5 w-5 text-greenVE-500"></span>
                            : <span className="icon-[entypo--share-alternitive] h-5 w-5 text-gray-400 hover:text-greenVE-500"></span>
                    }
                </div>
            </div>
        </div>
    )
}

export default ProductItem;