// componentes/BotonSubmitNota.jsx
const BotonSubmitNota = ({ isPosting, notaId, guardarComo = 'actualizada', onClick, disabled }) => {
  const esActualizar = guardarComo === 'actualizada';

  const texto = esActualizar
    ? (isPosting
        ? (notaId ? 'Actualizando...' : 'Publicando...')
        : (notaId ? 'Actualizar Nota' : 'Publicar Nota'))
    : (isPosting
        ? (notaId ? 'Guardando cambios...' : 'Guardando...')
        : (notaId ? 'Guardar Cambios' : 'Guardar borrador'));

  const colorClase = esActualizar
    ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
    : "bg-green-600 hover:bg-green-700 focus:ring-green-500";

  return (
    <button
      type="button"            // ← importante: no dispara submit implícito
      onClick={onClick}
      className={`flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${colorClase} focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 cursor-pointer`}
      disabled={isPosting || disabled}
    >
      {texto}
    </button>
  );
};

export default BotonSubmitNota;
