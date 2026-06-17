import React, { useEffect, useState } from "react";
import { urlApi } from "../../api/url";

// ─────────────────────────────────────────────────────────────────────────
// Dashboard "¿Qué se muestra en la portada y de dónde sale?"
//
// Mapea cada bloque de la portada nueva del sitio público (HeroDesktop.astro,
// rama soloNueva) con el filtro REAL que usa por detrás (etiqueta editorial,
// tipo_nota o formato_nota). Sirve para entender por qué el título visible a
// veces no coincide con la etiqueta que se configura en el dashboard de notas.
//
// La columna "filtro" es la fuente de verdad. La columna "front" es el texto
// que ve el usuario en la web. Cuando difieren, se marca como ⚠ discrepancia.
// ─────────────────────────────────────────────────────────────────────────

const ENC = (s) => encodeURIComponent(s);

// Construye la URL pública de preview (los mismos endpoints que consume el sitio).
const fetchUrlEtiqueta = (etq, limit) =>
  `${urlApi}api/notas/por-etiqueta/${ENC(etq)}?limit=${limit}`;
const fetchUrlEtiquetaDestacada = (etq, limit, random) =>
  `${urlApi}api/notas/por-etiqueta-destacada/${ENC(etq)}?limit=${limit}${
    random ? "&random=1" : ""
  }`;
const fetchUrlTipo = (tipo, limit) =>
  `${urlApi}api/notas/por-tipo-nota/${ENC(tipo)}?limit=${limit}`;
const fetchUrlFormato = (formato, limit, random) =>
  `${urlApi}api/notas/por-formato/${ENC(formato)}?limit=${limit}${
    random ? "&random=1" : ""
  }`;

// tipoFiltro: "etiqueta" | "tipo" | "formato" | "manual" | "buscador"
const FILAS = [
  {
    titulo: "① Fila de buscadores",
    bloques: [
      {
        front: "Buscador de Resi (chat)",
        tipoFiltro: "buscador",
        valorReal: "ChatSearchBar",
        nota: "No muestra notas: abre el chat del concierge Resi.",
      },
      {
        front: "Buscador general",
        tipoFiltro: "buscador",
        valorReal: "BuscadorGlobal",
        nota: "No muestra notas: búsqueda global del sitio.",
      },
    ],
  },
  {
    titulo: "② Portada destacada + Dónde comer",
    bloques: [
      {
        front: "Noticias (columna izquierda)",
        tipoFiltro: "formato",
        valorReal: "noticia",
        limit: 6,
        fetchUrl: fetchUrlFormato("noticia", 6),
        nota: "Las 6 notas más nuevas con formato_nota = noticia.",
      },
      {
        front: "Reflexión destacada (centro grande)",
        tipoFiltro: "formato",
        valorReal: "reflexion",
        limit: 1,
        random: true,
        fetchUrl: fetchUrlFormato("reflexion", 1, true),
        nota: "1 reflexión AL AZAR de todas las publicadas (cambia en cada carga).",
      },
      {
        front: "Dónde comer en {mes}",
        tipoFiltro: "etiqueta",
        valorReal: "5 razones",
        limit: 4,
        fetchUrl: fetchUrlEtiqueta("5 razones", 4),
        discrepancia: true,
        nota: 'El título dice "Dónde comer" pero la etiqueta editorial real es "5 razones".',
      },
    ],
  },
  {
    titulo: "③ Más recomendaciones (franja full-width)",
    bloques: [
      {
        front: "Recomendaciones",
        tipoFiltro: "etiqueta",
        valorReal: "recomendaciones",
        limit: 6,
        fetchUrl: fetchUrlEtiqueta("recomendaciones", 6),
        nota: "Las 6 más nuevas con la etiqueta editorial 'recomendaciones'.",
      },
    ],
  },
  {
    titulo: "④ Portada Mundial",
    bloques: [
      {
        front: "Nota principal (foto grande)",
        tipoFiltro: "manual",
        valorReal: "ID fijo: 2608",
        nota: "Nota fija por ID en el código (NOTA_PRINCIPAL_ID = 2608).",
      },
      {
        front: "Grid de restaurantes promovidos",
        tipoFiltro: "manual",
        valorReal: "restaurantes promovidos",
        nota: "No son notas: restaurantes con solo_promovidos=1 (aleatorios).",
      },
    ],
  },
  {
    titulo: "⑤ Cuadrícula de 4 columnas (PortadaCuadrilla)",
    bloques: [
      {
        front: "Restaurantes",
        tipoFiltro: "tipo",
        valorReal: "Restaurantes",
        limit: 15,
        fetchUrl: fetchUrlTipo("Restaurantes", 15),
        nota: "Notas con tipo_nota = Restaurantes (toma las 3 más nuevas).",
      },
      {
        front: "Food & Drink",
        tipoFiltro: "tipo",
        valorReal: "Food & Drink",
        limit: 15,
        fetchUrl: fetchUrlTipo("Food & Drink", 15),
        nota: "Notas con tipo_nota = Food & Drink (toma las 3 más nuevas).",
      },
      {
        front: "Antojería",
        tipoFiltro: "tipo",
        valorReal: "Antojos",
        limit: 15,
        fetchUrl: fetchUrlTipo("Antojos", 15),
        discrepancia: true,
        nota: 'El título dice "Antojería" pero el tipo_nota real en la BD es "Antojos".',
      },
      {
        front: "Restaurantes recomendados (Todo sobre…)",
        tipoFiltro: "etiqueta",
        valorReal: "restaurantes recomendados",
        limit: 3,
        random: true,
        fetchUrl: fetchUrlEtiquetaDestacada("restaurantes recomendados", 3, true),
        nota: "Etiqueta 'restaurantes recomendados' (incluye destacadas, orden aleatorio). Si solo hay 3 notas con la etiqueta, siempre se ven las mismas.",
      },
    ],
  },
  {
    titulo: "⑥ Secciones inferiores",
    bloques: [
      {
        front: "Platillos icónicos",
        tipoFiltro: "tipo",
        valorReal: "Food & Drink",
        limit: 70,
        fetchUrl: fetchUrlTipo("Food & Drink", 70),
        nota: "Sección de platillos icónicos basada en tipo_nota = Food & Drink (límite 70).",
      },
      {
        front: "Antojería (sección inferior)",
        tipoFiltro: "tipo",
        valorReal: "Antojos",
        limit: 30,
        fetchUrl: fetchUrlTipo("Antojos", 30),
        discrepancia: true,
        nota: 'Título "Antojería" → tipo_nota real "Antojos".',
      },
    ],
  },
];

