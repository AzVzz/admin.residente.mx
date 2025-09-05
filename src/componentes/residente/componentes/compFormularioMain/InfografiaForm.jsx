import React, { useState, useEffect } from 'react';
import { getInfografias, crearInfografia } from '../../../api/infografiaApi';

const InfografiaForm = () => {
    const [form, setForm] = useState({
        info_imagen: null,
        pdf: null,
    });
    const [imagenPreview, setImagenPreview] = useState(null);
    const [pdfNombre, setPdfNombre] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [postError, setPostError] = useState(null);
    const [postResponse, setPostResponse] = useState(null);
    const [infografias, setInfografias] = useState([]);

    useEffect(() => {
        getInfografias().then(setInfografias);
    }, []);

    const handleImagenChange = e => {
        const file = e.target.files[0];
        setForm({ ...form, info_imagen: file });
        if (file) {
            const reader = new FileReader();
            reader.onload = ev => setImagenPreview(ev.target.result);
            reader.readAsDataURL(file);
        } else {
            setImagenPreview(null);
        }
    };

    const handlePdfChange = e => {
        const file = e.target.files[0];
        setForm({ ...form, pdf: file });
        setPdfNombre(file ? file.name : "");
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setIsPosting(true);
        setPostError(null);
        setPostResponse(null);
        try {
            const formData = new FormData();
            if (form.info_imagen) formData.append("info_imagen", form.info_imagen);
            if (form.pdf) formData.append("pdf", form.pdf);

            await crearInfografia(formData);
            setPostResponse("Infografía creada correctamente");
            setForm({ info_imagen: null, pdf: null });
            setImagenPreview(null);
            setPdfNombre("");
            // Actualiza la lista después de crear
            getInfografias().then(setInfografias);
        } catch (error) {
            setPostError("Error al crear la infografía");
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="py-8">
            <div className="max-w-[600px] mx-auto">
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg border border-gray-200 px-8 py-8 space-y-6">
                    <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
                        Nueva Infografía
                    </h1>
                    <p className="text-gray-600 text-center mb-4">
                        Sube una imagen y un PDF para crear una nueva infografía.
                    </p>
                    {postResponse && (
                        <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-2 text-center">
                            {postResponse}
                        </div>
                    )}
                    {postError && (
                        <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-2 text-center">
                            {postError}
                        </div>
                    )}
                    {/* Imagen */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                            <input
                                type="file"
                                name="info_imagen"
                                accept="image/*"
                                onChange={handleImagenChange}
                                className="hidden"
                                id="imagen-infografia"
                            />
                            {imagenPreview ? (
                                <div className="space-y-3">
                                    <img
                                        src={imagenPreview}
                                        alt="Preview"
                                        className="mx-auto h-32 w-auto object-cover"
                                    />
                                    <p className="text-sm text-gray-600 mb-3">Imagen seleccionada</p>
                                    <div className="flex gap-3 justify-center">
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('imagen-infografia').click()}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Cambiar Imagen
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImagenPreview(null);
                                                setForm({ ...form, info_imagen: null });
                                                document.getElementById('imagen-infografia').value = '';
                                            }}
                                            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <svg
                                        className="mx-auto h-16 w-16 text-gray-400"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 48 48"
                                    >
                                        <path
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <div>
                                        <p className="text-base text-gray-600 mb-2">
                                            Haz clic para seleccionar una imagen
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('imagen-infografia').click()}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Elegir Imagen
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500">JPG, PNG, WEBP hasta 20MB</p>
                                </div>
                            )}
                        </div>
                        {/* PDF */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Archivo PDF</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                <input
                                    type="file"
                                    name="pdf"
                                    accept="application/pdf"
                                    onChange={handlePdfChange}
                                    className="hidden"
                                    id="pdf-infografia"
                                />
                                {pdfNombre ? (
                                    <div className="space-y-3">
                                        <p className="text-base text-gray-700">{pdfNombre}</p>
                                        <div className="flex gap-3 justify-center">
                                            <button
                                                type="button"
                                                onClick={() => document.getElementById('pdf-infografia').click()}
                                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Cambiar PDF
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPdfNombre("");
                                                    setForm({ ...form, pdf: null });
                                                    document.getElementById('pdf-infografia').value = '';
                                                }}
                                                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 48 48">
                                            <rect width="48" height="48" rx="8" fill="#F3F4F6" />
                                            <path d="M16 32h16M16 24h16M16 16h16" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('pdf-infografia').click()}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Elegir PDF
                                        </button>
                                        <p className="text-sm text-gray-500">PDF hasta 20MB</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isPosting}
                        className={`w-full py-2 px-4 font-bold rounded text-white bg-blue-600 hover:bg-blue-700 transition ${isPosting ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {isPosting ? "Guardando..." : "Crear Infografía"}
                    </button>
                </form>
                <ul
                    className="mt-8 space-y-4"
                    style={{ maxHeight: '400px', overflowY: 'auto' }} // Puedes ajustar la altura
                >
                    {infografias.map((info, idx) => (
                        <li key={info.id} className="flex flex-col sm:flex-row gap-4 bg-white rounded-lg shadow-md p-4">
                            <img src={info.info_imagen} alt="Infografía" className="w-full sm:w-1/3 h-auto rounded-md object-cover" />
                            <div className="flex-1">
                                <h2 className="text-lg font-semibold text-gray-800">{info.titulo}</h2>
                                <p className="text-gray-600 mt-1">{info.descripcion}</p>
                                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                                    <a href={info.pdf} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                        Ver PDF
                                    </a>
                                    <button className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default InfografiaForm;
