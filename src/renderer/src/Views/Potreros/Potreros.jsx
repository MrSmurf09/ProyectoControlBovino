import '../../Style/Potreros/Potreros.css'
import { Link, useParams } from 'react-router-dom'
import { GoTrash } from 'react-icons/go'
import Header from '../../components/Header/Header'
import { useSnackbar } from '../../Context/SnackbarContext'
import { useAppData } from '../../Context/AppContext'
import { useRef, useState, useEffect } from 'react'
import ConfirmacionModal from "../../components/ConfirmacionModal/ConfirmacionModal"

function Potreros() {
  const [potreros, setPotreros] = useState([])
  const [formData, setFormData] = useState({
    Nombre: ''
  })

  const { userId, token, fincaId, fincaNombre, setPotreroId, setPotreroNombre } = useAppData()

  const { showSnackbar } = useSnackbar()

  const [busqueda, setBusqueda] = useState("")
  const modalRef = useRef(null)
  const [potreroAEliminar, setPotreroAEliminar] = useState(null)

  const setinfopotrero = (potrero) => {
    setPotreroId(potrero.id)
    localStorage.setItem('potreroId', potrero.id)
    setPotreroNombre(potrero.nombre)
    localStorage.setItem('potreroNombre', potrero.nombre)
  }

  // Función para obtener los potreros de la finca
  const obtenerPotreros = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/potreros/${fincaId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      })
      const data = await response.json()
      console.log('Data Potreros:', data)
      if (response.ok) {
        setPotreros(data.potreros)
      } else {
        console.error('Error al obtener los potreros:', data.message)
      }
    } catch (error) {
      console.error('Error al obtener los potreros:', error)
    }
  }

  useEffect(() => {
    obtenerPotreros()
  }, [fincaId])

  // Ingresar datos del potrero
  const obtenerInputs = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // Ingresar datos del potrero
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/potreros/${fincaId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
        })

        const data = await response.json()
        if (response.ok) {
          await obtenerPotreros() // Agregar nuevo potrero a la lista
          closeModal()
          showSnackbar('Potrero registrado exitosamente', 'success')
        } else {
          console.error('Error:', data.message)
          closeModal()
          showSnackbar(`Error: ${data.message}`, 'error')
        }
      } catch (error) {
        console.error('Error al registrar el nuevo potrero:', error)
      }
  }

  const openModal = () => {
    modalRef.current.showModal()
  }

  const closeModal = () => {
    modalRef.current.close()
  }

  const confirmarEliminar = (potrero) => {
    setPotreroAEliminar(potrero)
  }

  // Cancelar eliminación
  const cancelarEliminar = () => {
    setPotreroAEliminar(null)
  }

  // Proceder con la eliminación después de confirmar
  const eliminarPotrero = async () => {
    if (!potreroAEliminar) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/potreros/${potreroAEliminar.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()
      if (response.ok) {
        // Actualiza la lista de potreros después de eliminar
        setPotreros((prevPotreros) => prevPotreros.filter((p) => p.id !== potreroAEliminar.id))
        showSnackbar("Potrero eliminado exitosamente", "success")
      } else {
        console.error("Error:", result.message)
        showSnackbar(`Error: ${result.message}`, "error")
      }
    } catch (error) {
      console.error("Error al eliminar el potrero:", error)
      showSnackbar("Error al eliminar el potrero", "error")
    } finally {
      setPotreroAEliminar(null) // Limpiar el estado después de la operación
    }
  }

  return (
    <>
      <Header TextButton="Crear Potrero" TextHeader={'Potreros: ' + fincaNombre} openCreateModal={openModal} onBuscar={setBusqueda} TextBuscar="Buscar Potreros..." />
      <div className="potreros-container">
        <header className="potreros-header">
          <Link to={`/Home/${userId}`} className="volver-fincas">
            Volver a Fincas
          </Link>
        </header>
        {potreros.length > 0 ? (
          <div className="potreros-list">
            {potreros
              .filter((potrero) => 
                potrero.nombre.toLowerCase().includes(busqueda.toLowerCase())
              )
              .map((potrero) => (
              <div key={potrero.id} className="potrero-card">
                <Link to={`/ListVacas/${potrero.nombre}/${potrero.id}`} className="potrero-info" onClick={() => setinfopotrero(potrero)}>
                  <span className="potrero-nombre">Nombre del potrero: {potrero.nombre}</span>
                  <span className="potrero-detalles">Cantidad de vacas: {potrero.cantidad_vacas}</span>
                  <span className="potrero-detalles">Promedio de producción de leche: {potrero.promedio_leche ? potrero.promedio_leche.toFixed(2) : 'No disponible'}</span>
                </Link>
                <button className="potrero-delete-btn" onClick={() => confirmarEliminar(potrero)}>
                  <GoTrash />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-registros">
            <p>No hay potreros registrados</p>
          </div>
        )}
      </div>

      <dialog ref={modalRef} className="modal">
        <h3 className="title-modal">Registro de Nuevo Potrero</h3>
        <form method="dialog" onSubmit={handleSubmit}>
          <input
            className="input"
            id="nombre-finca"
            type="text"
            placeholder="Nombre del Potrero"
            name='Nombre'
            value={formData.Nombre}
            onChange={obtenerInputs}
            required
          />
          <div className="modal-buttons">
            <button type="submit" className="btn-guardar-modal">
              Guardar
            </button>
            <button type="button" onClick={closeModal} className="btn-cerrar-modal">
              Cerrar
            </button>
          </div>
        </form>
      </dialog>

      {potreroAEliminar && (
        <ConfirmacionModal titulo="Eliminar Potrero"
          mensaje={`¿Está seguro que desea eliminar el potrero "${potreroAEliminar.nombre}"? Esta acción no se puede deshacer.`} 
          onConfirm={eliminarPotrero} 
          onCancel={cancelarEliminar} 
        />
      )}
    </>
  )
}

export default Potreros
