import './procesosmedicos.css'
import { useSnackbar } from '../../Context/SnackbarContext'
import { useRef, useState, useEffect } from 'react'

const ProcesosMedicos = ({ id }) => {
  const [procesos, setProcesos] = useState([])
  const [formData, setFormData] = useState({
    Fecha: '',
    Tipo: '',
    Estado: '',
    Descripcion: ''
  })

  const { showSnackbar } = useSnackbar()

  // Obtener los procesos de medicos desde la API
  const obtenerProcesos = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/procesos/medicos/${id}`)
      const data = await response.json()
      console.log('Data de los procesos:', data)
      if (response.ok) {
        setProcesos(data.procesos)
      } else {
        console.error('Error al obtener los procesos:', data.message)
      }
    } catch (error) {
      console.error('Error al obtener los procesos:', error)
    }
  }

  useEffect(() => {
    obtenerProcesos()
  }, [id])

  // Manejar cambios en los inputs de texto
  const obtenerInputs = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/registrar/procesos/medicos/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
        })

        const data = await response.json()
        if (response.ok) {
          setProcesos([...procesos, data.procesos])
          closeModal()
          showSnackbar('Registro de proceso de medico registrado exitosamente', 'success')
        } else {
          console.error('Error:', data.message)
          closeModal()
          showSnackbar(`Error: ${data.message}`, 'error')
        }
      } catch (error) {
        console.error('Error al registrar el proceso de medico:', error)
      }
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

  const modalRef = useRef(null);

  const openModal = () => {
    modalRef.current.showModal();
  };

  const closeModal = () => {
    modalRef.current.close();
  };

  return (
    <>
      <section className="procesos-medicos">
        <h2>Registro de Procesos Médicos</h2>
        <button onClick={openModal} className="btn-agregar">Añadir proceso</button>
        {procesos.length > 0 ? (
          <div className="procesos-container">
            {procesos.map((proceso, index) => (
              <div className="proceso-item" key={proceso.id || index}>
                <ul className="procesos-detalles">
                  <li>
                    <strong>Fecha:</strong> {formatFecha(proceso.created_at)}
                  </li>
                  <li>
                    <strong>Procedimiento:</strong> {proceso.Tipo}
                  </li>
                  <li>
                    <strong>Estado:</strong> {proceso.Estado}
                  </li>
                  <li>
                    <strong>Descripcion:</strong> {proceso.Descripcion}
                  </li>
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-registros">
            <p>No hay procesos medicos registrados</p>
          </div>
        )}
      </section>

      <dialog ref={modalRef} className="modal">
        <h3 className='title-modal'>Registro de procesos médicos</h3>
        <form method="dialog" onSubmit={handleSubmit}>
          <input className='input' name='Fecha' type="date" onChange={obtenerInputs} value={formData.Fecha} required />
          <input className='input' name='Tipo' type="text" placeholder="Procedimiento a realizar" onChange={obtenerInputs} value={formData.Tipo} required />
          <select className='input' name='Estado' id="estado" type="text" placeholder="Estado" onChange={obtenerInputs} value={formData.Estado} required>
            <option value="" selected disabled>Seleccione un estado</option>
            <option value="Realizado">Realizado</option>
            <option value="Cancelado">Cancelado</option>
            <option value="Recordatorio">Recordatorio</option>
          </select>
          <textarea className='textarea' name='Descripcion' id="descripcion" placeholder="Descripción del procedimiento" onChange={obtenerInputs} value={formData.Descripcion} required />
          <div className="modal-buttons">
            <button type="submit" className="btn-guardar-modal">Guardar</button>
            <button type="button" onClick={closeModal} className="btn-cerrar-modal">Cerrar</button>
          </div>
        </form>
      </dialog>
    </>
  )
}

export default ProcesosMedicos