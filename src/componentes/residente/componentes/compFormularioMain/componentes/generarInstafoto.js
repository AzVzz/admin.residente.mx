const FUENTE_BOLD = "NeueHaasGroteskDisplayPro75Bold";
const TEMAS = {
  oscuro: { fondo: "#000000", texto: "#FFFFFF" },
  claro: { fondo: "#FFFFFF", texto: "#000000" },
};
const SALIDAS = {
  post: {
    ancho: 1080,
    alto: 1350,
    logoX: 69,
    logoY: 38,
    logoMedida: 76,
    webX: 171,
    webY: 91,
    etiquetaY: 380,
    tipoY: 492,
    primeraLinea: 535,
    nombre: "post",
  },
  story: {
    ancho: 1080,
    alto: 1920,
    logoX: 69,
    logoY: 150,
    logoMedida: 76,
    webX: 171,
    webY: 203,
    etiquetaY: 645,
    tipoY: 768,
    primeraLinea: 940,
    nombre: "story",
  },
};

const ETIQUETAS_FORMATO = {
  recomendacion: "LO MEJOR",
  noticia: "EN TENDENCIA",
  reflexion: "IDEAS",
  favoritos: "FAVORITOS",
};

const cargarImagen = (src) =>
  new Promise((resolve, reject) => {
    const imagen = new Image();
    imagen.onload = () => resolve(imagen);
    imagen.onerror = () => reject(new Error(`No se pudo cargar: ${src}`));
    imagen.src = src;
  });

