const CorreoElectronico = () => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico *
            </label>
            <input
                type="text"
                placeholder="Tu correo electronico"
                className={`w-full px-3 py-2 border rounded-md bg-white border-gray-300`}
            />
        </div>
    )
}

export default CorreoElectronico
