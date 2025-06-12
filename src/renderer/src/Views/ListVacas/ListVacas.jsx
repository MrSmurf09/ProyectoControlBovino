import '../../Style/ListVacas/ListVacas.css'
import { GoTrash } from 'react-icons/go'
import { Link, useParams } from 'react-router-dom'
import Header from '../../components/Header/Header'
import { useSnackbar } from '../../Context/SnackbarContext'
import { useAppData } from '../../Context/AppContext'
import { useRef, useState, useEffect } from 'react'
import ConfirmacionModal from "../../components/ConfirmacionModal/ConfirmacionModal"

function ListVacas() {
  const [vacas, setVacas] = useState([])

  // Estado del formulario
  const [formData, setFormData] = useState({
    codigo: '',
    edad: '',
    raza: '',
    novedadesSanitarias: '',
    vacunas: '',
    //desparasitacion: false, // Checkbox como booleano
    fechaDesparasitacion: '',
    //embarazo: false, // Checkbox como booleano
    fechaEmbarazo: ''
  })

  const { showSnackbar } = useSnackbar()
  const { potreroId, token, potreroNombre, rol, userId } = useAppData()

  const [busqueda, setBusqueda] = useState("")
  const modalRef = useRef(null)
  const [vacaAEliminar, setVacaAEliminar] = useState(null)

  // Obtener vacas del potrero desde la API
  const obtenerVacas = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vacas/${potreroId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      })
      const data = await response.json()
      console.log('Data Vacas:', data)
      if (response.ok) {
        setVacas(data.vacas)
      } else {
        console.error('Error al obtener las vacas:', data.message)
      }
    } catch (error) {
      console.error('Error al obtener las vacas:', error)
    }
  }

  // Obtener vacas del veterinario desde la API (solo veterinarios)
  const obtenerVacasVeterinario = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/veterinario/vacas/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      })
      const data = await response.json()
      console.log('Data Vacas:', data)
      if (response.ok) {
        setVacas(data.vacas)
      } else {
        console.error('Error al obtener las vacas:', data.message)
      }
    } catch (error) {
      console.error('Error al obtener las vacas:', error)
    }
  }

  useEffect(() => {
    if (rol === "Veterinario") {
      obtenerVacasVeterinario()
    } else {
      obtenerVacas()
    }
  }, [potreroId])

  // ✅ Manejar cambios en los inputs de texto
  const obtenerInputs = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // ✅ Manejar cambios en los checkboxes (Desparasitación y Embarazo)
  // const handleCheckboxChange = (e) => {
  //   const { name, checked } = e.target
  //   setFormData({ ...formData, [name]: checked })
  // }

  // ✅ Enviar datos al backend
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Convertir booleanos en 1 o 0
    // const payload = {
    //   ...formData,
    //   desparasitacion: formData.desparasitacion ? 1 : 0,
    //   embarazo: formData.embarazo ? 1 : 0
    // }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vacas/nueva/${potreroId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      })

      const result = await response.json()
      if (response.ok) {
        await obtenerVacas() // Agregar nueva vaca a la lista
        closeModal() // Cerrar modal
        showSnackbar('Vaca registrada exitosamente', 'success')
        setFormData({
          codigo: '',
          edad: '',
          raza: '',
          novedadesSanitarias: '',
          vacunas: '',
          // desparasitacion: false,
          fechaDesparasitacion: '',
          // embarazo: false,
          fechaEmbarazo: ''
        })
      } else {
        console.error('Error:', result.message)
        closeModal()
        showSnackbar(`Error: ${result.message}`, 'error')
      }
    } catch (error) {
      console.error('Error al registrar la vaca:', error)
    }
  }

  const openModal = () => modalRef.current.showModal()
  const closeModal = () => modalRef.current.close()

  const confirmarEliminar = (vaca) => {
    setVacaAEliminar(vaca)
  }

  // Cancelar eliminación
  const cancelarEliminar = () => {
    setVacaAEliminar(null)
  }

  // Proceder con la eliminación después de confirmar
  const eliminarVaca = async () => {
    if (!vacaAEliminar) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vacas/eliminar/${vacaAEliminar.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()
      if (response.ok) {
        // Actualiza la lista de vacas después de eliminar
        setVacas((prevVacas) => prevVacas.filter((v) => v.id !== vacaAEliminar.id))
        showSnackbar("Vaca eliminada exitosamente", "success")
      } else {
        console.error("Error:", result.message)
        showSnackbar(`Error: ${result.message}`, "error")
      }
    } catch (error) {
      console.error("Error al eliminar la vaca:", error)
      showSnackbar("Error al eliminar la vaca", "error")
    } finally {
      setVacaAEliminar(null) // Limpiar el estado después de la operación
    }
  }

  let contenido;
  // Si es un ganadero, muestra la lista de vacas
  // Si es un veterinario, muestra la lista de vacas de su veterinario
  if (rol === "Ganadero") {
    if (vacas.length > 0) {
      contenido = (
        <div className="vacas-list">
          {vacas
            .filter((vaca) => 
              vaca.codigo.toLowerCase().includes(busqueda.toLowerCase())
            )
            .map((vaca) => (
            <div key={vaca.id} className="vaca-card">
              <Link to={`/VacasPefil/${vaca.id}/${vaca.codigo}`} className="vaca-info">
                <span className="vaca-nombre">Código: {vaca.codigo}</span>
                <span className="vaca-detalles">Edad: {vaca.edad}</span>
                <span className="vaca-detalles">Raza: {vaca.raza}</span>
                <span className="vaca-detalles">Promedio de producción de leche: {vaca.promedio_leche ? vaca.promedio_leche.toFixed(2) : 'No disponible'}</span>
              </Link>
              <button className="vaca-delete-btn" onClick={() => confirmarEliminar(vaca)}>
                <GoTrash />
              </button>
            </div>
          ))}
        </div>
      );
    } else {
      contenido = (
        <div className="no-registros">
          <p>No hay vacas registradas</p>
        </div>
      );
    }
  } else if (rol === "Veterinario") {
    if (vacas.length > 0) {
      contenido = (
        <div className="vacas-list">
          {vacas
            .filter((vaca) => 
              vaca.Codigo.toLowerCase().includes(busqueda.toLowerCase())
            )
            .map((vaca) => (
            <div key={vaca.id} className="vaca-card">
              <Link to={`/VacasPefil/${vaca.id}/${vaca.codigo}`} className="vaca-info">
                <span className="vaca-nombre">Código: {vaca.Codigo}</span>
                <span className="vaca-detalles">Edad: {vaca.Edad}</span>
                <span className="vaca-detalles">Raza: {vaca.Raza}</span>
              </Link>
              {rol === "Veterinario" ? (
                <></>
              ) : (
              <button className="vaca-delete-btn" onClick={() => confirmarEliminar(vaca)}>
                <GoTrash />
              </button>
              )}
            </div>
          ))}
        </div>
      );
    } else {
      contenido = (
        <div className="no-registros">
          <p>No hay vacas registradas</p>
        </div>
      );
    }
  } else {
    contenido = (
      <div className="no-registros">
        <p>No hay vacas registradas</p>
      </div>
    );
  }

  return (
    <>
      <Header TextButton="Crear Vaca" TextHeader={`Vacas de: ${potreroNombre}`} openCreateModal={openModal} onBuscar={setBusqueda} TextBuscar="Buscar Vacas..." />
      <div className="vacas-container">
        <header className="vacas-header">
          {rol === "Ganadero" ? (
            <Link to={`/Potreros/${potreroNombre}/${potreroId}`} className="volver-potreros">
              Volver a Potreros
            </Link>
          ) : (
            <></>
          )}
        </header>
        {contenido}
      </div>

      <dialog ref={modalRef} className="modal">
        <h3 className="title-modal">Registro de Nueva Vaca</h3>
        <form onSubmit={handleSubmit}>
          <div className="alinear-input">
            <input className="input" name="codigo" type="text" placeholder="Código" value={formData.codigo} onChange={obtenerInputs} required />
            <input className="input" name="edad" type="number" placeholder="Edad" value={formData.edad} onChange={obtenerInputs} required />
          </div>
          <div className="alinear-input">
            <input className="input" name="raza" type="text" placeholder="Raza" value={formData.raza} onChange={obtenerInputs} required />
            <input className="input" name="novedadesSanitarias" type="text" placeholder="Novedades Sanitarias" value={formData.novedadesSanitarias} onChange={obtenerInputs} required />
          </div>
          <div className="alinear-input">
            <input className="input" name="vacunas" type="text" placeholder="Vacunas" value={formData.vacunas} onChange={obtenerInputs} required />
          </div>
          <div className="alinear-input">
            {/* <label className="label-input">Desparasitación:
              <input type="checkbox" name="desparasitacion" checked={formData.desparasitacion} onChange={handleCheckboxChange} />
            </label> */}
            <input className="input" name="fechaDesparasitacion" type="date" value={formData.fechaDesparasitacion} onChange={obtenerInputs} />
          </div>
          <div className="alinear-input">
            {/* <label className="label-input">Embarazo:
              <input type="checkbox" name="embarazo" checked={formData.embarazo} onChange={handleCheckboxChange} />
            </label> */}
            <input className="input" name="fechaEmbarazo" type="date" value={formData.fechaEmbarazo} onChange={obtenerInputs} />
          </div>
          <div className="modal-buttons">
            <button type="submit" className="btn-guardar-modal">Guardar</button>
            <button type="button" onClick={closeModal} className="btn-cerrar-modal">Cerrar</button>
          </div>
        </form>
      </dialog>

      {vacaAEliminar && (
        <ConfirmacionModal titulo="Eliminar Vaca"
          mensaje={`¿Está seguro que desea eliminar la vaca "${vacaAEliminar.codigo}"? Esta acción no se puede deshacer.`} 
          onConfirm={eliminarVaca} 
          onCancel={cancelarEliminar} 
        />
      )}
    </>
  )
}

export default ListVacas
