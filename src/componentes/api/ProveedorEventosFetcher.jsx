import { useEffect, useState } from "react";
import { proveedorPorSlug } from "./proveedoresEventosApi";

export default function ProveedorEventosFetcher({ slug, children }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proveedor, setProveedor] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await proveedorPorSlug(slug, { preview: true });
        if (!cancelled) setProveedor(data);
      } catch (e) {
        if (!cancelled) setError(e.message || "Error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return children({ loading, error, proveedor });
}
