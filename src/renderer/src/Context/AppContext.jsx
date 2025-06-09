import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '')
  const [nombreUser, setNombreUser] = useState(localStorage.getItem('nombreUser') || '')
  const [rol, setRol] = useState(localStorage.getItem('rol') || '')
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [fincaId, setFincaId] = useState(localStorage.getItem('fincaId') || '')
  const [fincaNombre, setFincaNombre] = useState(localStorage.getItem('fincaNombre') || '')
  const [potreroId, setPotreroId] = useState(localStorage.getItem('potreroId') || '')
  const [potreroNombre, setPotreroNombre] = useState(localStorage.getItem('potreroNombre') || '')

  // Sincronizar cualquier cambio de estado con el localStorage
  useEffect(() => {
      localStorage.setItem('userId', userId)
      localStorage.setItem('nombreUser', nombreUser)
      localStorage.setItem('token', token)
  }, [userId, nombreUser, token])

  useEffect(() => {
    localStorage.setItem('rol', rol)
  }, [rol])

  useEffect(() => {
    localStorage.setItem('fincaId', fincaId)
    localStorage.setItem('fincaNombre', fincaNombre)
  }, [fincaId, fincaNombre])

  useEffect(() => {
    localStorage.setItem('potreroId', potreroId)
    localStorage.setItem('potreroNombre', potreroNombre)
  }, [potreroId, potreroNombre])

  return (
    <AppContext.Provider value={{
      userId, setUserId,
      nombreUser, setNombreUser,
      rol, setRol,
      token, setToken,
      fincaId, setFincaId,
      fincaNombre, setFincaNombre,
      potreroId, setPotreroId,
      potreroNombre, setPotreroNombre
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppData = () => useContext(AppContext)
