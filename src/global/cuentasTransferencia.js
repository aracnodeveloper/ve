/**
 * Cuentas bancarias de la empresa para deposito / transferencia.
 *
 * Viven aqui y no en el componente porque se usan en dos pasos del flujo:
 * en el paso 3 el cliente elige a que cuenta va a depositar, y en el paso 4
 * se muestran los datos de esa unica cuenta.
 */

export const BENEFICIARIO = "ARACNO CIA. LTDA.";
export const RUC = "0190167895001";

/** Logos oficiales, los mismos que usa la app (endpoint diferidos). */
const LOGO = "https://visitaecuador.com/img/diseno/bco/";

export const CUENTAS = [
    { banco: "Banco del Austro", tipo: "Ahorros", cuenta: "0700074528", logo: LOGO + "austro.jpg" },
    { banco: "Banco del Austro", tipo: "Corriente", cuenta: "0300000045", logo: LOGO + "austro.jpg" },
    { banco: "Banco Bolivariano", tipo: "Ahorros", cuenta: "4001136095", logo: LOGO + "bolivariano.jpg" },
    { banco: "Banco Pacífico", tipo: "Ahorros", cuenta: "1044225806", logo: LOGO + "pacifico.jpg" },
    { banco: "Banco Guayaquil", tipo: "Corriente", cuenta: "0023211386", logo: LOGO + "guayaquil.jpg" },
    { banco: "Banco Produbanco", tipo: "Corriente", cuenta: "02071006202", logo: LOGO + "produbanco.jpg" },
];

/** Texto con el que se guarda la cuenta destino (mismo formato que la app). */
export const textoCuenta = (c) =>
    c ? `${c.banco} - ${c.tipo} ${c.cuenta}` : "";
