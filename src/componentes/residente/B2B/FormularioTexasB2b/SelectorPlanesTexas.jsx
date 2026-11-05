import React, { useMemo, useState } from "react";

const TIERS = [
  {
    key: "local",
    name: "LOCAL",
    subtitle: "Small & Independent Businesses",
    blurb: "Cafés, bakeries, small restaurants, and independent businesses.",
  },
  {
    key: "signature",
    name: "SIGNATURE",
    subtitle: "Established Businesses",
    blurb:
      "Full-service restaurants, bars, specialty dining, and established local businesses.",
  },
  {
    key: "premium",
    name: "PREMIUM",
    subtitle: "Premium & Groups",
    blurb:
      "Fine dining, upscale restaurants, hotels, chains, and larger hospitality businesses.",
  },
];

const TERMS = [6, 9, 12];

const INCLUDED = [
  "Your own business page: Photos, descriptions, menus, location, contact information, and direct links to your business.",
  "Digital directory presence: Visibility within Residente's destination and category directories.",
  "Monthly promotional exposure: One sponsored promotional placement per month within Residente's South Texas digital platform.",
  "Special offers: Publish an exclusive promotion or benefit for Residente readers.",
  "Performance dashboard: Access to your business profile's traffic and engagement information.",
  "Business insights: Access to available Residente market research and industry resources.",
];

const FALLBACK_PRICES = {
  local: { 6: 209, 9: 179, 12: 149 },
  signature: { 6: 309, 9: 269, 12: 219 },
  premium: { 6: 419, 9: 359, 12: 299 },
};

const SelectorPlanesTexas = ({ precios = [], loading = false, onSelectPlan }) => {
  const [tier, setTier] = useState("local");
  const [meses, setMeses] = useState(12);

  const priceMap = useMemo(() => {
    const map = {};
    for (const p of precios) {
      map[`${p.tier}_${p.meses}`] = p;
    }
    return map;
  }, [precios]);

  const selectedFromApi = priceMap[`${tier}_${meses}`];
  const monthly =
    selectedFromApi?.precioMensual ?? FALLBACK_PRICES[tier]?.[meses] ?? 0;

  const handleContinue = () => {
    const plan = selectedFromApi || {
      tier,
      meses,
      mesesTexto: `${meses} months`,
      precioMensual: monthly,
      priceId: `fallback_${tier}_${meses}`,
      nombre: `South Texas ${tier} ${meses}m`,
      moneda: "USD",
      intervalo: "month",
      region: "south_texas",
    };
    onSelectPlan({
      ...plan,
      tier,
      meses,
      precioMensual: monthly,
      moneda: "USD",
    });
  };

  return (
    <div className="max-w-[900px] mx-auto px-4 py-8 text-gray-900">
      <div className="text-center mb-10">
        <p className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-2">
          Residente South Texas
        </p>
        <h1 className="text-4xl font-black mb-3">Business Membership</h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Reach Mexican travelers visiting South Texas.
        </p>
        <p className="mt-4 text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Connect your business with travelers from Monterrey, San Pedro Garza
          García, and Northern Mexico through Residente, a Spanish-language
          food, travel, and lifestyle media platform established in 2015.
        </p>
        <p className="mt-4 text-sm font-medium">
          Available markets: San Antonio · Austin · Laredo · Rio Grande Valley
          956 · South Padre Island.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          What&apos;s included in your membership?
        </h2>
        <ul className="space-y-3">
          {INCLUDED.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-relaxed">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#fff200] shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-2">Choose your membership</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {TIERS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTier(t.key)}
              className={`text-left rounded-xl p-5 border transition ${
                tier === t.key
                  ? "border-black bg-black text-white shadow-lg"
                  : "border-gray-200 bg-white hover:border-black"
              }`}
            >
              <div className="text-xs tracking-widest uppercase opacity-70 mb-1">
                {t.subtitle}
              </div>
              <div className="text-xl font-black mb-2">{t.name}</div>
              <p className="text-sm opacity-80">{t.blurb}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-2">Choose your subscription term</h2>
        <p className="text-sm text-gray-500 mb-4">
          All prices in USD. Billed monthly. Fixed-term subscription commitment.
        </p>

        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading prices…</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Membership</th>
                  {TERMS.map((m) => (
                    <th key={m} className="p-3 text-center">
                      {m} Months
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIERS.map((t) => (
                  <tr key={t.key} className="border-t border-gray-100">
                    <td className="p-3 font-semibold">{t.name}</td>
                    {TERMS.map((m) => {
                      const api = priceMap[`${t.key}_${m}`];
                      const amount =
                        api?.precioMensual ?? FALLBACK_PRICES[t.key][m];
                      const active = tier === t.key && meses === m;
                      return (
                        <td key={m} className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setTier(t.key);
                              setMeses(m);
                            }}
                            className={`w-full rounded-lg py-2 px-2 font-semibold transition ${
                              active
                                ? "bg-[#fff200] text-black"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            ${amount}/mo
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="rounded-xl border border-gray-200 p-5 mb-8 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-gray-500">
              Selected
            </div>
            <div className="font-bold text-lg">
              {tier.toUpperCase()} — {meses} months
            </div>
            <div className="text-sm text-gray-600">
              ${monthly}/mo · Total commitment ${monthly * meses} USD
            </div>
          </div>
          <button
            type="button"
            onClick={handleContinue}
            className="bg-[#fff200] text-black font-bold px-6 py-3 rounded-lg hover:brightness-95"
          >
            Continue
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 leading-relaxed">
        Limited Membership Availability: A maximum of five participating
        businesses per category and market, subject to availability and
        approval. Rates apply to one participating business location.
      </p>
    </div>
  );
};

export default SelectorPlanesTexas;
