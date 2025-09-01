import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { notasPorTipoNota } from "../../../api/notasPublicadasGet";
import { urlApi } from "../../../api/url.js";

const NotasAcervo = ({ onCardClick }) => {
    const [notas, setNotas] = useState([]);
    const [notasBusqueda, setNotasBusqueda] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [buscando, setBuscando] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotas = async () => {
            try {
                const data = await notasPorTipoNota("Acervo");
                setNotas(data);
            } catch (error) {
                console.error("Error cargando notas de acervo:", error);
            }
        };

        fetchNotas();
    }, []);

    const buscarNotas = async (query) => {
        if (query.length < 3) {
            setNotasBusqueda([]);
            setBuscando(false);
            return;
        }

        setBuscando(true);
        try {
            const response = await fetch(`${urlApi}api/notas`);
            if (response.ok) {
                const todas = await response.json();
                const normalizar = (t) =>
                    t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                const filtradas = todas.filter(
                    (n) =>
                        normalizar(n.titulo || "").includes(normalizar(query)) ||
                        normalizar(n.subtitulo || "").includes(normalizar(query))
                );
                setNotasBusqueda(filtradas.slice(0, 20));
            }
        } catch (e) {
            console.error("Error buscando:", e);
        } finally {
            setBuscando(false);
        }
    };

    useEffect(() => {
        const t = setTimeout(() => {
            if (inputValue.length >= 3) buscarNotas(inputValue);
        }, 300);
        return () => clearTimeout(t);
    }, [inputValue]);

    const opciones = inputValue.length >= 3 ? notasBusqueda : notas;

    return (
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-[#fff300] mb-4">
            <div className="max-w-[1080px] mx-auto h-80 py-12">

                <div className="flex justify-between items-end leading-8  mb-4">
                    <h2 className="text-[29px] font-bold">Residente. El acervo gastronómico de Nuevo León</h2>
                    {/* 🔍 Buscador */}
                    <Autocomplete
                        disablePortal
                        options={opciones}
                        getOptionLabel={(option) => option.titulo || ""}
                        sx={{
                            width: 380,
                            "& .MuiOutlinedInput-root": {
                                padding: "0 8px",          // padding lateral
                                height: 40,               // altura total
                                fontSize: "14px",
                                backgroundColor: "white"
                            },
                            "& .MuiInputBase-input": {
                                padding: "0 8px !important", // quitar padding vertical
                                height: "100%",              // que ocupe toda la caja
                                display: "flex",
                                alignItems: "center",        // centrado vertical
                            },
                            "& .MuiInputLabel-root": {
                                fontSize: "13px",
                                top: "-4px"                  // baja el label un poquito
                            },
                        }}
                        renderInput={(params) => (
                            <TextField {...params} label="Buscar notas..." />
                        )}
                        onChange={(event, newValue) => {
                            if (newValue && newValue.id) {
                                navigate(`/notas/${newValue.id}`);
                            }
                        }}
                        onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
                        noOptionsText={
                            inputValue.length >= 3
                                ? buscando
                                    ? "Buscando..."
                                    : "No se encontraron notas"
                                : "Escribe al menos 3 caracteres"
                        }
                    />


                </div>

                {notas.length > 0 ? (
                    <div className="flex flex-row gap-4">
                        <div className="flex justify-start items-start">
                            <span className="text-[25px] text-white leading-6.5">
                                Encuentra aqui todo sobre la actualidad y la historia sobre la gastronimia de Nuevo León
                            </span>
                        </div>
                        <div className="flex gap-4 justify-end ml-auto">
                            {notas.map((nota) => (
                                <div
                                    key={nota.id}
                                    className="w-40 cursor-pointer"
                                    onClick={() => onCardClick && onCardClick(nota)}
                                >
                                    <img
                                        src={nota.imagen}
                                        alt="Portada Revista"
                                        className="w-full h-28 object-cover"
                                    />
                                    <div className="flex flex-col mt-2 text-right">
                                        <h2 className="text-black text-[14px] leading-4.5 text-wrap">
                                            {nota.titulo}
                                        </h2>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p>No hay notas de Acervo disponibles.</p>
                )}
            </div>
        </div>
    );
};

export default NotasAcervo;
