import React, { useState, useEffect } from "react";
import { FaRobot, FaTimes, FaPlus, FaMagic } from "react-icons/fa";

const SmartTagsInput = ({ value = [], onChange, onGenerateAI, isGenerating, hideGenerationButton = false }) => {
    const [inputValue, setInputValue] = useState("");
    const [localTags, setLocalTags] = useState([]);

    useEffect(() => {
        // Sincronizar estado local con props, asegurando que sea un array
        if (Array.isArray(value)) {
            setLocalTags(value);
        } else if (typeof value === "string") {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) setLocalTags(parsed);
            } catch (e) {
                setLocalTags([]);
            }
        } else {
            setLocalTags([]);
        }
    }, [value]);

    const handleAddTag = () => {
        if (inputValue.trim() !== "") {
            const newTag = inputValue.trim().toLowerCase();
            if (!localTags.includes(newTag)) {
                const newTags = [...localTags, newTag];
                setLocalTags(newTags);
                onChange(newTags);
            }
            setInputValue("");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        const newTags = localTags.filter((tag) => tag !== tagToRemove);
        setLocalTags(newTags);
        onChange(newTags);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                    🏷️ Smart Tags (IA)
                </label>
                {onGenerateAI && !hideGenerationButton && (
                    <button
                        type="button"
                        onClick={onGenerateAI}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm font-medium transition-colors h-[42px]"
                    >
                        {isGenerating ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                Generando...
                            </>
                        ) : (
                            <>
                                <FaMagic />
                                Generar con IA
                            </>
                        )}
                    </button>
                )}
            </div>

            <p className="text-xs text-gray-500 mb-3">
                Etiquetas conceptuales para relacionar contenido automáticamente. Generadas por IA o agregadas manualmente.
            </p>

            {/* Input Area */}
            <div className="flex gap-2 mb-3">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Escribe una etiqueta y presiona Enter..."
                        className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 text-sm"
                    />
                    <button
                        type="button"
                        onClick={handleAddTag}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600"
                    >
                        <FaPlus />
                    </button>
                </div>
            </div>

            {/* Tags Cloud */}
            <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-gray-50 rounded-md border border-gray-100">
                {localTags.length === 0 && (
                    <span className="text-gray-400 text-xs italic p-1">
                        No hay etiquetas asignadas.
                    </span>
                )}
                {localTags.map((tag, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-600 focus:outline-none"
                        >
                            <FaTimes size={10} />
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
};

export default SmartTagsInput;
