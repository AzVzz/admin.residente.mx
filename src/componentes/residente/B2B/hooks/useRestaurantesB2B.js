import { useEffect, useState } from "react";
import { urlApi } from "../../../api/url";

// Carga todos los restaurantes que pertenecen al usuario B2B autenticado,
// o a otro usuario cuando el solicitante es residente con es_superadmin
// (modo admin: se pasa `viewAsUserId`).
// Para cada uno hace fetch en paralelo del detalle (/api/restaurante/:slug)
// y de las stats de notas etiquetadas (/api/notas/restaurante/:id/stats),
// y devuelve un array N estable: [{ ...detalle, notasStats }, ...].
export function useRestaurantesB2B(token, viewAsUserId = null) {
  const [restaurantes, setRestaurantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
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
          if (!cancelado) setRestaurantes([]);
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

        if (!cancelado) {
          setRestaurantes(detalles.filter(Boolean));
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
  }, [token, viewAsUserId]);

  return { restaurantes, loading, error };
}
