import { useFormContext } from "react-hook-form";
import {
  Seccion,
  CampoTexto,
  CampoSelect,
  CampoMulti,
  CampoSiNo,
  CampoArchivo,
} from "../campos/CampoHelpers";
import { OPCIONES_CATEGORIA, MUNICIPIOS_NL } from "../constantesProveedorEventos";

function F({ name, ...rest }) {
  return <CampoTexto name={`ficha_especializada.${name}`} {...rest} />;
}
function S({ name, ...rest }) {
  return <CampoSelect name={`ficha_especializada.${name}`} {...rest} />;
}
function M({ name, ...rest }) {
  return <CampoMulti name={`ficha_especializada.${name}`} {...rest} />;
}
function Y({ name, ...rest }) {
  return <CampoSiNo name={`ficha_especializada.${name}`} {...rest} />;
}

function Catering() {
  const o = OPCIONES_CATEGORIA.catering;
  return (
    <>
      <Seccion id="esp-servicios" titulo="Catering — Servicios">
        <M name="servicios" label="¿Qué servicios ofrece?" options={o.servicios} />
        <M name="cocina" label="¿Qué tipo de cocina ofrece?" options={o.cocina} />
        <M name="modalidades" label="Modalidades de servicio" options={o.modalidades} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <F name="comensales_min" label="Mínimo de comensales" type="number" />
          <F name="comensales_max" label="Máximo de comensales" type="number" />
        </div>
        <M name="dietas" label="Menús / adaptaciones" options={o.dietas} />
        <M name="incluye" label="¿Qué incluye?" options={o.incluye} />
        <Y name="necesita_cocina" label="¿Necesita cocina equipada en el lugar?" triState />
      </Seccion>
      <Seccion
        id="esp-rubro1"
        titulo="Rubro especial 1 — Especialidad gastronómica"
        subtitulo="Obligatorio para publicar: al menos un rubro con 20+ caracteres (o un platillo/experiencia detallado)."
      >
        <F name="platillo_1" label="Platillo / experiencia 1" maxLength={180} />
        <F name="platillo_2" label="Platillo / experiencia 2" maxLength={180} />
        <F name="platillo_3" label="Platillo / experiencia 3" maxLength={180} />
        <F
          name="rubro_especial_1"
          label="Resumen de especialidad (sustantivo)"
          required
          rows={3}
          maxLength={400}
          placeholder="Ej. Cocina mexicana contemporánea con enfoque en banquete familiar y coffee break corporativo."
        />
      </Seccion>
      <Seccion id="esp-rubro2" titulo="Rubro especial 2 — Qué incluye su servicio">
        <F
          name="rubro_especial_2"
          label="Para un evento de 100 personas, ¿qué incluiría?"
          rows={4}
          maxLength={600}
          placeholder="Ej. Menú tres tiempos, montaje de buffet, vajilla básica, personal de servicio y limpieza de área."
        />
        <F
          name="conceptos_aparte"
          label="¿Qué conceptos se cotizan por separado?"
          rows={2}
          maxLength={250}
        />
      </Seccion>
    </>
  );
}

function Entretenimiento() {
  const o = OPCIONES_CATEGORIA.entretenimiento;
  return (
    <>
      <Seccion id="esp-servicios" titulo="Entretenimiento — Servicios">
        <M name="tipos" label="Tipo de entretenimiento" options={o.tipos} />
        <M name="generos" label="Géneros / especialidades" options={o.generos} />
        <F name="generos_otro" label="Otro género (texto libre)" />
        <F name="integrantes" label="Personas en el espectáculo (número o rango)" />
        <S name="duracion" label="Duración habitual" options={o.duracion} />
        <Y name="formatos_paquetes" label="¿Ofrece diferentes formatos o paquetes?" />
        <F name="formatos_desc" label="Describe formatos/paquetes" rows={2} />
        <M name="equipo_incluido" label="¿Incluye equipo técnico?" options={o.equipo} />
        <F name="requiere_contratante" label="¿Qué debe proporcionar el contratante?" rows={2} />
        <F name="video_1" label="Video presentación 1 (URL)" type="url" />
        <F name="video_2" label="Video 2 (URL)" type="url" />
        <F name="video_3" label="Video 3 (URL)" type="url" />
        <F name="video_4" label="Video 4 (URL)" type="url" />
        <F name="video_5" label="Video 5 (URL)" type="url" />
      </Seccion>
      <Seccion id="esp-rubro1" titulo="Rubro especial 1 — El momento ideal">
        <M name="momento_ideal" label="¿En qué momento funciona mejor?" options={o.momento} />
        <F name="rubro_especial_1" label="Ambiente que genera" rows={3} maxLength={300} />
      </Seccion>
      <Seccion id="esp-rubro2" titulo="Rubro especial 2 — Adaptación al público">
        <F
          name="rubro_especial_2"
          label="¿Cómo adapta su repertorio a bodas, graduaciones, posadas y corporativos?"
          rows={4}
          maxLength={400}
        />
        <Y name="personaliza" label="¿Puede personalizar canciones/repertorios?" />
        <F name="personaliza_desc" label="Describe la personalización" rows={2} />
      </Seccion>
    </>
  );
}

