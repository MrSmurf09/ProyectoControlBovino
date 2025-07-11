import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { FiEdit } from "react-icons/fi"
import { GoTrash } from "react-icons/go"
import "../../Style/Home/Home.css"
import { useSnackbar } from "../../Context/SnackbarContext"
import { useAppData } from "../../Context/AppContext"
import Header from "../../components/Header/Header"
import RecomendacionModal from "../../components/RecomendacionModal/RecomendacionModal"
import ConfirmacionModal from "../../components/ConfirmacionModal/ConfirmacionModal"

function Home() {
  const [fincas, setFincas] = useState([]) // Lista de fincas obtenidas
  const [formData, setFormData] = useState({
    Nombre: "",
    Descripcion: "",
    Imagen: null,
  })
  const [fincaSeleccionada, setFincaSeleccionada] = useState(null)
  const [showRecomendacion, setShowRecomendacion] = useState(false)
  const [fincaAEliminar, setFincaAEliminar] = useState(null)

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

  // Verificar si el usuario ya ha visto la recomendación
  useEffect(() => {
    if (userId) {
      const hasSeenRecomendacion = localStorage.getItem(`recomendacion_vista_${userId}`)
      if (!hasSeenRecomendacion) {
        setShowRecomendacion(true)
      }
    }
  }, [userId])

  // Función para obtener las fincas del usuario
  const obtenerFincas = async () => {
    if (!userId || !token) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/fincas?UsuarioId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        console.error("Error del servidor:", response.status)
        return
      }

      const data = await response.json()
      if (data && data.fincas) {
        setFincas(data.fincas) // Actualiza el estado con las fincas
      }
    } catch (error) {
      console.error("Error en fetch:", error)
    }
  }

  // Llamar a obtenerFincas cuando se monta el componente
  useEffect(() => {
    if (userId && token) {
      obtenerFincas()
    }
  }, [userId, token])

  const ObtenerIputs = (e) => {
    const { name, value, files } = e.target
    if (name === "Imagen") {
      setFormData({ ...formData, Imagen: files[0] })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  // ingresar finca
  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = new FormData()
    data.append("Nombre", formData.Nombre)
    data.append("Descripcion", formData.Descripcion)
    data.append("Imagen", formData.Imagen)
    data.append("UsuarioId", userId)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/fincas`, {
        method: "POST",
        body: data,
      })

      const result = await response.json()
      if (response.ok) {
        await obtenerFincas() // Agregar la nueva finca al estado
        closeModal()
        showSnackbar("Finca registrada exitosamente", "success")
      } else {
        console.error("Error:", result.message)
        closeModal()
        showSnackbar(`Error: ${result.message}`, "error")
      }
    } catch (error) {
      console.error("Error al registrar la finca:", error)
    }
  }

  // editar finca
  const handleEdit = (finca) => {
    setFincaSeleccionada(finca)
    setFormData({
      Nombre: finca.Nombre,
      Descripcion: finca.Descripcion,
      Imagen: null, // La imagen se carga solo si se selecciona una nueva
    })
    openEditModal()
  }

  const handleUpdate = async (e) => {
    e.preventDefault()

    const data = new FormData()
    data.append("Nombre", formData.Nombre)
    data.append("Descripcion", formData.Descripcion)
    if (formData.Imagen) {
      data.append("Imagen", formData.Imagen)
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/fincas/${fincaSeleccionada.id}`, {
        method: "PUT",
        body: data,
      })

      const result = await response.json()
      if (response.ok) {
        // Actualizar la lista de fincas
        setFincas((prevFincas) => prevFincas.map((f) => (f.id === fincaSeleccionada.id ? result.finca : f)))
        closeModal()
        showSnackbar("Finca actualizada exitosamente", "success")
      } else {
        console.error("Error:", result.message)
        showSnackbar(`Error: ${result.message}`, "error")
      }
    } catch (error) {
      console.error("Error al actualizar la finca:", error)
    }
  }

  // Mostrar modal de confirmación antes de eliminar
  const confirmarEliminar = (finca) => {
    setFincaAEliminar(finca)
  }

  // Cancelar eliminación
  const cancelarEliminar = () => {
    setFincaAEliminar(null)
  }

  // Proceder con la eliminación después de confirmar
  const eliminarFinca = async () => {
    if (!fincaAEliminar) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/fincas/${fincaAEliminar.id}`, {
        method: "DELETE",
      })

      const result = await response.json()
      if (response.ok) {
        // Actualiza la lista de fincas después de eliminar
        setFincas((prevFincas) => prevFincas.filter((f) => f.id !== fincaAEliminar.id))
        showSnackbar("Finca eliminada exitosamente", "success")
      } else {
        console.error("Error:", result.message)
        showSnackbar(`Error: ${result.message}`, "error")
      }
    } catch (error) {
      console.error("Error al eliminar la finca:", error)
    } finally {
      setFincaAEliminar(null) // Limpiar el estado después de la operación
    }
  }

  const openCreateModal = () => {
    setFincaSeleccionada(null)
    setFormData({
      Nombre: "",
      Descripcion: "",
      Imagen: null,
    })
    modalRef.current.showModal()
  }

  const openEditModal = () => {
    modalRef.current.showModal()
  }

  const closeModal = () => modalRef.current.close()

  const handleCloseRecomendacion = () => {
    setShowRecomendacion(false)
    // Guardar en localStorage que el usuario ya vio la recomendación
    if (userId) {
      localStorage.setItem(`recomendacion_vista_${userId}`, "true")
    }
  }

  return (
    <>
      <div className="fincas-container">
        <Header
          openCreateModal={openCreateModal}
          TextButton="Crear Finca"
          TextHeader="Fincas Registradas"
          onBuscar={setBusqueda}
          TextBuscar="Buscar Fincas..."
        />
        {fincas.length > 0 ? (
          <div className="fincas-list">
            {fincas
              .filter((finca) => finca.Nombre.toLowerCase().includes(busqueda.toLowerCase()))
              .map((finca) => (
                <div key={finca.id} className="finca-card">
                  <Link to={`/Potreros/${finca.Nombre}/${finca.id}`} onClick={() => setinfofinca(finca)}>
                    <img
                      src={finca.Imagen || "/placeholder.svg"}
                      alt={`Imagen de ${finca.Nombre}`}
                      className="finca-image"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = "https://via.placeholder.com/150"
                      }}
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
                      <button className="delete-btn" onClick={() => confirmarEliminar(finca)}>
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
        <h3 className="title-modal">{fincaSeleccionada ? "Editar Finca" : "Registro de Nueva Finca"}</h3>
        <form onSubmit={fincaSeleccionada ? handleUpdate : handleSubmit} encType="multipart/form-data">
        <span>Imagen de la finca</span>
          <input className="input" id="imagen" type="file" name="Imagen" onChange={ObtenerIputs} accept="image/*" />
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
              {fincaSeleccionada ? "Actualizar" : "Guardar"}
            </button>
            <button type="button" onClick={closeModal} className="btn-cerrar-modal">
              Cerrar
            </button>
          </div>
        </form>
      </dialog>

      {showRecomendacion && <RecomendacionModal onClose={handleCloseRecomendacion} />}

      {fincaAEliminar && (
        <ConfirmacionModal
          titulo="Eliminar Finca"
          mensaje={`¿Está seguro que desea eliminar la finca "${fincaAEliminar.Nombre}"? Esta acción no se puede deshacer.`}
          onConfirm={eliminarFinca}
          onCancel={cancelarEliminar}
        />
      )}
    </>
  )
}

export default Home
