const TextoOpinion = () => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Tu opinión editorial *
      </label>
      <textarea
        placeholder="Escribe tu opinión editorial aquí..."
        className="w-full px-3 py-2 border rounded-md bg-white border-gray-300 min-w-10"
        rows={5}
      />
    </div>
  )
}

export default TextoOpinion
