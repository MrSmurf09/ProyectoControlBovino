import '../RegistroProduccion/registroproduccion.css'
import { useState, useEffect, useRef, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { useSnackbar } from '../../Context/SnackbarContext'

const HistorialProduccion = ({ id }) => {
  const [registros, setRegistros] = useState([])
  const [registrosFiltrados, setRegistrosFiltrados] = useState([])
  const [vacaInfo, setVacaInfo] = useState(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [filtroActivo, setFiltroActivo] = useState(false)
  
  // Estados para los filtros
  const [mesInicio, setMesInicio] = useState('')
  const [anioInicio, setAnioInicio] = useState('')
  const [mesFin, setMesFin] = useState('')
  const [anioFin, setAnioFin] = useState('')

  // Estado para el snackbar
  const { showSnackbar } = useSnackbar()
  
  const graficoRef = useRef(null)
  const modalRef = useRef(null)

  const obtenerHistorial = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/historial/produccion/${id}`)
      const data = await response.json()
      console.log('Data de los registros:', data)
      if (response.ok) {
        setRegistros(data.registros)
        setRegistrosFiltrados(data.registros) // Inicialmente mostramos todos
      } else {
        console.error('Error al obtener los registros:', data.message)
      }
    } catch (error) {
      console.error('Error al obtener los registros:', error)
    }
  }

  // Función para obtener la información de la vaca
  const obtenerInfoVaca = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vacas/perfil/${id}`)
      const data = await response.json()
      if (response.ok) {
        setVacaInfo(data.vaca[0])
        return data.vaca[0]
      } else {
        console.error('Error al obtener la vaca:', data.message)
        return null
      }
    } catch (error) {
      console.error('Error al obtener la vaca:', error)
      return null
    }
  }

  useEffect(() => {
    obtenerHistorial()
  }, [id])

  // Obtener años únicos para los selectores
  const aniosDisponibles = useMemo(() => {
    if (!registros.length) return []
    
    const anios = registros.map(registro => 
      new Date(registro.Fecha).getFullYear()
    )
    return [...new Set(anios)].sort((a, b) => a - b)
  }, [registros])

  const formatFecha = (fecha) => {
    if (!fecha) return 'No registrada'
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const getNombreMes = (numeroMes) => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    return meses[numeroMes - 1]
  }

  // Función para aplicar el filtro
  const aplicarFiltro = () => {
    if (!mesInicio || !anioInicio || !mesFin || !anioFin) {
      showSnackbar('Por favor selecciona un rango de fechas completo', 'warning')
      return
    }

    const fechaInicio = new Date(anioInicio, mesInicio - 1, 1)
    const fechaFin = new Date(anioFin, mesFin, +1) // Último día del mes seleccionado
    console.log("Fecha inicio:", fechaInicio)
    console.log("Fecha fin:", fechaFin)
    
    const registrosFiltrados = registros.filter(registro => {
      const fechaRegistro = new Date(registro.Fecha)
      return fechaRegistro >= fechaInicio && fechaRegistro <= fechaFin
    })
    
    setRegistrosFiltrados(registrosFiltrados)
    setFiltroActivo(true)
    showSnackbar('Filtro aplicado exitosamente', 'success')
  }

  // Función para resetear el filtro
  const resetearFiltro = () => {
    setMesInicio('')
    setAnioInicio('')
    setMesFin('')
    setAnioFin('')
    setRegistrosFiltrados(registros)
    setFiltroActivo(false)
    showSnackbar('Filtro reseteado exitosamente', 'info')
  }

  const dataGrafica = useMemo(() => {
    return registrosFiltrados.map(registro => ({
      fecha: registro.Fecha,
      cantidad: registro.Cantidad
    }))
  }, [registrosFiltrados])

  const openModal = () => {
    modalRef.current.showModal()
  }

  const closeModal = () => {
    modalRef.current.close()
  }

  // Función para generar el PDF
  const generarPDF = async () => {
    setIsGeneratingPDF(true)
    
    try {
      // Obtener la información de la vaca si aún no la tenemos
      let infoVaca = vacaInfo
      if (!infoVaca) {
        infoVaca = await obtenerInfoVaca()
        if (!infoVaca) {
          showSnackbar('No se pudo obtener la información de la vaca para el PDF', 'error')
          setIsGeneratingPDF(false)
          return
        }
      }

      const doc = new jsPDF('p', 'mm', 'a4')
      
      // Título
      doc.setFontSize(18)
      doc.text("CONTROL BOVINO - REPORTE DE PRODUCCIÓN", 105, 15, { align: "center" })
      
      // Información de la vaca
      doc.setFontSize(14)
      doc.text("Información del Bovino", 20, 30)
      
      doc.setFontSize(10)
      doc.text(`Código: ${infoVaca.Codigo || 'No disponible'}`, 20, 40)
      doc.text(`Edad: ${infoVaca.Edad || 'No disponible'}`, 20, 45)
      doc.text(`Raza: ${infoVaca.Raza || 'No disponible'}`, 20, 50)
      doc.text(`Novedades Sanitarias: ${infoVaca.Novedad_Sanitaria || 'Sin novedades'}`, 20, 55)
      
      doc.text(`Vacunas: ${infoVaca.Vacunas || 'No registradas'}`, 120, 40)
      
      if (infoVaca.Fecha_Desparacitada) {
        doc.text(`Desparasitación: Sí`, 120, 45)
        doc.text(`Fecha: ${infoVaca.Fecha_Desparacitada}`, 120, 50)
      } else {
        doc.text(`Desparasitación: No`, 120, 45)
      }
      
      if (infoVaca.Fecha_Embarazo) {
        doc.text(`Embarazo: Sí`, 120, 55)
        doc.text(`Fecha: ${infoVaca.Fecha_Embarazo}`, 120, 60)
      } else {
        doc.text(`Embarazo: No`, 120, 55)
      }
      
      // Información del filtro aplicado
      if (filtroActivo) {
        doc.text(`Período: ${getNombreMes(parseInt(mesInicio))} ${anioInicio} - ${getNombreMes(parseInt(mesFin))} ${anioFin}`, 20, 65)
      } else {
        doc.text(`Período: Todos los registros`, 20, 65)
      }
      
      // Historial de producción
      doc.setFontSize(14)
      doc.text("Historial de Producción de Leche", 20, 75)
      
      // Tabla de producción
      doc.setFontSize(10)
      doc.text("Fecha", 30, 85)
      doc.text("Litros", 80, 85)
      
      const y = 90
      registrosFiltrados.slice(0, 8).forEach((registro, index) => {
        doc.text(registro.Fecha, 30, y + index * 5)
        doc.text(registro.Cantidad.toString(), 80, y + index * 5)
      })
      
      // Título de la gráfica
      doc.setFontSize(14)
      doc.text("Gráfica de Producción", 20, 135)
      
      // Capturar la gráfica que ya está visible en el modal
      if (graficoRef.current) {
        const canvas = await html2canvas(graficoRef.current, {
          scale: 2,
          logging: false,
          useCORS: true
        })
        
        const imgData = canvas.toDataURL('image/png')
        doc.addImage(imgData, 'PNG', 20, 140, 170, 80)
      }
      
      // Información adicional
      doc.setFontSize(12)
      doc.text("Información Adicional", 20, 230)
      doc.setFontSize(10)
      
      // Calcular promedio y total
      const total = registrosFiltrados.reduce((sum, registro) => sum + registro.Cantidad, 0)
      const promedio = registrosFiltrados.length > 0 ? (total / registrosFiltrados.length).toFixed(1) : 0
      
      doc.text(`Promedio de producción: ${promedio} litros`, 20, 240)
      doc.text(`Producción total: ${total} litros`, 20, 245)
      doc.text(`Cantidad de registros: ${registrosFiltrados.length}`, 20, 250)
      doc.text("Observaciones: Producción registrada según datos del sistema.", 20, 255)
      
      // Recomendaciones
      doc.text("Recomendaciones:", 20, 265)
      doc.text("- Mantener la dieta actual para sostener los niveles de producción", 20, 270)
      doc.text("- Programar revisión veterinaria para el próximo mes", 20, 275)
      doc.text("- Monitorear el estado de salud regularmente", 20, 280)
      
      // Pie de página
      doc.setFontSize(8)
      doc.text("Generado el: " + new Date().toLocaleDateString(), 20, 290)
      doc.text("Control Bovino - Sistema de Gestión Ganadera", 105, 290, { align: "center" })
      
      doc.save(`reporte-produccion-${infoVaca.Codigo || id}.pdf`)
    } catch (error) {
      console.error("Error al generar el PDF:", error)
      showSnackbar("Ocurrió un error al generar el PDF. Por favor, inténtalo de nuevo.", "error")
    } finally {
      setIsGeneratingPDF(false)
      showSnackbar("Generación de PDF finalizada exitosamente", "success")
    }
  }

  return (
    <>
      <section className="registro-produccion">
        <div className="header-section">
          <h2>Historial de Producción de Leche</h2>
          <button className='btn-agregar' onClick={openModal}>Ver gráfica</button>
        </div>
        
        {/* Filtros de fecha */}
        <div className="filtros-container">
          <h3>Filtrar por período</h3>
          <div className="filtros-fecha">
            <div className="filtro-grupo">
              <label>Desde:</label>
              <div className="select-grupo">
                <select 
                  value={mesInicio} 
                  onChange={(e) => setMesInicio(e.target.value)}
                  className="select-mes"
                >
                  <option value="">Mes</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(mes => (
                    <option key={`inicio-${mes}`} value={mes}>
                      {getNombreMes(mes)}
                    </option>
                  ))}
                </select>
                
                <select 
                  value={anioInicio} 
                  onChange={(e) => setAnioInicio(e.target.value)}
                  className="select-anio"
                >
                  <option value="">Año</option>
                  {aniosDisponibles.map(anio => (
                    <option key={`inicio-${anio}`} value={anio}>{anio}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="filtro-grupo">
              <label>Hasta:</label>
              <div className="select-grupo">
                <select 
                  value={mesFin} 
                  onChange={(e) => setMesFin(e.target.value)}
                  className="select-mes"
                >
                  <option value="">Mes</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(mes => (
                    <option key={`fin-${mes}`} value={mes}>
                      {getNombreMes(mes)}
                    </option>
                  ))}
                </select>
                
                <select 
                  value={anioFin} 
                  onChange={(e) => setAnioFin(e.target.value)}
                  className="select-anio"
                >
                  <option value="">Año</option>
                  {aniosDisponibles.map(anio => (
                    <option key={`fin-${anio}`} value={anio}>{anio}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="filtro-botones">
              <button 
                className="btn-aplicar-filtro" 
                onClick={aplicarFiltro}
              >
                Aplicar filtro
              </button>
              <button 
                className="btn-resetear-filtro" 
                onClick={resetearFiltro}
              >
                Ver todos
              </button>
            </div>
          </div>
          
          {filtroActivo && (
            <div className="filtro-activo">
              <p>
                Mostrando registros desde {getNombreMes(parseInt(mesInicio))} {anioInicio} hasta {getNombreMes(parseInt(mesFin))} {anioFin}
                ({registrosFiltrados.length} registros)
              </p>
            </div>
          )}
        </div>
        
        <div className="registros">
          {registrosFiltrados.length > 0 ? (
            registrosFiltrados.map((registro, index) => (
              <div className="registro-item" key={registro.id || index}>
                <p><strong>Fecha:</strong> {registro.Fecha}</p>
                <p><strong>Cantidad de litros:</strong> {registro.Cantidad}</p>
              </div>
            ))
          ) : (
            <p className="no-registros">No hay registros para el período seleccionado</p>
          )}
        </div>
      </section>

      {/* MODAL CON GRÁFICA MÁS ANCHA */}
      <dialog ref={modalRef} className="modal">
        <h3 className="title-modal">Gráfica de Producción de Leche</h3>
        
        {filtroActivo && (
          <div className="filtro-info">
            <p>Período: {getNombreMes(parseInt(mesInicio))} {anioInicio} - {getNombreMes(parseInt(mesFin))} {anioFin}</p>
          </div>
        )}
        
        <div className="grafica-container" ref={graficoRef}>
          {dataGrafica.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={dataGrafica} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="0 0" />
                <XAxis dataKey="fecha" fontSize={12} interval={3}/>
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#007bff" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data-message">
              <p>No hay datos para mostrar en el período seleccionado</p>
            </div>
          )}
        </div>
        
        <button onClick={closeModal} className="btn-cerrar-modal">Cerrar</button>
        <button 
          className="btn-generar-pdf" 
          onClick={generarPDF}
          disabled={isGeneratingPDF || registrosFiltrados.length === 0}
        >
          {isGeneratingPDF ? 'Generando...' : 'Generar PDF'}
        </button>
      </dialog>
    </>
  )
}

export default HistorialProduccion