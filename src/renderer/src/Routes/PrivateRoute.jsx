// src/routes/PrivateRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAppData } from '../Context/AppContext'
import { isTokenValid } from '../utils/auth'

const PrivateRoute = ({ children }) => {
  const { token } = useAppData()
  console.log('PrivateRoute Token:', token)

  if (!token || !isTokenValid(token)) {
    console.log('Token no válido o no presente. Redirigiendo...')
    return <Navigate to="/" replace />
  }
  console.log('Token válido. Acceso concedido.')
  return children
}

export default PrivateRoute
