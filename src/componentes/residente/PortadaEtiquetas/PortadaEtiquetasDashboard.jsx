import React, { useEffect, useState } from "react";
import { urlApi, imgApi } from "../../api/url";
import { Iconografia } from "../../utils/Iconografia";

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

// ─────────────────────────────────────────────────────────────────────────
// Vista previa EN VIVO de la cola "taquerias iconicas" (mismo diseño que la
// portada pública). La cola por tiempo (endpoint cola-etiqueta) entrega una
// ventana de 4: índice 0 = nota grande (izquierda), índices 1·2·3 = notas
// chicas (derecha). Avanza 1 nota por minuto; el botón "Actualizar" la repuebla.
// ─────────────────────────────────────────────────────────────────────────

const FALLBACK_IMG = `${imgApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`;

// sticker (clave) -> URL del icono, igual que en el sitio público.
const getIconoUrl = (clave) => {
  const found =
    Iconografia.categorias.find((i) => i.clave === clave)?.icono ||
    Iconografia.ocasiones.find((i) => i.clave === clave)?.icono ||
    Iconografia.zonas.find((i) => i.clave === clave)?.icono;
  return found || null;
};

const iconoDeNota = (nota) => {
  const stickers = Array.isArray(nota?.sticker)
    ? nota.sticker
    : nota?.sticker
      ? [nota.sticker]
      : [];
  return stickers[0] ? getIconoUrl(stickers[0]) : null;
};

