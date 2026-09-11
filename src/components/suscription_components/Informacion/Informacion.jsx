import React, { useEffect, useState } from 'react';
import { getRemoteTarjetas } from '../../../controllers/pago/pagoController';
import { Select, SelectItem } from '@tremor/react';
import { CUENTAS, textoCuenta } from '../../../global/cuentasTransferencia';
import { useParams } from 'react-router-dom';

const Informacion = ({ setOpcion, persona, setPersona, setPago }) => {
    const { codigo } = useParams();
    const [typePayment, setTypePayment] = useState();
    const [nombres, setNombres] = useState(persona != null ? persona.nombres : "");
    const [cedula, setCedula] = useState(persona != null ? persona.cedula : "");
    const [celular, setCelular] = useState(persona != null ? persona.telefono : "");
    const [correo, setCorreo] = useState(persona != null ? persona.correo : "");
    const [listaBancosTransferencia, setListaBancosTransferencia] = useState();
    const [listaBancos, setListaBancos] = useState();
    const [banco, setBanco] = useState();
    const [listaTD, setListaTD] = useState();
    const [tarjetaDebito, setTarjetaDebito] = useState();
    const [tarjetaCredito, setTarjetaCredito] = useState();
    const [botonPago, setBotonPago] = useState();
    const [diferido, setDiferido] = useState();
    const [errorCedula, setErrorCedula] = useState(false);
    const [errorNombres, setErrorNombres] = useState(false);
    const [errorCelular, setErrorCelular] = useState(false);
    const [errorCorreo, setErrorCorreo] = useState(false);
    const [errorTipoPago, setErrorTipoPago] = useState(false);
    const [errorBanco, setErrorBanco] = useState(false);
    const [errorTC, setErrorTC] = useState(false);
    const [errorDiferido, setErrorDiferido] = useState(false);
    const [errorTD, setErrorTD] = useState(false);
    const [errorBotonPago, setErrorBotonPago] = useState(false);
    const [errorCheck, setErrorCheck] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [showTipoPago, setShowTipoPago] = useState(true);
    const [showBancos, setShowBancos] = useState(true);
    const [showBotonesPago, setShowBotonesPago] = useState(true);
    const [showOtrosPago, setShowOtrosPago] = useState(true);
    const [showTransferencia, setShowTransferencia] = useState(true);
    // Cuenta a la que el cliente va a depositar (indice en CUENTAS).
    const [cuentaTransferencia, setCuentaTransferencia] = useState();
    const [errorCuentaTransferencia, setErrorCuentaTransferencia] = useState(false);
    const [showMarcaTarjeta, setShowMarcaTarjeta] = useState(true);



    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
    };


    const handleChangeNombres = (event) => {
        setNombres(event.target.value)
    }

    const handleChangeCedula = (event) => {
        setCedula(event.target.value)
    }

    const handleChangeCelular = (event) => {
        setCelular(event.target.value)
    }

    const handleChangeCorreo = (event) => {
        setCorreo(event.target.value)
    }

    const handleChangeTypePayment = (event) => {
        setTypePayment(event);
        setBanco(0);
        setTarjetaDebito(0);
        setBotonPago(0);
        setTarjetaCredito(0)
        setDiferido(0);
        switch (codigo) {
            case "bda":
                (event == 1) && setBanco(8);
                break;
            case "bp":
                (event == 1) && setBanco(2);
                break;
            case "cpn":
                (event == 1) && setBanco(14);
                (event == 1) && setTarjetaCredito(2);
                (event == 2) && setTarjetaDebito(2);
                break;
        }
    };

    const handleChangeBanco = (event) => {
        setTarjetaCredito(0);
        setDiferido(0);
        setBanco(event);

    };

    const handleChangeTD = (event) => {
        setTarjetaDebito(event);
    };

    const handleChangeBotonPago = (event) => {
        setBotonPago(event)
    }

    const handleChangeTC = (event) => {
        setTarjetaCredito(event)
        setDiferido(0)
    }

    const handleChangeDiferido = (event) => {
        setDiferido(event)
    }

    useEffect(
        () => {
            getRemoteTarjetas().then((resp) => {
                if (resp) {
                    setListaBancos(resp[1].ListaBancos)
                    setListaTD(resp[2].ListaBancos[0].ListaTarjetas)
                    setListaBancosTransferencia(resp[0].ListaBancos)
                }
            })

            switch (codigo) {
                case "bda":
                case "bp":
                    setShowBancos(false);
                    setShowOtrosPago(false);
                    setShowTransferencia(false);
                    break;
                case "cja":
                    setShowBotonesPago(false);
                    setShowTipoPago(false);
                    setTypePayment(3);
                    setBotonPago(2);
                    break;
                case "cpn":
                    setShowBancos(false);
                    setShowOtrosPago(false);
                    setShowTransferencia(false);
                    setShowMarcaTarjeta(false);
                    break;
                case "pp":
                    setShowBotonesPago(false);
                    setShowTipoPago(false);
                    setTypePayment(3);
                    setBotonPago(1);
                    break;
            }
        }, []
    )

    const handleClickContinuar = () => {
        var error = false;
        if (!nombres) {
            setErrorNombres(true); error = true;
        } else {
            setErrorNombres(false);
        }
        if (!cedula) {
            setErrorCedula(true); error = true;
        } else {
            setErrorCedula(false);
        }
        if (!celular) {
            setErrorCelular(true); error = true;
        } else {
            setErrorCelular(false);
        }
        if (!correo) {
            setErrorCorreo(true); error = true;
        } else {
            setErrorCorreo(false);
        }
        if (!typePayment || typePayment == 0) {
            setErrorTipoPago(true); error = true;
        } else {
            setErrorTipoPago(false)
        }
        if ((!banco || banco == 0) && typePayment == 1) {
            setErrorBanco(true); error = true;
        } else {
            setErrorBanco(false);
        }
        if ((banco || banco != 0) && (!tarjetaCredito || tarjetaCredito == 0) && typePayment == 1) {
            setErrorTC(true); error = true;
        } else {
            setErrorTC(false);
        }
        if ((tarjetaCredito || tarjetaCredito != 0) && (!diferido || diferido == 0) && typePayment == 1) {
            setErrorDiferido(true); error = true;
        } else {
            setErrorDiferido(false);
        }
        if ((!tarjetaDebito || tarjetaDebito == 0) && typePayment == 2) {
            setErrorTD(true); error = true;
        } else {
            setErrorTD(false)
        }
        if ((!botonPago || botonPago == 0) && typePayment == 3) {
            setErrorBotonPago(true); error = true;
        } else {
            setErrorBotonPago(false)
        }
        if ((cuentaTransferencia === undefined || cuentaTransferencia === null || cuentaTransferencia === "") && typePayment == 4) {
            setErrorCuentaTransferencia(true); error = true;
        } else {
            setErrorCuentaTransferencia(false)
        }
        /*if(!isChecked){
            setErrorCheck(true);error=true;
        }else{
            setErrorCheck(false)
        }*/


        if (!error) {
            const datos = {
                nombres: nombres,
                cedula: cedula,
                telefono: celular,
                correo: correo,
                ciudad: 256,
            }
            if (typePayment == 1) {
                const tarjeta = listaBancos[banco - 1].ListaTarjetas[tarjetaCredito - 1].Nombre;
                const tarjetaLogo = listaBancos[banco - 1].ListaTarjetas[tarjetaCredito - 1].Logo;
                const bancoLogo = listaBancos[banco - 1].Logo;
                var pago = listaBancos[banco - 1].ListaTarjetas[tarjetaCredito - 1].ListaDiferidos[diferido - 1];
                pago.Tarjeta = tarjeta == "Visa" ? "VISA" : tarjeta == "MasterCard" ? "MASTER" : tarjeta == "Alia" ? "ALIA" : tarjeta == "AmericanExpress" ? "AMEX" : "";
                if (codigo != "cpn") {
                    pago.LogoBanco = bancoLogo;
                }
                pago.LogoTarjeta = tarjetaLogo;

                setPersona(datos);
                setPago(pago);
                setOpcion(4);
            }
            if (typePayment == 2) {
                const tarjeta = listaTD[tarjetaDebito - 1].Nombre;
                const tarjetaLogo = listaTD[tarjetaDebito - 1].Logo;
                const bancoLogo = "";
                var pago = listaBancos[0].ListaTarjetas[tarjetaDebito - 1].ListaDiferidos[0];
                pago.Tarjeta = tarjeta == "Visa" ? "VISA" : tarjeta == "MasterCard" ? "MASTER" : tarjeta == "Alia" ? "ALIA" : tarjeta == "AmericanExpress" ? "AMEX" : "";
                if (codigo != "cpn") {
                    pago.LogoBanco = bancoLogo;
                }
                pago.LogoTarjeta = tarjetaLogo;

                setPersona(datos);
                setPago(pago);
                setOpcion(4);
            }
            if (typePayment == 3) {
                var pago = {
                    IdTipoBotonPago: botonPago == 1 ? "7" : botonPago == 2 ? "8" : "9",
                    botonLogo: botonPago == 1 ? "https://visitaecuador.com/img/web/pp_logo.jpg"
                        : botonPago == 2 ? "https://visitaecuador.com/img/web/ja_logo.png"
                            : "https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png",
                    Meses: "1",
                    tipo_pago_boton: botonPago == 1 ? "7" : botonPago == 2 ? "8" : "9",
                };

                setPersona(datos);
                setPago(pago);
                setOpcion(4);
            }
            if (typePayment == 4) {
                const cuenta = CUENTAS[parseInt(cuentaTransferencia)];
                var pago = {
                    IdTipoBotonPago: "10",
                    tipo_pago_boton: "10",
                    // Cuenta elegida: en el paso 4 se muestran solo sus datos.
                    cuentaTransferencia: cuenta,
                    bancoDestino: textoCuenta(cuenta),
                    bancos: listaBancosTransferencia,
                };

                setPersona(datos);
                setPago(pago);
                setOpcion(4);
            }
            //selMap.set("tarjeta",)

        } else {
        }
    }
    return (
        <div className='flex flex-col bg-gray-200 p-3 rounded-lg'>
            <div className='flex flex-col w-full'>
                <label className='font-semibold text-xl md:text-2xl'>Datos personales y de pago</label>
                <label className='text-xs md:text-sm font-light text-gray-500 italic'>Ingresa tus información personal y datos de pago. Todos los datos son obligatorios</label>
            </div>
            <div className='border-b border-gray-400 my-2'></div>
            <div>
                <div className='flex flex-col md:flex-row md:flex-wrap gap-x-4 gap-y-4 justify-center'>
                    <div className={`md:w-2/5 border ${errorCedula ? "border-red-500" : "border-gray-300"} bg-white flex  items-center px-3 py-1.5 gap-2`}>
                        <span className={`icon-[material-symbols-light--id-card-outline-rounded] h-6 w-6 ${errorCedula ? "text-red-500" : "text-gray-600"}`}></span>
                        <input
                            value={cedula}
                            onChange={handleChangeCedula}
                            className={`text-sm w-full focus:outline-none focus:ring-0 focus:border-transparent border-0 ${errorCedula ? "placeholder:text-red-500" : ""}`}
                            placeholder='Documento de identidad'
                        ></input>
                    </div>
                    <div className={`md:w-2/5 border ${errorNombres ? "border-red-500" : "border-gray-300"} bg-white flex  items-center px-3 py-1.5 gap-2`}>
                        <span className={`icon-[mdi-light--account] h-6 w-6 ${errorNombres ? "text-red-500" : "text-gray-600"}`}></span>
                        <input
                            value={nombres}
                            onChange={handleChangeNombres}
                            className={`text-sm w-full focus:outline-none focus:ring-0 focus:border-transparent ${errorNombres ? "placeholder:text-red-500" : ""}`}
                            placeholder='Nombres y apellidos'
                        ></input>
                    </div>
                    <div className={`md:w-2/5 border ${errorCelular ? "border-red-500" : "border-gray-300"} bg-white flex  items-center px-3 py-1.5 gap-2`}>
                        <span className={`icon-[material-symbols-light--phone-android-outline] h-6 w-6 ${errorCelular ? "text-red-500" : "text-gray-600"}`}></span>
                        <input
                            value={celular}
                            onChange={handleChangeCelular}
                            className={`text-sm w-full focus:outline-none focus:ring-0 focus:border-transparent border-0 ${errorCelular ? "placeholder:text-red-500" : ""}`}
                            placeholder='Celular'
                        ></input>
                    </div>
                    <div className={`md:w-2/5 border ${errorCorreo ? "border-red-500" : "border-gray-300"} bg-white flex  items-center px-3 py-1.5 gap-2`}>
                        <span className={`icon-[material-symbols-light--mail-outline] h-6 w-6 ${errorCorreo ? "text-red-500" : "text-gray-600"}`}></span>
                        <input
                            value={correo}
                            onChange={handleChangeCorreo}
                            className={`text-sm w-full focus:outline-none focus:ring-0 focus:border-transparent border-0 ${errorCorreo ? "placeholder:text-red-500" : ""}`}
                            placeholder='Correo electrónico'
                        ></input>
                    </div>
                    {
                        showTipoPago &&
                        <div className={`md:w-2/5   bg-white flex  items-center   gap-2  border ${errorTipoPago ? "border-red-400" : ""}`}>
                            <Select
                                value={typePayment}
                                placeholder={
                                    <div className='flex items-center'>
                                        <span className={`icon-[f7--money-dollar] h-5 w-5 ${errorTipoPago ? "text-red-500" : "text-gray-600"}`}></span>
                                        <label className={`${errorTipoPago ? "text-red-500" : ""}`}>Seleccione tipo de pago</label>
                                    </div>
                                }
                                onValueChange={handleChangeTypePayment}>
                                <SelectItem value={1}>Crédito</SelectItem>
                                <SelectItem value={2}>Débito</SelectItem>
                                {
                                    showTransferencia && <SelectItem value={4}>Transferencia / Depósito</SelectItem>
                                }
                                {
                                    showOtrosPago && <SelectItem value={3}>Otros / Botones de pago</SelectItem>
                                }
                            </Select>
                        </div>
                    }
                    {
                        (typePayment == 1 && showBancos) && <div className={`md:w-2/5   bg-white flex  items-center   gap-2 border ${errorBanco ? "border-red-400" : ""}`}>
                            <Select
                                value={banco}
                                placeholder={
                                    <div className='flex items-center gap-2'>
                                        <span className={`icon-[basil--bank-outline] h-5 w-5 ${errorBanco ? "text-red-500" : "text-gray-600"}`}></span>
                                        <label className={`${errorBanco ? "text-red-500" : ""}`}>Seleccione banco emisor</label>
                                    </div>
                                }
                                onValueChange={handleChangeBanco}>
                                {
                                    listaBancos.map((item, index) => (
                                        <SelectItem value={index + 1}>
                                            <div className='flex gap-1 items-center'>
                                                <img src={item.Logo} className='w-5 h-5' />
                                                <label>{item.Nombre}</label>
                                            </div>
                                        </SelectItem>
                                    ))
                                }
                            </Select>
                        </div>
                    }
                    {
                        (typePayment == 2 && showMarcaTarjeta) && <div className={`md:w-2/5   bg-white flex  items-center   gap-2 border ${errorTD ? "border-red-500" : ""}`}>

                            <Select
                                value={tarjetaDebito}
                                placeholder={
                                    <div className='flex items-center gap-2'>
                                        <span className={`icon-[material-symbols-light--credit-card-outline] h-5 w-5 ${errorTD ? "text-red-500" : "text-gray-600"}`}></span>
                                        <label className={`${errorTD ? "text-red-500" : ""}`}>Seleccione marca de tarjeta</label>
                                    </div>
                                }
                                onValueChange={handleChangeTD}>
                                {
                                    listaTD.map((item, index) => (
                                        <SelectItem value={index + 1}>
                                            <div className='flex gap-1 items-center'>
                                                <img src={item.Logo} className='w-5 h-5' />
                                                <label>{item.Nombre}</label>
                                            </div>
                                        </SelectItem>
                                    )
                                    )
                                }
                            </Select>
                        </div>
                    }

                    {
                        (typePayment == 3 && showBotonesPago) && <div className={`md:w-2/5   bg-white flex  items-center   gap-2 border ${errorBotonPago ? "border-red-500" : ""}`}>

                            <Select
                                value={botonPago}
                                placeholder={
                                    <div className='flex items-center gap-2'>
                                        <span className={`icon-[ph--wallet-light] h-5 w-5 ${errorBotonPago ? "text-red-500" : "text-gray-600"}`}></span>
                                        <label className={`${errorBotonPago ? "text-red-500" : ""}`}>Seleccione opción</label>
                                    </div>
                                }
                                onValueChange={handleChangeBotonPago}>
                                <SelectItem value={1}>
                                    <div className='flex gap-1 items-center'>
                                        <img src='https://visitaecuador.com/img/web/pp_logo.jpg' className='w-5 h-5' />
                                        <label>PayPhone</label>
                                    </div>
                                </SelectItem>
                                <SelectItem value={2}>
                                    <div className='flex gap-1 items-center'>
                                        <img src='https://visitaecuador.com/img/web/ja_logo.png' className='w-5 h-5' />
                                        <label>Cooperativa Jardín Azuayo</label>
                                    </div>
                                </SelectItem>
                                <SelectItem value={3}>
                                    <div className='flex gap-1 items-center'>
                                        <img src='https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png' className='w-5 h-5' />
                                        <label>PayPal</label>
                                    </div>
                                </SelectItem>
                            </Select>
                        </div>
                    }
                    {
                        typePayment == 4 && <div className={`md:w-2/5 bg-white flex items-center gap-2 border ${errorCuentaTransferencia ? "border-red-500" : ""}`}>
                            <Select
                                className='cursor-pointer'
                                value={cuentaTransferencia}
                                placeholder={
                                    <div className='flex items-center gap-2'>
                                        <span className={`icon-[basil--bank-outline] h-5 w-5 ${errorCuentaTransferencia ? "text-red-500" : "text-gray-600"}`}></span>
                                        <label className={`${errorCuentaTransferencia ? "text-red-500" : ""}`}>Seleccione la cuenta a depositar</label>
                                    </div>
                                }
                                onValueChange={(valor) => { setCuentaTransferencia(valor); setErrorCuentaTransferencia(false); }}>
                                {
                                    CUENTAS.map((c, index) => (
                                        <SelectItem key={index} value={String(index)}>
                                            <div className='flex items-center gap-2 cursor-pointer'>
                                                <img
                                                    src={c.logo}
                                                    alt={c.banco}
                                                    className='h-7 w-7 object-contain rounded flex-shrink-0'
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                                <div className='flex flex-col min-w-0'>
                                                    <label className='text-xs text-gray-600 cursor-pointer'>{c.banco} · {c.tipo}</label>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))
                                }
                            </Select>
                        </div>
                    }
                    {
                        (banco != null && banco != 0 && showMarcaTarjeta) && <div className={`md:w-2/5   bg-white flex  items-center   gap-2 border ${errorTC ? "border-red-500" : ""}`}>

                            <Select
                                value={tarjetaCredito}
                                placeholder={
                                    <div className='flex items-center gap-2'>
                                        <span className={`icon-[material-symbols-light--credit-card-outline] h-5 w-5 ${errorTC ? "text-red-500" : "text-gray-600"}`}></span>
                                        <label className={`${errorTC ? "text-red-500" : ""}`}>Seleccione marca de tarjeta</label>
                                    </div>
                                }
                                onValueChange={handleChangeTC}>
                                {
                                    listaBancos[banco - 1].ListaTarjetas.map((item, index) => (
                                        <SelectItem value={index + 1}>
                                            <div className='flex gap-1 items-center'>
                                                <img src={item.Logo} className='w-5 h-5' />
                                                <label>{item.Nombre}</label>
                                            </div>
                                        </SelectItem>
                                    ))
                                }
                            </Select>
                        </div>
                    }
                    {
                        (banco != null && banco != 0
                            && tarjetaCredito != null && tarjetaCredito != 0
                        ) && <div className={`md:w-2/5   bg-white flex  items-center   gap-2 border ${errorDiferido ? "border-red-500" : ""}`}>

                            <Select
                                value={diferido}
                                placeholder={
                                    <div className='flex items-center gap-2'>
                                        <span className={`icon-[material-symbols-light--calendar-today-outline-rounded] h-5 w-5 ${errorDiferido ? "text-red-500" : "text-gray-600"}`}></span>
                                        <label className={`${errorDiferido ? "text-red-500" : ""}`}>Seleccione meses diferido</label>
                                    </div>
                                }
                                onValueChange={handleChangeDiferido}>
                                {
                                    listaBancos[banco - 1].ListaTarjetas[tarjetaCredito - 1].ListaDiferidos.map((item, index) => (
                                        <SelectItem value={index + 1}>
                                            <div className='flex gap-1 items-center'>
                                                <span className="icon-[material-symbols-light--calendar-today-outline-rounded] h-5 w-5 text-gray-600"></span>
                                                <label>{item.Titulo}</label>
                                            </div>
                                        </SelectItem>
                                    ))
                                }
                            </Select>
                        </div>
                    }
                </div>
            </div>
            <div className='md:px-16 text-[10px] flex justify-center items-center text-center mt-4 md:mt-8'>
                {/*<input 
                    type="checkbox" 
                    className="mr-2 cursor-pointer  "
                    checked={isChecked}
                onChange={handleCheckboxChange}/>*/}
                <label className=''>Al registrarte aceptas nuestros <a className='text-blue-500 underline cursor-pointer' href='https://visitaecuador.com/terminos-condiciones' target='_blank'>Términos y condiciones de uso</a> y el uso de tus datos personales de acuerdo a nuestras <a className='text-blue-500 underline cursor-pointer' href='https://visitaecuador.com/politicas-privacidad' target='_blank'>Políticas de Privacidad</a>.  {/*errorCheck?<label className='text-red-500 text-[11px]'>* Obligatorio</label>:""*/}</label>
            </div>
            <div className='flex w-full items-center justify-center mt-4 md:mt-8'>
                <button className='bg-greenVE-500 text-white font-semibold px-3 py-1.5 rounded-full flex items-center justify-center cursor-pointer text-sm md:text-base' onClick={() => handleClickContinuar()}>
                    <label className='cursor-pointer'>Continuar</label>
                    <span className="icon-[ic--round-navigate-next] h-7 w-7"></span>
                </button>
            </div>
        </div>
    );
};

export default Informacion;