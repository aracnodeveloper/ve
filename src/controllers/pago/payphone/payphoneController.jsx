import Config from "../../../global/config";
import { btoa, dateFormat } from "../../../global/util";

class PayPhoneController {
  getParams(product, personalInfo, paymentInfo, diferido) {
    const _date = dateFormat({ d: new Date() });
    const _tax = 0.12; // iva ecuador

    try {
      const amount = ((product.PrecioProducto * 100) + (product.PrecioProducto * 0.12 * 100)).toFixed(0);
      const amountWithTax = (product.PrecioProducto * 100).toFixed(0);
      const tax = (product.PrecioProducto * _tax * 100).toFixed(0);

      const _params = {
        cardHolder: btoa(paymentInfo.cardHolder),
        number: btoa(paymentInfo.cardNumber),
        expirationMonth: btoa(paymentInfo.monthExpire),
        expirationYear: btoa(paymentInfo.yearExpire),
        verificationCode: btoa(paymentInfo.cvc),
        amount: amount,
        amountWithTax: amountWithTax,
        tax: tax,
        clientTransactionId: btoa(personalInfo.cedula + _date),
        currency: Config.MONEDA,
        documentId: personalInfo.cedula,
        email: personalInfo.correo,
        phoneNumber: personalInfo.telefono,
        deferredType: this.genDeferredCode(diferido)
      };

      return _params;
    } catch (e) {
      console.error(e.toString());
    }
    return {};
  }

  genDeferredCode(deferred) {
    let _codigo = "";
    let bloque = ["", "", "", "", ""]; // bloque a,b,c,d,e

    if (deferred.Meses === "1") {
      _codigo = '00000000';
    } else if (parseInt(deferred.Meses) > 1) {
      if (deferred.Intereses === "2") {
        bloque[0] = "PR";
        bloque[1] = "01";
      } else {
        bloque[0] = "CF";
        bloque[1] = "02";
      }
      bloque[2] = "01";
      bloque[3] = deferred.Meses.toString().padStart(2, '0');
      bloque[4] = "00";
      _codigo = bloque.join('');
    }

    return _codigo;
  }

  getParamsPrepareTransaction(product, personalInfo) {
    const _date = dateFormat({ d: new Date() });
    const _tax = 0.12; // iva ecuador

    try {
      const amount = ((product.precio_producto * 100) + (product.precio_producto * 0.12 * 100)).toFixed(0);
      const amountWithTax = (product.precio_producto * 100).toFixed(0);
      const tax = (product.precio_producto * _tax * 100).toFixed(0);

      const _params = {
        amount: amount,
        amountWithTax: amountWithTax,
        tax: tax,
        clientTransactionId: btoa(personalInfo.dni + _date),
        currency: Config.MONEDA,
        documentId: personalInfo.dni,
        email: personalInfo.email,
        countryCode: personalInfo.countryCode.substring(1),
        phoneNumber: personalInfo.phone,
        reference: product.titulo
      };

      return _params;
    } catch (e) {
      console.error(e.toString());
    }

    return {};
  }

  async sendRemotePayment(product, personalInfo, paymentInfo, diferido) {
    try {

    } catch {

    }
    return {}
  }

  async prepareTransaction(product, personalInfo) {
    var headers = {
      'Authorization':
        'Bearer _lHifGqe0mLy7wQ-NElk3oX62v6KzkOjEkmn6DJwN_qPMoWUpCBc5ThqnMRcENtYVEfHPUFtBsiBYjuWnJhNihqZoDFqktxQxQsPkW455r4rsDhurhaNNhE-B9mZVYCryWVGK-h9gzvYzEXzaDOAvPkuA7mAQhBvgcojamlhk0RBE-gXum-VwXd_wQk2Y5aokqjAN4h9o5wBcLmBJ9g8C_0pj_jiN85hdkqK6_Nujk8H1MEQqPcVRY5w5KzdSz-yKX6CsAxCfp6-UGzufSUh5OeTQsaACdQnOlVTZ495ktUp8SNklZ-hfJ7xTehAeX4vhlzX9g',
      'Accept': 'application/json',
      'Content-Type': 'application/json; charset=UTF-8',
    }

    var url = 'https://pay.payphonetodoesposible.com/api/sale';
    try {
      const response = await fetch(url, {
        headers: headers,
        method: 'POST',
        body: JSON.stringify(this.getParamsPrepareTransaction(product, personalInfo))
      });


      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      var data = await response.json();
      if (data) {
        data.code = 0;
      }
      return data;
    } catch (error) {
      console.error('Cannot post to ' + url + '. error:' + error.message);
      return { "code": -1, "msg": `Cannot post to ${url}. error: ${error.message}` };
    }
  }

