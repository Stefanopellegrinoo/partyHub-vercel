type CacheItem<T> = {
  data: T
  timestamp: number
}

class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map()
  private defaultTTL: number = 5 * 60 * 1000 // 5 minutos en milisegundos

  // Obtener un elemento de la caché
  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // Verificar si el elemento ha expirado
    if (Date.now() - item.timestamp > this.defaultTTL) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  // Guardar un elemento en la caché
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })

    // Configurar eliminación automática después del TTL
    setTimeout(() => {
      if (this.cache.has(key)) {
        this.cache.delete(key)
      }
    }, ttl)
  }

  // Eliminar un elemento de la caché
  delete(key: string): void {
    this.cache.delete(key)
  }

  // Limpiar toda la caché
  clear(): void {
    this.cache.clear()
  }

  // Invalidar elementos de la caché que coincidan con un patrón
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }
}

// Exportar una única instancia del servicio de caché
export const cacheService = new CacheService()