function Venues() {
  const o = OPCIONES_CATEGORIA.venues;
  return (
    <>
      <Seccion id="esp-servicios" titulo="Venues — Características del espacio">
        <S name="tipo_espacio" label="Tipo de espacio" options={o.tipos} />
        <F name="direccion_exacta" label="Dirección exacta del inmueble" required />
        <F name="mapa_url" label="Ubicación en mapa (URL Google Maps)" type="url" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <F name="capacidad_banquete" label="Capacidad banquete sentado" type="number" />
          <F name="capacidad_coctel" label="Capacidad cóctel de pie" type="number" />
          <F name="capacidad_auditorio" label="Capacidad auditorio" type="number" />
        </div>
        <M name="espacios" label="¿Qué espacios ofrece?" options={o.espacios} />
        <M name="servicios_renta" label="Servicios incluidos en la renta" options={o.serviciosRenta} />
        <Y name="proveedores_externos" label="¿Permite proveedores externos?" triState />
        <Y name="exclusividad" label="¿Tiene exclusividad con algún servicio?" />
        <F name="exclusividad_desc" label="Describe la exclusividad" rows={2} />
        <F name="horario_max" label="Horario máximo permitido" type="time" />
        <F name="minimo_horas" label="Mínimo de horas de contratación" type="number" />
      </Seccion>
      <Seccion id="esp-rubro1" titulo="Rubro especial 1 — Comodidad y acceso">
        <Y name="estacionamiento" label="Estacionamiento propio" />
        <F name="cajones" label="Número aproximado de cajones" type="number" />
        <Y name="valet" label="Valet parking" />
        <Y name="accesibilidad" label="Acceso movilidad reducida" triState />
        <Y name="carga_descarga" label="Zona de carga y descarga" />
        <F name="rubro_especial_1" label="Notas de acceso" rows={2} maxLength={350} />
      </Seccion>
      <Seccion id="esp-rubro2" titulo="Rubro especial 2 — Clima y contingencias">
        <F
          name="rubro_especial_2"
          label="Alternativas ante lluvia, calor o frío"
          rows={3}
          maxLength={350}
        />
        <M name="contingencias" label="Infraestructura de respaldo" options={o.contingencias} />
      </Seccion>
    </>
  );
}

function Audiovisuales() {
  const o = OPCIONES_CATEGORIA.audiovisuales;
  return (
    <>
      <Seccion id="esp-servicios" titulo="Audiovisuales — Servicios y equipamiento">
        <M name="servicios" label="Servicios" options={o.servicios} />
        <M name="tamanos" label="Tamaño de eventos" options={o.tamanos} />
        <F name="aforo_max" label="Aforo máximo aproximado" type="number" />
        <S name="modalidad" label="¿Solo renta o servicio integral?" options={o.modalidad} />
        <Y name="operadores" label="¿Incluye operadores/técnicos?" triState />
        <M name="logistica" label="Incluye transporte/instalación…" options={o.incluyeLogistica} />
        <Y name="visitas_tecnicas" label="¿Realiza visitas técnicas previas?" />
        <Y name="equipo_respaldo" label="¿Cuenta con equipo de respaldo?" triState />
      </Seccion>
      <Seccion id="esp-rubro1" titulo="Rubro especial 1 — Fortaleza técnica">
        <M name="fortalezas" label="Tipo de producción que domina" options={o.fortalezas} />
        <F
          name="rubro_especial_1"
          label="Proyecto real representativo"
          rows={4}
          maxLength={450}
        />
      </Seccion>
      <Seccion id="esp-rubro2" titulo="Rubro especial 2 — Seguridad de la operación">
        <F
          name="rubro_especial_2"
          label="Medidas para evitar interrupciones"
          rows={3}
          maxLength={350}
        />
        <F
          name="requisitos_venue"
          label="Qué debe proporcionar el venue/contratante"
          rows={2}
          maxLength={300}
        />
      </Seccion>
    </>
  );
}

