import { FaHome, FaHistory, FaFileMedical, FaFileAlt, FaStopwatch } from 'react-icons/fa'
import './sidebar.css'
import { Link } from 'react-router-dom'

const SideBar = ({ cambiarSeccion, seccionActiva, nombre, id }) => {
  return (
    <aside className="sidebar">
      <ul>
        <Link to={`/ListVacas/${nombre}/${id}`} className="inicio">
          <li className="icons-sidebar">
            <FaHome /> Inicio
          </li>
        </Link>
        <li
          className={`icons-sidebar ${seccionActiva === 'produccionLeche' ? 'active' : ''}`}
          onClick={() => cambiarSeccion('produccionLeche')}
        >
          <FaFileAlt /> Producción de leche
        </li>
        <li
          className={`icons-sidebar ${seccionActiva === 'historialRegistros' ? 'active' : ''}`}
          onClick={() => cambiarSeccion('historialRegistros')}
        >
          <FaHistory /> Ver historial de registros
        </li>
        <li
          className={`icons-sidebar ${seccionActiva === 'procesosMedicos' ? 'active' : ''}`}
          onClick={() => cambiarSeccion('procesosMedicos')}
        >
          <FaFileMedical /> Registrar procesos médicos
        </li>
        <li
          className={`icons-sidebar ${seccionActiva === 'recordatorios' ? 'active' : ''}`}
          onClick={() => cambiarSeccion('recordatorios')}
        >
          <FaStopwatch /> Registrar recordatorios
        </li>
      </ul>
    </aside>
  )
}

export default SideBar
