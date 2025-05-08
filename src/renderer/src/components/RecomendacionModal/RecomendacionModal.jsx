"use client"

import { useEffect, useRef } from "react"
import "./RecomendacionModal.css"

function RecomendacionModal({ onClose }) {
  const modalRef = useRef(null)

  useEffect(() => {
    // Asegurarse de que el modal se abra cuando el componente se monte
    if (modalRef.current) {
      modalRef.current.showModal()
    }

    // Prevenir que el cuerpo de la página se desplace cuando el modal está abierto
    document.body.style.overflow = "hidden"

    // Restaurar el desplazamiento cuando el componente se desmonte
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <dialog ref={modalRef} className="recomendacion-modal">
      <div className="recomendacion-content">
        <h2 className="recomendacion-title">Recomendación técnica para su finca</h2>

        <div className="recomendacion-body">
          <p className="recomendacion-body-text">¡Bienvenido a la plataforma de control bovino!</p>
          <p>
            Recuerde que la calidad de la leche producida en su finca debe cumplir con estándares internacionales como
            la ISO 707 (muestreo), ISO 2446 (contenido de grasa) e ISO 2447 (sólidos no grasos).
          </p>
          <p>
            En Colombia, también aplica la Resolución 017 de 2012 del Ministerio de Agricultura, que define los
            parámetros para leche cruda de alta calidad.
          </p>
          <p>
            Mantenga registros claros y consistentes para mejorar la trazabilidad y el rendimiento de su producción.
          </p>
        </div>

        <div className="recomendacion-footer">
          <button onClick={handleClose} className="btn-entendido">
            Entendido
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default RecomendacionModal
