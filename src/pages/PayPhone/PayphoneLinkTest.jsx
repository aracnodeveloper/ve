import React, { useState } from 'react';
import PayPhoneController from '../../controllers/pago/payphone/payphoneController';

const PayphoneLinkTest = () => {
  const [loading, setLoading] = useState(false);
  const [linkData, setLinkData] = useState(null);
  const [error, setError] = useState(null);

  // Datos de prueba
  const [productData, setProductData] = useState({
    PrecioProducto: 10, // $10 dólares sin impuestos
    nombreProducto: "Suscripción de prueba VisitaEcuador"
  });

  const [personalData, setPersonalData] = useState({
    cedula: "0999999999",
    correo: "prueba@visitaecuador.com",
    telefono: "0999999999"
  });

  const handleCreateLink = async () => {
    setLoading(true);
    setError(null);
    setLinkData(null);

    const controller = new PayPhoneController();
    
    try {
      const response = await controller.createPaymentLink(productData, personalData);
      
      if (response && response.url) {
        setLinkData(response);
      } else {
        setError(response.msg || "No se pudo generar el link. Revisa la consola o los datos enviados.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full">
        <h1 className="text-2xl font-bold text-center mb-6 text-greenVE-600">Probar Link de Pago PayPhone</h1>
        
        <div className="space-y-4 mb-6">
          <div>
            <h2 className="font-semibold text-gray-700">Datos del Producto</h2>
            <div className="bg-gray-50 p-3 rounded text-sm mt-1">
              <p>Producto: {productData.nombreProducto}</p>
              <p>Precio base: ${productData.PrecioProducto} (+ IVA)</p>
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-gray-700">Datos del Cliente</h2>
            <div className="bg-gray-50 p-3 rounded text-sm mt-1">
              <p>Cédula: {personalData.cedula}</p>
              <p>Correo: {personalData.correo}</p>
              <p>Teléfono: {personalData.telefono}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleCreateLink}
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-bold transition-all ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#8AB600] hover:bg-[#6c8f00]'
          }`}
        >
          {loading ? 'Generando Link...' : 'Generar Link de Pago'}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        {linkData && (
          <div className="mt-6 p-4 border border-green-200 bg-green-50 rounded-lg">
            <h3 className="text-green-800 font-bold mb-2">¡Link generado exitosamente!</h3>
            
            <div className="flex flex-col gap-3">
              <a 
                href={linkData.url} 
                target="_blank" 
                rel="noreferrer"
                className="text-center py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium"
              >
                Abrir Link de Pago
              </a>
              
              <div className="text-xs break-all bg-white p-2 border rounded">
                <span className="font-bold">URL:</span> {linkData.url}
              </div>
              <div className="text-xs bg-white p-2 border rounded">
                <span className="font-bold">ID Transacción:</span> {linkData.transactionId}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="mt-8 text-sm text-gray-500">
        Esta es una página de prueba temporal. No accesible desde el menú principal.
      </div>
    </div>
  );
};

export default PayphoneLinkTest;
