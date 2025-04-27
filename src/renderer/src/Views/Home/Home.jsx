import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiEdit } from 'react-icons/fi'
import { GoTrash } from 'react-icons/go'
import '../../Style/Home/Home.css'
import { useSnackbar } from '../../Context/SnackbarContext'
import { useAppData } from '../../Context/AppContext'

import Header from '../../components/Header/Header'

function Home() {
  const [fincas, setFincas] = useState([]) // Lista de fincas obtenidas
  const [formData, setFormData] = useState({
    Nombre: '',
    Descripcion: '',
    Imagen: null
  })
  const [fincaSeleccionada, setFincaSeleccionada] = useState(null)

  const { showSnackbar } = useSnackbar()
  const { userId } = useAppData()
  const { setFincaId } = useAppData()
  const { setFincaNombre } = useAppData()
  const { token } = useAppData()

  const setinfofinca = (finca) => {
    setFincaId(finca.id)
    setFincaNombre(finca.Nombre)
  }

  const [busqueda, setBusqueda] = useState("")
  const modalRef = useRef(null)

  // Función para obtener las fincas del usuario
  const obtenerFincas = async () => {
    console.log('UsuarioId:', userId) // Verifica si el UsuarioId está definido

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/fincas?UsuarioId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
        })
      console.log('Response:', response) // Verifica si la respuesta llega correctamente
      const data = await response.json()
      console.log('Data:', data) // Verifica si los datos son correctos
      if (response.ok) {
        setFincas(data.fincas) // Actualiza el estado con las fincas
      } else {
        console.error('Error del servidor:', data.message)
      }
    } catch (error) {
      console.error('Error en fetch:', error)
    }
  }

  // Llamar a obtenerFincas cuando se monta el componente
  useEffect(() => {
    obtenerFincas()
  }, [userId])

  const ObtenerIputs = (e) => {
    const { name, value, files } = e.target
    if (name === 'Imagen') {
      setFormData({ ...formData, Imagen: files[0] })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  // ingresar finca

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = new FormData()
    data.append('Nombre', formData.Nombre)
    data.append('Descripcion', formData.Descripcion)
    data.append('Imagen', formData.Imagen)
    data.append('UsuarioId', userId)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/fincas`, {
        method: 'POST',
        body: data
      })

      const result = await response.json()
      if (response.ok) {
        await obtenerFincas() // Agregar la nueva finca al estado
        closeModal()
        showSnackbar('Finca registrada exitosamente', 'success')
      } else {
        console.error('Error:', result.message)
        closeModal()
        showSnackbar(`Error: ${result.message}`, 'error')
      }
    } catch (error) {
      console.error('Error al registrar la finca:', error)
    }
  }

  // editar finca

  const handleEdit = (finca) => {
    setFincaSeleccionada(finca)
    setFormData({
      Nombre: finca.Nombre,
      Descripcion: finca.Descripcion,
      Imagen: null // La imagen se carga solo si se selecciona una nueva
    })
    openEditModal()
  }

  const handleUpdate = async (e) => {
    e.preventDefault()

    const data = new FormData()
    data.append('Nombre', formData.Nombre)
    data.append('Descripcion', formData.Descripcion)
    if (formData.Imagen) {
      data.append('Imagen', formData.Imagen)
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/fincas/${fincaSeleccionada.id}`, {
        method: 'PUT',
        body: data
      })

      const result = await response.json()
      if (response.ok) {
        // Actualizar la lista de fincas
        setFincas((prevFincas) =>
          prevFincas.map((f) => (f.id === fincaSeleccionada.id ? result.finca : f))
        )
        closeModal()
        showSnackbar('Finca actualizada exitosamente', 'success')
      } else {
        console.error('Error:', result.message)
        showSnackbar(`Error: ${result.message}`, 'error')
      }
    } catch (error) {
      console.error('Error al actualizar la finca:', error)
    }
  }

  // eliminar finca

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/fincas/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      if (response.ok) {
        // Actualiza la lista de fincas después de eliminar
        setFincas((prevFincas) => prevFincas.filter((f) => f.id !== id))
        showSnackbar('Finca eliminada exitosamente', 'success')
      } else {
        console.error('Error:', result.message)
        showSnackbar(`Error: ${result.message}`, 'error')
      }
    } catch (error) {
      console.error('Error al eliminar la finca:', error)
    }
  }

  const openCreateModal = () => {
    setFincaSeleccionada(null)
    setFormData({
      Nombre: '',
      Descripcion: '',
      Imagen: null
    })
    modalRef.current.showModal()
  }
  
  const openEditModal = () => {
    modalRef.current.showModal()
  }
  
  const closeModal = () => modalRef.current.close()

  return (
    <>
      <div className="fincas-container">
        <Header openCreateModal={openCreateModal} TextButton="Crear Finca" TextHeader="Fincas Registradas" onBuscar={setBusqueda} TextBuscar="Buscar Fincas..." />
        {fincas.length > 0 ? (
          <div className="fincas-list">
            {fincas
              .filter((finca) => 
                finca.Nombre.toLowerCase().includes(busqueda.toLowerCase())
              )
              .map((finca) => (
              <div key={finca.id} className="finca-card">
                <Link to={`/Potreros/${finca.Nombre}/${finca.id}`} onClick={() => setinfofinca(finca)}>
                  <img
                    src={finca.Imagen}
                    alt={`Imagen de ${finca.Nombre}`}
                    className="finca-image"
                  />
                </Link>
                <div className="finca-info">
                  <h3>Nombre: {finca.Nombre}</h3>
                  <p>Cantidad de potreros: {finca.cantidad_potreros}</p>
                  <p>Descripcion: {finca.Descripcion}</p>
                  <div className="finca-actions">
                    <button className="edit-btn" onClick={() => handleEdit(finca)}>
                      <FiEdit />
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(finca.id)}>
                      <GoTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-registros">
            <p>No hay fincas registradas</p>
          </div>
        )}
      </div>

      <dialog ref={modalRef} className="modal">
        <h3 className="title-modal">Registro de Nueva Finca</h3>
        <form
          onSubmit={fincaSeleccionada ? handleUpdate : handleSubmit}
          encType="multipart/form-data"
        >
          <input className="input" id="imagen" type="file" name="Imagen" onChange={ObtenerIputs} />
          <input
            className="input"
            id="nombre-finca"
            type="text"
            placeholder="Nombre de la finca"
            name="Nombre"
            value={formData.Nombre}
            onChange={ObtenerIputs}
            required
          />
          <textarea
            className="textarea"
            id="descripcion"
            placeholder="Descripción"
            name="Descripcion"
            value={formData.Descripcion}
            onChange={ObtenerIputs}
            required
          ></textarea>
          <div className="modal-buttons">
            <button type="submit" className="btn-guardar-modal">
              {fincaSeleccionada ? 'Actualizar' : 'Guardar'}
            </button>
            <button type="button" onClick={closeModal} className="btn-cerrar-modal">
              Cerrar
            </button>
          </div>
        </form>
      </dialog>
    </>
  )
}

export default Home
