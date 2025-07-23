import Cafeterias from '../../../../imagenes/gifsBarrioAntiguo/CAFETERIAS-BARRIO-ANTIGUO.gif';
import Tardear from '../../../../imagenes/gifsBarrioAntiguo/Copia-de-TARDEAR-BARRIO-ANTIGUO.gif';
import Tadicional from '../../../../imagenes/gifsBarrioAntiguo/Copia-de-TRADICIONAL-MEXICANA-BARRIO-ANTIGUO.gif';
import Vida from '../../../../imagenes/gifsBarrioAntiguo/Copia-de-VIDA-LENTA-BARRIO-ANTIGUO.gif';
import Experiencias from '../../../../imagenes/gifsBarrioAntiguo/EXPERIENCIAS-BARRIO-ANTIGUO.gif';

const BarrioAntiguoGifs = () => {
    return (
        <div className="flex flex-col gap-5">
            <img className="h-full w-full object-contain" src={Cafeterias}/>
            <img className="h-full w-full object-contain" src={Tardear}/>
            <img className="h-full w-full object-contain" src={Tadicional}/>
            <img className="h-full w-full object-contain" src={Vida}/>
            <img className="h-full w-full object-contain" src={Experiencias}/>
        </div>
    )
}

export default BarrioAntiguoGifs;