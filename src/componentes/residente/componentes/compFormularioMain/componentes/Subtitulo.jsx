const Subtitulo = ({ subtitulo, onSubtituloChange }) => {
    return (
        <div className="space-y-2">
            <label htmlFor="subtitulo" className="block text-sm font-medium text-gray-700">
                Subtítulo
            </label>
            <textarea
                id="subtitulo"
                placeholder="Agrega un subtítulo descriptivo"
                value={subtitulo}
                onChange={(e) => onSubtituloChange(e.target.value)}
                rows={1}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 max-h-50 min-h-24"
            />
        </div>
    )
}

export default Subtitulo;