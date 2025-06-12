import { Routes, Route, Navigate } from 'react-router-dom'
import InicioSesion from '../Views/Inicio/Inicio'
import Registrarse from '../Views/Registrarse/Registrarse'
import Home from '../Views/Home/Home'
import Potreros from '../Views/Potreros/Potreros'
import ListVacas from '../Views/ListVacas/ListVacas'
import PerfilVacas from '../Views/PerfilVacas/PerfilVacas'
import PrivateRoute from './PrivateRoute'

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<InicioSesion />} />
      <Route path="/Registrarse" element={<Registrarse />} />
      
      {/* Rutas protegidas */}
      <Route path="/Home/:id" element={
        <PrivateRoute allowedRoles={['Ganadero']}>
          <Home />
        </PrivateRoute>
      } />

      <Route path="/Potreros/:nombre/:id" element={
        <PrivateRoute allowedRoles={['Ganadero']}>
          <Potreros />
        </PrivateRoute>
      } />

      <Route path="/ListVacas/:nombre/:id" element={
        <PrivateRoute allowedRoles={['Ganadero']}>
          <ListVacas />
        </PrivateRoute>
      } />

      <Route path="/ListVacas" element={
        <PrivateRoute allowedRoles={['Veterinario']}>
          <ListVacas />
        </PrivateRoute>
      } />

    <Route path="/VacasPefil/:id/:nombre" element={
      <PrivateRoute allowedRoles={['Ganadero', 'Veterinario']}>
        <PerfilVacas />
      </PrivateRoute>
    } />

      {/* Ruta por defecto */}
      <Route path="/*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default AppRouter
