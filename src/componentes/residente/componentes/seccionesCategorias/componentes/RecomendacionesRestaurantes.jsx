import { Link } from "react-router-dom";

const RecomendacionesRestaurantes = ({ categoria, restaurantes }) => (
    <div className="mb-8">
        <h2 className="text-xl font-bold mb-3 text-center">
            Más recomendaciones de {categoria}
        </h2>
        <ul className="flex flex-row justify-center items-center flex-wrap gap-x-5 gap-y-1">
            {restaurantes.map(rest => (
                <li
                    key={rest.id}
                    className="bg-black text-white text-[18px] font-semibold font-sans px-2 py-1 shadow-md whitespace-nowrap "
                >
                    <Link
                        to={`/restaurante/${rest.slug}`}
                        className="text-black-600 hover:underline"
                    >
                        {rest.nombre_restaurante.charAt(0).toUpperCase() +
                            rest.nombre_restaurante.slice(1).toLowerCase()}
                    </Link>
                </li>
            ))}
        </ul>
    </div>
);

export default RecomendacionesRestaurantes;