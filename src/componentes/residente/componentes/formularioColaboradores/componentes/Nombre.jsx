import { useFormContext } from "react-hook-form"

const Nombre = () => {

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Tu nombre *
            </label>
            <input
                type="text"
                placeholder="Nombre"
                className={`w-full px-3 py-2 border rounded-md bg-white border-gray-300`}
            />

        </div>
    )
}

export default Nombre