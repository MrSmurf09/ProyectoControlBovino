// src/routes/PrivateRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAppData } from '../Context/AppContext'
import { isTokenValid } from '../utils/auth'

const PrivateRoute = ({ children, allowedRoles }) => {
  const { token, rol } = useAppData()
  console.log('PrivateRoute Token:', token)

  // Verifica si el token existe y es válido
  if (!token || !isTokenValid(token)) {
    console.log('Token no válido o no presente. Redirigiendo...')
    return <Navigate to="/" replace />
  }

  // Verifica si el rol es permitido (si se definieron roles específicos)
  if (allowedRoles && !allowedRoles.includes(rol)) {
    console.log(`Rol ${rol} no autorizado para esta ruta. Redirigiendo...`)
    return <Navigate to="/" replace />
  }

  console.log('Token y rol válidos. Acceso concedido.')
  return children
}

export default PrivateRoute
