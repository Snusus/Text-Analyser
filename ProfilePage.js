import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import i18n from 'i18next';
import { Bar, Pie } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import './styles/ProfilePage.css';
import Cookies from 'js-cookie';
import axios from 'axios';

const BASE_URL = 'http://localhost:3001';
const ProfileTab = ({
  userData,
  username,
  email,
  password,
  showPassword,
  editableFields,
  handleFieldEdit,
  toggleShowPassword,
  setUsername,
  setEmail,
  setPassword,
  handleSubmit,
  setIsAdmin,
  isAdmin,
}) => {


  const { t } = useTranslation();

  return (

    <form className="profile-page__form" onSubmit={handleSubmit}>
      <h1 className="profile-page__title">{t('profilePage.title')}</h1>
      <div className="profile-page__form-group">
        <label htmlFor="username" className="profile-page__label">
          {t('profilePage.usernameLabel')}:
        </label>
        <div className="profile-page__input-container">
          <input
            maxLength={32}
            type="text"
            id="username"
            className="profile-page__input"
            value={editableFields.username ? username : (userData && userData.Username) || ''}
            onChange={(e) => setUsername(e.target.value)}
            readOnly={!editableFields.username}
          />
          <button type="button" className="profile-page__edit-button" onClick={() => handleFieldEdit('username')}>
            🖉
          </button>
        </div>
      </div>
      <div className="profile-page__form-group">
        <label htmlFor="email" className="profile-page__label">
          {t('profilePage.emailLabel')}:
        </label>
        <div className="profile-page__input-container">
          <input
            maxLength={32}
            type="email"
            id="email"
            className="profile-page__input"
            value={editableFields.email ? email : (userData && userData.Email) || ''}
            onChange={(e) => setEmail(e.target.value)}
            readOnly={!editableFields.email}
          />
          <button type="button" className="profile-page__edit-button" onClick={() => handleFieldEdit('email')}>
            🖉
          </button>
        </div>
      </div>
      <div className="profile-page__form-group">
        <label htmlFor="password" className="profile-page__label">
          {t('profilePage.passwordLabel')}:
        </label>
        <div className="profile-page__input-container">
          <input
            maxLength={32}
            type={showPassword ? 'text' : 'password'}
            id="password"
            className="profile-page__input"
            value={editableFields.password ? password : (userData && userData.Password) || ''}
            onChange={(e) => setPassword(e.target.value)}
            readOnly={!editableFields.password}
          />
          <button type="button" className="profile-page__edit-button" onClick={() => handleFieldEdit('password')}>
            🖉
          </button>
          <button style={{ marginRight: '6%', marginTop: '0.07%' }}
            type="button"
            className="profile-page__edit-button"
            onClick={toggleShowPassword}
          >
            {showPassword ? t('profilePage.hidePassword') : t('profilePage.showPassword')}
          </button>
        </div>
      </div>
      <div className="profile-page__form-group">
        <label htmlFor="role" className="profile-page__label">
          {t('profilePage.roleLabel')}:
        </label>
        <input
          type="text"
          id="role"
          className="profile-page__input"
          value={userData ? t(`roles.${userData.Roles}`) : ''}
          readOnly
        />
      </div>
      <div className="profile-page__actions">
        <button type="submit" className="profile-page__button">
          {t('profilePage.submitButton')}
        </button>
        <button type="button" onClick={handleGoBack} className="profile-page__return-button">
          {t('profilePage.goBackLink')}
        </button>
        <button type="button" onClick={handleLogout} className="profile-page__logout-button">
          {t('profilePage.logoutButton')}
        </button>
      </div>
    </form>
  );
};

const handleLogout = () => {
  Cookies.remove('userData');
  window.location = '/'; 
};

const handleGoBack = () => {
  window.location = '/';
};

const highlightMatches = (text, query) => {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.split(regex).map((part, index) =>
    regex.test(part) ? <mark className="highlight" key={index}>{part}</mark> : part
  );
};

