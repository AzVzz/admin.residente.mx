// Noticias y más recomendaciones de {categoria}
const BarraMarquee = ({ categoria, repeticiones = 7 }) => (
  <div className=" text-black bg-[#fff300] px-3 py-1.5 my-0 overflow-hidden relative w-full text-[16px] font-bold">
    <div className="inline-flex flex-nowrap animate-marquee items-center font-roman">
      {Array.from({ length: repeticiones }).map((_, idx) => (
        <span key={idx} className={`whitespace-nowrap${idx > 0 ? " ml-[150px]" : ""}`}>
          {categoria}
        </span>
      ))}
      {Array.from({ length: repeticiones }).map((_, idx) => (
        <span key={`dup-${idx}`} className={`whitespace-nowrap${idx > 0 ? " ml-[150px]" : ""}`}>
          {categoria}
        </span>
      ))}
    </div>
  </div>
);

export default BarraMarquee;
