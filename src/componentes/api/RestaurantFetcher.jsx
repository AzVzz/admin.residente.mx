// src/componentes/api/RestaurantFetcher.jsx

import { useEffect, useState } from 'react'
import {urlApi} from '../../componentes/api/url.js'


const RestaurantFetcher = ({ slug, children }) => {
  const [restaurante, setRestaurante] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${urlApi}api/restaurante/${slug}`
        )
        if (!response.ok) {
          throw new Error('Error al obtener el restaurante')
        }
        const data = await response.json()
        setRestaurante(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  return children({
    loading,
    error,
    restaurante,
  })
}

export default RestaurantFetcher;