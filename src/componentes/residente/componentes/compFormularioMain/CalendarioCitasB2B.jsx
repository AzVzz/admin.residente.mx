import React, { useState, useMemo } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// Clave única por día (año-mes-día) a partir de una fecha.
const claveDia = (anio, mes, dia) => `${anio}-${mes}-${dia}`;

const formatMonto = (m) =>
  m == null || isNaN(Number(m))
    ? ""
    : new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 0,
      }).format(Number(m));

const CalendarioCitasB2B = ({ citas }) => {
  // Mes que se está mostrando (primer día del mes)
  const [ref, setRef] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const anio = ref.getFullYear();
  const mes = ref.getMonth();

  // Agrupar las citas por día
  const porDia = useMemo(() => {
    const map = {};
    citas.forEach((c) => {
      const d = new Date(c.fecha_cita);
      if (isNaN(d.getTime())) return;
      const k = claveDia(d.getFullYear(), d.getMonth(), d.getDate());
      if (!map[k]) map[k] = [];
      map[k].push(c);
    });
    return map;
  }, [citas]);

  // Construir las celdas del mes (con huecos al inicio para alinear el día de la semana)
  const primerDiaSemana = new Date(anio, mes, 1).getDay(); // 0=Dom
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const celdas = [];
  for (let i = 0; i < primerDiaSemana; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d);

  const hoy = new Date();
  const esHoy = (d) =>
    d &&
    hoy.getFullYear() === anio &&
    hoy.getMonth() === mes &&
    hoy.getDate() === d;

  const mesAnterior = () => setRef(new Date(anio, mes - 1, 1));
  const mesSiguiente = () => setRef(new Date(anio, mes + 1, 1));
  const irHoy = () => setRef(new Date(hoy.getFullYear(), hoy.getMonth(), 1));

  return (
    <div className="bg-white overflow-hidden">
      {/* Barra de navegación */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600">
        <button
          onClick={mesAnterior}
          className="text-white/90 hover:text-white p-1 rounded hover:bg-white/10 cursor-pointer"
          aria-label="Mes anterior"
        >
          <IoChevronBack className="text-xl" />
        </button>
        <div className="flex items-center gap-3">
          <h3 className="text-white font-semibold capitalize">
            {MESES[mes]} {anio}
          </h3>
          <button
            onClick={irHoy}
            className="text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded cursor-pointer"
          >
            Hoy
          </button>
        </div>
        <button
          onClick={mesSiguiente}
          className="text-white/90 hover:text-white p-1 rounded hover:bg-white/10 cursor-pointer"
          aria-label="Mes siguiente"
        >
          <IoChevronForward className="text-xl" />
        </button>
      </div>

      {/* Encabezado de días de la semana */}
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-200">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Celdas del mes */}
      <div className="grid grid-cols-7">
        {celdas.map((d, i) => {
          const k = d ? claveDia(anio, mes, d) : null;
          const delDia = k ? porDia[k] || [] : [];
          return (
            <div
              key={i}
              className={`min-h-[92px] border border-gray-100 p-1 align-top ${
                d ? "bg-white" : "bg-gray-50"
              } ${esHoy(d) ? "ring-2 ring-inset ring-indigo-400" : ""}`}
            >
              {d && (
                <div
                  className={`text-xs mb-1 ${
                    esHoy(d)
                      ? "font-bold text-indigo-700"
                      : "text-gray-500"
                  }`}
                >
                  {d}
                </div>
              )}
              <div className="space-y-1">
                {delDia.map((c) => (
                  <div
                    key={c.id}
                    className="rounded bg-indigo-100 text-indigo-800 text-[10px] leading-tight px-1 py-0.5 cursor-default"
                    title={`${c.nombre}${
                      c.monto != null ? " · " + formatMonto(c.monto) : ""
                    }${c.vendedor_nombre ? " · " + c.vendedor_nombre : ""}`}
                  >
                    <div className="font-semibold truncate">{c.nombre}</div>
                    {c.vendedor_nombre && (
                      <div className="text-indigo-600/80 truncate">
                        👤 {c.vendedor_nombre}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarioCitasB2B;
