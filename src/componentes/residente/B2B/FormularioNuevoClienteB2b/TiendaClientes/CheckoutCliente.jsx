import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CheckoutCliente = () => {  // 👈 SIN props
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        {loading ? (
          <div>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando tu pago...</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                ¡Pago exitoso!
              </h1>
              <p className="text-gray-600 mb-4">
                Tu compra se ha procesado correctamente
              </p>
              {sessionId && (
                <p className="text-xs text-gray-400 mb-4">
                  ID de sesión: {sessionId}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/dashboardb2b')}
                className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Volver al Dashboard
              </button>
              
              <p className="text-sm text-gray-500">
                Recibirás un correo de confirmación con los detalles de tu compra.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutCliente;