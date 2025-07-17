const Imagen = () => {
    return (
        <div className="space-y-2">
            <label htmlFor="imagen" className="block text-sm font-medium text-gray-700">
                Imagen
            </label>
            <input
                id="imagen"
                type="file"
                accept="image/*"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
        </div>
    )
}

export default Imagen;