function Mobiliario() {
  const o = OPCIONES_CATEGORIA.mobiliario;
  return (
    <>
      <Seccion id="esp-servicios" titulo="Mobiliario — Productos y servicios">
        <M name="productos" label="Mobiliario en renta" options={o.productos} />
        <M name="estilos" label="Estilos" options={o.estilos} />
        <CampoArchivo
          nameFile="ficha_especializada.catalogo_file"
          namePreview="ficha_especializada.catalogo_preview"
          label="Catálogo con fotos y medidas (PDF)"
          accept="application/pdf"
        />
        <F name="capacidad_inventario" label="Personas aproximadas con su inventario" type="number" />
        <M name="logistica" label="Incluye transporte/montaje…" options={o.logistica} />
        <S name="tiempo_renta" label="Tiempo habitual de renta" options={o.tiempoRenta} />
        <Y name="paquetes" label="¿Ofrece paquetes prearmados?" />
        <F name="paquetes_desc" label="Describe paquetes" rows={2} />
        <Y name="deposito" label="¿Requiere depósito en garantía?" />
      </Seccion>
      <Seccion id="esp-rubro1" titulo="Rubro especial 1 — Capacidad real de montaje">
        <M name="montaje_tamanos" label="Tamaños que puede atender" options={o.montajeTamano} />
        <F name="rubro_especial_1" label="Describe capacidades de montaje" rows={3} maxLength={400} />
        <Y name="montajes_simultaneos" label="¿Montajes simultáneos en distintos eventos?" />
      </Seccion>
      <Seccion id="esp-rubro2" titulo="Rubro especial 2 — Logística de entrega">
        <M
          name="municipios_sin_cargo"
          label="Municipios sin cargos adicionales"
          options={MUNICIPIOS_NL}
        />
        <F
          name="rubro_especial_2"
          label="Restricciones o cargos adicionales"
          rows={3}
          maxLength={400}
        />
      </Seccion>
    </>
  );
}

function Decoracion() {
  const o = OPCIONES_CATEGORIA.decoracion;
  return (
    <>
      <Seccion id="esp-servicios" titulo="Decoración — Servicios y especialidades">
        <M name="servicios" label="Servicios" options={o.servicios} />
        <M name="estilos" label="Estilos principales" options={o.estilos} />
        <Y name="disenos_personalizados" label="¿Realiza diseños personalizados?" />
        <S name="tipo_proyecto" label="Integrales o individuales" options={o.proyectoTipo} />
        <S name="anticipacion_diseno" label="Anticipación para definir diseño" options={o.anticipacionDiseno} />
        <Y name="montaje_retiro" label="¿Incluye montaje y retiro?" triState />
        <Y name="propuestas_visuales" label="¿Propuestas visuales antes de contratar?" />
        <Y name="sustentable" label="¿Materiales reutilizables / sustentables?" />
        <F name="sustentable_desc" label="Describe alternativas sustentables" rows={2} />
      </Seccion>
      <Seccion id="esp-rubro1" titulo="Rubro especial 1 — Identidad estética">
        <F name="rubro_especial_1" label="Estilo que mejor representa su trabajo" rows={3} maxLength={350} />
        <F name="proyecto_1_titulo" label="Proyecto portafolio 1 — título" />
        <F name="proyecto_2_titulo" label="Proyecto portafolio 2 — título" />
        <F name="proyecto_3_titulo" label="Proyecto portafolio 3 — título" />
      </Seccion>
      <Seccion id="esp-rubro2" titulo="Rubro especial 2 — Transformación del espacio">
        <F
          name="rubro_especial_2"
          label="Qué puede lograr en salón, jardín o terraza"
          rows={3}
          maxLength={400}
        />
        <F
          name="incluye_vs_aparte"
          label="Qué incluye vs. qué se cotiza aparte"
          rows={3}
          maxLength={350}
        />
      </Seccion>
    </>
  );
}

