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
        <PrivateRoute><Home /></PrivateRoute>
      } />
      <Route path="/Potreros/:nombre/:id" element={
        <PrivateRoute><Potreros /></PrivateRoute>
      } />
      <Route path="/ListVacas/:nombre/:id" element={
        <PrivateRoute><ListVacas /></PrivateRoute>
      } />
      <Route path="/VacasPefil/:id/:nombre" element={
        <PrivateRoute><PerfilVacas /></PrivateRoute>
      } />

      {/* Ruta por defecto */}
      <Route path="/*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default AppRouter
