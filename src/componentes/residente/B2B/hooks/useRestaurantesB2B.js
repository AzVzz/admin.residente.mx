import { useEffect, useState } from "react";
import { urlApi } from "../../../api/url";

// Cache a nivel de modulo para sobrevivir a navegaciones SPA. Mismo patron
// que ListaNotas.jsx (commit 36678ad). TTL 5 min: los restaurantes B2B
// cambian poco entre navegaciones, no se justifica refetch en cada mount.
const _restCache = new Map();
const _restCacheTime = new Map();
const REST_TTL = 5 * 60 * 1000;
const _isRestCacheValid = (key) => {
  const t = _restCacheTime.get(key);
  return !!(t && Date.now() - t < REST_TTL);
};

// Carga todos los restaurantes que pertenecen al usuario B2B autenticado,
// o a otro usuario cuando el solicitante es residente con es_superadmin
// (modo admin: se pasa `viewAsUserId`).
// Para cada uno hace fetch en paralelo del detalle (/api/restaurante/:slug)
// y de las stats de notas etiquetadas (/api/notas/restaurante/:id/stats),
// y devuelve un array N estable: [{ ...detalle, notasStats }, ...].
export function useRestaurantesB2B(token, viewAsUserId = null) {
  // Hidratacion sincronica desde cache de modulo para skip render con loading=true.
  const cacheKey = `${token || ""}|${viewAsUserId || ""}`;
  const cachedInicial = _isRestCacheValid(cacheKey) ? _restCache.get(cacheKey) : null;
  const [restaurantes, setRestaurantes] = useState(cachedInicial ?? []);
  const [loading, setLoading] = useState(!cachedInicial);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    // Cache hit: hidratar inmediatamente sin red.
    if (_isRestCacheValid(cacheKey)) {
      setRestaurantes(_restCache.get(cacheKey));
      setLoading(false);
      return;
    }

    let cancelado = false;

    const cargar = async () => {
      setLoading(true);
      setError(null);

      try {
        const qs = viewAsUserId ? `?usuario_id=${viewAsUserId}` : "";
        const resBasicos = await fetch(`${urlApi}api/restaurante/basicos${qs}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resBasicos.ok) throw new Error("No se pudieron cargar los restaurantes");
        const basicos = await resBasicos.json();

        if (!Array.isArray(basicos) || basicos.length === 0) {
          if (!cancelado) {
            setRestaurantes([]);
            _restCache.set(cacheKey, []);
            _restCacheTime.set(cacheKey, Date.now());
          }
          return;
        }

        const detalles = await Promise.all(
          basicos.map(async (b) => {
            try {
              const [detalleRes, notasRes] = await Promise.all([
                fetch(`${urlApi}api/restaurante/${b.slug}`),
                b.id
                  ? fetch(`${urlApi}api/notas/restaurante/${b.id}/stats`)
                  : Promise.resolve(null),
              ]);
              const detalle = detalleRes.ok ? await detalleRes.json() : null;
              const notasStats =
                notasRes && notasRes.ok ? await notasRes.json() : null;
              if (!detalle) return null;
              return { ...detalle, notasStats };
            } catch {
              return null;
            }
          }),
        );

        const resultado = detalles.filter(Boolean);
        _restCache.set(cacheKey, resultado);
        _restCacheTime.set(cacheKey, Date.now());

        if (!cancelado) {
          setRestaurantes(resultado);
        }
      } catch (e) {
        if (!cancelado) setError(e);
      } finally {
        if (!cancelado) setLoading(false);
      }
    };

    cargar();
    return () => {
      cancelado = true;
    };
  }, [token, viewAsUserId, cacheKey]);

  return { restaurantes, loading, error };
}
