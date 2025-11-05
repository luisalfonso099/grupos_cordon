import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { login } from '../../services/auth/login'; // ajusta la ruta según tu estructura

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    let formIsValid = true;
    const errors: any = {};

    if (!form.email || !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(form.email)) {
      formIsValid = false;
      errors.email = 'Por favor ingrese un correo electrónico válido';
    }

    if (!form.password || form.password.length < 6) {
      formIsValid = false;
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(errors);
    return formIsValid;
  };

  const loginUser = async () => {
    try {
      if (validateForm()) {
        setLoading(true);
        await login(form);
        navigate('/');
      }
    } catch (error: any) {
      setLoading(false);
      if (error.message.includes('(auth/too-many-requests)')) {
        setError('El acceso a esta cuenta se ha desactivado temporalmente debido a muchos intentos fallidos de inicio de sesión. Puede restaurarlo inmediatamente restableciendo su contraseña o puede intentarlo de nuevo más tarde. 😒');
      } else if (error.message.includes('(auth/invalid-credential)')) {
        setError('Correo o contraseña inválida');
      } else if (error.message.includes('(auth/invalid-email).')) {
        setError('Correo electrónico inválido');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center sm:py-12 bg-black">
      <div className="relative text-white bg-[#292929] shadow-lg p-6 sm:p-16 sm:max-w-xl sm:mx-auto">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-semibold md:w-80">Iniciar sesión</h1>

          <div className="divide-y divide-gray-200">
            <div className="py-8 text-base leading-6 space-y-4 sm:text-lg sm:leading-7">

              <div>
                <label htmlFor="email" className="text-sm font-bold">Escriba su correo</label>
                <input
                  autoComplete="off"
                  id="email"
                  name="email"
                  type="text"
                  className="bg-[#373433] px-2 h-10 w-full border-[0.5px] border-gray-500 text-white focus:outline-none"
                  placeholder="Email address"
                  onChange={handleChange}
                />
                {errors.email && <p className='text-red-500 text-sm'>{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-bold">Escriba su contraseña</label>
                <input
                  autoComplete="off"
                  id="password"
                  name="password"
                  type="password"
                  className="bg-[#373433] px-2 h-10 w-full border-[0.5px] border-gray-500 text-white focus:outline-none"
                  placeholder="Password"
                  onChange={handleChange}
                />
                {errors.password && <p className='text-red-500 text-sm'>{errors.password}</p>}
              </div>

              {error && <p className='text-red-500 text-sm'>{error}</p>}

              <div>
                <button
                  onClick={loginUser}
                  className="bg-[#4a6da7] text-[16px] hover:bg-[#345996] text-white py-[8px] w-full"
                >
                  <span className='flex items-center justify-center'>
                    {loading && <AiOutlineLoading3Quarters className='animate-spin mr-2' />}
                    Iniciar sesión
                  </span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
