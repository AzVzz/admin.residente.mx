const BotonSubmitNota = ({ isPosting, notaId }) => (
    <div className="flex gap-4 pt-4">
        <button
            type="submit"
            className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            disabled={isPosting}
        >
            {isPosting
                ? (notaId ? 'Actualizando...' : 'Publicando...')
                : (notaId ? 'Actualizar Nota' : 'Publicar Nota')}
        </button>
    </div>
);

export default BotonSubmitNota;