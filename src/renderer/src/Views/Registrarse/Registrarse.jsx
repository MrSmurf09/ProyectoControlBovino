import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../../Context/SnackbarContext';
import '../../Style/Inicio/Inicio.css';

function Registrarse() {
    const [formData, setFormData] = useState({
        Nombre: '',
        Correo: '',
        Contraseña: '',
        Telefono: ''
    });

    const { showSnackbar } = useSnackbar();

    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.Nombre || !formData.Correo || !formData.Contraseña || !formData.Telefono) {
            showSnackbar('Por favor, rellene todos los campos', 'warning');
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/usuario/registrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        
            const data = await response.json();

            if (!response.ok) {
                // Muestra el mensaje de error que viene del backend (si existe)
                showSnackbar(data.message || 'Error al registrar el usuario', 'error');
                throw new Error(data.message || 'Error al registrar el usuario');
            }
        
            showSnackbar(data.message || 'Usuario registrado con éxito', 'success');
            navigate('/Inicio');
        } catch (error) {
            console.error('Error:', error);
            showSnackbar(error.message || 'Error desconocido', 'error');
        }
    };

    return (
        <div className="body">
            <div className="centrar_inicio">
                <img src="https://i.postimg.cc/zD0RMBZy/logo-removebg.png" alt="Logo" className="logo" />
                <form className="form_inicio" onSubmit={handleSubmit}>
                    <div className="alinear_input_inicio">
                        <label className="input_label_inicio">Nombre:</label>
                        <input
                            type="text"
                            name="Nombre"
                            className="input_inicio"
                            placeholder="Ingrese su Nombre"
                            value={formData.Nombre}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="alinear_input_inicio">
                        <label className="input_label_inicio">Correo:</label>
                        <input
                            type="email"
                            name="Correo"
                            className="input_inicio"
                            placeholder="Ingrese su Correo"
                            value={formData.Correo}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="alinear_input_inicio">
                        <label className="input_label_inicio">Contraseña:</label>
                        <input
                            type="password"
                            name="Contraseña"
                            className="input_inicio"
                            placeholder="Ingrese su Contraseña"
                            value={formData.Contraseña}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="alinear_input_inicio">
                        <label className="input_label_inicio">Teléfono:</label>
                        <input
                            type="text"
                            name="Telefono"
                            className="input_inicio"
                            placeholder="Ingrese su Teléfono"
                            value={formData.Telefono}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn_inicio">Registrarse</button>
                </form>
            </div>
        </div>
    );
}

export default Registrarse;
