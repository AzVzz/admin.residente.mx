import { useState, useRef, useEffect } from 'react';

const DropdownMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="font-bold text-xl">Mi Sitio</div>
        
        {/* Menú para pantallas grandes */}
        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            <li><a href="#" className="hover:text-blue-300 transition">Inicio</a></li>
            <li className="relative">
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="hover:text-blue-300 transition flex items-center"
              >
                Servicios
                <svg 
                  className={`w-4 h-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Menú desplegable */}
              {isOpen && (
                <div 
                  ref={dropdownRef}
                  className="absolute z-10 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg py-1"
                >
                  <a 
                    href="#" 
                    className="block px-4 py-2 hover:bg-gray-100 transition"
                    onClick={() => setIsOpen(false)}
                  >
                    Diseño Web
                  </a>
                  <a 
                    href="#" 
                    className="block px-4 py-2 hover:bg-gray-100 transition"
                    onClick={() => setIsOpen(false)}
                  >
                    Desarrollo App
                  </a>
                  <a 
                    href="#" 
                    className="block px-4 py-2 hover:bg-gray-100 transition"
                    onClick={() => setIsOpen(false)}
                  >
                    Consultoría
                  </a>
                </div>
              )}
            </li>
            <li><a href="#" className="hover:text-blue-300 transition">Contacto</a></li>
          </ul>
        </nav>
        
        {/* Menú móvil */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-white focus:outline-none"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {isOpen && (
        <div className="md:hidden bg-gray-700">
          <div className="container mx-auto py-2 px-4 flex flex-col">
            <a href="#" className="py-2 hover:text-blue-300 transition">Inicio</a>
            <div className="py-2">
              <button 
                className="flex items-center justify-between w-full"
                onClick={() => setIsOpen(!isOpen)}
              >
                Servicios
                <svg 
                  className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="mt-2 ml-4 flex flex-col space-y-2">
                <a href="#" className="block py-1 hover:text-blue-300 transition">Diseño Web</a>
                <a href="#" className="block py-1 hover:text-blue-300 transition">Desarrollo App</a>
                <a href="#" className="block py-1 hover:text-blue-300 transition">Consultoría</a>
              </div>
            </div>
            <a href="#" className="py-2 hover:text-blue-300 transition">Contacto</a>
          </div>
        </div>
      )}
    </header>
  );
};

export default DropdownMenu;