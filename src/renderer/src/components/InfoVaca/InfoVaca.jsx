import './infovaca.css'
import { useState, useEffect } from 'react'
import { useAppData } from '../../Context/AppContext'

const InfoVaca = ({ id }) => {
  const [vaca, setVaca] = useState(null) // Estado para almacenar los datos de la vaca
  const { token } = useAppData()

  // ✅ Obtener la información de la vaca desde la API
  const obtenerVaca = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vacas/perfil/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      })
      const data = await response.json()
      console.log('Data de la vaca:', data)

      if (response.ok) {
        setVaca(data.vaca[0]) // Guardamos la vaca en el estado
      } else {
        console.error('Error al obtener la vaca:', data.message)
      }
    } catch (error) {
      console.error('Error al obtener la vaca:', error)
    }
  }

  useEffect(() => {
    obtenerVaca()
  }, [id]) // Se ejecuta cuando cambia el id

  // ✅ Si la vaca aún no ha cargado, mostrar un mensaje de carga
  if (!vaca) {
    return <p>Cargando información de la vaca...</p>
  }

  const formatFecha = (fecha) => {
    if (!fecha) return 'No registrada'
    return new Date(fecha).toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(',', '')
  }
  

  return (
    <section className="vaca-info-2">
      <img src="https://via.placeholder.com/150" alt="Vaca" className="vaca-imagen" />
      <div className="info-detalles">
        <div className='alinear-info'>
          <p><strong>Código:</strong> {vaca.Codigo}</p>
          <p><strong>Edad:</strong> {vaca.Edad}</p>
          <p><strong>Raza:</strong> {vaca.Raza}</p>
          <p><strong>Novedades Sanitarias:</strong> {vaca.Novedad_Sanitaria || 'Sin novedades'}</p>
        </div>
        <div className='alinear-info'>
          <p><strong>Vacunas:</strong> {vaca.Vacunas || 'No registradas'}</p>
          <p>
            <strong>Desparasitación:</strong> {vaca.Fecha_Desparacitada ? 'Sí' : 'No'}<br></br>
            {vaca.Fecha_Desparacitada && <span> Fecha: {vaca.Fecha_Desparacitada}</span>}
          </p>
          <p>
            <strong>Embarazo:</strong> {vaca.Fecha_Embarazo ? 'Sí' : 'No'}<br></br>
            {vaca.Fecha_Embarazo && <span> Fecha: {vaca.Fecha_Embarazo}</span>}
          </p>
        </div>
      </div>
    </section>
  )
}

export default InfoVaca