const Facebook = () => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Facebook *
            </label>
            <input
                type="text"
                placeholder="Url de tu usuario/página de Facebook"
                className={`w-full px-3 py-2 border rounded-md bg-white border-gray-300`}
            />
        </div>
    )
}

export default Facebook
