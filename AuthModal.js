import React, { useState } from 'react';
import './styles/AuthModal.css'; 
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Cookies from 'js-cookie';

const AuthModal = ({ isOpen, onClose, onLogin, onRegister }) => {
    const { t } = useTranslation();
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Добавляем состояние для авторизации
    const BASE_URL = 'http://localhost:3001';

    const handleToggleMode = () => {
        setIsLogin(!isLogin);
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = () => {
        // Проверка наличия всех обязательных данных перед отправкой запроса
        if (!username || !password) {
            alert('Все поля должны быть заполнены');
            return;
        }
        
        axios.post(`${BASE_URL}/login`, { username, password })
            .then(response => {
                // Обработка успешного входа
                console.log(response.data);
                onClose(); // Закрытие модального окна
    
                // Определение имени пользователя на основе введенного юзернейма
                const enteredUsername = username;
        
                // Сохранение данных в куки в виде JSON строки
                const userData = { enteredUsername, password };
                Cookies.set('userData', JSON.stringify(userData));
                
                // Установка состояния авторизации
                setIsLoggedIn(true);
                window.location.reload(true);
                alert(`Авторизация прошла успешно.`);
                // Тут вы можете добавить логику для обновления состояния вашего React-приложения после входа
            })
            .catch(error => {
                // Обработка ошибок при входе
                if (error.response) {
                    // Ошибка с ответом от сервера (например, код ответа не 2xx)
                    alert(`Ошибка: ${error.response.data.message}`);
                } else if (error.request) {
                    // Ошибка без ответа от сервера
                    alert('Ошибка запроса. Пожалуйста, повторите попытку.');
                } else {
                    // Общая ошибка
                    alert(`Ошибка: ${error.message}`);
                }
            });
    };
    
    
    
    

    const handleRegister = () => {
        axios.post(`${BASE_URL}/register`, { email, username, password, confirmPassword })
            .then(response => {
                console.log(response.data);
                alert(`Вы успешно зарегистрировались.`);
            })
            .catch(error => {
                if (error.response) {
                    alert(`Ошибка: ${error.response.data.message}`);
                } else if (error.request) {
                    alert('Ошибка запроса. Пожалуйста, повторите попытку.');
                } else {
                    alert(`Ошибка: ${error.message}`);
                }
            });
    };

    // Добавляем условие для закрытия модального окна после успешного входа
    if (isLoggedIn) {
        return null;
    }

    return (
        <>
            {isOpen && (
                <div className="modal-overlay">
                    <div className="auth-modal">
                        <div className="close-button" onClick={onClose}>
                            &times;
                        </div>
                        <h2>{isLogin ? t('app.login') : t('app.register')}</h2>
                        <form>
                            {!isLogin && (
                                <label>
                                    {t('app.email')}:
                                    <input
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        maxLength={32}
                                        className="input-field"
                                    />
                                </label>
                            )}
                            <label>
                                {isLogin ? t('app.usernameOrEmail') : t('app.username')}:
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    maxLength={32}
                                    className="input-field"
                                />
                            </label>
                            <label>
                                {t('app.password')}:
                                <div className="password-input">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        maxLength={32}
                                        className="input-field"
                                    />
                                    <div className="eye-icon" onClick={handleTogglePasswordVisibility}>
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </div>
                                </div>
                            </label>
                            {!isLogin && (
                                <label>
                                    {t('app.confirmPassword')}:
                                    <div className="password-input">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            maxLength={32}
                                            className="input-field"
                                        />
                                        <div className="eye-icon" onClick={handleTogglePasswordVisibility}>
                                            {showPassword ? '👁️' : '👁️‍🗨️'}
                                        </div>
                                    </div>
                                </label>
                            )}
                            <div className="button-container">
                                <button type="button" onClick={isLogin ? handleLogin : handleRegister}>
                                    {isLogin ? t('app.login') : t('app.register')}
                                </button>
                                <button type="button" onClick={handleToggleMode}>
                                    {isLogin ? t('app.switchToRegister') : t('app.switchToLogin')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AuthModal;
