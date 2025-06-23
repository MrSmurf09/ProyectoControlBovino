import "../ProcesosMedicos/procesosmedicos.css"
import "./registrorecordatorios.css"
import { useSnackbar } from "../../Context/SnackbarContext"
import { useRef, useState, useEffect } from "react"
import { useAppData } from "../../Context/AppContext"
import { GoTrash } from "react-icons/go"

const RegistroRecordatorios = ({ id }) => {
  const [recordatorios, setRecordatorios] = useState([])
  const [tabActiva, setTabActiva] = useState("pendientes")
  const { userId, token } = useAppData()
  const [formData, setFormData] = useState({
    Fecha: "",
    Titulo: "",
    Descripcion: "",
    Tipo: "",
    UsuarioId: userId,
  })

  const { showSnackbar } = useSnackbar()

  // Obtener los recordatorios desde la API
  const obtenerRecordatorios = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/obtener/recordatorios/${id}`)
      const data = await response.json()
      console.log("Data de los recordatorios:", data)
      if (response.ok) {
        setRecordatorios(data.recordatorios)
      } else {
        console.error("Error al obtener los recordatorios:", data.message)
      }
    } catch (error) {
      console.error("Error al obtener los recordatorios:", error)
    }
  }

  useEffect(() => {
    obtenerRecordatorios()
  }, [id])

  // registrar el recordatorio
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/registrar/recordatorios/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      console.log("Data de los recordatorios:", data)
      if (response.ok) {
        setRecordatorios([...recordatorios, data.recordatorios])
        closeModal()
        showSnackbar("Registro de recordatorio registrado exitosamente", "success")
        // Resetear el formulario
        setFormData({
          Fecha: "",
          Titulo: "",
          Descripcion: "",
          Tipo: "",
          UsuarioId: userId,
        })
      } else {
        console.error("Error:", data.message)
        closeModal()
        showSnackbar(`Error: ${data.message}`, "error")
      }
    } catch (error) {
      console.error("Error al registrar el recordatorio:", error)
    }
  }

  // manejar cambios en los inputs de texto
  const obtenerInputs = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const formatFecha = (fecha) => {
    if (!fecha) return "No registrada"
    return new Date(fecha)
      .toLocaleString("es-CO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(",", "")
  }

  const modalRef = useRef(null)

  const openModal = () => {
    modalRef.current.showModal()
  }

  const closeModal = () => {
    modalRef.current.close()
  }

  // Función para determinar el estado del recordatorio
  const obtenerEstadoRecordatorio = (recordatorio) => {
    return recordatorio.Enviado === true ? "enviado" : "pendiente"
  }

  // Función para obtener el ícono según el estado
  const obtenerIconoEstado = (estado) => {
    return estado === "enviado" ? "✅" : "⏰"
  }

  // Filtrar recordatorios según la pestaña activa
  const recordatoriosFiltrados = recordatorios.filter((recordatorio) => {
    if (tabActiva === "pendientes") {
      return recordatorio.Enviado === false || recordatorio.Enviado === undefined || recordatorio.Enviado === null
    } else {
      return recordatorio.Enviado === true
    }
  })

  // Eliminar recordatorio
  const eliminarRecordatorio = async (idRecordatorio) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recordatorios/eliminar/${idRecordatorio}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`, // si es necesario
        },
      })
      const data = await response.json()

      if (response.ok) {
        showSnackbar("Recordatorio eliminado exitosamente", "success")
        await obtenerRecordatorios() // refrescar la lista
      } else {
        console.error("Error al eliminar:", data.message)
        showSnackbar(`Error: ${data.message}`, "error")
      }
    } catch (error) {
      console.error("Error al eliminar el recordatorio:", error)
      showSnackbar("Error de conexión al eliminar el recordatorio", "error")
    }
  }

  return (
    <>
      <section className="procesos-medicos">
        <div className="header-section">
          <h2>Registro de recordatorios</h2>
          <button onClick={openModal} className="btn-agregar">
            Añadir recordatorio
          </button>
        </div>

        {/* Pestañas */}
        <div className="tabs-container">
          <div
            className={`tab ${tabActiva === "pendientes" ? "active" : ""} tab-pendientes`}
            onClick={() => setTabActiva("pendientes")}
          >
            ⏰ Pendientes ({recordatorios.filter((r) => !r.Enviado).length})
          </div>
          <div
            className={`tab ${tabActiva === "enviados" ? "active" : ""} tab-enviados`}
            onClick={() => setTabActiva("enviados")}
          >
            ✅ Enviados ({recordatorios.filter((r) => r.Enviado).length})
          </div>
        </div>

        <div className="procesos-container">
          {recordatoriosFiltrados.length > 0 ? (
            recordatoriosFiltrados.map((recordatorio, index) => {
              const estado = obtenerEstadoRecordatorio(recordatorio)
              const icono = obtenerIconoEstado(estado)

              return (
                <div className={`recordatorio-item recordatorio-${estado}`} key={recordatorio.id || index}>
                  <div className="recordatorio-header">
                    <span className="recordatorio-icono">{icono}</span>
                    <span className="recordatorio-estado-badge">{estado.toUpperCase()}</span>
                  </div>
                  <ul className="procesos-detalles">
                    <li>
                      <strong>Creación:</strong> {formatFecha(recordatorio.created_at)}
                    </li>
                    <li>
                      <strong>Procedimiento:</strong> {recordatorio.Titulo}
                    </li>
                    <li>
                      <strong>Descripción:</strong> {recordatorio.Descripcion}
                    </li>
                    <li>
                      <strong>Sonará:</strong> {formatFecha(recordatorio.Fecha)}
                    </li>
                  </ul>
                    {estado === "pendiente" && (
                      <button className="eliminar-registro" onClick={() => eliminarRecordatorio(recordatorio.id)}>
                        <GoTrash />
                      </button>
                    )}
                </div>
              )
            })
          ) : (
            <p className="no-recordatorios">
              No hay recordatorios {tabActiva === "pendientes" ? "pendientes" : "enviados"}
            </p>
          )}
        </div>
      </section>

      <dialog ref={modalRef} className="modal">
        <h3 className="title-modal">Registro de recordatorios</h3>
        <form method="dialog" onSubmit={handleSubmit}>
          <input
            className="input"
            name="Fecha"
            type="datetime-local"
            onChange={obtenerInputs}
            value={formData.Fecha}
            required
          />
          <input
            className="input"
            name="Titulo"
            type="text"
            placeholder="Titulo del recordatorio"
            onChange={obtenerInputs}
            value={formData.Titulo}
            required
          />
          <textarea
            className="textarea"
            name="Descripcion"
            id="descripcion"
            placeholder="Descripción del recordatorio"
            onChange={obtenerInputs}
            value={formData.Descripcion}
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
    </>
  )
}

export default RegistroRecordatorios
