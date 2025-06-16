"use client"

import "../../Style/ListVacas/ListVacas.css"
import { GoTrash } from "react-icons/go"
import { Link } from "react-router-dom"
import Header from "../../components/Header/Header"
import { useSnackbar } from "../../Context/SnackbarContext"
import { useAppData } from "../../Context/AppContext"
import { useRef, useState, useEffect } from "react"
import ConfirmacionModal from "../../components/ConfirmacionModal/ConfirmacionModal"

function ListVacas() {
  const [vacas, setVacas] = useState([])
  const [veterinarios, setVeterinarios] = useState([])
  const [cargandoVeterinarios, setCargandoVeterinarios] = useState(false)

  // Estado del formulario
  const [formData, setFormData] = useState({
    codigo: "",
    edad: "",
    raza: "",
    novedadesSanitarias: "",
    vacunas: "",
    fechaDesparasitacion: "",
    fechaEmbarazo: "",
  })

  const { showSnackbar } = useSnackbar()
  const { potreroId, token, potreroNombre, rol, userId } = useAppData()

  const [busqueda, setBusqueda] = useState("")
  const modalRef = useRef(null)
  const modalVeterinarioRef = useRef(null)
  const [vacaAEliminar, setVacaAEliminar] = useState(null)

  const [vacaParaAsignar, setVacaParaAsignar] = useState(null)
  const [veterinarioSeleccionado, setVeterinarioSeleccionado] = useState("")
  const [busquedaVeterinario, setBusquedaVeterinario] = useState("")

  const abrirModalAsignarVet = (vaca) => {
    if (!vaca) return

    setVacaParaAsignar(vaca)
    setVeterinarioSeleccionado(vaca.veterinario?.toString() || "")
    setBusquedaVeterinario("")

    if (modalVeterinarioRef.current) {
      modalVeterinarioRef.current.showModal()
    }
  }

  const cerrarModalAsignarVet = () => {
    modalVeterinarioRef.current.close()
    setVacaParaAsignar(null)
    setVeterinarioSeleccionado("")
    setBusquedaVeterinario("")
  }

  const asignarVeterinario = async () => {
    if (!vacaParaAsignar) return

    try {
      // Si veterinarioSeleccionado es "null" o vacío, enviar null
      const veterinarioId =
        veterinarioSeleccionado === "null" || veterinarioSeleccionado === ""
          ? null
          : Number.parseInt(veterinarioSeleccionado)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/veterinario/asignar/${vacaParaAsignar.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ veterinario_id: veterinarioId }),
      })

      const result = await response.json()
      if (response.ok) {
        // Actualizar la lista de vacas
        await obtenerVacas()
        cerrarModalAsignarVet()

        const mensaje =
          veterinarioId === null ? "Veterinario removido exitosamente" : "Veterinario asignado exitosamente"

        showSnackbar(mensaje, "success")
      } else {
        console.error("Error:", result.message)
        showSnackbar(`Error: ${result.message}`, "error")
      }
    } catch (error) {
      console.error("Error al asignar veterinario:", error)
      showSnackbar("Error al asignar veterinario", "error")
    }
  }

  const veterinariosFiltrados = Array.isArray(veterinarios)
    ? veterinarios.filter((vet) => {
        if (!vet) return false

        const nombre = vet.Nombre || vet.nombre || ""
        const email = vet.Correo || vet.email || ""
        const busqueda = busquedaVeterinario.toLowerCase()

        return nombre.toLowerCase().includes(busqueda) || email.toLowerCase().includes(busqueda)
      })
    : []

  // Obtener vacas del potrero desde la API
  const obtenerVacas = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vacas/${potreroId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      console.log("Data Vacas:", data)
      if (response.ok) {
        setVacas(data.vacas)
      } else {
        console.error("Error al obtener las vacas:", data.message)
      }
    } catch (error) {
      console.error("Error al obtener las vacas:", error)
    }
  }

  // Obtener veterinarios
  const obtenerVeterinarios = async () => {
    setCargandoVeterinarios(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/get/veterinarios`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      console.log("Data Veterinarios:", data)
      if (response.ok && data.veterinarios) {
        setVeterinarios(Array.isArray(data.veterinarios) ? data.veterinarios : [])
      } else {
        console.error("Error al obtener los veterinarios:", data.message)
        setVeterinarios([])
      }
    } catch (error) {
      console.error("Error al obtener los veterinarios:", error)
      setVeterinarios([])
      showSnackbar("Error al cargar veterinarios", "error")
    } finally {
      setCargandoVeterinarios(false)
    }
  }

  // Obtener vacas del veterinario desde la API (solo veterinarios)
  const obtenerVacasVeterinario = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/veterinario/vacas/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      console.log("Data Vacas:", data)
      if (response.ok) {
        setVacas(data.vacas)
      } else {
        console.error("Error al obtener las vacas:", data.message)
      }
    } catch (error) {
      console.error("Error al obtener las vacas:", error)
    }
  }

  useEffect(() => {
    if (rol === "Veterinario") {
      obtenerVacasVeterinario()
    } else {
      obtenerVacas()
      obtenerVeterinarios()
    }
  }, [potreroId])

  // Manejar cambios en los inputs de texto
  const obtenerInputs = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // Enviar datos al backend
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vacas/nueva/${potreroId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      if (response.ok) {
        await obtenerVacas()
        closeModal()
        showSnackbar("Vaca registrada exitosamente", "success")
        setFormData({
          codigo: "",
          edad: "",
          raza: "",
          novedadesSanitarias: "",
          vacunas: "",
          fechaDesparasitacion: "",
          fechaEmbarazo: "",
        })
      } else {
        console.error("Error:", result.message)
        closeModal()
        showSnackbar(`Error: ${result.message}`, "error")
      }
    } catch (error) {
      console.error("Error al registrar la vaca:", error)
    }
  }

  const openModal = () => modalRef.current.showModal()
  const closeModal = () => modalRef.current.close()

  const confirmarEliminar = (vaca) => {
    setVacaAEliminar(vaca)
  }

  const cancelarEliminar = () => {
    setVacaAEliminar(null)
  }

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
      setVacaAEliminar(null)
    }
  }

  let contenido
  if (rol === "Ganadero") {
    if (vacas.length > 0) {
      contenido = (
        <div className="vacas-list">
          {vacas
            .filter((vaca) => vaca.codigo.toLowerCase().includes(busqueda.toLowerCase()))
            .map((vaca) => (
              <div key={vaca.id} className="vaca-card">
                <Link to={`/VacasPefil/${vaca.id}/${vaca.codigo}`} className="vaca-info">
                  <span className="vaca-nombre">Código: {vaca.codigo}</span>
                  <span className="vaca-detalles">Edad: {vaca.edad}</span>
                  <span className="vaca-detalles">Raza: {vaca.raza}</span>
                  <span className="vaca-detalles">
                    Veterinario: {vaca.nombre_veterinario ? vaca.nombre_veterinario : "No asignado"}
                  </span>
                  <span className="vaca-detalles">
                    Promedio de producción de leche:{" "}
                    {vaca.promedio_leche ? vaca.promedio_leche.toFixed(2) : "No disponible"}
                  </span>
                </Link>
                <div className="vaca-botones">
                  <button className="btn-asignar-veterinario" onClick={() => abrirModalAsignarVet(vaca)}>
                    {vaca.nombre_veterinario ? "Cambiar Veterinario" : "Asignar Veterinario"}
                  </button>
                  <button className="vaca-delete-btn" onClick={() => confirmarEliminar(vaca)}>
                    <GoTrash />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )
    } else {
      contenido = (
        <div className="no-registros">
          <p>No hay vacas registradas</p>
        </div>
      )
    }
  } else if (rol === "Veterinario") {
    if (vacas.length > 0) {
      contenido = (
        <div className="vacas-list">
          {vacas
            .filter((vaca) => vaca.Codigo.toLowerCase().includes(busqueda.toLowerCase()))
            .map((vaca) => (
              <div key={vaca.id} className="vaca-card">
                <Link to={`/VacasPefil/${vaca.id}/${vaca.codigo}`} className="vaca-info">
                  <span className="vaca-nombre">Código: {vaca.Codigo}</span>
                  <span className="vaca-detalles">Edad: {vaca.Edad}</span>
                  <span className="vaca-detalles">Raza: {vaca.Raza}</span>
                </Link>
              </div>
            ))}
        </div>
      )
    } else {
      contenido = (
        <div className="no-registros">
          <p>No hay vacas asignadas</p>
        </div>
      )
    }
  } else {
    contenido = (
      <div className="no-registros">
        <p>No hay vacas registradas</p>
      </div>
    )
  }

  return (
    <>
      <Header
        TextButton="Crear Vaca"
        TextHeader={`Vacas de: ${potreroNombre}`}
        openCreateModal={openModal}
        onBuscar={setBusqueda}
        TextBuscar="Buscar Vacas..."
      />
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

      {/* Modal para crear vaca */}
      <dialog ref={modalRef} className="modal">
        <h3 className="title-modal">Registro de Nueva Vaca</h3>
        <form onSubmit={handleSubmit}>
          <div className="alinear-input">
            <input
              className="input"
              name="codigo"
              type="text"
              placeholder="Código"
              value={formData.codigo}
              onChange={obtenerInputs}
              required
            />
            <input
              className="input"
              name="edad"
              type="number"
              placeholder="Edad"
              value={formData.edad}
              onChange={obtenerInputs}
              required
            />
          </div>
          <div className="alinear-input">
            <input
              className="input"
              name="raza"
              type="text"
              placeholder="Raza"
              value={formData.raza}
              onChange={obtenerInputs}
              required
            />
            <input
              className="input"
              name="novedadesSanitarias"
              type="text"
              placeholder="Novedades Sanitarias"
              value={formData.novedadesSanitarias}
              onChange={obtenerInputs}
              required
            />
          </div>
          <div className="alinear-input">
            <input
              className="input"
              name="vacunas"
              type="text"
              placeholder="Vacunas"
              value={formData.vacunas}
              onChange={obtenerInputs}
              required
            />
          </div>
          <div className="alinear-input">
            <input
              className="input"
              name="fechaDesparasitacion"
              type="date"
              value={formData.fechaDesparasitacion}
              onChange={obtenerInputs}
            />
          </div>
          <div className="alinear-input">
            <input
              className="input"
              name="fechaEmbarazo"
              type="date"
              value={formData.fechaEmbarazo}
              onChange={obtenerInputs}
            />
          </div>
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

      {/* Modal para asignar veterinario */}
      <dialog ref={modalVeterinarioRef} className="modal modal-veterinario">
        <div className="modal-veterinario-header">
          <h3 className="title-modal-veterinario">
            {vacaParaAsignar?.nombre_veterinario ? "Cambiar" : "Asignar"} Veterinario
          </h3>
          <p className="subtitle-modal-veterinario">
            Vaca: <strong>{vacaParaAsignar?.codigo}</strong>
          </p>
        </div>

        <div className="modal-veterinario-content">
          {/* Campo de búsqueda */}
          <div className="form-group-veterinario">
            <label htmlFor="busqueda-vet" className="label-veterinario">
              Buscar Veterinario
            </label>
            <input
              id="busqueda-vet"
              type="text"
              placeholder="Buscar por nombre o email..."
              value={busquedaVeterinario}
              onChange={(e) => setBusquedaVeterinario(e.target.value)}
              className="input-busqueda-veterinario"
            />
          </div>

          {/* Lista de veterinarios */}
          <div className="form-group-veterinario">
            <label className="label-veterinario">Seleccionar Veterinario</label>
            <div className="lista-veterinarios">
              {/* Opción para quitar veterinario */}
              <div
                className={`item-veterinario item-sin-veterinario ${veterinarioSeleccionado === "null" ? "veterinario-seleccionado" : ""}`}
                onClick={() => setVeterinarioSeleccionado("null")}
              >
                <div className="nombre-veterinario">🚫 Sin Veterinario</div>
                <div className="email-veterinario">Quitar asignación de veterinario</div>
              </div>

              {/* Lista de veterinarios disponibles */}
              {veterinariosFiltrados && veterinariosFiltrados.length > 0 ? (
                veterinariosFiltrados.map((vet) => {
                  if (!vet || !vet.id) return null

                  return (
                    <div
                      key={vet.id}
                      className={`item-veterinario ${veterinarioSeleccionado === vet.id.toString() ? "veterinario-seleccionado" : ""}`}
                      onClick={() => setVeterinarioSeleccionado(vet.id.toString())}
                    >
                      <div className="nombre-veterinario">{vet.Nombre || vet.nombre || "Sin nombre"}</div>
                      <div className="email-veterinario">{vet.Correo || vet.email || "Sin email"}</div>
                    </div>
                  )
                })
              ) : busquedaVeterinario ? (
                <div className="no-veterinarios">
                  No se encontraron veterinarios que coincidan con "{busquedaVeterinario}"
                </div>
              ) : (
                <div className="no-veterinarios">
                  {veterinarios.length === 0 ? "No hay veterinarios disponibles" : "Escribe para buscar veterinarios"}
                </div>
              )}
            </div>
          </div>

          {/* Veterinario actual */}
          {vacaParaAsignar?.nombre_veterinario && (
            <div className="veterinario-actual">
              <strong>Veterinario actual:</strong> {vacaParaAsignar.nombre_veterinario}
            </div>
          )}
        </div>

        <div className="modal-veterinario-buttons">
          <button type="button" onClick={cerrarModalAsignarVet} className="btn-cancelar-veterinario">
            Cancelar
          </button>
          <button
            onClick={asignarVeterinario}
            disabled={!veterinarioSeleccionado}
            className="btn-asignar-veterinario-modal"
          >
            {veterinarioSeleccionado === "null"
              ? "Quitar Veterinario"
              : vacaParaAsignar?.nombre_veterinario
                ? "Cambiar"
                : "Asignar"}
          </button>
        </div>
      </dialog>

      {vacaAEliminar && (
        <ConfirmacionModal
          titulo="Eliminar Vaca"
          mensaje={`¿Está seguro que desea eliminar la vaca "${vacaAEliminar.codigo}"? Esta acción no se puede deshacer.`}
          onConfirm={eliminarVaca}
          onCancel={cancelarEliminar}
        />
      )}
    </>
  )
}

export default ListVacas
