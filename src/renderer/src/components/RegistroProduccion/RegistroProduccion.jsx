"use client"

import "../RegistroProduccion/registroproduccion.css"
import { useRef, useState, useEffect, useMemo } from "react"
import { useSnackbar } from "../../Context/SnackbarContext"

const RegistroProduccion = ({ id }) => {
  const [registros, setRegistros] = useState([]) // Todos los registros del historial
  const [registrosFiltrados, setRegistrosFiltrados] = useState([]) // Para futuras funcionalidades de filtrado
  const [formData, setFormData] = useState({
    Fecha: "",
    Cantidad: "",
  })
  const { showSnackbar } = useSnackbar()

  // Obtener el historial completo de producción de leche desde la API
  const obtenerHistorial = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/historial/produccion/${id}`)
      const data = await response.json()
      console.log("Data de los registros:", data)
      if (response.ok) {
        // Ordenar registros por fecha (más recientes primero)
        const registrosOrdenados = ordenarRegistrosPorFecha(data.registros)
        setRegistros(registrosOrdenados)
        setRegistrosFiltrados(registrosOrdenados) // Inicialmente mostramos todos
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

  // Función para detectar bajada significativa en la producción
  const detectarBajadaProduccion = (nuevaCantidad, historialCompleto) => {
    if (historialCompleto.length === 0) return false

    const ultimoRegistro = historialCompleto[0] // El más reciente
    const cantidadAnterior = Number.parseFloat(ultimoRegistro.Cantidad)
    const cantidadNueva = Number.parseFloat(nuevaCantidad)

    // Calcular el porcentaje de reducción
    const porcentajeReduccion = ((cantidadAnterior - cantidadNueva) / cantidadAnterior) * 100

    // Considerar bajada significativa si es mayor al 25%
    const UMBRAL_BAJADA = 25

    return {
      esBajadaSignificativa: porcentajeReduccion >= UMBRAL_BAJADA,
      porcentajeReduccion: porcentajeReduccion.toFixed(1),
      cantidadAnterior,
      cantidadNueva,
    }
  }

  // Función para calcular promedio de los últimos registros del historial
  const calcularPromedioReciente = (historialCompleto, numeroRegistros = 5) => {
    if (historialCompleto.length === 0) return 0

    const registrosParaPromedio = historialCompleto.slice(0, numeroRegistros)
    const suma = registrosParaPromedio.reduce((acc, registro) => acc + Number.parseFloat(registro.Cantidad), 0)
    return suma / registrosParaPromedio.length
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/registrar/leche/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (response.ok) {
        // Detectar bajada de producción antes de actualizar los registros
        const analisisBajada = detectarBajadaProduccion(formData.Cantidad, registros)

        // Actualizar el historial completo obteniendo los datos frescos
        await obtenerHistorial()

        closeModal()

        // Limpiar el formulario
        setFormData({
          Fecha: "",
          Cantidad: "",
        })

        // Mostrar mensaje de éxito
        showSnackbar("Producción de leche registrada exitosamente", "success")

        // Verificar si hay bajada significativa y mostrar alerta
        if (analisisBajada.esBajadaSignificativa) {
          setTimeout(() => {
            showSnackbar(
              `⚠️ ALERTA: La producción ha bajado un ${analisisBajada.porcentajeReduccion}% (de ${analisisBajada.cantidadAnterior}L a ${analisisBajada.cantidadNueva}L). Se recomienda revisar la salud de la vaca.`,
              "warning",
            )
          }, 1500) // Mostrar después del mensaje de éxito
        }

        // Verificar si está por debajo del promedio reciente usando el historial completo
        const promedioReciente = calcularPromedioReciente(registros, 5)
        const cantidadNueva = Number.parseFloat(formData.Cantidad)

        if (registros.length >= 3 && cantidadNueva < promedioReciente * 0.8) {
          setTimeout(() => {
            showSnackbar(
              `📊 La producción actual (${cantidadNueva}L) está por debajo del promedio reciente (${promedioReciente.toFixed(1)}L)`,
              "info",
            )
          }, 3000) // Mostrar después de la alerta principal
        }
      } else {
        showSnackbar(`Error: ${data.message}`, "error")
        closeModal()
        console.error("Error:", data.message)
      }
    } catch (error) {
      console.error("Error al registrar la produccion de leche:", error)
      showSnackbar("Error al registrar la producción de leche", "error")
    }
  }

  useEffect(() => {
    obtenerHistorial()
  }, [id])

  const modalRef = useRef(null)

  const openModal = () => {
    modalRef.current.showModal()
  }

  const closeModal = () => {
    modalRef.current.close()
    // Limpiar formulario al cerrar
    setFormData({
      Fecha: "",
      Cantidad: "",
    })
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

  // Registros limitados a los 6 más recientes para mostrar en la UI
  const registrosMostrados = useMemo(() => {
    return registrosFiltrados.slice(0, 6)
  }, [registrosFiltrados])

  // Calcular estadísticas usando TODO el historial de registros
  const estadisticas = useMemo(() => {
    if (registros.length === 0) return null

    const cantidades = registros.map((r) => Number.parseFloat(r.Cantidad))
    const promedio = cantidades.reduce((a, b) => a + b, 0) / cantidades.length
    const maximo = Math.max(...cantidades)
    const minimo = Math.min(...cantidades)

    // Calcular tendencia (comparar últimos 3 vs anteriores 3)
    let tendencia = "estable"
    if (registros.length >= 6) {
      const ultimosTres = cantidades.slice(0, 3)
      const anterioresTres = cantidades.slice(3, 6)
      const promedioUltimos = ultimosTres.reduce((a, b) => a + b, 0) / ultimosTres.length
      const promedioAnteriores = anterioresTres.reduce((a, b) => a + b, 0) / anterioresTres.length

      if (promedioUltimos > promedioAnteriores * 1.1) {
        tendencia = "creciente"
      } else if (promedioUltimos < promedioAnteriores * 0.9) {
        tendencia = "decreciente"
      }
    }

    return {
      promedio: promedio.toFixed(1),
      maximo,
      minimo,
      total: registros.length,
      tendencia,
      promedioUltimos7Dias:
        registros.length >= 7
          ? (registros.slice(0, 7).reduce((acc, r) => acc + Number.parseFloat(r.Cantidad), 0) / 7).toFixed(1)
          : promedio.toFixed(1),
    }
  }, [registros]) // Usar registros completos, no solo los mostrados

  // Función para obtener el color de la tendencia
  const getColorTendencia = (tendencia) => {
    switch (tendencia) {
      case "creciente":
        return "#10b981" // Verde
      case "decreciente":
        return "#ef4444" // Rojo
      default:
        return "#6b7280" // Gris
    }
  }

  // Función para obtener el ícono de la tendencia
  const getIconoTendencia = (tendencia) => {
    switch (tendencia) {
      case "creciente":
        return "📈"
      case "decreciente":
        return "📉"
      default:
        return "➡️"
    }
  }

  return (
    <>
      <section className="registro-produccion">
        <h2>Registro de producción de leche</h2>

        {/* Mostrar estadísticas basadas en el historial completo */}
        {estadisticas && (
          <div className="estadisticas-produccion">
            <div className="stat-item">
              <span className="stat-label">Promedio Total</span>
              <span className="stat-value">{estadisticas.promedio}L</span>
              <span className="stat-subtitle">({estadisticas.total} registros)</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Últimos 7 días</span>
              <span className="stat-value">{estadisticas.promedioUltimos7Dias}L</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Máximo</span>
              <span className="stat-value">{estadisticas.maximo}L</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Mínimo</span>
              <span className="stat-value">{estadisticas.minimo}L</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tendencia</span>
              <span className="stat-value" style={{ color: getColorTendencia(estadisticas.tendencia) }}>
                {getIconoTendencia(estadisticas.tendencia)} {estadisticas.tendencia}
              </span>
            </div>
          </div>
        )}

        <button onClick={openModal} className="btn-agregar">
          Añadir registro
        </button>

        <div className="registros">
          {registrosMostrados.length > 0 ? (
            registrosMostrados.map((registro, index) => {
              const esElMasReciente = index === 0
              const cantidad = Number.parseFloat(registro.Cantidad)

              // Determinar si es una cantidad baja comparada con el promedio del historial completo
              let claseAlerta = ""
              if (estadisticas && cantidad < Number.parseFloat(estadisticas.promedio) * 0.7) {
                claseAlerta = "registro-bajo"
              } else if (estadisticas && cantidad > Number.parseFloat(estadisticas.promedio) * 1.3) {
                claseAlerta = "registro-alto"
              }

              return (
                <div
                  className={`registro-item ${esElMasReciente ? "registro-reciente" : ""} ${claseAlerta}`}
                  key={registro.id || index}
                >
                  <p>
                    <strong>Fecha:</strong> {formatFecha(registro.Fecha)}
                    {esElMasReciente && <span className="badge-reciente">Más reciente</span>}
                  </p>
                  <p>
                    <strong>Cantidad de litros:</strong> {registro.Cantidad}L
                    {claseAlerta === "registro-bajo" && <span className="badge-alerta">⚠️ Bajo</span>}
                    {claseAlerta === "registro-alto" && <span className="badge-excelente">🌟 Excelente</span>}
                  </p>
                </div>
              )
            })
          ) : (
            <p className="no-registros">No hay registros para esta vaca</p>
          )}

          {/* Mostrar indicador si hay más registros */}
          {registros.length > 6 && (
            <div className="mas-registros">
              <p>📊 Mostrando los 6 registros más recientes de {registros.length} total</p>
            </div>
          )}
        </div>
      </section>

      <dialog ref={modalRef} className="modal">
        <h3 className="title-modal">Registro de producción de leche</h3>
        <form method="dialog" onSubmit={handleSubmit}>
          <input
            className="input"
            id="cantidad-litros"
            type="number"
            step="0.1"
            min="0"
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