const crearLogoNegro = (imagenLogo) => {
  const medida = 96;
  const canvas = document.createElement("canvas");
  canvas.width = medida;
  canvas.height = medida;

  const ctx = canvas.getContext("2d");

  ctx.save();
  ctx.beginPath();
  ctx.arc(medida / 2, medida / 2, medida / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(imagenLogo, 0, 0, medida, medida);
  ctx.restore();

  const imagen = ctx.getImageData(0, 0, medida, medida);
  const pixeles = imagen.data;

  for (let i = 0; i < pixeles.length; i += 4) {
    if (pixeles[i + 3] === 0) continue;

    const luminosidad =
      pixeles[i] * 0.299 +
      pixeles[i + 1] * 0.587 +
      pixeles[i + 2] * 0.114;
    const color = luminosidad < 120 ? 255 : 0;

    pixeles[i] = color;
    pixeles[i + 1] = color;
    pixeles[i + 2] = color;
  }

  ctx.putImageData(imagen, 0, 0);
  return canvas;
};

const crearLogoBlanco = (imagenLogo) => {
  const medida = 96;
  const canvas = document.createElement("canvas");
  canvas.width = medida;
  canvas.height = medida;

  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.beginPath();
  ctx.arc(medida / 2, medida / 2, medida / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(imagenLogo, 0, 0, medida, medida);
  ctx.restore();

  const imagen = ctx.getImageData(0, 0, medida, medida);
  const pixeles = imagen.data;

  for (let i = 0; i < pixeles.length; i += 4) {
    if (pixeles[i + 3] === 0) continue;

    const luminosidad =
      pixeles[i] * 0.299 +
      pixeles[i + 1] * 0.587 +
      pixeles[i + 2] * 0.114;
    const coberturaR = Math.max(0, Math.min(1, (luminosidad - 45) / 172));
    const color = Math.round(coberturaR * 255);

    pixeles[i] = color;
    pixeles[i + 1] = color;
    pixeles[i + 2] = color;
  }

  ctx.putImageData(imagen, 0, 0);
  return canvas;
};

const dividirTexto = (ctx, texto, anchoMaximo) => {
  const palabras = String(texto || "").trim().split(/\s+/);
  const lineas = [];
  let linea = "";

  palabras.forEach((palabra) => {
    const prueba = linea ? `${linea} ${palabra}` : palabra;

    if (ctx.measureText(prueba).width <= anchoMaximo) {
      linea = prueba;
    } else {
      if (linea) lineas.push(linea);
      linea = palabra;
    }
  });

  if (linea) lineas.push(linea);
  return lineas;
};

const obtenerEtiquetaFormato = (formato) => {
  const normalizado = String(formato || "").trim().toLowerCase();
  return ETIQUETAS_FORMATO[normalizado] || normalizado.toUpperCase() || "RESIDENTE";
};

const obtenerTipoNota = (tipoNota) => {
  const tipo = String(tipoNota || "RESIDENTE").trim();
  const normalizado = tipo.toLowerCase().replace(/\s+/g, "");

  if (normalizado === "food&drink" || normalizado === "foodanddrink") {
    return "Food&Drink®";
  }
  if (normalizado === "restaurantes") return "RESTAURANTES";
  if (normalizado === "antojos") return "ANTOJOS";

  return tipo.toUpperCase();
};

const dibujarCoverEnArea = (ctx, imagen, x, y, ancho, alto) => {
  const anchoOriginal = imagen.naturalWidth || imagen.width;
  const altoOriginal = imagen.naturalHeight || imagen.height;
  const escala = Math.max(ancho / anchoOriginal, alto / altoOriginal);
  const anchoDibujado = anchoOriginal * escala;
  const altoDibujado = altoOriginal * escala;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, ancho, alto);
  ctx.clip();
  ctx.drawImage(
    imagen,
    x + (ancho - anchoDibujado) / 2,
    y + (alto - altoDibujado) / 2,
    anchoDibujado,
    altoDibujado,
  );
  ctx.restore();
};

const dibujarPost = (
  ctx,
  imagenPrincipal,
  logoOriginal,
  titulo,
  formato,
  tipoNota,
  tema,
) => {
  const margen = 78;
  const imagen = { x: 64, y: 732, ancho: 952, alto: 618 };
  const colores = TEMAS[tema];

  ctx.fillStyle = colores.fondo;
  ctx.fillRect(0, 0, 1080, 1350);

  const logo = tema === "oscuro" ? crearLogoNegro(logoOriginal) : crearLogoBlanco(logoOriginal);
  ctx.drawImage(logo, 76, 35, 72, 72);

  ctx.fillStyle = colores.texto;
  ctx.font = `700 30px "${FUENTE_BOLD}"`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("www.residente.mx", 160, 80);

  const etiqueta = obtenerEtiquetaFormato(formato);
  const etiquetaY = 156;
  const etiquetaAlto = 75;
  ctx.font = `italic 700 46px "${FUENTE_BOLD}"`;
  const anchoEtiqueta = Math.max(174, ctx.measureText(etiqueta).width + 38);
  ctx.fillStyle = "#FFF200";
  ctx.fillRect(margen, etiquetaY, anchoEtiqueta, etiquetaAlto);
  ctx.fillStyle = "#000000";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(etiqueta, margen + 18, etiquetaY + 55);

  ctx.fillStyle = colores.texto;
  ctx.font = `700 40px "${FUENTE_BOLD}"`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(obtenerTipoNota(tipoNota), margen, 322);

  const tituloTop = 367;
  const anchoTitulo = 924;
  let tamano = 64;
  let lineas = [];
  let ascenso = 0;
  let descenso = 0;
  let interlineado = 0;
  let altoTexto = 0;

  while (tamano >= 32) {
    ctx.font = `700 ${tamano}px "${FUENTE_BOLD}"`;
    lineas = dividirTexto(ctx, titulo.trim(), anchoTitulo);
    const metricas = ctx.measureText("Ágj");
    ascenso = metricas.actualBoundingBoxAscent || tamano * 0.8;
    descenso = metricas.actualBoundingBoxDescent || tamano * 0.2;
    interlineado = tamano * 1.04;
    altoTexto = ascenso + descenso + (lineas.length - 1) * interlineado;

    if (tituloTop + altoTexto + 40 <= imagen.y) break;
    tamano -= 1;
  }

  imagen.y = Math.max(600, Math.ceil(tituloTop + altoTexto + 40));

  ctx.font = `700 ${tamano}px "${FUENTE_BOLD}"`;
  ctx.fillStyle = colores.texto;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  lineas.forEach((linea, indice) => {
    ctx.fillText(linea, margen, tituloTop + ascenso + indice * interlineado);
  });

  dibujarCoverEnArea(
    ctx,
    imagenPrincipal,
    imagen.x,
    imagen.y,
    imagen.ancho,
    imagen.alto,
  );
};

const dibujarStory = (
  ctx,
  imagenPrincipal,
  logoOriginal,
  titulo,
  formato,
  tipoNota,
  tema,
) => {
  const margen = 78;
  const imagen = { x: 64, y: 0, ancho: 952, alto: 0 };
  const colores = TEMAS[tema];

  ctx.fillStyle = colores.fondo;
  ctx.fillRect(0, 0, 1080, 1920);

  const logo = tema === "oscuro" ? crearLogoNegro(logoOriginal) : crearLogoBlanco(logoOriginal);
  ctx.drawImage(logo, 76, 50, 72, 72);

  ctx.fillStyle = colores.texto;
  ctx.font = `700 30px "${FUENTE_BOLD}"`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("www.residente.mx", 160, 114);

  const etiqueta = obtenerEtiquetaFormato(formato);
  const etiquetaY = 186;
  const etiquetaAlto = 64;
  ctx.font = `italic 700 38px "${FUENTE_BOLD}"`;
  const anchoEtiqueta = Math.max(174, ctx.measureText(etiqueta).width + 38);
  ctx.fillStyle = "#FFF200";
  ctx.fillRect(margen, etiquetaY, anchoEtiqueta, etiquetaAlto);
  ctx.fillStyle = "#000000";
  ctx.fillText(etiqueta, margen + 18, etiquetaY + 47);

  ctx.fillStyle = colores.texto;
  ctx.font = `700 40px "${FUENTE_BOLD}"`;
  ctx.fillText(obtenerTipoNota(tipoNota), margen, 322);

  const tituloTop = 394;
  const anchoTitulo = 924;
  const tamano = 76;
  ctx.font = `700 ${tamano}px "${FUENTE_BOLD}"`;
  const lineas = dividirTexto(ctx, titulo.trim(), anchoTitulo);
  const metricas = ctx.measureText("Ágj");
  const ascenso = metricas.actualBoundingBoxAscent || tamano * 0.8;
  const descenso = metricas.actualBoundingBoxDescent || tamano * 0.2;
  const interlineado = tamano * 1.04;
  const altoTexto = ascenso + descenso + (lineas.length - 1) * interlineado;

  imagen.y = Math.ceil(tituloTop + altoTexto + 57);
  imagen.alto = 1920 - imagen.y - 190;

  ctx.fillStyle = colores.texto;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  lineas.forEach((linea, indice) => {
    ctx.fillText(linea, margen, tituloTop + ascenso + indice * interlineado);
  });

  dibujarCoverEnArea(
    ctx,
    imagenPrincipal,
    imagen.x,
    imagen.y,
    imagen.ancho,
    imagen.alto,
  );
};

const esperarFuentes = async () => {
  if (!document.fonts) return;

  await document.fonts.load(`700 64px "${FUENTE_BOLD}"`);
};

const canvasAArchivo = (canvas, nombre) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("No se pudo crear la imagen para redes"));
          return;
        }

        resolve(
          new File([blob], `${nombre}-${Date.now()}.jpg`, {
            type: "image/jpeg",
          }),
        );
      },
      "image/jpeg",
      0.92,
    );
  });

