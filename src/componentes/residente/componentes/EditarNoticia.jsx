import { useState } from 'react';

// Opciones de categorías
const TIPOS_NOTA = [
  'Restaurantes', 'Food & Drink', 'Antojos', 'B2B', 'Gastro-Destinos', 
  'Residente', 'Acervo', 'Giveaway', 'Uanl'
];

const NIVELES_GASTO = ['Fine Dining', 'Premium', 'Casual', 'Económico'];

const TIPOS_COMIDA = [
  'Mexicana', 'Tacos', 'Comfort food', 'Mariscos', 'Oriental', 
  'Carnes', 'Italiano y pizza', 'Internacional'
];

const ZONAS = [
  'Zona Tec', 'Cumbres', 'San Pedro', 'Guadalupe', 'Monterrey Centro',
  'Norte', 'Carretera', 'San Nicolás'
];

const EXPERIENCIAS = ['De negocios', 'Afición', 'Saludable', 'Desayuno', 'Único'];

// Componente Vista Editar Nota - Estilo FormMainResidente
const EditarNoticia = ({ nota, onVolver, formatDate, estatus, onCambiarEstatus }) => {
  const [imagenError, setImagenError] = useState(false);
  const [datosNota, setDatosNota] = useState({
    titulo: nota.title || '',
    subtitulo: nota.description || '',
    contenido: nota.content || '',
    autor: nota.author || nota.source || '',
    tipoNota: '',
    nivelGasto: '',
    tipoComida: '',
    zonas: [],
    experiencia: '',
  });
  const [guardando, setGuardando] = useState(false);
  const [opcionPublicacion, setOpcionPublicacion] = useState('borrador');
  const [fechaProgramada, setFechaProgramada] = useState('');

  // Simular guardado
  const handleGuardar = () => {
    setGuardando(true);
    setTimeout(() => {
      setGuardando(false);
      onVolver();
    }, 1000);
  };

  // Manejar cambio de zona (checkbox)
  const handleZonaChange = (zona) => {
    setDatosNota(prev => ({
      ...prev,
      zonas: prev.zonas.includes(zona)
        ? prev.zonas.filter(z => z !== zona)
        : [...prev.zonas, zona]
    }));
  };

  return (
    <div className="py-8">
      <div className="mx-auto max-w-[1080px]">
        {/* Botón volver */}
        <button 
          onClick={onVolver}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-4 font-medium"
        >
          <span>←</span> Volver a mis notas
        </button>

        <form onSubmit={(e) => e.preventDefault()}>
          <div>
            {/* Header */}
            <div className="mb-6 text-center">
              <h1 className="leading-tight text-2xl font-black text-[#1a365d]">
                Nueva Nota
              </h1>
              <p className="text-gray-600 mt-2">
                Crea una nueva publicación completando los siguientes campos
              </p>
            </div>

            <div>
              {/* Imágenes - selectores de archivo */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen de la nota
                  </label>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instafoto
                  </label>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                  </div>
                </div>
              </div>

              {/* Categorías en 5 columnas */}
              <div className="grid grid-cols-5 gap-4 mb-6 p-4 bg-gray-100 rounded-lg">
                {/* Tipo de Nota */}
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-bold text-[#1a365d] text-sm mb-3 text-center border-b pb-2">
                    Tipo de Nota
                  </h3>
                  <div className="space-y-2">
                    {TIPOS_NOTA.map((tipo) => (
                      <label key={tipo} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="radio"
                          name="tipoNota"
                          value={tipo}
                          checked={datosNota.tipoNota === tipo}
                          onChange={(e) => setDatosNota(prev => ({ ...prev, tipoNota: e.target.value }))}
                          className="w-4 h-4 text-[#1a365d] border-gray-300 focus:ring-[#1a365d]"
                        />
                        <span className="text-gray-700">{tipo}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-red-500 mt-2">Selecciona una.</p>
                </div>

                {/* Nivel de gasto */}
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-bold text-[#1a365d] text-sm mb-3 text-center border-b pb-2">
                    Nivel de gasto
                  </h3>
                  <div className="space-y-2">
                    {NIVELES_GASTO.map((nivel) => (
                      <label key={nivel} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="radio"
                          name="nivelGasto"
                          value={nivel}
                          checked={datosNota.nivelGasto === nivel}
                          onChange={(e) => setDatosNota(prev => ({ ...prev, nivelGasto: e.target.value }))}
                          className="w-4 h-4 text-[#1a365d] border-gray-300 focus:ring-[#1a365d]"
                        />
                        <span className="text-gray-700">{nivel}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tipo de comida */}
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-bold text-[#1a365d] text-sm mb-3 text-center border-b pb-2">
                    Tipo de comida
                  </h3>
                  <div className="space-y-2">
                    {TIPOS_COMIDA.map((tipo) => (
                      <label key={tipo} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="radio"
                          name="tipoComida"
                          value={tipo}
                          checked={datosNota.tipoComida === tipo}
                          onChange={(e) => setDatosNota(prev => ({ ...prev, tipoComida: e.target.value }))}
                          className="w-4 h-4 text-[#1a365d] border-gray-300 focus:ring-[#1a365d]"
                        />
                        <span className="text-gray-700">{tipo}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Zona */}
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-bold text-[#1a365d] text-sm mb-3 text-center border-b pb-2">
                    Zona
                  </h3>
                  <div className="space-y-2">
                    {ZONAS.map((zona) => (
                      <label key={zona} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          value={zona}
                          checked={datosNota.zonas.includes(zona)}
                          onChange={() => handleZonaChange(zona)}
                          className="w-4 h-4 text-[#1a365d] border-gray-300 rounded focus:ring-[#1a365d]"
                        />
                        <span className="text-gray-700">{zona}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Experiencia */}
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-bold text-[#1a365d] text-sm mb-3 text-center border-b pb-2">
                    Experiencia
                  </h3>
                  <div className="space-y-2">
                    {EXPERIENCIAS.map((exp) => (
                      <label key={exp} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="radio"
                          name="experiencia"
                          value={exp}
                          checked={datosNota.experiencia === exp}
                          onChange={(e) => setDatosNota(prev => ({ ...prev, experiencia: e.target.value }))}
                          className="w-4 h-4 text-[#1a365d] border-gray-300 focus:ring-[#1a365d]"
                        />
                        <span className="text-gray-700">{exp}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Título */}
              <div className="pb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  value={datosNota.titulo}
                  onChange={(e) => setDatosNota(prev => ({ ...prev, titulo: e.target.value }))}
                  className="w-full px-4 py-3 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d] text-lg"
                  placeholder="Título de la nota"
                />
              </div>

              {/* Subtítulo */}
              <div className="pb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtítulo
                </label>
                <input 
                  type="text"
                  value={datosNota.subtitulo}
                  onChange={(e) => setDatosNota(prev => ({ ...prev, subtitulo: e.target.value }))}
                  className="w-full px-4 py-3 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                  placeholder="Breve descripción de la nota"
                />
              </div>

              {/* Autor */}
              <div className="pb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Autor
                </label>
                <input 
                  type="text"
                  value={datosNota.autor}
                  onChange={(e) => setDatosNota(prev => ({ ...prev, autor: e.target.value }))}
                  className="w-full px-4 py-2 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                  placeholder="Nombre del autor"
                />
              </div>

              {/* Contenido */}
              <div className="pb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenido
                </label>
                <textarea 
                  value={datosNota.contenido}
                  onChange={(e) => setDatosNota(prev => ({ ...prev, contenido: e.target.value }))}
                  rows={12}
                  className="w-full px-4 py-3 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d] resize-none"
                  placeholder="Contenido completo de la nota..."
                />
              </div>

              {/* Opciones de publicación */}
              <div className="mb-6 p-6 bg-gray-100 rounded-lg">
                <label className="block text-sm font-bold text-gray-800 mb-4">
                  Opciones de Publicación
                </label>

                <div className="space-y-4">
                  {/* Publicar ahora */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="publicar-ahora"
                      name="opcionPublicacion"
                      value="publicada"
                      checked={opcionPublicacion === 'publicada'}
                      onChange={(e) => setOpcionPublicacion(e.target.value)}
                      className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                    />
                    <label htmlFor="publicar-ahora" className="text-sm text-amber-700 cursor-pointer font-medium">
                      Publicar ahora
                    </label>
                  </div>

                  {/* Programar publicación */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="programar"
                        name="opcionPublicacion"
                        value="programada"
                        checked={opcionPublicacion === 'programada'}
                        onChange={(e) => setOpcionPublicacion(e.target.value)}
                        className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                      />
                      <label htmlFor="programar" className="text-sm text-amber-700 cursor-pointer font-medium">
                        Programar publicación
                      </label>
                    </div>
                    
                    {/* Campo de fecha y hora */}
                    {opcionPublicacion === 'programada' && (
                      <div className="ml-6 mt-2">
                        <label className="block text-xs text-amber-600 mb-1">
                          Fecha y hora de publicación
                        </label>
                        <input
                          type="datetime-local"
                          value={fechaProgramada}
                          onChange={(e) => setFechaProgramada(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg bg-amber-50 text-amber-800 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Guardar como borrador */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="borrador"
                      name="opcionPublicacion"
                      value="borrador"
                      checked={opcionPublicacion === 'borrador'}
                      onChange={(e) => setOpcionPublicacion(e.target.value)}
                      className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                    />
                    <label htmlFor="borrador" className="text-sm text-amber-700 cursor-pointer font-medium">
                      Guardar como borrador
                    </label>
                  </div>
                </div>

                {/* Botón Eliminar Nota */}
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('¿Estás seguro de que deseas eliminar esta nota?')) {
                        onVolver();
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Eliminar Nota
                  </button>
                </div>
              </div>


              {/* Botones de acción */}
              <div className="flex w-full gap-5">
                <button
                  type="button"
                  onClick={onVolver}
                  className="flex-1 py-3 px-6 rounded-lg bg-blue-600 font-bold text-white transition-colors hover:bg-blue-700"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleGuardar}
                  disabled={guardando}
                  className={`flex-1 py-3 px-6 rounded-lg font-bold text-white transition-colors ${
                    guardando
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {guardando ? 'Guardando...' : 'Guardar Nota'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarNoticia;