const ESTILO_FILTRO = {
  etiqueta: { label: "ETIQUETA", clase: "bg-amber-100 text-amber-800 border-amber-300" },
  tipo: { label: "TIPO_NOTA", clase: "bg-blue-100 text-blue-800 border-blue-300" },
  formato: { label: "FORMATO_NOTA", clase: "bg-purple-100 text-purple-800 border-purple-300" },
  manual: { label: "MANUAL", clase: "bg-gray-200 text-gray-700 border-gray-300" },
  buscador: { label: "BUSCADOR", clase: "bg-gray-100 text-gray-500 border-gray-300" },
};

const BloqueCard = ({ bloque }) => {
  const [notas, setNotas] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!bloque.fetchUrl) return;
    let cancelado = false;
    setCargando(true);
    setError(null);
    (async () => {
      try {
        const res = await fetch(bloque.fetchUrl, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelado) setNotas(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelado) setError(e.message || "Error");
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [bloque.fetchUrl]);

  const estilo = ESTILO_FILTRO[bloque.tipoFiltro] || ESTILO_FILTRO.manual;

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Encabezado: título visible + badge del filtro real */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-[15px] font-semibold leading-tight text-gray-900">
          {bloque.front}
        </h3>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide ${estilo.clase}`}
        >
          {estilo.label}
        </span>
      </div>

      {/* Valor real del filtro */}
      <code className="mb-2 block w-fit rounded bg-gray-900 px-2 py-1 text-[12px] font-medium text-white">
        {bloque.valorReal}
      </code>

      {/* Discrepancia front vs real */}
      {bloque.discrepancia && (
        <p className="mb-2 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] leading-snug text-red-700">
          ⚠ El nombre visible no coincide con el filtro real.
        </p>
      )}

      {/* Nota aclaratoria */}
      {bloque.nota && (
        <p className="mb-2 text-[11px] leading-snug text-gray-500">{bloque.nota}</p>
      )}

      {/* Endpoint */}
      {bloque.fetchUrl && (
        <p className="mb-2 break-all text-[10px] text-gray-400">
          {bloque.fetchUrl.replace(urlApi, "/")}
        </p>
      )}

      {/* Notas en vivo */}
      {bloque.fetchUrl && (
        <div className="mt-auto border-t border-gray-100 pt-2">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">
            Notas mostrándose ahora
          </p>
          {cargando && <p className="text-[11px] text-gray-400">Cargando…</p>}
          {error && (
            <p className="text-[11px] text-red-500">No se pudo cargar ({error})</p>
          )}
          {notas && notas.length === 0 && (
            <p className="text-[11px] text-amber-600">
              0 notas con este filtro.
            </p>
          )}
          {notas && notas.length > 0 && (
            <ol className="list-decimal space-y-0.5 pl-4">
              {notas.slice(0, 6).map((n) => (
                <li key={n.id} className="text-[12px] leading-snug text-gray-700">
                  {n.titulo || `Nota #${n.id}`}
                  {n.tipo_nota && (
                    <span className="ml-1 text-[10px] text-gray-400">
                      · {n.tipo_nota}
                    </span>
                  )}
                </li>
              ))}
              {notas.length > 6 && (
                <li className="list-none text-[10px] text-gray-400">
                  +{notas.length - 6} más…
                </li>
              )}
            </ol>
          )}
        </div>
      )}
    </div>
  );
};

const PortadaEtiquetasDashboard = () => {
  return (
    <div className="max-w-[1080px] mx-auto py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Portada: ¿qué se muestra y de dónde sale?
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Cada bloque de la portada nueva con el filtro real que usa por detrás
          (etiqueta editorial, tipo_nota o formato_nota) y las notas que está
          mostrando en este momento.
        </p>

        {/* Leyenda */}
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(ESTILO_FILTRO).map(([k, v]) => (
            <span
              key={k}
              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${v.clase}`}
            >
              {v.label}
            </span>
          ))}
          <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">
            ⚠ DISCREPANCIA
          </span>
        </div>
      </header>

      <div className="space-y-8">
        {FILAS.map((fila) => (
          <section key={fila.titulo}>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-700">
              {fila.titulo}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {fila.bloques.map((bloque) => (
                <BloqueCard key={bloque.front} bloque={bloque} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default PortadaEtiquetasDashboard;
