import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SuccessTienda = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener el session_id de la URL si existe
    const query = new URLSearchParams(window.location.search);
    const sessionId = query.get('session_id');
    
    // Redirigir al dashboard B2B con el parámetro de éxito
    const redirectUrl = sessionId 
      ? `/dashboardb2b?payment_success=true&session_id=${sessionId}`
      : '/dashboardb2b?payment_success=true';
    
    // Pequeño delay para que el usuario vea que el pago fue exitoso
    const timer = setTimeout(() => {
      navigate(redirectUrl, { replace: true });
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-16 w-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Pago Exitoso!
        </h1>
        <p className="text-gray-600 mb-4">
          Tu pago se ha procesado correctamente.
        </p>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <span>Redirigiendo al dashboard</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessTienda;

