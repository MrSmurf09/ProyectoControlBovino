import { useState, useEffect } from "react"
import "./RecuperarContraseñaModal.css"

const RecuperarContraseñaModal = ({ onClose, showSnackbar }) => {
  const [etapa, setEtapa] = useState(1) // 1: Ingresar correo, 2: Ingresar código, 3: Nueva contraseña
  const [correo, setCorreo] = useState("")
  const [codigo, setCodigo] = useState("")
  const [nuevaContraseña, setNuevaContraseña] = useState("")
  const [confirmarContraseña, setConfirmarContraseña] = useState("")
  const [tiempoRestante, setTiempoRestante] = useState(60) // 60 segundos = 1 minuto
  const [cargando, setCargando] = useState(false)
  const [codigoEnviado, setCodigoEnviado] = useState(false)

  // Temporizador para el código de verificación
  useEffect(() => {
    let intervalo = null

    if (codigoEnviado && tiempoRestante > 0) {
      intervalo = setInterval(() => {
        setTiempoRestante((tiempo) => tiempo - 1)
      }, 1000)
    } else if (tiempoRestante === 0) {
      // El código ha expirado
      if (etapa === 2) {
        showSnackbar("El código ha expirado. Por favor, solicita uno nuevo.", "warning")
        setEtapa(1) // Volver a la etapa de ingresar correo
        setCodigoEnviado(false)
      }
    }

    return () => clearInterval(intervalo)
  }, [codigoEnviado, tiempoRestante, etapa, showSnackbar])

  const handleEnviarCodigo = async (e) => {
    e.preventDefault()

    if (!correo) {
      showSnackbar("Por favor, ingresa tu correo electrónico", "warning")
      return
    }

    setCargando(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/usuario/recuperar-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Correo: correo }),
      })

      const data = await response.json()

      if (response.ok) {
        showSnackbar("Se ha enviado un código de verificación a tu correo", "success")
        setEtapa(2) // Avanzar a la etapa de ingresar código
        setCodigoEnviado(true)
        setTiempoRestante(60) // Reiniciar el temporizador
      } else {
        showSnackbar(`Error: ${data.message}`, "error")
      }
    } catch (err) {
      showSnackbar("Error al conectar con el servidor", "error")
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  const handleVerificarCodigo = async (e) => {
    e.preventDefault()

    if (!codigo) {
      showSnackbar("Por favor, ingresa el código de verificación", "warning")
      return
    }

    setCargando(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/usuario/verificar-codigo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Correo: correo, Codigo: codigo }),
      })

      const data = await response.json()

      if (response.ok) {
        showSnackbar("Código verificado correctamente", "success")
        setEtapa(3) // Avanzar a la etapa de cambiar contraseña
      } else {
        showSnackbar(`Error: ${data.message}`, "error")
      }
    } catch (err) {
      showSnackbar("Error al conectar con el servidor", "error")
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  const handleCambiarContraseña = async (e) => {
    e.preventDefault()

    if (!nuevaContraseña || !confirmarContraseña) {
      showSnackbar("Por favor, completa todos los campos", "warning")
      return
    }

    if (nuevaContraseña !== confirmarContraseña) {
      showSnackbar("Las contraseñas no coinciden", "warning")
      return
    }

    if (nuevaContraseña.length < 6) {
      showSnackbar("La contraseña debe tener al menos 6 caracteres", "warning")
      return
    }

    setCargando(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/usuario/cambiar-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Correo: correo,
          Codigo: codigo,
          NuevaContraseña: nuevaContraseña,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        showSnackbar("Contraseña cambiada exitosamente", "success")
        onClose() // Cerrar el modal
      } else {
        showSnackbar(`Error: ${data.message}`, "error")
      }
    } catch (err) {
      showSnackbar("Error al conectar con el servidor", "error")
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  const handleSolicitarNuevoCodigo = () => {
    setEtapa(1)
    setCodigoEnviado(false)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-recuperar">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h2>Recuperar Contraseña</h2>

        {etapa === 1 && (
          <form onSubmit={handleEnviarCodigo}>
            <div className="form-group">
              <label>Correo Electrónico:</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="Ingresa tu correo electrónico"
                required
              />
            </div>
            <button type="submit" className="btn-enviar" disabled={cargando}>
              {cargando ? "Enviando..." : "Enviar Código"}
            </button>
          </form>
        )}

        {etapa === 2 && (
          <form onSubmit={handleVerificarCodigo}>
            <div className="form-group">
              <label>Código de Verificación:</label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ingresa el código recibido"
                required
              />
              <div className="tiempo-restante">Tiempo restante: {tiempoRestante} segundos</div>
            </div>
            <div className="botones-grupo">
              <button type="submit" className="btn-verificar" disabled={cargando}>
                {cargando ? "Verificando..." : "Verificar Código"}
              </button>
              <button type="button" className="btn-nuevo-codigo" onClick={handleSolicitarNuevoCodigo}>
                Solicitar nuevo código
              </button>
            </div>
          </form>
        )}

        {etapa === 3 && (
          <form onSubmit={handleCambiarContraseña}>
            <div className="form-group">
              <label>Nueva Contraseña:</label>
              <input
                type="password"
                value={nuevaContraseña}
                onChange={(e) => setNuevaContraseña(e.target.value)}
                placeholder="Ingresa tu nueva contraseña"
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label>Confirmar Contraseña:</label>
              <input
                type="password"
                value={confirmarContraseña}
                onChange={(e) => setConfirmarContraseña(e.target.value)}
                placeholder="Confirma tu nueva contraseña"
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn-cambiar" disabled={cargando}>
              {cargando ? "Cambiando..." : "Cambiar Contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default RecuperarContraseñaModal
