import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context';

const CancelSubscriptionButton = ({ b2bId, onCancelSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cancelInfo, setCancelInfo] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const { saveToken, saveUsuario } = useAuth();

  const handleCancelSubscription = async () => {
    if (!b2bId) {
      setError('No se encontró el ID del usuario B2B');
      return;  
    }

    setLoading(true);
    setError(null);

    try {
      // Determinar la URL del API según el entorno
      const apiUrl = import.meta.env.DEV
        ? '/api/stripe/cancel-subscription'
        : 'https://admin.residente.mx/api/stripe/cancel-subscription';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ b2b_id: b2bId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cancelar la suscripción');
      }

      setCancelInfo(data);
      
      // Si la invoice requiere pago manual, redirigir al usuario
      if (data.invoiceStatus === 'open' && data.invoiceUrl) {
        window.location.href = data.invoiceUrl;
      } else if (data.subscriptionCanceled) {
        // Si ya se canceló automáticamente
        const mensaje = `Suscripción cancelada exitosamente. Se cobraron ${data.mesesRestantes} mes(es) restante(s) por un total de $${(data.montoCobrado / 100).toFixed(2)} ${data.moneda.toUpperCase()}.\n\nTu sesión será cerrada y no podrás acceder al dashboard B2B.`;
        
        alert(mensaje);
        
        // Actualizar el usuario en el contexto para reflejar que suscripcion es 0
        // Esto asegura que si intenta acceder de nuevo, será bloqueado
        const usuarioActualizado = {
          ...JSON.parse(localStorage.getItem('usuario') || '{}'),
          suscripcion: 0
        };
        saveUsuario(usuarioActualizado);
        
        // Llamar al callback si existe
        if (onCancelSuccess) {
          onCancelSuccess(data);
        }
        
        // Cerrar sesión y redirigir después de un breve delay
        setTimeout(() => {
          saveToken(null);
          saveUsuario(null);
          navigate('/login?mensaje=Suscripción cancelada exitosamente');
        }, 1500);
      }

    } catch (err) {
      console.error('Error cancelando suscripción:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const formatCurrency = (amount, currency = 'mxn') => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (cancelInfo && cancelInfo.subscriptionCanceled) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-800 font-semibold">
          ✅ Suscripción cancelada exitosamente
        </p>
        <p className="text-green-700 text-sm mt-2">
          Se cobraron {cancelInfo.mesesRestantes} mes(es) restante(s) por un total de{' '}
          {formatCurrency(cancelInfo.montoCobrado, cancelInfo.moneda)}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          disabled={loading}
        >
          {loading ? 'Procesando...' : 'Cancelar Suscripción'}
        </button>
      ) : (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-4">
          <p className="text-yellow-800 font-semibold">
            ⚠️ ¿Estás seguro de que deseas cancelar tu suscripción?
          </p>
          <p className="text-yellow-700 text-sm">
            Al cancelar, se te cobrarán los meses restantes de tu membresía anual de una sola vez.
            La suscripción se cancelará después del pago.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleCancelSubscription}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Sí, cancelar suscripción'}
            </button>
            <button
              onClick={() => {
                setShowConfirm(false);
                setError(null);
              }}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {cancelInfo && cancelInfo.invoiceStatus === 'open' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 font-semibold">
            💳 Pago pendiente
          </p>
          <p className="text-blue-700 text-sm mt-2">
            Se requiere completar el pago de {formatCurrency(cancelInfo.montoCobrado, cancelInfo.moneda)} para cancelar la suscripción.
          </p>
          {cancelInfo.invoiceUrl && (
            <a
              href={cancelInfo.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Pagar ahora
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default CancelSubscriptionButton;

