import { useEffect, useRef } from "react"
import "./ConfirmacionModal.css"

function ConfirmacionModal({ onConfirm, onCancel, mensaje, titulo }) {
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

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  return (
    <dialog ref={modalRef} className="confirmacion-modal">
      <div className="confirmacion-content">
        <h2 className="confirmacion-title">{titulo || "Confirmar acción"}</h2>

        <div className="confirmacion-body">
          <p>{mensaje || "¿Está seguro que desea realizar esta acción?"}</p>
        </div>

        <div className="confirmacion-footer">
          <button onClick={handleCancel} className="btn-cancelar">
            Cancelar
          </button>
          <button onClick={handleConfirm} className="btn-confirmar">
            Aceptar
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default ConfirmacionModal
