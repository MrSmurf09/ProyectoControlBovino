import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import "../../Style/Inicio/Inicio.css"
import { useSnackbar } from "../../Context/SnackbarContext"
import { useAppData } from "../../Context/AppContext"
import { isTokenValid } from "../../utils/auth"
import RecuperarContraseñaModal from "../../components/RecuperarContraseña/RecuperarContraseñaModal"

function Inicio() {
  const [Correo, setCorreo] = useState("")
  const [Contraseña, setContraseña] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const navigate = useNavigate()
  const { showSnackbar } = useSnackbar()
  const {
    setUserId,
    setNombreUser,
    setRol,
    setToken,
    setFincaId,
    setFincaNombre,
    setPotreroId,
    setPotreroNombre,
    token,
    userId,
  } = useAppData()

  const setinfousuario = (data) => {
    setUserId(data.userId)
    localStorage.setItem("userId", data.userId)
    setNombreUser(data.Nombre)
    localStorage.setItem("nombreUser", data.Nombre)
    setRol(data.rol)
    localStorage.setItem("rol", data.rol)
    setToken(data.token)
    localStorage.setItem("token", data.token)
  }

  useEffect(() => {
    if (token && userId && isTokenValid(token)) {
      navigate(`/Home/${userId}`)
    } else {
      setUserId(null)
      setNombreUser(null)
      setToken(null)
      setFincaId(null)
      setFincaNombre(null)
      setPotreroId(null)
      setPotreroNombre(null)
      setRol(null)

      // Limpiar localStorage
      localStorage.removeItem("userId")
      localStorage.removeItem("fincaId")
      localStorage.removeItem("potreroId")
      localStorage.removeItem("rol")

      // También podemos limpiar cualquier otro dato de sesión que exista
      localStorage.removeItem("token")

      // Solo mostrar el mensaje si hay un token inválido
      if (token) {
        showSnackbar("La sesión ha caducado, por favor, inicia sesión nuevamente", "info")
      }

      // No redirigir aquí si ya estamos en la página de inicio
      if (window.location.pathname !== "/") {
        navigate("/")
      }
    }
  }, [token, userId, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/usuario/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Correo, Contraseña }),
      })

      const data = await response.json()

      if (response.ok) {
        // Guarda el ID del usuario y el token
        setinfousuario(data)

        // Redirigir a la página de inicio después de iniciar sesión
        showSnackbar("Sesión iniciada exitosamente", "success")
        navigate(`/Home/${data.userId}`)
      } else {
        console.log(data.message) // Mostrar error si las credenciales no son válidas
        showSnackbar(`Error: ${data.message}`, "error")
      }
    } catch (err) {
      console.log(err.message)
      showSnackbar(err.message, "error")
    }
  }

  const openRecuperarModal = () => {
    setModalOpen(true)
  }

  const closeRecuperarModal = () => {
    setModalOpen(false)
  }

  return (
    <div className="body">
      <div className="centrar_inicio">
        <img src="https://i.postimg.cc/zD0RMBZy/logo-removebg.png" alt="Logo" className="logo" />
        <form className="form_inicio" onSubmit={handleSubmit}>
          <div className="alinear_input_inicio">
            <label className="input_label_inicio">Usuario:</label>
            <input
              type="email"
              className="input_inicio"
              placeholder="Ingrese su Usuario"
              value={Correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>
          <div className="alinear_input_inicio">
            <label className="input_label_inicio">Contraseña:</label>
            <input
              type="password"
              className="input_inicio"
              placeholder="Ingrese su Contraseña"
              value={Contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn_inicio">
            Iniciar Sesión
          </button>
          <div className="enlaces-adicionales">
            <Link to="/Registrarse" className="registrarse">
              ¿Registrate?
            </Link>
            <button type="button" className="recuperar-contraseña" onClick={openRecuperarModal}>
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </form>
      </div>

      {modalOpen && <RecuperarContraseñaModal onClose={closeRecuperarModal} showSnackbar={showSnackbar} />}
    </div>
  )
}

export default Inicio
