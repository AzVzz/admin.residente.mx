import { useForm, FormProvider } from "react-hook-form";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../Context";
import Login from "../Login";
import useAutoguardado from "../../hooks/useAutoguardado";
import BannerRecuperacion from "../residente/componentes/compFormularioMain/componentes/BannerRecuperacion.jsx";
import {
  defaultValuesProveedor,
  CATEGORIAS_PROVEEDOR,
} from "./constantesProveedorEventos";
import BloqueGeneral from "./secciones/BloqueGeneral";
import EspecializadoPorCategoria from "./secciones/EspecializadoPorCategoria";
import { fileToBase64 } from "./campos/CampoHelpers";
import {
  proveedorCrear,
  proveedorActualizar,
  mediaUrl,
} from "../api/proveedoresEventosApi";

function mapProveedorToForm(p) {
  if (!p) return defaultValuesProveedor;
  return {
    ...defaultValuesProveedor,
    ...p,
    categorias_extra: Array.isArray(p.categorias_extra) ? p.categorias_extra : [],
    contratacion: {
      ...defaultValuesProveedor.contratacion,
      ...(p.contratacion || {}),
    },
    contacto: {
      ...defaultValuesProveedor.contacto,
      ...(p.contacto || {}),
    },
    ficha_especializada: p.ficha_especializada || {},
    logo_preview: mediaUrl(p.url_logo),
    foto_principal_preview: mediaUrl(p.foto_principal),
    galeria: Array.isArray(p.galeria) ? p.galeria : [],
    galeria_files: [],
    logo_file: null,
    foto_principal_file: null,
    catalogo_pdf_file: null,
  };
}

export default function FormularioProveedorEventos({ proveedor, esEdicion }) {
  const { usuario, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const borradorParam = searchParams.get("borrador");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [okMsg, setOkMsg] = useState(null);

  const defaults = useMemo(
    () => mapProveedorToForm(proveedor),
    [proveedor]
  );

  const methods = useForm({
    defaultValues: defaults,
    mode: "onChange",
  });

  const { watch, handleSubmit, reset } = methods;

  const { borradorPendiente, recuperar, descartar, limpiar } = useAutoguardado({
    tipo: "proveedor_eventos",
    watch,
    reset,
    recordId: proveedor?.id,
    borradorParam,
    getTitulo: (v) => v?.nombre_comercial || "Proveedor eventos",
    listo: true,
  });

  if (!usuario || !token) return <Login />;

  const categoria = watch("categoria");
  const catLabel =
    CATEGORIAS_PROVEEDOR.find((c) => c.slug === categoria)?.label || categoria;

  const onSubmit = async (values, publicar = false) => {
    setGuardando(true);
    setError(null);
    setOkMsg(null);
    try {
      const payload = {
        nombre_comercial: values.nombre_comercial,
        anio_fundacion: values.anio_fundacion,
        descripcion: values.descripcion,
        frase_especialidad: values.frase_especialidad,
        municipio: values.municipio,
        direccion: values.direccion,
        municipios_cobertura: values.municipios_cobertura,
        atiende_fuera_nl: values.atiende_fuera_nl,
        cobra_traslado: values.cobra_traslado,
        tipos_evento: values.tipos_evento,
        contratacion: values.contratacion,
        contacto: values.contacto,
        video_url: values.video_url,
        categoria: values.categoria,
        categorias_extra: [],
        ficha_especializada: values.ficha_especializada || {},
        acepta_veracidad: values.acepta_veracidad,
        url_logo: values.url_logo || undefined,
        foto_principal: values.foto_principal || undefined,
        galeria: values.galeria || [],
        catalogo_pdf: values.catalogo_pdf || undefined,
      };

      if (values.logo_file) {
        payload.logo_base64 = await fileToBase64(values.logo_file);
      }
      if (values.foto_principal_file) {
        payload.foto_principal_base64 = await fileToBase64(
          values.foto_principal_file
        );
      }
      if (values.catalogo_pdf_file) {
        payload.catalogo_pdf_base64 = await fileToBase64(
          values.catalogo_pdf_file
        );
      }
      if (Array.isArray(values.galeria_files) && values.galeria_files.length) {
        payload.galeria_base64 = await Promise.all(
          values.galeria_files.map((f) => fileToBase64(f))
        );
      }

      if (publicar && usuario?.rol === "residente") {
        payload.status = 1;
      }

      let saved;
      if (esEdicion && proveedor?.slug) {
        saved = await proveedorActualizar(token, proveedor.slug, payload);
      } else {
        saved = await proveedorCrear(token, payload);
      }

      limpiar();
      setOkMsg(
        publicar
          ? "Guardado y enviado a publicación."
          : "Borrador guardado correctamente."
      );
      if (!esEdicion && saved?.slug) {
        navigate(`/formulario-proveedor-eventos/${saved.slug}`, {
          replace: true,
        });
      }
    } catch (e) {
      setError(e.message || "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="max-w-[1080px] mx-auto px-4 sm:px-0 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
              Vivir y Convivir · Proveedores
            </p>
            <h1 className="font-haas text-2xl sm:text-3xl font-semibold">
              {esEdicion ? "Editar micrositio" : "Nuevo micrositio de proveedor"}
            </h1>
            <p className="text-sm text-neutral-600 mt-1">
              Categoría activa: <strong>{catLabel}</strong>
            </p>
          </div>
          <div className="flex gap-2 text-sm">
            <Link
              to="/proveedores-eventos"
              className="rounded-lg border border-neutral-300 px-3 py-2 hover:bg-neutral-50"
            >
              Ver listado
            </Link>
            {proveedor?.slug ? (
              <a
                href={`https://residente.mx/proveedores-eventos/${proveedor.slug}?preview=1`}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-neutral-300 px-3 py-2 hover:bg-neutral-50"
              >
                Vista previa
              </a>
            ) : null}
          </div>
        </div>

        {borradorPendiente ? (
          <BannerRecuperacion
            borrador={borradorPendiente}
            onRecuperar={recuperar}
            onDescartar={descartar}
          />
        ) : null}

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}
        {okMsg ? (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {okMsg}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit((v) => onSubmit(v, false))}
          className="space-y-2"
        >
          <BloqueGeneral />
          <EspecializadoPorCategoria />

          <div className="mt-8 pt-6 border-t border-neutral-200 flex flex-wrap gap-2 justify-end">
            <button
              type="submit"
              disabled={guardando}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {guardando ? "Guardando…" : "Guardar borrador"}
            </button>
            {usuario?.rol === "residente" ? (
              <button
                type="button"
                disabled={guardando}
                onClick={handleSubmit((v) => onSubmit(v, true))}
                className="rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                Guardar y publicar
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
