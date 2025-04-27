import "../RegistroProduccion/registroproduccion.css"
import { useRef, useState, useEffect, useMemo } from "react"
import { useSnackbar } from '../../Context/SnackbarContext'

const RegistroProduccion = ({ id }) => {
  const [registros, setRegistros] = useState([])
  const [formData, setFormData] = useState({
    Fecha: "",
    Cantidad: "",
  })
  const { showSnackbar } = useSnackbar()

  // Obtener los registros de producción de leche desde la API
  const obtenerRegistros = async () => {
    try {
      const response = await fetch(`https://api-proyecto-jkec.onrender.com/api/produccion/leche/${id}`)
      const data = await response.json()
      console.log("Data de los registros:", data)
      if (response.ok) {
        // Ordenar registros por fecha (más recientes primero)
        const registrosOrdenados = ordenarRegistrosPorFecha(data.registros)
        // Limitar a los 6 más recientes
        setRegistros(registrosOrdenados)
      } else {
        console.error("Error al obtener los registros:", data.message)
      }
    } catch (error) {
      console.error("Error al obtener los registros:", error)
    }
  }

  // Función para ordenar registros por fecha (más recientes primero)
  const ordenarRegistrosPorFecha = (registros) => {
    return [...registros].sort((a, b) => {
      return new Date(b.Fecha) - new Date(a.Fecha)
    })
  }

  // Manejar cambios en los inputs de texto
  const obtenerInputs = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // registro de produccion de leche
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch(`https://api-proyecto-jkec.onrender.com/api/registrar/leche/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (response.ok) {
        // Añadir el nuevo registro y ordenar por fecha
        const nuevosRegistros = ordenarRegistrosPorFecha([...registros, data.registro])
        // Limitar a los 6 más recientes
        setRegistros(nuevosRegistros.slice(0, 6))

        closeModal()
        showSnackbar('Produccion de leche registrada exitosamente', 'success')
      } else {
        showSnackbar(`Error: ${data.message}`, 'error')
        closeModal()
        console.error("Error:", data.message)
      }
    } catch (error) {
      console.error("Error al registrar la produccion de leche:", error)
    }
  }

  useEffect(() => {
    obtenerRegistros()
  }, [id])

  const modalRef = useRef(null)

  const openModal = () => {
    modalRef.current.showModal()
  }

  const closeModal = () => {
    modalRef.current.close()
  }

  const formatFecha = (fecha) => {
    if (!fecha) return "No registrada"
    return new Date(fecha)
      .toLocaleString("es-CO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(",", "")
  }

  // Registros limitados a los 6 más recientes
  const registrosMostrados = useMemo(() => {
    return registros.slice(0, 6)
  }, [registros])

  return (
    <>
      <section className="registro-produccion">
        <h2>Registro de producción de leche</h2>
        <button onClick={openModal} className="btn-agregar">
          Añadir registro
        </button>
        <div className="registros">
          {registrosMostrados.length > 0 ? (
            registrosMostrados.map((registro, index) => (
              <div className="registro-item" key={registro.id || index}>
                <p>
                  <strong>Fecha:</strong> {registro.Fecha}
                </p>
                <p>
                  <strong>Cantidad de litros:</strong> {registro.Cantidad}
                </p>
              </div>
            ))
          ) : (
            <p className="no-registros">No hay registros para esta vaca</p>
          )}
        </div>
      </section>

      <dialog ref={modalRef} className="modal">
        <h3 className="title-modal">Registro de producción de leche</h3>
        <form method="dialog" onSubmit={handleSubmit}>
          <input
            className="input"
            id="cantidad-litros"
            type="text"
            placeholder="Cantidad de litros"
            name="Cantidad"
            value={formData.Cantidad}
            onChange={obtenerInputs}
            required
          />
          <input
            className="input"
            id="fecha-registro"
            type="date"
            placeholder="Fecha"
            name="Fecha"
            value={formData.Fecha}
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
    </>
  )
}

export default RegistroProduccion
