import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface FavoritesContextType {
  favorites: string[]
  addFavorite: (topicId: string) => void
  removeFavorite: (topicId: string) => void
  isFavorite: (topicId: string) => boolean
  toggleFavorite: (topicId: string) => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

const STORAGE_KEY = 'anatomia_favorites'

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>([])

  // Load favorites from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setFavorites(parsed)
        }
      } catch (error) {
        console.error('Failed to parse favorites from localStorage:', error)
      }
    }
  }, [])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  }, [favorites])

  const addFavorite = (topicId: string) => {
    setFavorites((prev) => {
      if (prev.includes(topicId)) return prev
      return [...prev, topicId]
    })
  }

  const removeFavorite = (topicId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== topicId))
  }

  const isFavorite = (topicId: string) => {
    return favorites.includes(topicId)
  }

  const toggleFavorite = (topicId: string) => {
    if (isFavorite(topicId)) {
      removeFavorite(topicId)
    } else {
      addFavorite(topicId)
    }
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
