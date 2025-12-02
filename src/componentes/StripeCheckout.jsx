import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import "./StripeCheckout.css";

// Componente del producto
const ProductDisplay = ({ onSubscribe, loading, errorMessage }) => (
  <section>
    <div className="product">
      <Logo />
      <div className="description">
        <h3>Membresía Premium</h3>
        <h5>$2,199.00 MXN al mes</h5>
        <p className="iva-text">Ya con IVA incluido</p>
      </div>
    </div>

    {errorMessage && (
      <div className="error-message">
        <p>{errorMessage}</p>
      </div>
    )}

    <button id="checkout-button" onClick={onSubscribe} disabled={loading}>
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
  const [stripe, setStripe] = useState(null);

  // Detectar ?success=true
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

  // Cargar Stripe
  useEffect(() => {
    const initStripe = async () => {
      const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
      if (stripeKey) {
        const stripeInstance = await loadStripe(stripeKey);
        setStripe(stripeInstance);
      }
    };
    initStripe();
  }, []);

  // Crear sesión de suscripción
  const handleSubscribe = async () => {
    setLoading(true);
    setMessage("");

    try {
      // Usar la ruta que sabemos que funciona
      const apiUrl = import.meta.env.DEV
        ? "/api/stripe/create-subscription-session"
        : "https://admin.residente.mx/api/stripe/create-subscription-session";

      const requestBody = {
        priceId: "price_1SY9IGRzQ7oLCa50mibJc2n3",
        b2b_id: 1,
        customerEmail: "christophervalero05@hotmail.com",
        successUrl: `${window.location.origin}/stripe-checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/stripe-checkout?canceled=true`,
      };

      console.log("Enviando datos a:", apiUrl);
      console.log("Body:", requestBody);

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }); 

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error del servidor:", {
          status: res.status,
          statusText: res.statusText,
          headers: Object.fromEntries(res.headers.entries()),
          body: errorText
        });
        throw new Error(`Error ${res.status}: ${errorText}`);
      }

      const data = await res.json();

      if (data.url) {
        // Redirigir al checkout de Stripe
        window.location.href = data.url;
      } else {
        setLoading(false);
        setMessage("Error: No se recibió la URL del checkout.");
      }
    } catch (error) {
      setLoading(false);
      setMessage(error.message || "Error creando la sesión de suscripción.");
    }
  };

  if (!success && message === "") {
    return (
      <ProductDisplay
        onSubscribe={handleSubscribe}
        loading={loading}
        errorMessage={message}
      />
    );
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
