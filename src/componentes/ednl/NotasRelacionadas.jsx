import { useEffect, useId, useRef, useState } from 'react';
import { urlApi } from '../api/url.js';

const PUBLIC_API_URL = 'https://admin.residente.mx/';
const PUBLIC_SITE_URL = 'https://residente.mx/';
const MAX_CONCURRENT_DETAILS = 5;
const MAX_CONCURRENT_RESTAURANTS = 4;
const RELATED_CACHE_TTL = 5 * 60 * 1000;
const relatedCache = new Map();
const requestQueue = [];
const visibilityCallbacks = new WeakMap();
let activeRequests = 0;
let visibilityObserver;

function scheduleRequest(task) {
  return new Promise((resolve, reject) => {
    requestQueue.push({ task, resolve, reject });
    runQueuedRequests();
  });
}

function runQueuedRequests() {
  while (activeRequests < MAX_CONCURRENT_RESTAURANTS && requestQueue.length > 0) {
    const { task, resolve, reject } = requestQueue.shift();
    activeRequests += 1;
    Promise.resolve().then(task).then(resolve, reject).finally(() => {
      activeRequests -= 1;
      runQueuedRequests();
    });
  }
}

function observeNearby(element, onVisible) {
  if (!('IntersectionObserver' in window)) {
    onVisible();
    return () => {};
  }
  if (!visibilityObserver) {
    visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const callback = visibilityCallbacks.get(entry.target);
        visibilityCallbacks.delete(entry.target);
        visibilityObserver.unobserve(entry.target);
        if (callback) callback();
      });
    }, { rootMargin: '250px 0px' });
  }
  visibilityCallbacks.set(element, onVisible);
  visibilityObserver.observe(element);
  return () => {
    visibilityCallbacks.delete(element);
    visibilityObserver.unobserve(element);
  };
}

