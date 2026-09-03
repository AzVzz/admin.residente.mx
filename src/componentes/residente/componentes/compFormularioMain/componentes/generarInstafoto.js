const FUENTE_BOLD = "NeueHaasGroteskDisplayW02Bold";
const FUENTE_ROMAN = "NeueHaasGroteskDisplayPro55Roman";

const SALIDAS = {
  post: {
    ancho: 1080,
    alto: 1350,
    logoX: 69,
    logoY: 38,
    logoMedida: 76,
    webX: 171,
    webY: 91,
    etiquetaY: 286,
    tipoY: 394,
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
    etiquetaY: 660,
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

const dibujarCover = (ctx, imagen, ancho, alto) => {
  const anchoOriginal = imagen.naturalWidth || imagen.width;
  const altoOriginal = imagen.naturalHeight || imagen.height;
  const escala = Math.max(ancho / anchoOriginal, alto / altoOriginal);
  const anchoDibujado = anchoOriginal * escala;
  const altoDibujado = altoOriginal * escala;
  const x = (ancho - anchoDibujado) / 2;
  const y = (alto - altoDibujado) / 2;

  ctx.drawImage(imagen, x, y, anchoDibujado, altoDibujado);
};

const dibujarRectanguloRedondeado = (
  ctx,
  x,
  y,
  ancho,
  alto,
  radio,
) => {
  const r = Math.min(radio, ancho / 2, alto / 2);

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + ancho - r, y);
  ctx.quadraticCurveTo(x + ancho, y, x + ancho, y + r);
  ctx.lineTo(x + ancho, y + alto - r);
  ctx.quadraticCurveTo(x + ancho, y + alto, x + ancho - r, y + alto);
  ctx.lineTo(x + r, y + alto);
  ctx.quadraticCurveTo(x, y + alto, x, y + alto - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

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

const dibujarEtiqueta = (ctx, formato, salida) => {
  const etiqueta = obtenerEtiquetaFormato(formato);

  ctx.save();
  ctx.font = `italic 700 58px "${FUENTE_BOLD}"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  const paddingHorizontal = 30;
  const anchoTexto = ctx.measureText(etiqueta).width;
  const anchoCaja = anchoTexto + paddingHorizontal * 2;
  const altoCaja = 92;
  const x = (salida.ancho - anchoCaja) / 2;
  const y = salida.etiquetaY;

  ctx.fillStyle = "#FFF200";
  ctx.fillRect(x, y, anchoCaja, altoCaja);
  ctx.fillStyle = "#080808";
  ctx.fillText(etiqueta, salida.ancho / 2, y + 67);
  ctx.restore();
};

const dibujarTipoNota = (ctx, tipoNota, salida) => {
  const texto = obtenerTipoNota(tipoNota);

  ctx.save();
  ctx.font = `700 38px "${FUENTE_BOLD}"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  const anchoTexto = ctx.measureText(texto).width;
  const paddingHorizontal = 20;
  const anchoCaja = anchoTexto + paddingHorizontal * 2;
  const altoCaja = 56;
  const x = (salida.ancho - anchoCaja) / 2;
  const y = salida.tipoY;

  dibujarRectanguloRedondeado(ctx, x, y, anchoCaja, altoCaja, 13);
  ctx.fillStyle = "rgba(50, 50, 50, 0.42)";
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 2;
  ctx.fillText(texto, salida.ancho / 2, y + 42);
  ctx.restore();
};

const dibujarTitulo = (ctx, titulo, salida) => {
  const anchoTextoMaximo = salida.nombre === "story" ? 950 : 900;
  const maximoLineas = 7;
  let tamano = salida.nombre === "story" ? 104 : 74;
  let lineas = [];

  while (tamano >= 48) {
    ctx.font = `700 ${tamano}px "${FUENTE_BOLD}"`;
    lineas = dividirTexto(ctx, titulo, anchoTextoMaximo);
    if (lineas.length <= maximoLineas) break;
    tamano -= 1;
  }

  const interlineado = tamano * 1.21;
  ctx.font = `700 ${tamano}px "${FUENTE_BOLD}"`;

  const metricas = ctx.measureText("Ágj");
  const ascenso = metricas.actualBoundingBoxAscent || tamano * 0.8;
  const descenso = metricas.actualBoundingBoxDescent || tamano * 0.2;
  const primeraLinea = salida.primeraLinea;
  const paddingHorizontal = 32;
  const paddingVertical = 6;
  const solapeVertical = salida.nombre === "story" ? 12 : 0;

  ctx.save();

  // Los fondos se unen primero y la opacidad se aplica una sola vez.
  const canvasFondo = document.createElement("canvas");
  canvasFondo.width = salida.ancho;
  canvasFondo.height = salida.alto;
  const fondoCtx = canvasFondo.getContext("2d");
  fondoCtx.fillStyle = "#2D2D2D";

  lineas.forEach((linea, indice) => {
    const yTexto = primeraLinea + indice * interlineado;
    const anchoLinea = ctx.measureText(linea).width;
    const anchoFondo = Math.min(
      salida.ancho - 70,
      anchoLinea + paddingHorizontal * 2,
    );
    const altoTexto = ascenso + descenso;
    const altoFondoBase = altoTexto + paddingVertical * 2;
    const altoFondo =
      salida.nombre === "story"
        ? Math.max(altoFondoBase, interlineado + solapeVertical)
        : altoFondoBase;
    const paddingFondoVertical = (altoFondo - altoTexto) / 2;
    const xFondo = (salida.ancho - anchoFondo) / 2;
    const yFondo = yTexto - ascenso - paddingFondoVertical;

    dibujarRectanguloRedondeado(
      fondoCtx,
      xFondo,
      yFondo,
      anchoFondo,
      altoFondo,
      28,
    );
    fondoCtx.fill();
  });

  ctx.save();
  ctx.globalAlpha = 0.42;
  ctx.drawImage(canvasFondo, 0, 0);
  ctx.restore();

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = `700 ${tamano}px "${FUENTE_BOLD}"`;
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 2;

  lineas.forEach((linea, indice) => {
    ctx.fillText(linea, salida.ancho / 2, primeraLinea + indice * interlineado);
  });

  ctx.restore();
};

const esperarFuentes = async () => {
  if (!document.fonts) return;

  await Promise.all([
    document.fonts.load(`700 74px "${FUENTE_BOLD}"`),
    document.fonts.load(`400 35px "${FUENTE_ROMAN}"`),
  ]);
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

    dibujarCover(ctx, imagenPrincipal, salida.ancho, salida.alto);

    const degradado = ctx.createLinearGradient(0, 250, 0, salida.alto);
    degradado.addColorStop(0, "rgba(0, 0, 0, 0)");
    degradado.addColorStop(0.45, "rgba(0, 0, 0, 0.03)");
    degradado.addColorStop(1, "rgba(0, 0, 0, 0.13)");
    ctx.fillStyle = degradado;
    ctx.fillRect(0, 0, salida.ancho, salida.alto);

    const logoNegro = crearLogoNegro(logoOriginal);
    ctx.drawImage(
      logoNegro,
      salida.logoX,
      salida.logoY,
      salida.logoMedida,
      salida.logoMedida,
    );

    ctx.fillStyle = "#000000";
    ctx.font = `700 35px "${FUENTE_BOLD}"`;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("www.residente.mx", salida.webX, salida.webY);

    dibujarEtiqueta(ctx, formato, salida);
    dibujarTipoNota(ctx, tipoNota, salida);
    dibujarTitulo(ctx, titulo.trim(), salida);

    return canvasAArchivo(canvas, salida.nombre);
  } finally {
    URL.revokeObjectURL(urlImagen);
  }
};

export const generarInstafoto = (datos) =>
  generarImagenRedes({ ...datos, tipoSalida: "post" });

export const generarStory = (datos) =>
  generarImagenRedes({ ...datos, tipoSalida: "story" });
