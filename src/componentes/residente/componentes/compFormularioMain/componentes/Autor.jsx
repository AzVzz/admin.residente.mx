import { useFormContext } from 'react-hook-form';
import { useAuth } from '../../../../Context';

const Autor = () => {
    const { usuario } = useAuth();

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                Autor
            </label>
            <div className="w-full px-3 py-2 border rounded-md shadow-sm bg-gray-100 text-gray-700">
                {usuario?.nombre_usuario || "Sin usuario"}
            </div>
        </div>
    );
}

export default Autor;