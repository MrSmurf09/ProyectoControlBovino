import { useState, useEffect } from 'react'
import styles from './Snackbar.module.css'

const Snackbar = ({ message, show, setShow, type = 'success', duration = 3000 }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setShow(false)
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [show, setShow, duration])

  if (!show) return null

  return (
    <div className={`${styles.snackbar} ${styles[type]}`}>
    <div className={styles.snackbarBackground}></div>
    <div className={styles.snackbarContent}>
      <span>{message}</span>
      <button onClick={() => setShow(false)} className={styles.snackbarClose}>×</button>
    </div>
  </div>
  )
}
  
export default Snackbar