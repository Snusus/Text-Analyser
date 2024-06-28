import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import useLanguageDetection from './modules/languageDetection';
import useTextCheck from './modules/textCheck';
import useSpamCheck from './modules/spamCheck';
import useTextUpgrader from './modules/upgradeText';
import useCheckTextUniqueness from './modules/checkTextUniqueness';
import useTextStyleClassifier from './modules/getTextStyle';
import AuthModal from './AuthModal';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Импортируем useHistory
import Notification from './modules/Notification.js';
import Cookies from 'js-cookie';

const MainPage = () => {

  const navigate = useNavigate();
  const [username, setUsername] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [errors, setErrors] = useState([]);
  const [language, setLanguage] = useState('');
  const [spamPercentage, setSpamPercentage] = useState(null);
  const [originalityRate, setOriginalityRate] = useState(null);
  const [textStyle, setTextStyle] = useState('');
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [userData, setUserData] = useState(null); // Состояние для данных пользователя
  const [showNotification, setShowNotification] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('');
  const [notificationButtonText, setNotificationButtonText] = useState('');
  const { detectLanguage } = useLanguageDetection();
  const { checkText } = useTextCheck();
  const { checkSpam } = useSpamCheck();
  const { upgradeText } = useTextUpgrader();
  const { checkTextUniqueness } = useCheckTextUniqueness();
  const { classifyTextStyle } = useTextStyleClassifier();
  const charactersCount = text.length;
  const charactersLimit = 2500;
  const BASE_URL = 'http://localhost:3001';

  const getUserId = async () => {
    const userDataFromCookie = Cookies.get('userData');
    if (!userDataFromCookie) {
      console.error('User data not found in cookies');
      setIsAuthenticated(false);
      return null;
    }

    try {
      const userDataObject = JSON.parse(userDataFromCookie);
      const { enteredUsername, password } = userDataObject;
      const response = await axios.post(`${BASE_URL}/getUserData`, { username: enteredUsername, password });
      if (response.data.userData) {
        setUserData(response.data.userData);
        return response.data.userData.UserID; // Возвращаем UserID
      } else {
        setIsAuthenticated(false);
        return null;
      }
    } catch (error) {
      console.error('Error retrieving user data:', error);
      setIsAuthenticated(false);
      return null;
    }
  };


  const checkUserAuth = async () => {
    const userDataFromCookie = Cookies.get('userData');
    if (!userDataFromCookie) {
      console.error('User data not found in cookies');
      setIsAuthenticated(false);
      return;
    }

    try {
      const userDataObject = JSON.parse(userDataFromCookie);
      const { enteredUsername, password } = userDataObject;
      const response = await axios.post(`${BASE_URL}/getUserData`, { username: enteredUsername, password });
      if (response.data.userData) {
        console.log('User data retrieved successfully:', response.data.userData);
        setUserData(response.data.userData);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error retrieving user data:', error);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkUserAuth();
    if (isAuthenticated) {
      const userDataFromCookie = Cookies.get('userData');
      if (userDataFromCookie) {
        const userDataObject = JSON.parse(userDataFromCookie);
        setUsername(userDataObject.enteredUsername);
        const storedText = localStorage.getItem('editableText');
        if (storedText) {
          setText(storedText);
          localStorage.removeItem('editableText');
        }
      }
    }
  }, [isAuthenticated]);

  const checkUserData = async () => {
    const userData = Cookies.get('userData');
    if (!userData) {
      setIsLoggedIn(false);
      return false;
    }

    try {
      const userDataObject = JSON.parse(userData);
      const { enteredUsername } = userDataObject;

      const response = await axios.post(`${BASE_URL}/checkUserData`, { username: enteredUsername }); // Отправляем только имя пользователя
      if (response.data.isValid) {
        setIsLoggedIn(true);
        return true;
      } else {
        setIsLoggedIn(false);
        return false;
      }
    } catch (error) {
      setIsLoggedIn(false);
      return false;
    }
  };

  const handleShowNotification = (title, message, type, buttonText = 'Close') => {
    setNotificationTitle(title);
    setNotificationMessage(message);
    setNotificationType(type);
    setNotificationButtonText(buttonText);
    setShowNotification(true);
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
    setNotificationTitle('');
    setNotificationMessage('');
    setNotificationType('info');
    setNotificationButtonText(''); // Сбрасываем текст кнопки
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    if (newText.length <= charactersLimit) {
      setText(newText);
    }
  };
  const saveText = () => {
    if (!isAuthenticated) {
      handleShowNotification(t('notifications.warning'), t('notifications.authRequiredError'), 'warning', t('notifications.understoodAnswer'));
      return;
    }
    if (charactersCount > 0) {
      try {
        let Username = '';
        let Password = '';
        const Text = document.getElementById('textArea').value;
        let userDataObject = null;

        // Получаем данные пользователя из куки
        const userDataFromCookie = Cookies.get('userData');

        // Проверяем, есть ли данные пользователя в куки
        if (!userDataFromCookie) {
          console.error('User data not found in cookies');
          Cookies.remove('userData');
          return;
        }

        // Пытаемся распарсить данные пользователя из куки
        try {
          userDataObject = JSON.parse(userDataFromCookie);
        } catch (error) {
          console.error('Error parsing user data from cookie:', error);
          return;
        }

        // Извлекаем имя пользователя и пароль
        Username = userDataObject.enteredUsername || '';
        Password = userDataObject.password || '';

        // Выводим все данные в консоль для проверки
        console.log('Username:', Username);
        console.log('Password:', Password);
        console.log('Text:', Text);

        // Отправляем данные на сервер для сохранения текста
        fetch(`${BASE_URL}/saveText`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: Username, password: Password, textContent: Text }),
        })
          .then(response => {
            if (!response.ok) {
              handleShowNotification(t('notifications.error'), t('notifications.saveTextError'), 'error', t('notifications.understoodAnswer'));
              throw new Error(`HTTP Error: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            console.log(data.message);
            handleShowNotification(t('notifications.success'), t('notifications.textSavedSuccessfully'), 'success', t('notifications.acceptAnswer'));
          })
          .catch(error => {
            console.error('Error saving text:', error);
          });
      } catch {
        handleShowNotification(t('notifications.error'), t('notifications.saveTextError'), 'error', t('notifications.understoodAnswer'));
      }
    }
    else {
      handleShowNotification(t('notifications.warning'), t('notifications.nullTextAreaError'), 'error', t('notifications.acceptAnswer'));
    }
  };

  const improveText = async () => {
    if (!isAuthenticated) {
      handleShowNotification(t('notifications.warning'), t('notifications.authRequiredError'), 'warning', t('notifications.understoodAnswer'));
      return;
    }
    if (charactersCount > 0) {
      try {
        let newText = await upgradeText(text);
        // Удаляем первую и последнюю кавычки, если они есть
        if (newText.startsWith('"') && newText.endsWith('"')) {
          newText = newText.slice(1, -1);
        }
        console.log(newText);
        setText(newText);
      } catch (error) {
        console.error('Ошибка при улучшении текста:', error);
      }
      detectAndCheck();
    }
    else {
      handleShowNotification(t('notifications.warning'), t('notifications.nullTextAreaError'), 'error', t('notifications.acceptAnswer'));
    }
  };



  const detectAndCheck = async () => {
    const userId = await getUserId(); // Получаем UserID асинхронно
    if (userId === null) {
      userId = 0;
    }
    if (text.length > 0) {
      const detectedLanguage = detectLanguage(text);
      setLanguage(detectedLanguage);

      const result = await checkText(text);
      setErrors(result);

      const spamPercentage = checkSpam(text);
      setSpamPercentage(spamPercentage);

      const textStyle = await classifyTextStyle(text);
      setTextStyle(textStyle);

      const originalityRate = await checkTextUniqueness(text);
      setOriginalityRate(originalityRate);
      const getIPAddress = (req) => {
        if (req && req.headers) {
          const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
          const ipv4 = ip.includes(':') ? ip.split(':').pop() : ip;
          return ipv4;
        } else {
          return '127.0.0.1'; 
        }
      };
      // Получаем IP-адрес пользователя
      let ipAddress = '127.0.0.1';
      ipAddress = getIPAddress();
      const getUniqueWords = (text) => {
        const words = text.split(/\s+/); // Разбиваем текст на слова
        const uniqueWordsSet = new Set(words); // Создаем множество уникальных слов
        return uniqueWordsSet.size;
      };
      const uniqueWords = getUniqueWords(text);
      // Заполнение данными
      const checkResult = {
        UserID: userId,  // Используем userId из cookies или -1 если данных нет
        UniqueWords: uniqueWords,  // Статическое значение для теста
        SpamPercentage: spamPercentage,  // Вычисленное значение
        OriginalityPercentage: originalityRate,  // Вычисленное значение
        ErrorCount: result.length,  // Количество ошибок
        WordCount: text.split(' ').length,  // Количество слов
        CharacterCount: text.length,  // Длина текста
        Language: detectedLanguage,  // Вычисленный язык
        TextStyle:
          textStyle === 0 ? 'unknownTextStyle' :
            textStyle === 1 ? 'scientificTextStyle' :
              textStyle === 2 ? 'officialTextStyle' :
                textStyle === 3 ? 'journalisticTextStyle' :
                  textStyle === 4 ? 'conversationalTextStyle' :
                    textStyle === 5 ? 'literaryTextStyle' : '-',  // Вычисленный стиль текста
        IPAddress: ipAddress  // IP адрес клиента
      };

      console.log("Data to be sent to server:", checkResult); // Проверяем данные перед отправкой

      // Сохраняем результаты проверки текста в базу данных
      saveCheckResult(checkResult, t, handleShowNotification);
    } else {
      handleShowNotification(t('notifications.warning'), t('notifications.nullTextAreaError'), 'error', t('notifications.acceptAnswer'));
    }
  };

  // Функция для сохранения результатов проверки в базу данных
  const saveCheckResult = async (checkResult, t, handleShowNotification) => {
    try {
      const response = await axios.post(`${BASE_URL}/save-check`, checkResult);
      console.log('Text check results saved successfully:', response.data);
    } catch (error) {
      console.error('Error saving text check results:', error);
    }
  };


  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    if (text.length > 0) {
      detectAndCheck();
    }
  };

  const handleReload = () => {

    window.location.reload(true);

  };

  const handleLogin = (userData) => {
    setUserData(userData); // Сохраняем данные пользователя в состоянии
    setAuthModalOpen(true);

    // Сохраняем данные пользователя в куки
    Cookies.set('userData', userData);
  };


  const redirectToProfile = () => {
    if (checkUserData()) {
      navigate('/profile'); // Переход на страницу профиля
    }
    else {
      return;
    }
  };
  return (

    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {showNotification && (
        <Notification
          title={notificationTitle}
          message={notificationMessage}
          type={notificationType}
          buttonText={notificationButtonText}
          onClose={handleCloseNotification}
        />
      )}
      <div className='header-main'>
        <div>
          <img
            src={require('./images/icon.png')}
            alt="Reload"
            style={{ cursor: 'pointer', width: '13%', height: '80%', verticalAlign: 'middle' }}
            onClick={handleReload}
          />
          <button key="ru" onClick={() => changeLanguage('ru')} style={{ marginLeft: '10px', color: '#ecf0f1' }}>
            {t('languages.rus')}
          </button>
          <button key="en" onClick={() => changeLanguage('en')} style={{ marginLeft: '10px', color: '#ecf0f1' }}>
            {t('languages.eng')}
          </button>
        </div>
        <div style={{ maxWidth: '80%', overflowX: 'hidden' }}>
          {username ? ( // Проверяем, есть ли имя пользователя
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginTop: '3%', marginLeft: '28%', fontSize: '18px', color: '#ecf0f1', verticalAlign: 'middle' }}>{username}</span> {/* Отображаем имя пользователя */}
              <img
                src={require('./images/user-icon.png')}
                alt="User Icon"
                style={{ marginTop: '3%', marginLeft: '7%', cursor: 'pointer', width: '13%', height: '80%', verticalAlign: 'middle' }}
                onClick={redirectToProfile}
              />
            </div>
          ) : (
            <button onClick={() => handleLogin({ email: 'user@example.com' })} style={{ marginLeft: '10px', position: 'absolute', right: '10px', top: '10px', color: '#ecf0f1' }}>
              {t('app.login')}
            </button>
          )}
        </div>
      </div>
      {/* Остальной контент */}
      <div style={{ flex: 2 }}>
        <div className="actions-wrapper-articles">
          {/* Проверка языка */}
          <div className="text-block" style={{ marginLeft: '9.5%' }}>
            <div className="text-field-left">{t('app.detectedLanguage')}</div>
            <div className="text-field-right">{language || '-'}</div>
          </div>
          {/* Проверка заспамленности */}
          <div className="text-block" style={{ marginLeft: '10%' }}>
            <div className="text-field-left">{t('app.spamPercentage')}</div>
            <div className="text-field-right"> {spamPercentage !== null && spamPercentage !== undefined ? `${spamPercentage}%` : '-'}</div>
          </div>
          {/* Проверка ошибок */}
          <div className="text-block" style={{ marginLeft: '10%' }}>
            <div className="text-field-left">{t('app.errors')}</div>
            <div className="text-field-right">
              {errors.length === 1 && errors[0] && errors[0].message === t('app.noErrorsFound') ? t('app.noErrorsFound') : errors.length || '-'}
            </div>
          </div>
        </div>
        <div className="actions-wrapper-articles">
          {/* Проверка оригинальности */}
          <div class="text-block" style={{ marginLeft: '24.5%' }}>
            <div class="text-field-left">{t('app.originalityRate')}</div>
            <div class="text-field-right">{originalityRate !== null && originalityRate !== undefined ? `${originalityRate}%` : '-'}</div>
          </div>
          {/* Проверка стиля */}
          <div class="text-block" style={{ marginLeft: '10%' }}>
            <div class="text-field-left">{t('app.textStyle')}</div>
            <div class="text-field-right">{
              textStyle === 0 ? t('app.unknownTextStyle') :
                textStyle === 1 ? t('app.scientificTextStyle') :
                  textStyle === 2 ? t('app.officialTextStyle') :
                    textStyle === 3 ? t('app.journalisticTextStyle') :
                      textStyle === 4 ? t('app.conversationalTextStyle') :
                        textStyle === 5 ? t('app.literaryTextStyle') : '-'
            }</div>
          </div>
        </div>
        <textarea
          value={text}
          onChange={handleTextChange}
          id="textArea"
          maxLength={charactersLimit}
        />
        <div className="symbol-counter">
          {charactersCount}/{charactersLimit}
        </div>
        <div className="actions-wrapper">
          <button className="check-button" onClick={detectAndCheck}>{t('app.checkText')}</button>
          <button className="save-button" onClick={saveText}>{t('app.saveText')}</button>
          <button className="upgrade-button" onClick={improveText}>{t('app.upgradeText')}</button>
        </div>


        {errors.length > 0 && (
          <div style={{ marginLeft: '10px' }}>
            <h2>{t('app.errors')}:</h2>
            <ul>
              {errors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Нижняя панель */}
      <div class="footer-main">
        {t('app.allRightsReserved')}
      </div>

      {/* Модальное окно для входа/регистрации */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default MainPage;
