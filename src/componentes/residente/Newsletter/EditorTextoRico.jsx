import { useEffect, useRef } from "react";

// Editor rich-text minimal basado en contentEditable + execCommand.
// Produce HTML con <span style="..."> inline (styleWithCSS=true) compatible con clientes de correo.
// Soporta: negrita, cursiva, subrayado, fuente, tamaño, color y alineación por párrafo.
export default function EditorTextoRico({ value, onChange, placeholder = "Escribe aquí..." }) {
  const editorRef = useRef(null);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (!editorRef.current) return;
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    const actual = editorRef.current.innerHTML;
    const deseado = value || "";
    if (actual !== deseado) editorRef.current.innerHTML = deseado;
  }, [value]);

  const emit = () => {
    if (!editorRef.current) return;
    isInternalUpdate.current = true;
    onChange(editorRef.current.innerHTML);
  };

  const exec = (cmd, arg = null) => {
    editorRef.current?.focus();
    document.execCommand("styleWithCSS", false, true);
    document.execCommand(cmd, false, arg);
    emit();
  };

  // execCommand("fontSize") sólo soporta 1-7. Truco: aplicar size=7 sin styleWithCSS,
  // detectar los <font size="7"> resultantes y reemplazarlos por <span style="font-size:Npx">.
  const aplicarTamanio = (px) => {
    if (!px || !editorRef.current) return;
    editorRef.current.focus();
    document.execCommand("styleWithCSS", false, false);
    document.execCommand("fontSize", false, "7");
    const fonts = editorRef.current.querySelectorAll('font[size="7"]');
    fonts.forEach((f) => {
      const span = document.createElement("span");
      span.style.fontSize = `${px}px`;
      span.innerHTML = f.innerHTML;
      f.replaceWith(span);
    });
    emit();
  };

  const aplicarFuente = (stack) => {
    if (!stack) return;
    exec("fontName", stack);
  };

  const aplicarColor = (color) => {
    if (!color) return;
    exec("foreColor", color);
  };

  const btn =
    "w-7 h-7 flex items-center justify-center text-xs rounded border border-gray-200 hover:border-gray-400 bg-white";

  // mouseDown.preventDefault evita perder la selección al hacer clic en los botones.
  const stopMouse = (e) => e.preventDefault();

  const vacio = !value || value.replace(/<[^>]*>/g, "").trim() === "";

  return (
    <div className="border border-gray-200 rounded overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 px-2 py-1 border-b border-gray-200 bg-gray-50">
        <button type="button" onMouseDown={stopMouse} onClick={() => exec("bold")} className={btn} title="Negrita"><b>B</b></button>
        <button type="button" onMouseDown={stopMouse} onClick={() => exec("italic")} className={btn} title="Cursiva"><i>I</i></button>
        <button type="button" onMouseDown={stopMouse} onClick={() => exec("underline")} className={btn} title="Subrayado"><u>U</u></button>

        <span className="w-px h-5 bg-gray-300 mx-1"></span>

        <select
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => { aplicarFuente(e.target.value); e.target.value = ""; }}
          className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white h-7"
          defaultValue=""
          title="Fuente"
        >
          <option value="">Fuente</option>
          <option value="'Helvetica Neue', Helvetica, Arial, sans-serif">Helvetica</option>
          <option value="Georgia, 'Times New Roman', serif">Georgia</option>
          <option value="Verdana, Geneva, Tahoma, sans-serif">Verdana</option>
          <option value="'Courier New', Courier, monospace">Courier</option>
          <option value="'Times New Roman', Times, serif">Times</option>
        </select>

        <select
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => { aplicarTamanio(e.target.value); e.target.value = ""; }}
          className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white h-7"
          defaultValue=""
          title="Tamaño"
        >
          <option value="">Tamaño</option>
          <option value="10">10 px</option>
          <option value="12">12 px</option>
          <option value="14">14 px</option>
          <option value="16">16 px</option>
          <option value="18">18 px</option>
          <option value="22">22 px</option>
          <option value="28">28 px</option>
          <option value="36">36 px</option>
          <option value="48">48 px</option>
        </select>

        <label className="flex items-center gap-1 text-xs cursor-pointer px-1 h-7 border border-gray-200 rounded bg-white" title="Color">
          <span className="text-gray-500">A</span>
          <input
            type="color"
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => aplicarColor(e.target.value)}
            className="w-4 h-4 border-0 p-0 bg-transparent cursor-pointer"
          />
        </label>

        <span className="w-px h-5 bg-gray-300 mx-1"></span>

        <button type="button" onMouseDown={stopMouse} onClick={() => exec("justifyLeft")} className={btn} title="Alinear a la izquierda">⯇</button>
        <button type="button" onMouseDown={stopMouse} onClick={() => exec("justifyCenter")} className={btn} title="Centrar">↔</button>
        <button type="button" onMouseDown={stopMouse} onClick={() => exec("justifyRight")} className={btn} title="Alinear a la derecha">⯈</button>

        <span className="w-px h-5 bg-gray-300 mx-1"></span>

        <button
          type="button"
          onMouseDown={stopMouse}
          onClick={() => exec("removeFormat")}
          className="text-xs px-2 h-7 rounded border border-gray-200 hover:border-gray-400 bg-white"
          title="Quitar formato"
        >
          Limpiar
        </button>
      </div>

      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          onBlur={emit}
          className="min-h-[110px] px-2 py-2 text-sm outline-none"
        />
        {vacio && (
          <div className="absolute top-2 left-2 text-xs text-gray-400 pointer-events-none select-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