  async getStatusTransaction(transactionID) {
    var headers = {
      'Authorization':
        'Bearer _lHifGqe0mLy7wQ-NElk3oX62v6KzkOjEkmn6DJwN_qPMoWUpCBc5ThqnMRcENtYVEfHPUFtBsiBYjuWnJhNihqZoDFqktxQxQsPkW455r4rsDhurhaNNhE-B9mZVYCryWVGK-h9gzvYzEXzaDOAvPkuA7mAQhBvgcojamlhk0RBE-gXum-VwXd_wQk2Y5aokqjAN4h9o5wBcLmBJ9g8C_0pj_jiN85hdkqK6_Nujk8H1MEQqPcVRY5w5KzdSz-yKX6CsAxCfp6-UGzufSUh5OeTQsaACdQnOlVTZ495ktUp8SNklZ-hfJ7xTehAeX4vhlzX9g',
      'Accept': 'application/json',
      'Content-Type': 'application/json; charset=UTF-8',
    }

    var url = `https://pay.payphonetodoesposible.com/api/sale/${transactionID}`;
    try {
      const response = await fetch(url, {
        headers: headers,
        method: 'GET',
      });


      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      var data = await response.json();
      if (data) {
        data.code = 0;
      }
      return data;
    } catch (error) {
      console.error('Cannot post to ' + url + '. error:' + error.message);
      return { "code": -1, "msg": `Cannot post to ${url}. error: ${error.message}` };
    }
  }

  async pay(product, personalInfo, paymentInfo, diferido) {
    var headers = {
      'Authorization':
        `Bearer ${Config.TOKENPP}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json; charset=UTF-8',
    }

    var url = `${Config.URL_PAYPHONE}/Create/`;

    try {
      const response = await fetch(url, {
        headers: headers,
        method: 'POST',
        body: JSON.stringify(this.getParams(product, personalInfo, paymentInfo, diferido))
      });


      /*if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }         */
      var data = await response.json();
      if (data) {
        data.statusCode = 3;
        return data;
      }
      return { "ErrorCode": 900 };

    } catch (error) {
      console.error('Cannot post to ' + url + '. error:' + error.message);
      return { "ErrorCode": 700 };
    }
  }

  async createPaymentLink(product, personalInfo) {
    var headers = {
      'Authorization': `Bearer ${Config.TOKENPP}`, // ATENCIÓN: Este token debe ser de una App tipo "API"
      'Accept': 'application/json',
      'Content-Type': 'application/json; charset=UTF-8',
    };

    // Cambiamos la URL a nuestro backend PHP para evitar el error de CORS
    // DEBES ajustar esta URL a la ruta real de tu servidor PHP local o de producción
    // var url = 'http://localhost/ve/backend-php/payphoneLinks.php'; // Ejemplo ruta local
    var url = Config.URL_PAYPHONE_LINKS;
    try {
      const amount = ((product.PrecioProducto * 100) + (product.PrecioProducto * 0.12 * 100)).toFixed(0);
      const amountWithTax = (product.PrecioProducto * 100).toFixed(0);
      const tax = (product.PrecioProducto * 0.12 * 100).toFixed(0);

      const _params = {
        amount: amount,
        amountWithTax: amountWithTax,
        amountWithoutTax: 0,
        tax: tax,
        clientTransactionId: btoa(personalInfo.cedula + new Date().getTime()).substring(0, 15), // Máx 15 chars
        currency: Config.MONEDA,
        documentId: personalInfo.cedula,
        email: personalInfo.correo,
        phoneNumber: personalInfo.telefono,
        reference: product.nombreProducto,
        storeId: "3D905D39-DA9D-47AE-8F6C-54779DF6D081", // ATENCIÓN: Debes colocar tu storeId aquí
        expireIn: 24
      };

      const response = await fetch(url, {
        headers: headers,
        method: 'POST',
        body: JSON.stringify(_params)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      var data = await response.json();
      return data;
    } catch (error) {
      console.error('Cannot post to ' + url + '. error:' + error.message);
      return { "code": -1, "msg": `Error al crear el link: ${error.message}` };
    }
  }
}

export default PayPhoneController;