const generarImagenRedes = async ({
  imagen,
  titulo,
  formato,
  tipoNota,
  tipoSalida,
  tema,
}) => {
  if (!(imagen instanceof Blob)) {
    throw new Error("La imagen principal no es un archivo válido");
  }
  if (!titulo?.trim()) {
    throw new Error("La nota necesita un título");
  }

  const salida = SALIDAS[tipoSalida];
  if (!salida) throw new Error("Formato de salida no válido");

  await esperarFuentes();
  const urlImagen = URL.createObjectURL(imagen);

  try {
    const [imagenPrincipal, logoOriginal] = await Promise.all([
      cargarImagen(urlImagen),
      cargarImagen(`${import.meta.env.BASE_URL}residente.svg`),
    ]);

    const canvas = document.createElement("canvas");
    canvas.width = salida.ancho;
    canvas.height = salida.alto;
    const ctx = canvas.getContext("2d");

    if (tipoSalida === "post") {
      dibujarPost(ctx, imagenPrincipal, logoOriginal, titulo, formato, tipoNota, tema);
    } else {
      dibujarStory(ctx, imagenPrincipal, logoOriginal, titulo, formato, tipoNota, tema);
    }

    return canvasAArchivo(
      canvas,
      tema === "claro" ? `${salida.nombre}-blanco` : salida.nombre,
    );
  } finally {
    URL.revokeObjectURL(urlImagen);
  }
};

export const generarInstafoto = (datos, tema = "oscuro") =>
  generarImagenRedes({ ...datos, tema, tipoSalida: "post" });

export const generarStory = (datos, tema = "oscuro") =>
  generarImagenRedes({ ...datos, tema, tipoSalida: "story" });
