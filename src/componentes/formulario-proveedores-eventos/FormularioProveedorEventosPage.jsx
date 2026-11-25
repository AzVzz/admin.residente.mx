import FormularioProveedorEventos from "./FormularioProveedorEventos";
import ProveedorEventosFetcher from "../api/ProveedorEventosFetcher";
import { useParams } from "react-router-dom";

export default function FormularioProveedorEventosPage() {
  const { slug } = useParams();

  return (
    <ProveedorEventosFetcher slug={slug}>
      {({ loading, error, proveedor }) => {
        if (loading) return <p className="p-8">Cargando…</p>;
        if (error) return <p className="p-8 text-red-600">Error: {error}</p>;
        if (!proveedor) return <div className="p-8">Proveedor no encontrado</div>;
        return (
          <FormularioProveedorEventos proveedor={proveedor} esEdicion />
        );
      }}
    </ProveedorEventosFetcher>
  );
}