const TextsTab = ({ userTexts, handleEditClick, handleDeleteText }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredText, setHoveredText] = useState(null);

  const filteredTexts = userTexts.filter(text =>
    text.TextContent.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="profile-page__text-list">
      <h2 className="profile-page__text-header">{t('profilePage.texts')}</h2>
      <input
        type="text"
        placeholder={t('profilePage.searchPlaceholder')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="profile-page__search-input"
      />
      <div className="profile-page__text-container">
        <table className="profile-page__text-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{t('profilePage.textContent')}</th>
              <th>{t('profilePage.savedAt')}</th>
              <th>{t('profilePage.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredTexts.map(text => (
              <tr
                key={text.TextID}
                onMouseEnter={() => setHoveredText(text.TextID)}
                onMouseLeave={() => setHoveredText(null)}
              >
                <td>{text.TextID}</td>
                <td className="profile-page__text-content">
                  {highlightMatches(text.TextContent, searchQuery)}
                </td>
                <td>{new Date(text.SavedAt).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleEditClick(text.TextID, text.TextContent)}>{t('profilePage.edit')}</button>
                  <button onClick={() => handleDeleteText(text.TextID)}>{t('profilePage.delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StatsTab = () => {
  const { t } = useTranslation();
  const [checksData, setChecksData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [checksPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDataFromCookie = Cookies.get('userData');
        if (userDataFromCookie) {
          const userDataObject = JSON.parse(userDataFromCookie);
          const currentUsername = userDataObject.enteredUsername;
          const currentPassword = userDataObject.password;
          const response = await axios.post(`${BASE_URL}/getUserChecks`, {
            username: currentUsername,
            password: currentPassword,
          });

          if (response.data.success) {
            setChecksData(response.data.userChecks);
          } else {
            console.error('Error fetching user checks:', response.data.error);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);
  // Calculate averages
  const calculateAverages = () => {
    if (!checksData || checksData.length === 0) return null;

    let totalOriginalityPercentage = 0;
    let totalSpamPercentage = 0;
    let totalCharacters = 0;
    let totalWords = 0;
    let uniqueWords = new Set();
    let totalErrors = 0;

    checksData.forEach(check => {
      totalOriginalityPercentage += check.OriginalityPercentage || 0;
      totalSpamPercentage += check.SpamPercentage || 0;
      totalCharacters += check.Text ? check.Text.length : 0;
      totalWords += check.Text ? check.Text.split(/\s+/).length : 0;
      const wordsArray = check.Text ? check.Text.split(/\s+/) : [];
      wordsArray.forEach(word => uniqueWords.add(word.toLowerCase()));
      totalErrors += check.Errors || 0;
    });

    const averageOriginalityPercentage = totalOriginalityPercentage / checksData.length;
    const averageSpamPercentage = totalSpamPercentage / checksData.length;
    const averageCharacters = totalCharacters / checksData.length;
    const averageWords = totalWords / checksData.length;
    const uniqueWordsCount = uniqueWords.size;
    const averageErrors = totalErrors / checksData.length;

    return (
      <div className="stats-tab__averages">
        <p>{t('statsTab.averageOriginality')}: {averageOriginalityPercentage.toFixed(2)}%</p>
        <p>{t('statsTab.averageSpam')}: {averageSpamPercentage.toFixed(2)}%</p>
      </div>
    );
  };

  // Pagination
  const indexOfLastCheck = currentPage * checksPerPage;
  const indexOfFirstCheck = indexOfLastCheck - checksPerPage;
  const currentChecks = checksData.slice(indexOfFirstCheck, indexOfLastCheck);

  const paginate = pageNumber => setCurrentPage(pageNumber);

  return (
    <div className="stats-tab">
      <h1 className="stats-tab__title">{t('statsTab.title')}</h1>
      <div className="stats-tab__content">
        <div className="stats-tab__table-container">
          <h2 className="stats-tab__table-title">{t('statsTab.tableTitle')}</h2>
          <table className="stats-tab__table">
            <thead>
              <tr>
                <th>{t('statsTab.date')}</th>
                <th>{t('statsTab.characters')}</th>
                <th>{t('statsTab.words')}</th>
                <th>{t('statsTab.uniqueWords')}</th>
                <th>{t('statsTab.spamPercentage')}</th>
                <th>{t('statsTab.originalityPercentage')}</th>
                <th>{t('statsTab.language')}</th>
                <th>{t('statsTab.style')}</th>
                <th>{t('statsTab.errors')}</th>
              </tr>
            </thead>
            <tbody>
              {currentChecks.map((check) => (
                <tr key={check.CheckID}>
                  <td>{check.CheckTime}</td>
                  <td>{check.CharacterCount || '-'}</td>
                  <td>{check.WordCount || '-'}</td>
                  <td>{check.UniqueWords}</td>
                  <td>{check.SpamPercentage || '-'}</td>
                  <td>{check.OriginalityPercentage || '-'}</td>
                  <td>{check.Language || '-'}</td>
                  <td>{t("app."+check.TextStyle) || '-'}</td>
                  <td>{check.ErrorCount || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {checksData.length > checksPerPage && (
          <div className="stats-tab__pagination">
            <button
              className={`stats-tab__pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              {'<'}
            </button>
            <ul className="stats-tab__pagination-list">
              {Array.from({ length: Math.ceil(checksData.length / checksPerPage) }, (_, index) => (
                <li key={index} className={`stats-tab__pagination-item ${currentPage === index + 1 ? 'active' : ''}`}>
                  <button onClick={() => paginate(index + 1)}>{index + 1}</button>
                </li>
              ))}
            </ul>
            <button
              className={`stats-tab__pagination-button ${currentPage === Math.ceil(checksData.length / checksPerPage) ? 'disabled' : ''}`}
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(checksData.length / checksPerPage)}
            >
              {'>'}
            </button>
          </div>
        )}
        {calculateAverages()}
      </div>
    </div>
  );
};

// Функция для подсчета уникальных слов
function calculateUniqueWords(text) {
  if (!text) return '-';
  const wordsArray = text.split(/\s+/);
  const uniqueWords = new Set(wordsArray);
  return uniqueWords.size;
}

const AdminTab = () => {
  const { t } = useTranslation();
  const [checksData, setChecksData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [checksPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDataFromCookie = Cookies.get('userData');
        if (userDataFromCookie) {
          const userDataObject = JSON.parse(userDataFromCookie);
          const currentUsername = userDataObject.enteredUsername;
          const currentPassword = userDataObject.password;
          const response = await axios.post(`${BASE_URL}/getAllChecks`, {
            username: currentUsername,
            password: currentPassword,
          });

          if (response.data.success) {
            setChecksData(response.data.userChecks);
          } else {
            console.error('Error fetching user checks:', response.data.error);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Calculate averages
  const calculateAverages = () => {
    if (!checksData || checksData.length === 0) return null;

    let totalOriginalityPercentage = 0;
    let totalSpamPercentage = 0;
    let totalCharacters = 0;
    let totalWords = 0;
    let uniqueWords = new Set();
    let totalErrors = 0;

    checksData.forEach(check => {
      totalOriginalityPercentage += check.OriginalityPercentage || 0;
      totalSpamPercentage += check.SpamPercentage || 0;
      totalCharacters += check.CharacterCount || 0;
      totalWords += check.WordCount || 0;
      const wordsArray = null;
    });

    const averageOriginalityPercentage = totalOriginalityPercentage / checksData.length;
    const averageSpamPercentage = totalSpamPercentage / checksData.length;
    const averageCharacters = totalCharacters / checksData.length;
    const averageWords = totalWords / checksData.length;
    const uniqueWordsCount = uniqueWords.size;
    const averageErrors = totalErrors / checksData.length;

    return (
      <div className="stats-tab__averages">
        <p>{t('statsTab.averageOriginality')}: {averageOriginalityPercentage.toFixed(2)}%</p>
        <p>{t('statsTab.averageSpam')}: {averageSpamPercentage.toFixed(2)}%</p>
        <p>{t('statsTab.averageCharacters')}: {averageCharacters.toFixed(2)}</p>
        <p>{t('statsTab.averageWords')}: {averageWords.toFixed(2)}</p>
      </div>
    );
  };

  // Pagination
  const indexOfLastCheck = currentPage * checksPerPage;
  const indexOfFirstCheck = indexOfLastCheck - checksPerPage;
  const currentChecks = checksData.slice(indexOfFirstCheck, indexOfLastCheck);

  const paginate = pageNumber => setCurrentPage(pageNumber);

  return (
    <div className="stats-tab">
      <h1 className="stats-tab__title">{t('statsTab.title')}</h1>
      <div className="stats-tab__content">
        <div className="stats-tab__table-container">
          <h2 className="stats-tab__table-title">{t('statsTab.tableTitle')}</h2>
          <table className="stats-tab__table">
            <thead>
              <tr>
                <th>{t('statsTab.UserID')}</th>
                <th>{t('statsTab.date')}</th>
                <th>{t('statsTab.characters')}</th>
                <th>{t('statsTab.words')}</th>
                <th>{t('statsTab.uniqueWords')}</th>
                <th>{t('statsTab.spamPercentage')}</th>
                <th>{t('statsTab.originalityPercentage')}</th>
                <th>{t('statsTab.language')}</th>
                <th>{t('statsTab.style')}</th>
                <th>{t('statsTab.errors')}</th>
              </tr>
            </thead>
            <tbody>
              {currentChecks.map((check) => (
                <tr key={check.CheckID}>
                  <td>{check.UserID}</td>
                  <td>{check.CheckTime}</td>
                  <td>{check.CharacterCount || '-'}</td>
                  <td>{check.WordCount || '-'}</td>
                  <td>{check.UniqueWords}</td>
                  <td>{check.SpamPercentage || '-'}</td>
                  <td>{check.OriginalityPercentage || '-'}</td>
                  <td>{check.Language || '-'}</td>
                  <td>{t("app."+check.TextStyle) || '-'}</td>
                  <td>{check.ErrorCount || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {checksData.length > checksPerPage && (
          <div className="stats-tab__pagination">
            <button
              className={`stats-tab__pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              {'<'}
            </button>
            <ul className="stats-tab__pagination-list">
              {Array.from({ length: Math.ceil(checksData.length / checksPerPage) }, (_, index) => (
                <li key={index} className={`stats-tab__pagination-item ${currentPage === index + 1 ? 'active' : ''}`}>
                  <button onClick={() => paginate(index + 1)}>{index + 1}</button>
                </li>
              ))}
            </ul>
            <button
              className={`stats-tab__pagination-button ${currentPage === Math.ceil(checksData.length / checksPerPage) ? 'disabled' : ''}`}
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(checksData.length / checksPerPage)}
            >
              {'>'}
            </button>
          </div>
        )}
        {calculateAverages()}
      </div>
    </div>
  );
};



const ProfilePage = () => {
  const emailRegex = /^[A-Za-z\d]+@[A-Za-z\d]+\.[A-Za-z\d]+$/;
  const usernameRegex = /^[A-Za-z\d]{3,}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();
  const [userData, setUserData] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userTexts, setUserTexts] = useState([]);
  const [editableFields, setEditableFields] = useState({
    username: false,
    email: false,
    password: false,
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    getUserDataFromServer();
    getUserTexts();
  }, []);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const userDataFromCookie = Cookies.get('userData');
    const usernameValue = document.getElementById('username').value;
    const emailValue = document.getElementById('email').value;
    const passwordValue = document.getElementById('password').value;

    if (!usernameRegex.test(usernameValue) && usernameValue !== '') {
      alert('Введено недопустимое имя пользователя.');
      return;
    } else if (!emailRegex.test(emailValue) && emailValue !== '') {
      alert('Введена недопустимая почта.');
      return;
    } else if (!passwordRegex.test(passwordValue) && passwordValue !== '') {
      alert('Введен недопустимый пароль.');
      return;
    }

    if (usernameValue == '') {
      alert('Пожалуйста, введите имя пользователя.');
      return;
    } else if (emailValue == '') {
      alert('Пожалуйста, введите имя почту.');
      return;
    } else if (passwordValue == '') {
      alert('Пожалуйста, введите имя пароль.');
      return;
    }

    if (!userDataFromCookie) {
      console.error('Данные пользователя не найдены в куки');
      Cookies.remove('userData');
      return;
    }
    const userDataObject = JSON.parse(userDataFromCookie);
    const currentUsername = userDataObject.enteredUsername;
    const currentPassword = userDataObject.password;
    const newData = {
      username: currentUsername,
      password: currentPassword,
      currentUsername: usernameValue,
      currentEmail: emailValue,
      currentPassword: passwordValue,
    };

    // Отправляем данные на сервер
    axios.post(`${BASE_URL}/updateUserData`, newData)
      .then(response => {
        // Обработка успешного ответа
        console.log('Ответ сервера:', response.data);
        alert(response.data.message); // Выводим сообщение из ответа сервера
      })
      .catch(error => {
        console.error('Ошибка при отправке данных на сервер:', error);
        alert('Произошла ошибка при отправке данных на сервер'); // Выводим сообщение об ошибке
      });
  };

  const getUserTexts = () => {
    const userDataFromCookie = Cookies.get('userData');
    if (!userDataFromCookie) {
      console.error('Данные пользователя не найдены в куки');
      Cookies.remove('userData');
      return;
    }
    const userDataObject = JSON.parse(userDataFromCookie);
    const username = userDataObject.enteredUsername;
    const password = userDataObject.password;

    axios.post(`${BASE_URL}/getUserTexts`, { username, password })
      .then(response => {
        console.log('Данные текстов пользователя получены успешно:', response.data);
        setUserTexts(response.data.userTexts);
      })
      .catch(error => {
        console.error('Ошибка при получении текстов пользователя:', error);
      });
  };

  const handleEditClick = (textID, textContent) => {
    localStorage.setItem('editableText', textContent);
    window.location = '/';
  };

  const handleDeleteText = (textId) => {
    const userDataFromCookie = Cookies.get('userData');
    if (!userDataFromCookie) {
      console.error('Данные пользователя не найдены в куки');
      Cookies.remove('userData');
      return;
    }

    const { enteredUsername, password } = JSON.parse(userDataFromCookie);

    axios.post(`${BASE_URL}/deleteText`, { enteredUsername, password, textId })
      .then(response => {
        console.log(response.data.message);
        setUserTexts(userTexts.filter(text => text.TextID !== textId));
      })
      .catch(error => {
        console.error('Ошибка при удалении текста:', error);
        alert('Произошла ошибка при удалении текста');
      });
  };

  const handleFieldEdit = (field) => {
    setEditableFields((prevFields) => ({
      ...prevFields,
      [field]: !prevFields[field],
    }));
  };

  const getUserDataFromServer = () => {
    const userDataFromCookie = Cookies.get('userData');
    if (!userDataFromCookie) {
      console.error('Данные пользователя не найдены в куки');
      handleLogout();
      return;
    }
    const userDataObject = JSON.parse(userDataFromCookie);
    const Username = userDataObject.enteredUsername;
    const Password = userDataObject.password;

    axios.post(`${BASE_URL}/getUserData`, { username: Username, password: Password })
      .then(response => {
        console.log('Данные пользователя получены успешно:');
        console.log(response.data.userData);
        setIsAdmin(response.data.userData.Roles == 'admin');
        setUserData(response.data.userData);
      })
      .catch(error => {
        console.error('Ошибка при получении данных пользователя:', error);
      });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <ProfileTab
            userData={userData}
            username={username}
            email={email}
            password={password}
            showPassword={showPassword}
            editableFields={editableFields}
            handleFieldEdit={handleFieldEdit}
            toggleShowPassword={toggleShowPassword}
            setUsername={setUsername}
            setEmail={setEmail}
            setPassword={setPassword}
            handleSubmit={handleSubmit}
          />
        );
      case 'texts':
        return (
          <TextsTab
            userTexts={userTexts}
            handleEditClick={handleEditClick}
            handleDeleteText={handleDeleteText}
          />
        );
      case 'stats':
        return <StatsTab />;
      case 'admin':
        return isAdmin ? <AdminTab /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="profile-page-wrapper">
      <div className="profile-page__tabs">
        <button
          className={`profile-page__tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          {t('profilePage.profileTab')}
        </button>
        <button
          className={`profile-page__tab-button ${activeTab === 'texts' ? 'active' : ''}`}
          onClick={() => setActiveTab('texts')}
        >
          {t('profilePage.textsTab')}
        </button>
        <button
          className={`profile-page__tab-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          {t('profilePage.statsTab')}
        </button>
        {isAdmin && (
          <React.Fragment>
            <button
              className={`profile-page__tab-button ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              {t('profilePage.adminTab')}
            </button>
          </React.Fragment>
        )}
      </div>
      <div className="profile-page">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProfilePage;
