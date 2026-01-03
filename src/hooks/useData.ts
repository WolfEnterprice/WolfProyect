/**
 * Hook personalizado para manejar carga de datos con estado de loading y error
 */

import { useState, useEffect } from 'react';

interface UseDataOptions {
  immediate?: boolean;
}

export function useData<T>(
  fetchFn: () => Promise<T>,
  options: UseDataOptions = { immediate: true }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (options.immediate) {
      loadData();
    }
  }, []);
  
  return { data, loading, error, refetch: loadData };
}