function Produccion() {
  const o = OPCIONES_CATEGORIA.produccion;
  return (
    <>
      <Seccion id="esp-servicios" titulo="Producción — Organización y coordinación">
        <M name="tipos_evento" label="Tipos de eventos que organiza" options={o.tiposEvento} />
        <M name="servicios" label="Servicios" options={o.servicios} />
        <F name="capacidad_asistentes" label="Capacidad de asistentes (rango)" />
        <F name="tamano_equipo" label="Personas en el equipo habitual" type="number" />
        <S name="tipo_proveedores" label="Proveedores propios/externos" options={o.proveedores} />
        <Y name="presupuesto_completo" label="¿Puede encargarse del presupuesto completo?" />
        <S name="anticipacion" label="Anticipación para iniciar planeación" options={o.anticipacion} />
        <S name="honorarios" label="Cómo cobra honorarios" options={o.honorarios} />
      </Seccion>
      <Seccion id="esp-rubro1" titulo="Rubro especial 1 — Experiencia en Nuevo León">
        <F
          name="rubro_especial_1"
          label="Retos logísticos que resuelve en Monterrey y ZM"
          rows={4}
          maxLength={450}
        />
        <F
          name="caso_evento"
          label="Evento real de complejidad resuelta"
          rows={4}
          maxLength={450}
        />
      </Seccion>
      <Seccion id="esp-rubro2" titulo="Rubro especial 2 — Qué problemas le ahorramos al cliente">
        <F name="responsabilidad_1" label="Responsabilidad que asume 1" />
        <F name="responsabilidad_2" label="Responsabilidad que asume 2" />
        <F name="responsabilidad_3" label="Responsabilidad que asume 3" />
        <F
          name="rubro_especial_2"
          label="Qué decisiones permanecen en el contratante"
          rows={2}
          maxLength={300}
        />
      </Seccion>
    </>
  );
}

function Multimedia() {
  const o = OPCIONES_CATEGORIA.multimedia;
  return (
    <>
      <Seccion id="esp-servicios" titulo="Multimedia — Servicios">
        <M name="servicios" label="Servicios" options={o.servicios} />
        <S name="disciplinas" label="Fotografía, video o ambas" options={o.disciplinas} />
        <F name="tamano_equipo" label="Personas en el equipo" type="number" />
        <F name="horas_cobertura" label="Horas de cobertura (rango)" />
        <Y name="material_editado" label="¿Entrega material editado?" />
        <F name="dias_entrega" label="Días para entrega del material" type="number" />
        <Y name="alta_resolucion" label="¿Archivos digitales de alta resolución?" />
        <F name="portafolio_url" label="Portafolio de trabajos reales (URL)" required type="url" />
        <Y name="respaldo" label="¿Equipos de respaldo y copias de seguridad?" />
        <F name="respaldo_desc" label="Describe respaldo" rows={2} />
      </Seccion>
      <Seccion id="esp-rubro1" titulo="Rubro especial 1 — Qué recibe el cliente">
        <F name="rubro_especial_1" label="Entregables exactos" rows={4} maxLength={450} />
        <S
          name="disponibilidad_archivos"
          label="Disponibilidad de archivos digitales"
          options={o.disponibilidadArchivos}
        />
        <F
          name="condiciones_uso"
          label="Condiciones de uso comercial / redes"
          rows={2}
          maxLength={250}
        />
      </Seccion>
      <Seccion id="esp-rubro2" titulo="Rubro especial 2 — Momentos que mejor capturan">
        <M name="especialidad" label="Especialidad" options={o.especialidad} />
        <F
          name="rubro_especial_2"
          label="Qué distingue su manera de registrar un evento"
          rows={3}
          maxLength={350}
        />
      </Seccion>
    </>
  );
}

const MAP = {
  catering: Catering,
  entretenimiento: Entretenimiento,
  venues: Venues,
  audiovisuales: Audiovisuales,
  mobiliario: Mobiliario,
  decoracion: Decoracion,
  produccion: Produccion,
  multimedia: Multimedia,
};

export default function EspecializadoPorCategoria() {
  const { watch } = useFormContext();
  const categoria = watch("categoria") || "catering";
  const Comp = MAP[categoria] || Catering;
  return <Comp />;
}
