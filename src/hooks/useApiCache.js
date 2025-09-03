import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchWithCache } from '../utils/apiCache'

// Hook personalizado para manejar llamadas API con caché
export const useApiCache = (url, options = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const mountedRef = useRef(true)

  const fetchData = useCallback(async () => {
    if (!url) return

    setLoading(true)
    setError(null)

    try {
      const result = await fetchWithCache(url, options)
      
      // Solo actualizar estado si el componente sigue montado
      if (mountedRef.current) {
        setData(result)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err)
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [url, JSON.stringify(options)])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch }
}

// Hook para múltiples llamadas API en paralelo
export const useMultipleApiCache = (requests) => {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    if (!requests || requests.length === 0) {
      setLoading(false)
      return
    }

    const fetchAll = async () => {
      setLoading(true)
      setError(null)

      try {
        const promises = requests.map(async (request) => {
          const result = await fetchWithCache(request.url, request.options || {})
          return { key: request.key, data: result }
        })

        const results = await Promise.all(promises)
        
        if (mountedRef.current) {
          const resultsMap = results.reduce((acc, { key, data }) => {
            acc[key] = data
            return acc
          }, {})
          setResults(resultsMap)
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err)
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    }

    fetchAll()
  }, [JSON.stringify(requests)])

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  return { results, loading, error }
}
