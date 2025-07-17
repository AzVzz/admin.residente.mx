const Autor = ({ autor, onAutorChange }) => {
    return (
        <div className="space-y-2">
            <label htmlFor="autor" className="block text-sm font-medium text-gray-700">
                Autor
            </label>
            <input
                id="autor"
                type="text"
                placeholder="Nombre del autor"
                value={autor}
                onChange={(e) => onAutorChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
        </div>
    )
}

export default Autor;