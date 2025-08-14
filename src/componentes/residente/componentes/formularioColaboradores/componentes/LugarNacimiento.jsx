const LugarNacimiento = () => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Lugar de nacimiento *
            </label>
            <input
                type="text"
                placeholder="Lugar de nacimiento"
                className={`w-full px-3 py-2 border rounded-md bg-white border-gray-300`}
            />
        </div>
    )
}

export default LugarNacimiento
