import { FaHome, FaHistory, FaFileMedical, FaFileAlt, FaStopwatch } from 'react-icons/fa'
import './sidebar.css'
import { Link } from 'react-router-dom'
import { useAppData } from '../../Context/AppContext'

const SideBar = ({ cambiarSeccion, seccionActiva, nombre, id }) => {
  const { rol } = useAppData()
  return (
    <aside className="sidebar">
      <ul>
        {rol === 'Ganadero' ? (
          <Link to={`/ListVacas/${nombre}/${id}`} className="inicio">
            <li className="icons-sidebar">
              <FaHome /> Inicio
            </li>
          </Link>
        ) : (
          <Link to={`/ListVacas`} className="inicio">
            <li className="icons-sidebar">
              <FaHome /> Inicio
            </li>
          </Link>
        )}
        
        {rol === 'Ganadero' ? (
          <li
            className={`icons-sidebar ${seccionActiva === 'produccionLeche' ? 'active' : ''}`}
            onClick={() => cambiarSeccion('produccionLeche')}
          >
            <FaFileAlt /> Producción de leche
          </li>
        ) : (
          <></>
        )}

        {rol === 'Ganadero' ? (
          <li
          className={`icons-sidebar ${seccionActiva === 'historialRegistros' ? 'active' : ''}`}
          onClick={() => cambiarSeccion('historialRegistros')}
          >
            <FaHistory /> Ver historial de registros
          </li>
        ) : (
          <></>
        )}
        <li
          className={`icons-sidebar ${seccionActiva === 'procesosMedicos' ? 'active' : ''}`}
          onClick={() => cambiarSeccion('procesosMedicos')}
        >
          <FaFileMedical /> Registrar procesos médicos
        </li>

        {rol === 'Ganadero' ? (
          <li
          className={`icons-sidebar ${seccionActiva === 'recordatorios' ? 'active' : ''}`}
          onClick={() => cambiarSeccion('recordatorios')}
          >
            <FaStopwatch /> Registrar recordatorios
          </li>
        ) : (
          <></>
        )}
      </ul>
    </aside>
  )
}

export default SideBar
