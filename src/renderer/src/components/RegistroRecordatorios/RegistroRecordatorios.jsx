import "../ProcesosMedicos/procesosmedicos.css"
import "./registrorecordatorios.css"
import { useSnackbar } from '../../Context/SnackbarContext'
import { useRef, useState, useEffect } from "react"
import { useAppData } from '../../Context/AppContext'

const RegistroRecordatorios = ({ id }) => {
  const [recordatorios, setRecordatorios] = useState([])
  const [tabActiva, setTabActiva] = useState("pendientes")
  const { userId } = useAppData()
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
      const response = await fetch(`https://api-proyecto-jkec.onrender.com/api/obtener/recordatorios/${id}`)
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
      const response = await fetch(`https://api-proyecto-jkec.onrender.com/api/registrar/recordatorios/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      console.log("Data de los recordatorios:", data)
      if (response.ok) {
        setRecordatorios([...recordatorios, data.recordatorios])
        closeModal()
        showSnackbar('Registro de recordatorio registrado exitosamente', 'success')
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
        showSnackbar(`Error: ${data.message}`, 'error')
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

  // Filtrar recordatorios según la pestaña activa
  const recordatoriosFiltrados = recordatorios.filter((recordatorio) => {
    if (tabActiva === "pendientes") {
      return recordatorio.Enviado === false || recordatorio.Enviado === undefined || recordatorio.Enviado === null
    } else {
      return recordatorio.Enviado === true
    }
  })

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
            className={`tab ${tabActiva === "pendientes" ? "active" : ""}`}
            onClick={() => setTabActiva("pendientes")}
          >
            Pendientes
          </div>
          <div className={`tab ${tabActiva === "enviados" ? "active" : ""}`} onClick={() => setTabActiva("enviados")}>
            Enviados
          </div>
        </div>

        <div className="procesos-container">
          {recordatoriosFiltrados.length > 0 ? (
            recordatoriosFiltrados.map((recordatorio, index) => (
              <div className="recordatorio-item" key={recordatorio.id || index}>
                <ul className="procesos-detalles">
                  <li>
                    <strong>Creación:</strong> {formatFecha(recordatorio.created_at)}
                  </li>
                  <li>
                    <strong>Procedimiento:</strong> {recordatorio.Titulo}
                  </li>
                  <li>
                    <strong>Tipo:</strong> {recordatorio.Tipo}
                  </li>
                  <li>
                    <strong>Descripción:</strong> {recordatorio.Descripcion}
                  </li>
                  <li>
                    <strong>Sonará:</strong> {formatFecha(recordatorio.Fecha)}
                  </li>
                </ul>
              </div>
            ))
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
          <select
            className="input"
            name="Tipo"
            id="tipo"
            type="text"
            placeholder="Tipo"
            onChange={obtenerInputs}
            value={formData.Tipo}
            required
          >
            <option value="" disabled>
              Seleccione un tipo
            </option>
            <option value="Veterinario">Veterinario</option>
            <option value="Farmacia">Farmacia</option>
            <option value="Hospital">Hospital</option>
            <option value="Otro">Otro</option>
          </select>
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