// Preview genérico de la cola por etiqueta. Reutilizable para cada ruta
// (taquerías, reposterías, …) cambiando props.
const ColaPreview = ({ numero, nombre, etiqueta, tituloPortada, interiorUrl }) => {
  const VENTANA = 4; // las 4 visibles en la portada (0 grande + 1·2·3 chicas)
  // Pedimos una ventana grande para traer TODA la cola restante de la ronda y
  // poder listar las "próximas a aparecer". Las primeras 4 son las que salen ya.
  const url = `${urlApi}api/notas/cola-etiqueta/${ENC(etiqueta)}?ventana=500`;

  const [ventana, setVentana] = useState([]);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [actualizado, setActualizado] = useState(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setVentana(Array.isArray(data) ? data : []);
      setActualizado(new Date());
    } catch (e) {
      setError(e.message || "Error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const notaGrande = ventana[0] ?? null;
  const notasChicas = ventana.slice(1, 4);

  return (
    <section className="mt-12">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700">
            {numero} Vista previa en vivo · Cola {nombre}
          </h2>
          <p className="mt-1 text-[11px] leading-snug text-gray-500">
            Endpoint <code className="rounded bg-gray-100 px-1">cola-etiqueta</code>{" "}
            (ventana = {VENTANA}). Índice 0 = nota grande, 1·2·3 = notas chicas.
            Avanza 1 nota por minuto y al agotarse la fila rebaraja.
          </p>
        </div>
        <button
          onClick={cargar}
          disabled={cargando}
          className="shrink-0 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {cargando ? "Cargando…" : "↻ Actualizar"}
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {error && (
          <p className="text-[12px] text-red-500">No se pudo cargar ({error})</p>
        )}
        {!error && ventana.length === 0 && !cargando && (
          <p className="text-[12px] text-amber-600">
            0 notas en la cola. Verifica que las notas tengan la etiqueta{" "}
            <code className="rounded bg-gray-100 px-1">{etiqueta}</code>{" "}
            aplicada en la base de datos de producción.
          </p>
        )}

        {ventana.length > 0 && (
          <div className="mx-auto grid max-w-[1000px] grid-cols-2 items-center gap-x-16">
            {/* ── Izquierda: nota grande (índice 0) ── */}
            <div>
              <a
                href={interiorUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                <h3 className="block text-center font-bebas text-[24px] font-medium uppercase leading-[1] tracking-[-0.04em]">
                  {tituloPortada}
                </h3>
              </a>
              <p className="my-2 text-center text-[10px] font-black uppercase text-gray-400">
                #0 · nota grande
              </p>
              {notaGrande && (
                <a
                  href={`https://residente.mx/notas/${notaGrande.slug ?? notaGrande.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group"
                >
                  <p className="text-center text-[28px] leading-[1.1] group-hover:underline">
                    {notaGrande.titulo}
                  </p>
                </a>
              )}
            </div>

            {/* ── Derecha: 3 notas chicas (índices 1·2·3) ── */}
            <div className="flex flex-col gap-3">
              {notasChicas.map((nota, idx) => {
                const iconoUrl = iconoDeNota(nota);
                return (
                  <a
                    key={nota.id}
                    href={`https://residente.mx/notas/${nota.slug ?? nota.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex flex-row items-center gap-3"
                  >
                    <div className="relative h-[100px] w-[100px] flex-shrink-0">
                      <div className="h-full w-full overflow-hidden rounded-full bg-gray-100">
                        <img
                          src={nota.imagen || FALLBACK_IMG}
                          alt={nota.nombre_restaurante || nota.titulo || ""}
                          width={200}
                          height={200}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      {iconoUrl && (
                        <img
                          src={iconoUrl}
                          alt=""
                          className="absolute -left-1 -top-2 z-10 h-8 w-8 object-contain"
                        />
                      )}
                      <span className="absolute -bottom-1 -right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-[11px] font-bold text-white">
                        {idx + 1}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="font-bebas text-[14px] uppercase leading-[1.1]">
                        {nota.nombre_restaurante || "Sin nombre"}
                      </span>
                      <h3 className="font-roman text-[14px] leading-[1.2] text-gray-900 group-hover:underline">
                        {nota.titulo}
                      </h3>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Detalle expandible: toda la cola en orden (tabla con scroll) ── */}
        {ventana.length > 0 && (
          <details className="mt-6 w-full border-t border-gray-100 pt-4">
            <summary className="cursor-pointer select-none text-[13px] font-semibold text-gray-700 hover:text-gray-900">
              Próximas notas en la cola ({ventana.length}) — orden en que irán
              apareciendo
            </summary>

            <div className="mt-3 max-h-[360px] overflow-y-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse text-left text-[12px]">
                <thead className="sticky top-0 z-10 bg-gray-50 text-[10px] uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-3 py-2 font-bold">#</th>
                    <th className="px-3 py-2 font-bold">Foto</th>
                    <th className="px-3 py-2 font-bold">Restaurante</th>
                    <th className="px-3 py-2 font-bold">Título</th>
                    <th className="px-3 py-2 font-bold">ID</th>
                  </tr>
                </thead>
                <tbody>
                  {ventana.map((nota, idx) => {
                    const visible = idx < VENTANA; // las 4 que se ven ahora
                    return (
                      <tr
                        key={nota.id}
                        className={`border-t border-gray-100 ${
                          visible ? "bg-amber-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-3 py-2 align-middle font-mono text-gray-500">
                          {idx}
                          {visible && (
                            <span className="ml-1 rounded bg-amber-200 px-1 text-[9px] font-bold text-amber-800">
                              {idx === 0 ? "GRANDE" : "VISIBLE"}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 align-middle">
                          <img
                            src={nota.imagen || FALLBACK_IMG}
                            alt=""
                            width={36}
                            height={36}
                            loading="lazy"
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        </td>
                        <td className="px-3 py-2 align-middle font-bebas text-[13px] uppercase leading-tight">
                          {nota.nombre_restaurante || "—"}
                        </td>
                        <td className="px-3 py-2 align-middle leading-snug text-gray-800">
                          <a
                            href={`https://residente.mx/notas/${nota.slug ?? nota.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline"
                          >
                            {nota.titulo}
                          </a>
                        </td>
                        <td className="px-3 py-2 align-middle font-mono text-gray-400">
                          {nota.id}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[10px] text-gray-400">
              En amarillo, las {VENTANA} que se muestran ahora en la portada (la #0
              es la nota grande). Cada minuto el cursor avanza 1 y entra la
              siguiente; al terminar la fila, rebaraja.
            </p>
          </details>
        )}

        {actualizado && (
          <p className="mt-4 text-right text-[10px] text-gray-400">
            Actualizado {actualizado.toLocaleTimeString("es-MX")} · la cola avanza
            cada minuto
          </p>
        )}
      </div>
    </section>
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

      {/* Vista previa visual de las colas por etiqueta (hasta el final) */}
      <ColaPreview
        numero="⑦"
        nombre="Taquerías icónicas"
        etiqueta="taquerias iconicas"
        tituloPortada="Taquerías icónicas de Nuevo León"
        interiorUrl="https://residente.mx/taquerias-iconicas"
      />
      <ColaPreview
        numero="⑧"
        nombre="Ruta de Cantinas"
        etiqueta="cantinas"
        tituloPortada="Ruta de Cantinas de Nuevo León"
        interiorUrl="https://residente.mx/cantinas"
      />
      <ColaPreview
        numero="⑨"
        nombre="Reposterías icónicas"
        etiqueta="reposterias"
        tituloPortada="Reposterías icónicas de Nuevo León"
        interiorUrl="https://residente.mx/reposterias"
      />
      <ColaPreview
        numero="⑩"
        nombre="Cafés independientes"
        etiqueta="cafes"
        tituloPortada="Cafés Independientes de Nuevo León"
        interiorUrl="https://residente.mx/cafes"
      />
      <ColaPreview
        numero="⑪"
        nombre="Panaderías de colonia"
        etiqueta="panaderias de colonia"
        tituloPortada="Panaderías de Colonia de Nuevo León"
        interiorUrl="https://residente.mx/panaderias-colonia"
      />
      <ColaPreview
        numero="⑫"
        nombre="Ruta de Mercados"
        etiqueta="mercados"
        tituloPortada="Ruta de Mercados de Nuevo León"
        interiorUrl="https://residente.mx/mercados"
      />
    </div>
  );
};

export default PortadaEtiquetasDashboard;
