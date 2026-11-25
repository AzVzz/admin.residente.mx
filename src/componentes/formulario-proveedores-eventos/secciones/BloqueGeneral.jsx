import { useFormContext } from "react-hook-form";
import {
  Seccion,
  CampoTexto,
  CampoSelect,
  CampoMulti,
  CampoSiNo,
  CampoArchivo,
  Label,
} from "../campos/CampoHelpers";
import {
  CATEGORIAS_PROVEEDOR,
  MUNICIPIOS_NL,
  TIPOS_EVENTO,
  ANTICIPACION_OPCIONES,
  HORARIOS_ATENCION,
  METODOS_PAGO,
} from "../constantesProveedorEventos";

export default function BloqueGeneral() {
  const { watch, setValue } = useFormContext();
  const galeria = watch("galeria") || [];
  const galeriaFiles = watch("galeria_files") || [];

  return (
    <>
      <Seccion
        id="seccion-categoria"
        titulo="Categoría del proveedor"
        subtitulo="Elige una de las 8 categorías; el formulario mostrará sus preguntas especializadas."
      >
        <CampoSelect
          name="categoria"
          label="Categoría"
          required
          options={CATEGORIAS_PROVEEDOR.map((c) => ({
            value: c.slug,
            label: c.label,
          }))}
        />
      </Seccion>

      <Seccion id="seccion-identidad" titulo="1. Identidad del proveedor">
        <CampoTexto name="nombre_comercial" label="Nombre comercial" required />
        <CampoArchivo
          nameFile="logo_file"
          namePreview="logo_preview"
          label="Logotipo"
          required
          hint="Imagen cuadrada preferible"
        />
        <CampoTexto
          name="anio_fundacion"
          label="Año de fundación"
          type="number"
        />
        <CampoTexto
          name="descripcion"
          label="Descripción del negocio"
          required
          rows={4}
          maxLength={500}
        />
        <CampoTexto
          name="frase_especialidad"
          label="Frase que resume su especialidad"
          required
          maxLength={120}
        />
      </Seccion>

      <Seccion id="seccion-ubicacion" titulo="2. Ubicación y cobertura">
        <CampoSelect
          name="municipio"
          label="Municipio donde se encuentra establecido"
          required
          options={MUNICIPIOS_NL}
        />
        <CampoTexto
          name="direccion"
          label="Dirección física (si recibe clientes)"
        />
        <CampoMulti
          name="municipios_cobertura"
          label="Municipios donde ofrece servicios"
          required
          options={MUNICIPIOS_NL}
        />
        <CampoSiNo
          name="atiende_fuera_nl"
          label="¿Atiende eventos fuera de Nuevo León?"
        />
        <CampoSiNo
          name="cobra_traslado"
          label="¿Cobra traslado fuera de su zona habitual?"
        />
      </Seccion>

      <Seccion id="seccion-eventos" titulo="3. Tipos de eventos">
        <CampoMulti
          name="tipos_evento"
          label="Seleccionar todos los que correspondan"
          required
          options={TIPOS_EVENTO}
        />
      </Seccion>

      <Seccion id="seccion-contratacion" titulo="4. Contratación">
        <CampoSelect
          name="contratacion.anticipacion"
          label="¿Con cuánta anticipación recomienda contratar?"
          required
          options={ANTICIPACION_OPCIONES}
        />
        <CampoSiNo
          name="contratacion.cotizaciones_personalizadas"
          label="¿Ofrece cotizaciones personalizadas?"
        />
        <CampoTexto
          name="contratacion.monto_minimo"
          label="Monto mínimo de contratación (MXN)"
          type="number"
        />
        <CampoSiNo
          name="contratacion.factura"
          label="¿Expide factura?"
          required
        />
        <CampoSiNo
          name="contratacion.contrato"
          label="¿Trabaja con contrato de servicios?"
        />
        <CampoSiNo name="contratacion.anticipo" label="¿Requiere anticipo?" />
        <CampoMulti
          name="contratacion.metodos_pago"
          label="¿Acepta tarjeta, transferencia o efectivo?"
          options={METODOS_PAGO}
        />
      </Seccion>

      <Seccion id="seccion-contacto" titulo="5. Contacto">
        <CampoTexto
          name="contacto.responsable"
          label="Nombre del responsable (uso interno)"
        />
        <CampoTexto
          name="contacto.whatsapp"
          label="WhatsApp de atención comercial"
          required
          type="tel"
        />
        <CampoTexto
          name="contacto.correo"
          label="Correo comercial"
          required
          type="email"
        />
        <CampoTexto name="contacto.sitio_web" label="Sitio web" type="url" />
        <CampoTexto name="contacto.instagram" label="Instagram" type="url" />
        <CampoTexto name="contacto.facebook" label="Facebook" type="url" />
        <CampoSelect
          name="contacto.horarios"
          label="Horarios de atención"
          options={HORARIOS_ATENCION}
        />
      </Seccion>

      <Seccion
        id="seccion-visual"
        titulo="6. Material visual"
        subtitulo="Fotografías de servicios o trabajos reales del proveedor."
      >
        <CampoArchivo
          nameFile="foto_principal_file"
          namePreview="foto_principal_preview"
          label="Fotografía principal del micrositio"
          required
        />
        <div>
          <Label>Galería (hasta 12 fotografías)</Label>
          <input
            type="file"
            accept="image/*"
            multiple
            className="block w-full text-sm"
            onChange={(e) => {
              const files = Array.from(e.target.files || []).slice(0, 12);
              setValue("galeria_files", files, { shouldDirty: true });
            }}
          />
          {(galeria.length > 0 || galeriaFiles.length > 0) && (
            <p className="text-xs text-neutral-500 mt-1">
              {galeria.length} en servidor
              {galeriaFiles.length ? ` · ${galeriaFiles.length} nuevas` : ""}
            </p>
          )}
        </div>
        <CampoTexto name="video_url" label="Video de presentación (URL)" type="url" />
        <CampoArchivo
          nameFile="catalogo_pdf_file"
          namePreview="catalogo_pdf"
          label="Catálogo o presentación comercial (PDF)"
          accept="application/pdf"
        />
        <CampoSiNo
          name="acepta_veracidad"
          label="Acepto la declaración de veracidad y autorización de uso de imágenes"
          required
        />
      </Seccion>
    </>
  );
}
