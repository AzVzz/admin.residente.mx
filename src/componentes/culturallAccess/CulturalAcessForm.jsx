"use client"

import { useState } from "react"
import leonBlancoLogo from '../../imagenes/Culturall access Logos/Leon_blanco_2025.png';
import scLogo from '../../imagenes/Culturall access Logos/SC_logo_blanco_2025.png';
import culturallAccessLogo from '../../imagenes/Culturall access Logos/LOGOCULTURALLACCESS-04.png';

const CulturalAccessForm = () => {
  const [curpOption, setCurpOption] = useState("sin-curp")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    genero: "",
    email: "",
    calleNumero: "",
    municipio: "",
    estado: "",
    colonia: "",
    codigoPostal: "",
    edad: "",
    estudios: "",
    curp: "",
    estadoNacimiento: "",
    diaNacimiento: "",
    mesNacimiento: "",
    anoNacimiento: "",
    numeroTarjeta: "",
    aceptaInfo: false,
  })

  const handleInputChange = (field, value) => {
    // Solo formatear el número de tarjeta cuando se pierde el foco
    if (field === "numeroTarjeta") {
      // Permitir escribir libremente (solo números, máximo 4 dígitos)
      const cleanedValue = value.toString().replace(/\D/g, '').slice(0, 5);
      value = cleanedValue;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Nueva función para manejar cuando el campo pierde el foco
  const handleBlur = (field, value) => {
    if (field === "numeroTarjeta") {
      // Aplicar padding solo al perder el foco
      const paddedValue = value.padStart(5, '0');

      setFormData((prev) => ({
        ...prev,
        [field]: paddedValue,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Mapear los campos del frontend al formato del backend
      const dataToSend = {
        nombre: formData.nombre,
        apellido_paterno: formData.apellidoPaterno,
        apellido_materno: formData.apellidoMaterno,
        genero: formData.genero,
        email: formData.email,
        calle_numero: formData.calleNumero,
        municipio: formData.municipio,
        estado: formData.estado,
        colonia: formData.colonia,
        codigo_postal: formData.codigoPostal,
        edad: formData.edad,
        estudios: formData.estudios,
        curp: curpOption === "curp" ? formData.curp : null,
        estado_nacimiento: formData.estadoNacimiento,
        diaNacimiento: formData.diaNacimiento,
        mesNacimiento: formData.mesNacimiento,
        anoNacimiento: formData.anoNacimiento,
        numero_tarjeta: formData.numeroTarjeta,
        acepta_info: formData.aceptaInfo,
      }

      console.log("Enviando datos:", dataToSend)

      const response = await fetch("https://estrellasdenuevoleon.com.mx/api/culturalaccessform", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })

      const result = await response.json()

      if (result.success) {
        alert("¡Formulario enviado correctamente! Gracias por registrarte.")
        // Limpiar el formulario
        setFormData({
          nombre: "",
          apellidoPaterno: "",
          apellidoMaterno: "",
          genero: "",
          email: "",
          calleNumero: "",
          municipio: "",
          estado: "",
          colonia: "",
          codigoPostal: "",
          edad: "",
          estudios: "",
          curp: "",
          estadoNacimiento: "",
          diaNacimiento: "",
          mesNacimiento: "",
          anoNacimiento: "",
          numeroTarjeta: "",
          aceptaInfo: false,
        })
        setCurpOption("sin-curp")
      } else {
        // Manejar diferentes tipos de errores
        if (result.errors) {
          // Mostrar errores de validación específicos
          const errorMessages = result.errors.map(err =>
            `• ${err.field}: ${err.message}`
          ).join('\n');

          alert(`Errores de validación:\n${errorMessages}`);
        } else {
          alert(`Error: ${result.message}`);
        }
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error)
      alert("Error de conexión. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Icono de chevron down SVG inline
  const ChevronDownIcon = () => (
    <svg
      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white pointer-events-none"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )

  return (
    <div>
      <div className="flex flex-row items-center justify-center pb-5">
        <img
          src={scLogo}
          className="h-[clamp(2rem,4.6vw,3.1rem)]"
        />
        <h1 className="uppercase text-[clamp(0.8rem,4.2vw,4.2rem)] leading-tight font-bold text-center px-5">
          <span className="text-white">CULTUR</span>
          <span className="text-black">ALL ACCESS</span>
        </h1>
        <img
          src={leonBlancoLogo}
          className="h-[clamp(1.9rem,4.2vw,2.8rem)]"
        />
      </div>
      <div className="flex w-full justify-center items-center">
        <img
          src={culturallAccessLogo}
          className="h-[140px]"
        />
      </div>
      <div className="min-h-screen bg-[#FF7900] px-5 py-10 rounded-4xl shadow-xl">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombres */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="nombre" className="block text-white font-medium text-sm">
                  NOMBRE (S) *
                </label>
                <input
                  id="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border-white/30 border-2 rounded text-white placeholder:text-white/70 focus:border-white focus:outline-none transition-colors"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="apellidoPaterno" className="block text-white font-medium text-sm">
                  APELLIDO PATERNO *
                </label>
                <input
                  id="apellidoPaterno"
                  type="text"
                  value={formData.apellidoPaterno}
                  onChange={(e) => handleInputChange("apellidoPaterno", e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border-white/30 border-2 rounded text-white placeholder:text-white/70 focus:border-white focus:outline-none transition-colors"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="apellidoMaterno" className="block text-white font-medium text-sm">
                  APELLIDO MATERNO *
                </label>
                <input
                  id="apellidoMaterno"
                  type="text"
                  value={formData.apellidoMaterno}
                  onChange={(e) => handleInputChange("apellidoMaterno", e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border-white/30 border-2 rounded text-white placeholder:text-white/70 focus:border-white focus:outline-none transition-colors"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Género */}
            <div className="space-y-3">
              <label className="block text-white font-medium text-sm">GÉNERO</label>
              <div className="space-y-2">
                {[
                  { value: "femenino", label: "Femenino" },
                  { value: "masculino", label: "Masculino" },
                  { value: "prefiero-no-decir", label: "Prefiero no decir" },
                  { value: "otro", label: "Otro" },
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={option.value}
                      name="genero"
                      value={option.value}
                      checked={formData.genero === option.value}
                      onChange={(e) => handleInputChange("genero", e.target.value)}
                      className="w-4 h-4 text-white border-white bg-transparent focus:ring-white focus:ring-2"
                      disabled={isSubmitting}
                    />
                    <label htmlFor={option.value} className="text-white">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-white font-medium text-sm">
                EMAIL *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full px-3 py-2 bg-transparent border-white/30 border-2 rounded text-white placeholder:text-white/70 focus:border-white focus:outline-none transition-colors"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Dirección */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="calleNumero" className="block text-white font-medium text-sm">
                  CALLE Y NÚMERO *
                </label>
                <input
                  id="calleNumero"
                  type="text"
                  value={formData.calleNumero}
                  onChange={(e) => handleInputChange("calleNumero", e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border-white/30 border-2 rounded text-white placeholder:text-white/70 focus:border-white focus:outline-none transition-colors"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="municipio" className="block text-white font-medium text-sm">
                  MUNICIPIO *
                </label>
                <input
                  id="municipio"
                  type="text"
                  value={formData.municipio}
                  onChange={(e) => handleInputChange("municipio", e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border-white/30 border-2 rounded text-white placeholder:text-white/70 focus:border-white focus:outline-none transition-colors"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="colonia" className="block text-white font-medium text-sm">
                  COLONIA *
                </label>
                <input
                  id="colonia"
                  type="text"
                  value={formData.colonia}
                  onChange={(e) => handleInputChange("colonia", e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border-white/30 border-2 rounded text-white placeholder:text-white/70 focus:border-white focus:outline-none transition-colors"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="estado" className="block text-white font-medium text-sm">
                  ESTADO *
                </label>
                <div className="relative">
                  <select
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => handleInputChange("estado", e.target.value)}
                    className="w-full px-3 py-2 bg-transparent border-white/30 border-2 rounded text-white focus:border-white focus:outline-none appearance-none transition-colors"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="" className="text-gray-800">
                      Selecciona estado
                    </option>
                    <option value="aguascalientes" className="text-gray-800">
                      Aguascalientes
                    </option>
                    <option value="baja-california" className="text-gray-800">
                      Baja California
                    </option>
                    <option value="baja-california-sur" className="text-gray-800">
                      Baja California Sur
                    </option>
                    <option value="campeche" className="text-gray-800">
                      Campeche
                    </option>
                    <option value="chiapas" className="text-gray-800">
                      Chiapas
                    </option>
                    <option value="chihuahua" className="text-gray-800">
                      Chihuahua
                    </option>
                    <option value="cdmx" className="text-gray-800">
                      Ciudad de México
                    </option>
                    <option value="coahuila" className="text-gray-800">
                      Coahuila
                    </option>
                    <option value="colima" className="text-gray-800">
                      Colima
                    </option>
                    <option value="durango" className="text-gray-800">
                      Durango
                    </option>
                    <option value="guanajuato" className="text-gray-800">
                      Guanajuato
                    </option>
                    <option value="guerrero" className="text-gray-800">
                      Guerrero
                    </option>
                    <option value="hidalgo" className="text-gray-800">
                      Hidalgo
                    </option>
                    <option value="jalisco" className="text-gray-800">
                      Jalisco
                    </option>
                    <option value="mexico" className="text-gray-800">
                      México
                    </option>
                    <option value="michoacan" className="text-gray-800">
                      Michoacán
                    </option>
                    <option value="morelos" className="text-gray-800">
                      Morelos
                    </option>
                    <option value="nayarit" className="text-gray-800">
                      Nayarit
                    </option>
                    <option value="nuevo-leon" className="text-gray-800">
                      Nuevo León
                    </option>
                    <option value="oaxaca" className="text-gray-800">
                      Oaxaca
                    </option>
                    <option value="puebla" className="text-gray-800">
                      Puebla
                    </option>
                    <option value="queretaro" className="text-gray-800">
                      Querétaro
                    </option>
                    <option value="quintana-roo" className="text-gray-800">
                      Quintana Roo
                    </option>
                    <option value="san-luis-potosi" className="text-gray-800">
                      San Luis Potosí
                    </option>
                    <option value="sinaloa" className="text-gray-800">
                      Sinaloa
                    </option>
                    <option value="sonora" className="text-gray-800">
                      Sonora
                    </option>
                    <option value="tabasco" className="text-gray-800">
                      Tabasco
                    </option>
                    <option value="tamaulipas" className="text-gray-800">
                      Tamaulipas
                    </option>
                    <option value="tlaxcala" className="text-gray-800">
                      Tlaxcala
                    </option>
                    <option value="veracruz" className="text-gray-800">
                      Veracruz
                    </option>
                    <option value="yucatan" className="text-gray-800">
                      Yucatán
                    </option>
                    <option value="zacatecas" className="text-gray-800">
                      Zacatecas
                    </option>
                  </select>
                  <ChevronDownIcon />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="codigoPostal" className="block text-white font-medium text-sm">
                  CÓDIGO POSTAL *
                </label>
                <input
                  id="codigoPostal"
                  type="text"
                  value={formData.codigoPostal}
                  onChange={(e) => handleInputChange("codigoPostal", e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border-white/30 border-2 rounded text-white placeholder:text-white/70 focus:border-white focus:outline-none transition-colors"
                  maxLength="5"
                  pattern="[0-9]{5}"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Edad */}
            <div className="space-y-3">
              <label className="block text-white font-medium text-sm">EDAD *</label>
              <div className="space-y-2">
                {["16-17", "18-29", "30-49", "50-59", "60+"].map((edad) => (
                  <div key={edad} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={edad}
                      name="edad"
                      value={edad}
                      checked={formData.edad === edad}
                      onChange={(e) => handleInputChange("edad", e.target.value)}
                      className="w-4 h-4 text-white border-white bg-transparent focus:ring-white focus:ring-2"
                      disabled={isSubmitting}
                    />
                    <label htmlFor={edad} className="text-white">
                      {edad}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Estudios */}
            <div className="space-y-2">
              <label htmlFor="estudios" className="block text-white font-medium text-sm">
                ESTUDIOS *
              </label>
              <div className="relative">
                <select
                  id="estudios"
                  value={formData.estudios}
                  onChange={(e) => handleInputChange("estudios", e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border-white/30 border-2 rounded text-white focus:border-white focus:outline-none appearance-none transition-colors"
                  required
                  disabled={isSubmitting}
                >
                  <option value="" className="text-gray-800">
                    Elige uno
                  </option>
                  <option value="primaria" className="text-gray-800">
                    Primaria
                  </option>
                  <option value="secundaria" className="text-gray-800">
                    Secundaria
                  </option>
                  <option value="preparatoria" className="text-gray-800">
                    Preparatoria
                  </option>
                  <option value="licenciatura" className="text-gray-800">
                    Licenciatura
                  </option>
                  <option value="maestria" className="text-gray-800">
                    Maestría
                  </option>
                  <option value="doctorado" className="text-gray-800">
                    Doctorado
                  </option>
                  <option value="sin-estudios" className="text-gray-800">
                    N/A
                  </option>
                </select>
                <ChevronDownIcon />
              </div>
            </div>

            {/* Selección CURP */}
            <div className="space-y-3">
              <label className="block text-white font-medium text-sm">Selecciona una opción *</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="curp-option"
                    name="curpOption"
                    value="curp"
                    checked={curpOption === "curp"}
                    onChange={(e) => setCurpOption(e.target.value)}
                    className="w-4 h-4 text-white border-white bg-transparent focus:ring-white focus:ring-2"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="curp-option" className="text-white">
                    CURP
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="sin-curp-option"
                    name="curpOption"
                    value="sin-curp"
                    checked={curpOption === "sin-curp"}
                    onChange={(e) => setCurpOption(e.target.value)}
                    className="w-4 h-4 text-white border-white bg-transparent focus:ring-white focus:ring-2"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="sin-curp-option" className="text-white">
                    Sin CURP
                  </label>
                </div>
              </div>
            </div>

            {/* Campo CURP condicional */}
            {curpOption === "curp" && (
              <div
                className="space-y-2 opacity-0 animate-fade-in"
                style={{ animation: "fadeIn 0.3s ease-in-out forwards" }}
              >
                <label htmlFor="curp" className="block text-white font-medium text-sm">
                  INGRESA TU CURP *
                </label>
                <input
                  id="curp"
                  type="text"
                  value={formData.curp}
                  onChange={(e) => handleInputChange("curp", e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-transparent border-white/30 border-2 rounded text-white placeholder:text-white/70 focus:border-white focus:outline-none transition-colors"
                  placeholder="Ingresa tu CURP (18 caracteres)"
                  maxLength={18}
                  pattern="[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]"
                  required
                  disabled={isSubmitting}
                />
                <p className="text-white/70 text-xs">Formato: AAAA######HAAAAA##</p>
              </div>
            )}

            {/* Estado de nacimiento */}
            <div className="space-y-2">
              <label htmlFor="estadoNacimiento" className="block text-white font-medium text-sm">
                ESTADO DE NACIMIENTO *
              </label>
              <div className="relative">
                <select
                  id="estadoNacimiento"
                  value={formData.estadoNacimiento}
                  onChange={(e) => handleInputChange("estadoNacimiento", e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border-white/30 border-2 rounded text-white focus:border-white focus:outline-none appearance-none transition-colors"
                  required
                  disabled={isSubmitting}
                >
                  <option value="" className="text-gray-800">
                    Selecciona estado
                  </option>
                  <option value="aguascalientes" className="text-gray-800">
                    Aguascalientes
                  </option>
                  <option value="baja-california" className="text-gray-800">
                    Baja California
                  </option>
                  <option value="baja-california-sur" className="text-gray-800">
                    Baja California Sur
                  </option>
                  <option value="campeche" className="text-gray-800">
                    Campeche
                  </option>
                  <option value="chiapas" className="text-gray-800">
                    Chiapas
                  </option>
                  <option value="chihuahua" className="text-gray-800">
                    Chihuahua
                  </option>
                  <option value="cdmx" className="text-gray-800">
                    Ciudad de México
                  </option>
                  <option value="coahuila" className="text-gray-800">
                    Coahuila
                  </option>
                  <option value="colima" className="text-gray-800">
                    Colima
                  </option>
                  <option value="durango" className="text-gray-800">
                    Durango
                  </option>
                  <option value="guanajuato" className="text-gray-800">
                    Guanajuato
                  </option>
                  <option value="guerrero" className="text-gray-800">
                    Guerrero
                  </option>
                  <option value="hidalgo" className="text-gray-800">
                    Hidalgo
                  </option>
                  <option value="jalisco" className="text-gray-800">
                    Jalisco
                  </option>
                  <option value="mexico" className="text-gray-800">
                    México
                  </option>
                  <option value="michoacan" className="text-gray-800">
                    Michoacán
                  </option>
                  <option value="morelos" className="text-gray-800">
                    Morelos
                  </option>
                  <option value="nayarit" className="text-gray-800">
                    Nayarit
                  </option>
                  <option value="nuevo-leon" className="text-gray-800">
                    Nuevo León
                  </option>
                  <option value="oaxaca" className="text-gray-800">
                    Oaxaca
                  </option>
                  <option value="puebla" className="text-gray-800">
                    Puebla
                  </option>
                  <option value="queretaro" className="text-gray-800">
                    Querétaro
                  </option>
                  <option value="quintana-roo" className="text-gray-800">
                    Quintana Roo
                  </option>
                  <option value="san-luis-potosi" className="text-gray-800">
                    San Luis Potosí
                  </option>
                  <option value="sinaloa" className="text-gray-800">
                    Sinaloa
                  </option>
                  <option value="sonora" className="text-gray-800">
                    Sonora
                  </option>
                  <option value="tabasco" className="text-gray-800">
                    Tabasco
                  </option>
                  <option value="tamaulipas" className="text-gray-800">
                    Tamaulipas
                  </option>
                  <option value="tlaxcala" className="text-gray-800">
                    Tlaxcala
                  </option>
                  <option value="veracruz" className="text-gray-800">
                    Veracruz
                  </option>
                  <option value="yucatan" className="text-gray-800">
                    Yucatán
                  </option>
                  <option value="zacatecas" className="text-gray-800">
                    Zacatecas
                  </option>
                </select>
                <ChevronDownIcon />
              </div>
            </div>

            {/* Fecha de nacimiento */}
            <div className="space-y-2">
              <label className="block text-white font-medium text-sm">FECHA DE NACIMIENTO *</label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label htmlFor="dia" className="block text-white text-xs">
                    Día
                  </label>
                  <input
                    id="dia"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.diaNacimiento}
                    onChange={(e) => handleInputChange("diaNacimiento", e.target.value)}
                    className="w-full px-3 py-2 bg-transparent border-white/30 border-2 rounded text-white placeholder:text-white/70 focus:border-white focus:outline-none transition-colors"
                    placeholder="DD"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="mes" className="block text-white text-xs">
                    Mes
                  </label>
                  <div className="relative">
                    <select
                      id="mes"
                      value={formData.mesNacimiento}
                      onChange={(e) => handleInputChange("mesNacimiento", e.target.value)}
                      className="w-full px-3 py-2 bg-transparent border-white/30 border-2 rounded text-white focus:border-white focus:outline-none appearance-none transition-colors"
                      required
                      disabled={isSubmitting}
                    >
                      <option value="" className="text-gray-800">
                        Mes
                      </option>
                      <option value="01" className="text-gray-800">
                        Enero
                      </option>
                      <option value="02" className="text-gray-800">
                        Febrero
                      </option>
                      <option value="03" className="text-gray-800">
                        Marzo
                      </option>
                      <option value="04" className="text-gray-800">
                        Abril
                      </option>
                      <option value="05" className="text-gray-800">
                        Mayo
                      </option>
                      <option value="06" className="text-gray-800">
                        Junio
                      </option>
                      <option value="07" className="text-gray-800">
                        Julio
                      </option>
                      <option value="08" className="text-gray-800">
                        Agosto
                      </option>
                      <option value="09" className="text-gray-800">
                        Septiembre
                      </option>
                      <option value="10" className="text-gray-800">
                        Octubre
                      </option>
                      <option value="11" className="text-gray-800">
                        Noviembre
                      </option>
                      <option value="12" className="text-gray-800">
                        Diciembre
                      </option>
                    </select>
                    <svg
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white pointer-events-none"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="ano" className="block text-white text-xs">
                    Año
                  </label>
                  <input
                    id="ano"
                    type="number"
                    min="1900"
                    max="2024"
                    value={formData.anoNacimiento}
                    onChange={(e) => handleInputChange("anoNacimiento", e.target.value)}
                    className="w-full px-3 py-2 bg-transparent border-white/30 border-2 rounded text-white placeholder:text-white/70 focus:border-white focus:outline-none transition-colors"
                    placeholder="AAAA"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Número de tarjeta */}
            <div className="space-y-2">
              <label htmlFor="numeroTarjeta" className="block text-white font-medium text-sm">
                NÚMERO DE TARJETA EN 5 DÍGITOS*
              </label>
              <input
                id="numeroTarjeta"
                type="text"
                value={formData.numeroTarjeta}
                onChange={(e) => handleInputChange("numeroTarjeta", e.target.value)}
                onBlur={(e) => handleBlur("numeroTarjeta", e.target.value)}
                className="w-full px-3 py-2 bg-transparent border-white/30 border-2 rounded text-white placeholder:text-white/70 focus:border-white focus:outline-none transition-colors"
                placeholder="Ej. 00015"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Checkbox */}
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="aceptaInfo"
                checked={formData.aceptaInfo}
                onChange={(e) => handleInputChange("aceptaInfo", e.target.checked)}
                className="w-4 h-4 mt-1 text-orange-500 border-white rounded bg-transparent focus:ring-white focus:ring-2"
                disabled={isSubmitting}
              />
              <label htmlFor="aceptaInfo" className="text-white text-sm">
                Acepto recibir información por correo electrónico *
              </label>
            </div>

                        <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                className="w-4 h-4 mt-1 text-orange-500 border-white rounded bg-transparent focus:ring-white focus:ring-2"
                disabled={isSubmitting}
              />
              <label className="text-white text-sm">
                No Acepto recibir información por correo electrónico *
              </label>
            </div>

            <p className="text-white/80 text-sm italic">*Campo obligatorio</p>

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full font-semibold py-3 text-lg rounded-full transition-all duration-200 transform cursor-pointer ${isSubmitting
                ? "bg-white text-white cursor-not-allowed"
                : "bg-white hover:bg-white text-white-800 hover:scale-105 hover:shadow-lg"
                }`}
            >
              {isSubmitting ? "Enviando..." : "Registrarse"}
            </button>
          </form>
        </div>

        <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        input[type="radio"]:checked {
          background-color: white;
          border-color: white;
        }
        
        input[type="checkbox"]:checked {
          background-color: white;
          border-color: white;
        }
      `}</style>
      </div>
    </div>
  )
}

export default CulturalAccessForm
