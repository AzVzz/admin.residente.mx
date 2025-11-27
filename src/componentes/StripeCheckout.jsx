import React, { useState, useEffect } from "react";
import "./StripeCheckout.css";

// Componente de producto
const ProductDisplay = ({ onSubscribe, loading, errorMessage }) => (
  <section>
    <div className="product">
      <Logo />
      <div className="description">
        <h3>Membresía Premium</h3>
        <h5>$99.00 MXN al mes</h5>
      </div>
    </div>
    {errorMessage && (
      <div className="error-message">
        <p>{errorMessage}</p>
      </div>
    )}
    <button 
      id="checkout-button" 
      onClick={onSubscribe}
      disabled={loading}
    >
      {loading ? "Procesando..." : "Suscribirme"}
    </button>
  </section>
);

// Pantalla de éxito
const SuccessDisplay = ({ sessionId }) => (
  <section>
    <div className="product Box-root">
      <Logo />
      <div className="description Box-root">
        <h3>¡Suscripción exitosa!</h3>
      </div>
    </div>
    <p>ID de sesión: {sessionId}</p>
  </section>
);

// Mensaje general
const Message = ({ message }) => (
  <section>
    <p>{message}</p>
  </section>
);

const StripeCheckout = () => {
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      setSuccess(true);
      setSessionId(query.get("session_id"));
    }
    if (query.get("canceled")) {
      setSuccess(false);
      setMessage("La suscripción fue cancelada.");
    }
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    setMessage(""); // Limpiar mensajes anteriores
    
    try {
      // En desarrollo usar el proxy de Vite para evitar CORS
      // En producción usar la URL completa del backend
      const apiUrl = import.meta.env.DEV 
        ? "/api/stripe/create-subscription-session"
        : "https://residente.mx/api/stripe/create-subscription-session";
      
      const res = await fetch(
        apiUrl,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            priceId: "price_1SXRLGRzQ7oLCa500ae89zbx", 
            customerEmail: "juan.perez@example.com",
            successUrl: `${window.location.origin}/stripe-checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/stripe-checkout?canceled=true`,
          }),
        }
      );

      // Verificar si la respuesta es OK
      if (!res.ok) {
        // Si es 404, puede ser que el proxy no esté funcionando o la ruta no existe
        if (res.status === 404) {
          throw new Error(`Error 404: La ruta no fue encontrada. Verifica que: 1) El servidor de Vite se haya reiniciado después de configurar el proxy, 2) La ruta '/api/stripe/create-subscription-session' exista en el backend.`);
        }
        throw new Error(`Error del servidor: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      
      if (data.url) {
        // Redirigir al checkout de Stripe
        window.location.href = data.url;
      } else {
        setLoading(false);
        setMessage(`Error: ${data.error || "No se recibió la URL de checkout del servidor"}`);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error:", error);
      
      // Mensajes más específicos según el tipo de error
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        // Verificar si es un error de CORS
        const isCorsError = error.message.includes("CORS") || 
                           error.message.includes("Access-Control-Allow-Origin") ||
                           (typeof error.message === 'string' && error.message.toLowerCase().includes('cors'));
        
        if (isCorsError) {
          setMessage("Error de CORS: El servidor no permite peticiones desde localhost. Verifica que el backend tenga configurado 'http://localhost:5173' en los orígenes permitidos de CORS.");
        } else {
          setMessage("Error de conexión: No se pudo conectar con el servidor. Verifica que el backend esté funcionando y accesible.");
        }
      } else {
        setMessage(`Error: ${error.message || "Ocurrió un error al crear la sesión de suscripción"}`);
      }
    }
  };

  if (!success && message === "") {
    return <ProductDisplay onSubscribe={handleSubscribe} loading={loading} errorMessage={message} />;
  } else if (success && sessionId !== "") {
    return <SuccessDisplay sessionId={sessionId} />;
  } else {
    return <Message message={message} />;
  }
};

const Logo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14px"
    height="16px"
    viewBox="0 0 14 16"
    version="1.1"
  >
    <g fill="none" fillRule="evenodd">
      <g transform="translate(-121,-40)" fill="#E184DF">
        <path d="M127,50 L126,50 C123.238576,50 121,47.7614237 121,45 C121,42.2385763 123.238576,40 126,40 L135,40 L135,56 L133,56 L133,42 L129,42 L129,56 L127,56 L127,50 Z M127,48 L127,42 L126,42 C124.343146,42 123,43.3431458 123,45 C123,46.6568542 124.343146,48 126,48 L127,48 Z" />
      </g>
    </g>
  </svg>
);

export default StripeCheckout;

