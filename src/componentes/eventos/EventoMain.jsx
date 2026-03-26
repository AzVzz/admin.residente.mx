//src/componentes/eventos/EventoMain.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context";
import { toPng } from "html-to-image";
import FormularioEvento from "./componentes/FormularioEvento";
import TicketEvento from "./componentes/TicketEvento";
import FormularioPromoExt from "../promociones/componentes/FormularioPromoExt";
import { eventoCrear } from "../api/eventosGet";
import { restaurantesBasicosGet } from "../api/restaurantesBasicosGet.js";
import { Iconografia } from "../utils/Iconografia.jsx";
import SmartTagsInput from "../residente/componentes/SmartTagsInput.jsx";
import { useGeminiSEO } from "../../hooks/useGeminiSEO.js";

/** Opciones para html-to-image: skipFonts evita SecurityError con Google Fonts (CORS en cssRules) */
const ticketToPngOptions = {
  quality: 0.95,
  pixelRatio: 5,
  backgroundColor: "transparent",
  skipFonts: true,
};

const EventoMain = () => {
  const { usuario, token } = useAuth();
  const navigate = useNavigate();

  const rolActual = usuario?.rol?.toLowerCase();
  const esAutorizado = rolActual === "residente" || rolActual === "b2b" || rolActual === "vendedor";

  const [formData, setFormData] = useState({
    restaurantName: "",
    promoName: "",
    promoSubtitle: "",
    descEvento: "",
    fechaValidez: "",        // texto mostrado en el ticket (ej: "15 Abril, 8pm")
    fechaInicioEvento: "",   // datetime-local del inicio real
    fechaFinEvento: "",      // datetime-local del fin real
    zonaHoraria: "America/Monterrey",
    tipografia: "default",
    tipografia_bold: true,
    colorFondo: "#FFFFFF",
    espaciadoLetras: 0,
    espaciadoLineas: 1,
    colorTexto: "#000000",
    /** Solo admin: color del panel donde se ve la vista previa del ticket */
    colorFondoVistaPrevia: "#3B3B3C",
    colorAmarillo: "#FFF300",
    fontSizeTituloImagen: 36,
    fontSizeCuerpo: 13,
    seo_alt_text: "",
    seo_title: "",
    seo_keyword: "",
    meta_description: "",
    smart_tags: [],
    lugarEvento: "",
    flyerPromo: null,
    diasFijos: [],
    colorTitulo: "#FFFFFF",
  });

  const [selectedStickers, setSelectedStickers] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [restaurantes, setRestaurantes] = useState([]);
  const [selectedRestauranteId, setSelectedRestauranteId] = useState("");
  const ticketRef = useRef(null);

  const { optimizarCupon, loading: geminiLoading } = useGeminiSEO();

  useEffect(() => {
    restaurantesBasicosGet()
      .then((data) => {
        setRestaurantes(data);
        if (data && data.length === 1) {
          const r = data[0];
          setSelectedRestauranteId(r.id);
          setFormData((prev) => ({ ...prev, restaurantName: r.nombre_restaurante }));
        }
      })
      .catch((err) => console.error("Error cargando restaurantes:", err));
  }, []);

  const handleRestauranteChange = (e) => {
    const id = e.target.value;
    setSelectedRestauranteId(id);
    const info = restaurantes.find((r) => String(r.id) === String(id));
    setFormData((prev) => ({
      ...prev,
      restaurantName: info ? info.nombre_restaurante : prev.restaurantName,
      lugarEvento: info ? info.nombre_restaurante : prev.lugarEvento,
    }));
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatFechaTicket = (dateTimeLocal) => {
    if (!dateTimeLocal) return "";
    const normalized = dateTimeLocal.includes("T") ? dateTimeLocal : `${dateTimeLocal}T12:00:00`;
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  /** Fecha tipo boleto: "19 MARZO" */
  const formatFechaTicketLargo = (dateInput) => {
    if (!dateInput) return "";
    const normalized = dateInput.includes("T") ? dateInput : `${dateInput}T12:00:00`;
    const d = new Date(normalized);
    if (Number.isNaN(d.getTime())) return "";
    const day = d.getDate();
    const month = new Intl.DateTimeFormat("es-MX", { month: "long" }).format(d).toUpperCase();
    return `${day} ${month}`;
  };

  useEffect(() => {
    let textoFechas = "";

    if (formData.diasFijos?.length > 0) {
      const dias = formData.diasFijos;
      const listado =
        dias.length === 1
          ? dias[0]
          : dias.slice(0, -1).join(", ") + " y " + dias[dias.length - 1];
      textoFechas = `Todos los ${listado.toLowerCase()}`;
    } else {
      const inicio = formatFechaTicket(formData.fechaInicioEvento);
      const fin = formatFechaTicket(formData.fechaFinEvento);
      if (inicio && fin) textoFechas = `${inicio} - ${fin}`;
      else if (inicio) textoFechas = inicio;
      else if (fin) textoFechas = fin;
    }

    setFormData((prev) => {
      if (prev.fechaValidez === textoFechas) return prev;
      return { ...prev, fechaValidez: textoFechas };
    });
  }, [formData.fechaInicioEvento, formData.fechaFinEvento, formData.diasFijos]);

  const handleStickerSelect = (claves) => setSelectedStickers(claves);

  const getStickerUrls = () => {
    const allStickers = [...Iconografia.categorias, ...Iconografia.ocasiones, ...Iconografia.zonas];
    return selectedStickers.map((clave) => {
      const found = allStickers.find((item) => item.clave === clave);
      if (found?.icono) return found.icono.replace("https://residente.mx", "");
      return null;
    }).filter(Boolean);
  };

  const handleDownload = async () => {
    if (ticketRef.current) {
      try {
        const dataUrl = await toPng(ticketRef.current, ticketToPngOptions);
        const link = document.createElement("a");
        link.download = `evento-${formData.restaurantName || "ticket"}.png`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error("Error al generar la imagen:", error);
        alert("Error al generar la imagen");
      }
    }
  };

  const formatWithTimezone = (dateString, timeZone, endOfDay = false) => {
    if (!dateString) return null;
    try {
      const normalizedDate = dateString.includes("T")
        ? dateString
        : `${dateString}T${endOfDay ? "23:59" : "00:00"}`;
      let offset = -6;
      if (timeZone === "America/Tijuana") offset = -8;
      if (timeZone === "America/Chihuahua") offset = -7;
      if (timeZone === "America/Cancun") offset = -5;
      const offsetHours = Math.abs(Math.floor(offset));
      const offsetSign = offset < 0 ? "-" : "+";
      const offsetString = `${offsetSign}${String(offsetHours).padStart(2, "0")}:00`;
      return `${normalizedDate}:00${offsetString}`;
    } catch (e) {
      return null;
    }
  };

  const prepareApiData = () => {
    const restauranteSeleccionado = restaurantes.find((r) => String(r.id) === String(selectedRestauranteId));
    const stickerClave = selectedStickers[0] || "";
    const zonaHoraria = formData.zonaHoraria || "America/Monterrey";

    return {
      restaurante_id: selectedRestauranteId || null,
      nombre_restaurante: formData.restaurantName,
      titulo: formData.promoName,
      subtitulo: formData.promoSubtitle,
      descripcion: formData.descEvento,
      icon: stickerClave,
      email: formData.emailPromo || "",
      link: formData.urlPromo || "",
      lugar_evento: formData.lugarEvento?.trim() || null,
      fecha_inicio_evento: formatWithTimezone(formData.fechaInicioEvento, zonaHoraria, false),
      fecha_fin_evento: formatWithTimezone(formData.fechaFinEvento, zonaHoraria, true),
      secciones_categorias: restauranteSeleccionado?.secciones_categorias || undefined,
      tipografia_bold: formData.tipografia_bold !== false,
      seo_alt_text: formData.seo_alt_text?.trim() || null,
      seo_title: formData.seo_title?.trim() || null,
      seo_keyword: formData.seo_keyword?.trim() || null,
      meta_description: formData.meta_description?.trim() || null,
      smart_tags: formData.smart_tags?.length ? formData.smart_tags : null,
      dias_fijos: formData.diasFijos?.length ? formData.diasFijos : null,
      color_titulo: formData.colorTitulo || "#FFFFFF",
    };
  };

  const handleGuardar = async () => {
    setSaveSuccess(false);
    setSaveError(null);
    setIsPosting(true);

    try {
      if (!ticketRef.current) throw new Error("No se encontró el ticket para generar la imagen");
      if (!formData.diasFijos?.length && (!formData.fechaInicioEvento || !formData.fechaFinEvento)) {
        throw new Error("Debes seleccionar la fecha de inicio y fin del evento, o al menos un día fijo");
      }

      const dataUrl = await toPng(ticketRef.current, ticketToPngOptions);
      const base64Image = dataUrl.split(",")[1];
      const apiData = prepareApiData();
      apiData.imagen_base64 = base64Image;

      const response = await eventoCrear(apiData, token);
      console.log("✅ Evento creado:", response);

      setSaveSuccess(true);
      setTimeout(() => navigate("/dashboardeventos"), 1000);
    } catch (error) {
      console.error("Error al guardar evento:", error);
      setSaveError(error.message || "Error al guardar el evento");
    } finally {
      setIsPosting(false);
    }
  };

  useEffect(() => {
    if (saveSuccess || saveError) {
      setShowMessage(true);
      const hideTimer = setTimeout(() => setShowMessage(false), 2700);
      const clearTimer = setTimeout(() => { setSaveSuccess(false); setSaveError(null); }, 3000);
      return () => { clearTimeout(hideTimer); clearTimeout(clearTimer); };
    }
  }, [saveSuccess, saveError]);

  if (usuario && !esAutorizado) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center p-8 bg-gray-100 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600">No tienes permisos para crear eventos.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-5">
        <FormularioEvento
          formData={formData}
          onFieldChange={handleFieldChange}
          restaurantes={restaurantes}
          selectedRestauranteId={selectedRestauranteId}
          onRestauranteChange={handleRestauranteChange}
        />
        <div
          className="w-auto h-auto px-14 pt-10 pb-10 shadow-lg relative flex flex-col sticky top-5 self-start rounded-lg"
          style={{ backgroundColor: formData.colorFondoVistaPrevia || "#3B3B3C" }}
        >
          {(saveSuccess || saveError) && (
            <div className={`absolute top-3 left-1/2 transform -translate-x-1/2 z-20 w-[90%] transition-opacity duration-300 ${showMessage ? "opacity-100" : "opacity-0"}`}>
              {saveSuccess && <div className="p-3 bg-green-100 text-green-700 rounded-md text-center shadow-lg">¡Evento guardado exitosamente!</div>}
              {saveError && <div className="p-3 bg-red-100 text-red-700 rounded-md text-center shadow-lg">Error: {saveError}</div>}
            </div>
          )}

          <TicketEvento
            ref={ticketRef}
            nombreRestaurante={formData.restaurantName}
            nombrePromo={formData.promoName}
            subPromo={formData.promoSubtitle}
            descripcionPromo={formData.descEvento}
            fechaInicioDisplay={formatFechaTicketLargo(formData.fechaInicioEvento)}
            fechaFinDisplay={formatFechaTicketLargo(formData.fechaFinEvento)}
            urlPromo={formData.urlPromo}
            lugarEvento={formData.lugarEvento}
            flyerImagen={formData.flyerPromo}
            stickerUrl={getStickerUrls()[0]}
            tipografia={formData.tipografia}
            tipografiaBold={formData.tipografia_bold}
            colorFondo={formData.colorFondo}
            colorAmarillo={formData.colorAmarillo}
            espaciadoLetras={formData.espaciadoLetras}
            espaciadoLineas={formData.espaciadoLineas}
            colorTexto={formData.colorTexto}
            fontSizeTituloImagen={formData.fontSizeTituloImagen}
            fontSizeCuerpo={formData.fontSizeCuerpo}
            diasFijos={formData.diasFijos}
            colorTitulo={formData.colorTitulo}
          />

          <div className="flex flex-row w-full gap-2 pt-5 pr-11 mt-auto">
            <button onClick={handleDownload} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 cursor-pointer">
              Descargar (PNG)
            </button>
            <button onClick={handleGuardar} disabled={isPosting} className={`flex-1 bg-white hover:bg-yellow-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors duration-200 cursor-pointer ${isPosting ? "opacity-50 cursor-not-allowed" : ""}`}>
              {isPosting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <FormularioPromoExt stickerSeleccionado={selectedStickers} onStickerSelect={handleStickerSelect} />
      </div>

      <div className="pt-4">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-300">
          <SmartTagsInput
            value={formData.smart_tags}
            onChange={(tags) => setFormData((prev) => ({ ...prev, smart_tags: tags }))}
            isGenerating={geminiLoading}
            hideGenerationButton={usuario?.rol !== "residente"}
            onGenerateAI={async () => {
              if (!formData.restaurantName || !formData.promoName) {
                alert("Ingresa el nombre del restaurante y del evento para generar tags.");
                return;
              }
              try {
                const seo = await optimizarCupon({
                  nombre_restaurante: formData.restaurantName,
                  titulo: formData.promoName,
                  subtitulo: formData.promoSubtitle,
                  descripcion: formData.descEvento,
                });
                if (seo) {
                  setFormData((prev) => ({
                    ...prev,
                    smart_tags: seo.smart_tags || prev.smart_tags,
                    seo_title: seo.seo_title || prev.seo_title,
                    seo_keyword: seo.seo_keyword || prev.seo_keyword,
                    meta_description: seo.meta_description || prev.meta_description,
                    seo_alt_text: seo.seo_alt_text || prev.seo_alt_text,
                  }));
                }
              } catch (e) {
                console.error("Error optimizando evento:", e);
                alert("Error generando tags IA");
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EventoMain;
