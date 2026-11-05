import React, { useMemo, useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { urlApi } from "../../../api/url";
import { useAuth } from "../../../Context";
import TerminosyCondiciones from "../FormularioNuevoClienteB2b/TerminosyCondiciones";

const MARKETS = [
  "San Antonio",
  "Austin",
  "Laredo",
  "Rio Grande Valley 956",
  "South Padre Island",
];

const CATEGORIES = [
  "Café / Bakery",
  "Restaurant",
  "Bar / Nightlife",
  "Hotel / Hospitality",
  "Specialty Food",
  "Other",
];

const FormTexas = ({ plan, onBack }) => {
  const { usuario: usuarioSesion } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nombre_restaurante: "",
    market: "",
    category: "",
    website: "",
    nombre_responsable_restaurante: "",
    correo: "",
    telefono: "",
    nombre_usuario: "",
    password: "",
    confirm_password: "",
  });

  const monthly = plan?.precioMensual || 0;
  const meses = plan?.meses || 12;
  const totalCommitment = monthly * meses;

  const nextBillingDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setError("");

    if (!aceptaTerminos) {
      setError("You must agree to the Terms & Conditions to continue.");
      return;
    }
    if (
      !formData.nombre_restaurante ||
      !formData.market ||
      !formData.category ||
      !formData.nombre_responsable_restaurante ||
      !formData.correo ||
      !formData.telefono ||
      !formData.nombre_usuario ||
      !formData.password
    ) {
      setError("Please complete all required fields.");
      return;
    }
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo.trim())) {
      setError("Invalid email format.");
      return;
    }

    setLoading(true);
    try {
      const correoLimpio = formData.correo.trim().toLowerCase();
      const payloadForm = {
        ...formData,
        correo: correoLimpio,
        tier: plan.tier,
        meses: plan.meses,
      };
      localStorage.setItem("b2b_texas_form_data", JSON.stringify(payloadForm));
      localStorage.setItem("b2b_texas_plan", JSON.stringify(plan));

      const userData = {
        nombre_responsable_restaurante: formData.nombre_restaurante,
        correo: correoLimpio,
        telefono: formData.telefono || null,
        nombre_responsable: formData.nombre_responsable_restaurante || null,
        market: formData.market,
        category: formData.category,
        website: formData.website || null,
        terminos_condiciones: true,
        fecha_aceptacion_terminos: new Date().toISOString(),
      };

      const rolSesion = (usuarioSesion?.rol || "").toLowerCase();
      const vendedorIdSesion =
        (rolSesion === "vendedor" || rolSesion === "residente") &&
        usuarioSesion?.id
          ? Number(usuarioSesion.id)
          : null;

      const successUrl = `${window.location.origin}/admin/registrob2b-texas?payment_success=true&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/admin/registrob2b-texas?payment_canceled=true`;

      const res = await fetch(
        `${urlApi}api/stripe/create-subscription-session-texas`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tier: plan.tier,
            numeroMeses: plan.meses,
            userData,
            customerEmail: correoLimpio,
            market: formData.market,
            category: formData.category,
            website: formData.website,
            successUrl,
            cancelUrl,
            ...(vendedorIdSesion && { vendedor_id: vendedorIdSesion }),
          }),
        },
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Error ${res.status}: ${errText}`);
      }

      const data = await res.json();
      if (!data.url) throw new Error("No checkout URL received.");
      window.location.href = data.url;
    } catch (err) {
      setError(err.message || "Could not start checkout.");
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-black";

  return (
    <div className="max-w-[900px] mx-auto px-4 py-8">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-gray-600 hover:text-black mb-6"
      >
        ← Back to plans
      </button>

      <h1 className="text-3xl font-black mb-2">Your Business Information</h1>
      <p className="text-sm text-gray-600 mb-8">
        Complete your details to start the South Texas membership.
      </p>

      <form onSubmit={handleSubscribe} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Business name *</label>
            <input
              name="nombre_restaurante"
              value={formData.nombre_restaurante}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">City / Market *</label>
            <select
              name="market"
              value={formData.market}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select market</option>
              {MARKETS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Business category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              Website / Instagram
            </label>
            <input
              name="website"
              value={formData.website}
              onChange={handleChange}
              className={inputClass}
              placeholder="https:// or @handle"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Contact name *</label>
            <input
              name="nombre_responsable_restaurante"
              value={formData.nombre_responsable_restaurante}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Email address *</label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Phone number *</label>
            <input
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Username *</label>
            <input
              name="nombre_usuario"
              value={formData.nombre_usuario}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={inputClass}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              Confirm password *
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                className={inputClass}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowConfirm((v) => !v)}
              >
                {showConfirm ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-xl border border-gray-200 p-5 bg-gray-50 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Payment Summary</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-600">Selected membership</dt>
                <dd className="font-semibold capitalize">{plan?.tier}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-600">Subscription term</dt>
                <dd className="font-semibold">{meses} Months</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-600">Monthly charge</dt>
                <dd className="font-semibold">${monthly} USD</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-600">Total contract commitment</dt>
                <dd className="font-semibold">${totalCommitment} USD</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-gray-200 pt-3">
                <dt className="text-gray-600">Today&apos;s charge</dt>
                <dd className="font-bold text-base">${monthly} USD</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-600">Next billing date</dt>
                <dd className="font-semibold">{nextBillingDate}</dd>
              </div>
            </dl>

            <div className="mt-6 text-xs text-gray-600 leading-relaxed space-y-2">
              <p className="font-semibold text-gray-800">Subscription Agreement</p>
              <p>
                By subscribing, you agree to the selected fixed subscription term
                of 6, 9, or 12 months, with recurring monthly billing.
              </p>
              <p>
                Early cancellation does not release the subscriber from the
                remaining financial obligations of the agreed term.
              </p>
              <p>
                Membership fees are generally non-refundable once service has
                begun, except where required by applicable law. Renewal and
                cancellation conditions are governed by Residente&apos;s Terms
                and Conditions.
              </p>
              <p>
                Residente does not guarantee sales, traffic, or specific
                financial results.
              </p>
            </div>

            <label className="mt-5 flex items-start gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
                className="mt-1"
              />
              <span>
                I have read and agree to the{" "}
                <button
                  type="button"
                  className="underline font-semibold"
                  onClick={() => setShowTerms(true)}
                >
                  Terms & Conditions, Refund Policy, and Privacy Policy
                </button>
                , including the recurring payment authorization and the selected
                subscription commitment.
              </span>
            </label>

            {error && (
              <p className="mt-4 text-sm text-red-600 whitespace-pre-wrap">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full bg-[#fff200] text-black font-bold py-3 rounded-lg hover:brightness-95 disabled:opacity-60"
            >
              {loading ? "Redirecting to Stripe…" : "SUBSCRIBE NOW"}
            </button>
          </div>
        </div>
      </form>

      {showTerms && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] overflow-auto p-4 relative">
            <button
              type="button"
              className="absolute right-4 top-3 text-sm font-bold"
              onClick={() => setShowTerms(false)}
            >
              Close
            </button>
            <TerminosyCondiciones />
          </div>
        </div>
      )}
    </div>
  );
};

export default FormTexas;
