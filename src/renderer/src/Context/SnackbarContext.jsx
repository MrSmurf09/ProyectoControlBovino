import { createContext, useState, useContext } from 'react'
import Snackbar from '../components/SnackBar/Snackbar'

const SnackbarContext = createContext()

export const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    show: false,
    message: '',
    type: 'success',
    duration: 3000
  })

  const showSnackbar = (message, type = 'success', duration = 3000) => {
    setSnackbar({
      show: true,
      message,
      type,
      duration
    })
  }

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar 
        message={snackbar.message}
        show={snackbar.show}
        setShow={(show) => setSnackbar(prev => ({ ...prev, show: false }))}
        type={snackbar.type}
        duration={snackbar.duration}
      />
    </SnackbarContext.Provider>
  )
}

export const useSnackbar = () => useContext(SnackbarContext)