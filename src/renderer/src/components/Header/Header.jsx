import './header.css'
import { useAppData } from '../../Context/AppContext'
import { useSnackbar } from '../../Context/SnackbarContext'
import { FaRegUserCircle } from 'react-icons/fa'
import { useState, useEffect, useRef } from 'react'
import { FiSettings, FiLogOut } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom' 

function Header({mostrarBotonCrear = true, mostrarInputBusqueda = true, TextButton, TextHeader, openCreateModal, onBuscar, TextBuscar }) {
  const [busqueda, setBusqueda] = useState("")

  const handleChange = (e) => {
    const valor = e.target.value
    setBusqueda(valor)
    if (onBuscar) {
      onBuscar(valor)
    }
  }

  const { 
    nombreUser, 
    setUserId, 
    setNombreUser,
    rol,
    setRol,
    setToken,
    setFincaId, 
    setFincaNombre, 
    setPotreroId, 
    setPotreroNombre,
    userId
  } = useAppData()
  
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userContainerRef = useRef(null)
  const { showSnackbar } = useSnackbar()
  const navigate = useNavigate() 
  
  const handleLogout = () => {
    // Limpiar todos los estados del contexto
    setUserId(null)
    setNombreUser(null)
    setToken(null)
    setFincaId(null)
    setFincaNombre(null)
    setPotreroId(null)
    setPotreroNombre(null)
    setRol(null)
    localStorage.removeItem(`recomendacion_vista_${userId}`, "true")
    
    // Limpiar localStorage
    localStorage.removeItem('userId')
    localStorage.removeItem('fincaId')
    localStorage.removeItem('potreroId')
    localStorage.removeItem('rol')
    
    // También podemos limpiar cualquier otro dato de sesión que exista
    localStorage.removeItem('token') 

    showSnackbar('Sesión cerrada exitosamente', 'success')

    // Cerrar el dropdown
    setShowUserMenu(false)
    
    // Redireccionar a la página de login
    navigate('/') 
  }
  
  const handleSettings = () => {
    // Implementar la navegación a configuración
    //navigate('/configuracion') 
    setShowUserMenu(false) // Cerrar el dropdown después de navegar
  }

  // Efecto para cerrar el dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userContainerRef.current && !userContainerRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    
    // Añadir el event listener solo cuando el menú está abierto
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    // Limpiar el event listener cuando el componente se desmonta o el menú se cierra
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  return (
    <>
      <header className="header">
        <div className="logo">
          <img src="https://i.postimg.cc/zD0RMBZy/logo-removebg.png" alt="Logo" className="logo" />
        </div>
        {mostrarInputBusqueda && (
        <div className="search-bar">
          <input type="text" placeholder={TextBuscar} value={busqueda} onChange={handleChange} />
        </div>
        )}
        <div className='header-icons'>
        {rol === "Ganadero" && mostrarBotonCrear && (
          <button onClick={openCreateModal} className="create-farm-btn">{TextButton}</button>
        )}
        <div 
          className='user-container'
          ref={userContainerRef}
        >
          <div 
            className="user-info"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <FaRegUserCircle className="user-icon" />
            <span className="user-name">{rol}: {nombreUser}</span>
          </div>
          
          {/* Dropdown menu */}
          {showUserMenu && (
            <div className="user-dropdown">
              <div className="dropdown-item dropdown-logout" onClick={handleLogout}>
                <FiLogOut className="dropdown-icon" />
                <span>Cerrar sesión</span>
              </div>
            </div>
          )}
        </div>
        </div>
      </header>
      <div className="fincas-header">
        <h2>{ rol === "Ganadero" ? TextHeader : ""}</h2>
      </div>
    </>
  )
}

export default Header