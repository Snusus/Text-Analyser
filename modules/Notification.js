import React from 'react';
import '../styles/Notification.css'; // Подключаем файл стилей для уведомления
import successIcon from '../images/success.png'; // Импорт изображения
import errorIcon from '../images/error.png';
import infoIcon from '../images/info.png';
import warningIcon from '../images/star.png'; // Используем абсолютный путь


const Notification = ({ title, message, type, buttonText, onClose }) => {
  const iconMap = {
    success: successIcon,
    error: errorIcon,
    info: infoIcon,
    warning: warningIcon,
  };
  return (
    <div className={`notification-overlay ${type}`}>
      <div className="notification">
        <div className="notification-header">
          <h3>{title}</h3>
        </div>
        
        <div className="notification-body">
          <p>{message}</p>
          <img className="notification-icon" src={iconMap[type]} alt={`${type} icon`} />
        </div>
        <div className="notification-footer">
        <button onClick={onClose}>{buttonText}</button>
        </div>
      </div>
    </div>
  );
};

export default Notification;
