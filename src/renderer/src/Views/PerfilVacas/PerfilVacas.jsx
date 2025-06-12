import Header from '../../components/Header/Header'
import '../../Style/PerfilVacas/PerfilVacas.css'
import SideBar from '../../components/SideBar/SideBar'
import InfoVaca from '../../components/InfoVaca/InfoVaca'
import RegistroProduccion from '../../components/RegistroProduccion/RegistroProduccion'
import HistorialProduccion from '../../components/HistorialProduccion/HistorialProduccion'
import ProcesosMedicos from '../../components/ProcesosMedicos/ProcesosMedicos'
import RegistroRecordatorios from '../../components/RegistroRecordatorios/RegistroRecordatorios'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAppData } from '../../Context/AppContext'

const PerfilVacas = () => {
  // Estado para controlar la sección activa
  const { id } = useParams()
  const { nombre } = useParams()
  const { rol } = useAppData()
  const [seccionActiva, setSeccionActiva] = useState(rol === 'Ganadero' ? 'produccionLeche' : 'procesosMedicos')

  // Función para cambiar de sección
  const cambiarSeccion = (seccion) => {
    setSeccionActiva(seccion);
  };

  // como hago que en una variable se guarde el nombre de la sección activa usando un diccionario?
  const secciones = {
    produccionLeche: <RegistroProduccion  id={id} />,
    historialRegistros: <HistorialProduccion id={id} />,
    procesosMedicos: <ProcesosMedicos id={id} />,
    recordatorios: <RegistroRecordatorios id={id} />,
  };

  return (
    <>
      <Header mostrarBotonCrear={false} mostrarInputBusqueda={false} />
      <div className="vaca-detalle-container">
        <SideBar cambiarSeccion={cambiarSeccion} seccionActiva={seccionActiva} nombre={nombre} id={id} />

        <main className="main-content">
          <InfoVaca id={id} />

          {secciones[seccionActiva]}

        </main>
      </div>
    </>
  )
}

export default PerfilVacas
