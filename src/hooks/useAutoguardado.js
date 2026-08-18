import { useEffect, useRef, useState } from "react";
import {
  guardarBorrador,
  eliminarBorrador,
  obtenerBorrador,
  ultimoBorradorNuevo,
} from "../utils/borradores";

// Id de sesión para capturas NUEVAS. Se guarda en sessionStorage para que una
// recarga de página continúe el mismo borrador. OJO: sessionStorage se pierde
// al cerrar la pestaña; ese caso lo cubre el banner buscando el último borrador
// del tipo (ultimoBorradorNuevo), no este id.
const getSessionFormId = (tipo) => {
  const key = `borradorFormId_${tipo}`;
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = `${tipo}_nuevo_${Date.now()}`;
    sessionStorage.setItem(key, id);
  }
  return id;
};

const setSessionFormId = (tipo, id) => {
  sessionStorage.setItem(`borradorFormId_${tipo}`, id);
};

const clearSessionFormId = (tipo) => {
  sessionStorage.removeItem(`borradorFormId_${tipo}`);
};

/**
 * Auto-guardado de borradores + recuperación para formularios react-hook-form.
 *
 * @param {object}   params
 * @param {'nota'|'restaurante'} params.tipo
 * @param {function} params.watch      - watch de react-hook-form.
 * @param {function} params.reset      - reset de react-hook-form.
 * @param {string|number} [params.recordId]  - id del registro en edición (si aplica).
 * @param {string}  [params.borradorParam]   - id de borrador a recuperar directo (?borrador=).
 * @param {function} [params.getTitulo]      - (values) => string para el título del borrador.
 * @param {boolean} [params.listo]           - si el formulario ya cargó datos base.
 * @param {number}  [params.delay]           - ms de debounce (default 800).
 */
export const useAutoguardado = ({
  tipo,
  watch,
  reset,
  recordId,
  borradorParam,
  getTitulo,
  listo = true,
  delay = 800,
}) => {
  const esNuevo = !recordId && !borradorParam;

  // formId inicial: edición > recuperación directa > sesión nueva.
  // Es stateful porque al recuperar un borrador previo (tras cerrar la pestaña)
  // adoptamos su id para que los siguientes guardados actualicen esa entrada y
  // no se generen duplicados.
  const [formId, setFormId] = useState(() => {
    if (recordId) return `${tipo}_${recordId}`;
    if (borradorParam) return borradorParam;
    return getSessionFormId(tipo);
  });

  const [borradorPendiente, setBorradorPendiente] = useState(null);
  const yaEvaluoMount = useRef(false);

  useEffect(() => {
    if (yaEvaluoMount.current) return;
    yaEvaluoMount.current = true;

    if (borradorParam) {
      // Viene desde el apartado de Recuperación: cargar directo, sin banner.
      const existente = obtenerBorrador(borradorParam);
      if (existente) reset(existente.data);
      return;
    }

    // Buscar un borrador para ofrecer en el banner (opt-in, nunca sobreescribe).
    const candidato = esNuevo
      ? ultimoBorradorNuevo(tipo)
      : obtenerBorrador(formId);
    if (candidato) setBorradorPendiente(candidato);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-guardado con debounce sobre cada cambio real del usuario.
  const timerRef = useRef(null);
  useEffect(() => {
    if (!listo) return undefined;
    const sub = watch((value, { type } = {}) => {
      // Solo ediciones reales (type === "change"). Los eventos sin type vienen
      // de reset()/carga programática y no deben crear un borrador.
      if (!type) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const titulo = getTitulo ? getTitulo(value) : value?.titulo;
        guardarBorrador(tipo, formId, titulo, value);
      }, delay);
    });
    return () => {
      sub.unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch, formId, tipo, listo, delay]);

  // Recuperar el borrador ofrecido en el banner.
  const recuperar = () => {
    if (borradorPendiente) {
      reset(borradorPendiente.data);
      // Adoptar el id del borrador recuperado para seguir actualizándolo.
      setFormId(borradorPendiente.id);
      if (esNuevo) setSessionFormId(tipo, borradorPendiente.id);
    }
    setBorradorPendiente(null);
  };

  // Descartar el borrador ofrecido (lo elimina del storage).
  const descartar = () => {
    const idADescartar = borradorPendiente?.id || formId;
    eliminarBorrador(idADescartar);
    if (esNuevo) clearSessionFormId(tipo);
    setBorradorPendiente(null);
  };

  // Limpiar tras publicar con éxito.
  const limpiar = () => {
    eliminarBorrador(formId);
    if (esNuevo) clearSessionFormId(tipo);
    setBorradorPendiente(null);
  };

  return { formId, borradorPendiente, recuperar, descartar, limpiar };
};

export default useAutoguardado;