function isLocalApi() {
  try {
    const hostname = new URL(urlApi, window.location.origin).hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

function parseEtiquetas(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return null;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
  return response.json();
}

function getRelatedNotas(origen, restauranteId, slug) {
  const key = JSON.stringify([origen, restauranteId, slug]);
  const cached = relatedCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.promise;

  const entry = { expiresAt: Infinity, promise: null };
  entry.promise = scheduleRequest(async () => {
    const apiUrl = origen === 'publicado' ? PUBLIC_API_URL : urlApi;
    let id = restauranteId;
    if (origen === 'publicado') {
      const publico = await fetchJson(`${apiUrl}api/restaurante/seo/${encodeURIComponent(slug)}`);
      if (!publico?.id || publico.slug !== slug) {
        throw new Error('No se encontró este restaurante en el sitio publicado.');
      }
      id = publico.id;
    }
    const data = await fetchJson(`${apiUrl}api/notas/por-restaurante/${encodeURIComponent(id)}`);
    if (!Array.isArray(data)) throw new Error('La respuesta de notas no es válida.');
    return data.filter((nota) => nota && nota.id != null && typeof nota.titulo === 'string');
  }).then((notas) => {
    entry.expiresAt = Date.now() + RELATED_CACHE_TTL;
    return notas;
  }, (error) => {
    if (relatedCache.get(key) === entry) relatedCache.delete(key);
    throw error;
  });
  relatedCache.set(key, entry);
  return entry.promise;
}

async function addEtiquetas(notas, apiUrl, signal) {
  const result = new Array(notas.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < notas.length) {
      const index = nextIndex++;
      const nota = notas[index];
      try {
        const detalle = Object.hasOwn(nota, 'etiquetas')
          ? nota
          : await fetchJson(`${apiUrl}api/notas/id/${encodeURIComponent(nota.id)}`, signal);
        const etiquetas = Object.hasOwn(detalle, 'etiquetas')
          ? parseEtiquetas(detalle.etiquetas)
          : null;
        result[index] = {
          ...nota,
          esCincoRazones: etiquetas === null
            ? null
            : etiquetas.some((etiqueta) =>
              typeof etiqueta === 'string' && etiqueta.trim().toLowerCase() === '5 razones'),
        };
      } catch (error) {
        if (signal.aborted) throw error;
        result[index] = { ...nota, esCincoRazones: null };
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(MAX_CONCURRENT_DETAILS, notas.length) }, worker));
  return result;
}

export default function NotasRelacionadas({ restaurante, slug }) {
  const panelId = useId();
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isNearby, setIsNearby] = useState(false);
  const [isLocal] = useState(isLocalApi);
  const [origen, setOrigen] = useState(isLocal ? 'publicado' : 'actual');
  const [intento, setIntento] = useState(0);
  const [state, setState] = useState({ key: '', notas: null, error: '' });
  const [detalles, setDetalles] = useState({ base: null, notas: null, error: '' });
  const requestKey = JSON.stringify([origen, restaurante.id, slug]);
  const notas = state.key === requestKey ? state.notas : null;
  const error = state.key === requestKey ? state.error : '';
  const notasConEtiquetas = detalles.base === notas ? detalles.notas : null;
  const errorDetalles = detalles.base === notas ? detalles.error : '';
  const shouldLoad = isNearby || isOpen;

  useEffect(() => {
    if (!containerRef.current) return undefined;
    return observeNearby(containerRef.current, () => setIsNearby(true));
  }, []);

  useEffect(() => {
    if (!shouldLoad) return undefined;
    let isCurrent = true;
    setState({ key: requestKey, notas: null, error: '' });
    getRelatedNotas(origen, restaurante.id, slug).then((result) => {
      if (isCurrent) setState({ key: requestKey, notas: result, error: '' });
    }, (requestError) => {
      if (isCurrent) {
        setState({ key: requestKey, notas: null, error: requestError.message || 'No se pudieron cargar las notas.' });
      }
    });
    return () => { isCurrent = false; };
  }, [shouldLoad, origen, restaurante.id, slug, intento, requestKey]);

  useEffect(() => {
    if (!isOpen || !notas) return undefined;
    const controller = new AbortController();
    const apiUrl = origen === 'publicado' ? PUBLIC_API_URL : urlApi;
    setDetalles({ base: notas, notas: null, error: '' });
    addEtiquetas(notas, apiUrl, controller.signal).then((result) => {
      if (!controller.signal.aborted) setDetalles({ base: notas, notas: result, error: '' });
    }, () => {
      if (!controller.signal.aborted) {
        setDetalles({ base: notas, notas: null, error: 'No se pudieron verificar las etiquetas.' });
      }
    });
    return () => controller.abort();
  }, [isOpen, notas, origen, intento]);

  return (
    <div ref={containerRef} className="w-full text-right">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
        className="rounded px-1 py-1 text-xs font-semibold text-gray-600 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Notas relacionadas <span aria-hidden="true">{isOpen ? '▴' : '▾'}</span> ({error ? '—' : notas ? notas.length : '…'})
        <span className="sr-only"> de {restaurante.nombre_restaurante}</span>
      </button>

      {isOpen && (
        <div id={panelId} className="mb-2 rounded border border-gray-200 bg-white p-3 text-left text-sm shadow-sm">
          {isLocal && (
            <label className="mb-3 block text-xs font-semibold text-gray-600">
              Origen de las notas
              <select
                value={origen}
                onChange={(event) => setOrigen(event.target.value)}
                className="mt-1 block w-full rounded border border-gray-300 bg-white p-1 text-sm text-black"
              >
                <option value="publicado">Sitio publicado</option>
                <option value="actual">Base local</option>
              </select>
            </label>
          )}

          {error || errorDetalles ? (
            <div role="alert" className="text-red-700">
              <p>No se pudieron cargar las notas. {error || errorDetalles}</p>
              <button type="button" onClick={() => setIntento((value) => value + 1)} className="mt-1 font-semibold underline">
                Reintentar
              </button>
            </div>
          ) : !notas || !notasConEtiquetas ? (
            <p role="status" className="text-gray-600">Cargando notas y etiquetas…</p>
          ) : notas.length === 0 ? (
            <p className="text-gray-600">No hay notas publicadas relacionadas.</p>
          ) : (
            <div role="list" className="space-y-3">
              {notasConEtiquetas.map((nota) => (
                <div key={nota.id} role="listitem" className="border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                  <a
                    href={`${PUBLIC_SITE_URL}notas/${encodeURIComponent(nota.slug || nota.id)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block leading-snug hover:underline ${nota.esCincoRazones ? 'font-bold underline decoration-2' : 'text-gray-800'}`}
                  >
                    {nota.titulo}
                  </a>
                  {nota.esCincoRazones === true && (
                    <span className="mt-1 inline-block bg-[#FFF200] px-1.5 py-0.5 text-xs font-bold text-black">5 razones</span>
                  )}
                  {nota.esCincoRazones === null && (
                    <span className="mt-1 block text-xs text-amber-700">No se pudo verificar la etiqueta.</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
