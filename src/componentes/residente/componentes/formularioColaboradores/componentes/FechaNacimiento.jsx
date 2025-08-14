const FechaNacimiento = () => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Año de nacimiento*
            </label>
            <input
                type="text"
                placeholder="Año de nacimiento"
                className={`w-full px-3 py-2 border rounded-md bg-white border-gray-300`}
            />

        </div>
    )
}

export default FechaNacimiento
