import './CincoRazones.css';
import useFitText from 'use-fit-text';

const CincoRazones = ({ nombreRestaurante, razones }) => {
    const { fontSize, ref } = useFitText({
        minFontSize: 14,
        maxFontSize: 200,
        resolution: 5,
    });

    // Crear array de objetos con título y cuerpo
    const razonesCompletas = [1, 2, 3, 4, 5]
        .map(i => ({
            titulo: razones?.[`razon_${i}`],
            cuerpo: razones?.[`razonCuerpo_${i}`]
        }))
        .filter(r => r.titulo && r.cuerpo); // Solo incluir razones completas

    if (razonesCompletas.length === 0) return null;

    return (
        <div className="container-cinco-razones">
            <h3 className="text-categoria">5 Razones para ir hoy</h3>
            {razonesCompletas.map((razon, index) => (
                <div className="cinco-razones-item" key={index}>
                    <div className="cinco-razones-cuerpo">
                        <h4>{index + 1}</h4>
                        <p className="text-global">
                            <strong className="text-global">{razon.titulo}. </strong>
                            {razon.cuerpo}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CincoRazones;