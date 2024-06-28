const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const db = mysql.createConnection({
    host: 'y9h.h.filess.io',
    user: 'Diplom_fathermad',
    password: '599b19efcbca9d816a2a6ea2dd0968e0626b7663',
    database: 'Diplom_fathermad',
    port: 3307,
});

db.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
    } else {
        console.log('Подключение к базе данных успешно!');
    }
});

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});

app.post('/login', (req, res) => {
    const { email, username, password } = req.body;

    // Проверка на наличие пароля
    if (!password) {
        return res.status(400).json({ success: false, message: 'Поле "Пароль" должно быть заполнено' });
    }

    // Проверяем наличие поля email или username в запросе
    if (email && email.includes('@')) {
        // Запрос для проверки входа по электронной почте и паролю
        query = 'SELECT * FROM Users WHERE Email = ? AND Password = ?';
        queryParams = [email, password];
    } else if (username) {
        // Запрос для проверки входа по имени пользователя и паролю
        query = 'SELECT * FROM Users WHERE Username = ? AND Password = ?';
        queryParams = [username, password];
    } else {
        return res.status(400).json({ success: false, message: 'Некорректные учетные данные' });
    }

    // Выполнение запроса к базе данных
    db.query(query, queryParams, (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Ошибка при проверке учетных данных' });
        }

        // Если найден пользователь, возвращаем успех
        if (result.length > 0) {
            console.log(`Пользователь ${username} успешно вошел`);
            return res.status(200).json({ success: true, message: 'Вход выполнен успешно' });
        }

        // Если пользователь не найден, возвращаем ошибку
        return res.status(401).json({ success: false, message: 'Неверные учетные данные' });
    });
});


app.post('/register', (req, res) => {
    const { email, username, password, confirmPassword } = req.body;

    if (!email || !username || !password || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'Все поля должны быть заполнены' });
    }

    // Проверка валидности email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Некорректный формат email' });
    }

    // Проверка длины логина
    if (username.length < 3) {
        return res.status(400).json({ success: false, message: 'Логин должен содержать не менее 3 символов' });
    }

    // Проверка соответствия пароля требованиям
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            success: false,
            message: 'Пароль должен содержать не менее 8 символов, включая хотя бы одну букву и одну цифру',
        });
    }

    // Проверка совпадения пароля и подтверждения пароля
    if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Пароли не совпадают' });
    }

    // Проверка, что поля не состоят из пробелов или спец символов
    const invalidCharsRegex = /[^A-Za-z\d]/;
    if (invalidCharsRegex.test(username) || invalidCharsRegex.test(password)) {
        return res.status(400).json({
            success: false,
            message: 'Логин и пароль должны состоять только из латинских букв и цифр, без пробелов и спецсимволов',
        });
    }

    // Проверка уникальности логина
    const checkLoginQuery = 'SELECT * FROM Users WHERE Username = ?';
    db.query(checkLoginQuery, [username], (err, loginResult) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Ошибка при проверке логина' });
        }

        if (loginResult.length > 0) {
            return res.status(400).json({ success: false, message: 'Пользователь с таким логином уже существует' });
        }

        // Проверка уникальности почты
        const checkEmailQuery = 'SELECT * FROM Users WHERE Email = ?';
        db.query(checkEmailQuery, [email], (err, emailResult) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Ошибка при проверке email' });
            }

            if (emailResult.length > 0) {
                return res.status(400).json({ success: false, message: 'Пользователь с таким email уже существует' });
            }

            // Если оба запроса не нашли совпадений, то можно выполнять регистрацию пользователя.
            const insertUserQuery = 'INSERT INTO Users (Email, Username, Password) VALUES (?, ?, ?)';
            db.query(insertUserQuery, [email, username, password], (err, result) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Ошибка при сохранении пользователя' });
                }
                console.log(`Новый пользователь зарегистрирован`);
                return res.status(200).json({ success: true, message: 'Пользователь успешно зарегистрирован' });
            });
        });
    });
});

app.post('/checkUserData', (req, res) => {
    const { username } = req.body;

    // Проверка, было ли предоставлено имя пользователя в запросе
    if (!username) {
        return res.status(400).json({ error: 'Имя пользователя не предоставлено' });
    }

    // SQL-запрос для проверки существования пользователя по имени пользователя
    const query = 'SELECT UserID FROM Users WHERE username = ?';
    db.query(query, [username], (err, result) => {
        if (err) {
            console.error('Ошибка при выполнении запроса:', err);
            return res.status(500).json({ error: 'Ошибка сервера при выполнении запроса' });
        }

        // Проверяем, был ли найден пользователь
        if (result.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        // Если пользователь найден, возвращаем успех
        return res.status(200).json({ success: true, message: 'Пользователь найден' });
    });
});
app.post('/getUserData', (req, res) => {
    const { username, password } = req.body;

    // Проверка наличия имени пользователя и пароля в запросе
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Не указано имя пользователя или пароль' });
    }

    // SQL-запрос для получения данных пользователя по имени пользователя и паролю
    queryParams = [username, password];
    const query = 'SELECT * FROM Users WHERE Username = ? AND Password = ?';
    db.query(query, queryParams, (err, result) => {
        if (err) {
            console.error('Ошибка при выполнении запроса:', err);
            return res.status(500).json({ success: false, message: 'Ошибка сервера при выполнении запроса' });
        }

        // Проверка, был ли найден пользователь
        if (result.length === 0) {
            return res.status(404).json({ success: false, message: 'Пользователь не найден' });
        }

        // Если пользователь найден, возвращаем его данные
        const userData = result[0]; // Первый найденный пользователь
        return res.status(200).json({ success: true, userData: userData });
    });
});

app.post('/updateUserData', (req, res) => {
    const { username, password, currentUsername, currentEmail, currentPassword } = req.body;

    if (!username || !password || !currentUsername || !currentEmail || !currentPassword) {
        return res.status(400).json({ success: false, message: 'Не указаны все данные' });
    }

    const queryParams = [username, password];
    const query = 'SELECT * FROM Users WHERE Username = ? AND Password = ?';
    db.query(query, queryParams, (err, result) => {
        if (err) {
            console.error('Ошибка при выполнении запроса:', err);
            return res.status(500).json({ success: false, message: 'Ошибка сервера при выполнении запроса' });
        }

        // Check if the user exists
        if (result.length === 0) {
            return res.status(404).json({ success: false, message: 'Пользователь не найден' });
        }

        // If the user exists, compare the current state with the database data
        const userData = result[0];
        let hasChanges = false;
        let message = 'Данные пользователя обновлены успешно';

        // Check if the username, email, or password has changed
        if (userData.Username !== currentUsername) {
            // Validate the new username
            if (!validateUsername(currentUsername)) {
                return res.status(400).json({ success: false, message: 'Некорректный новый логин' });
            }
            hasChanges = true;
        }

        if (userData.Email !== currentEmail) {
            // Validate the new email
            if (!validateEmail(currentEmail)) {
                return res.status(400).json({ success: false, message: 'Некорректный новый email' });
            }
            hasChanges = true;
        }

        if (userData.Password !== currentPassword) {
            // Validate the new password
            if (!validatePassword(currentPassword)) {
                return res.status(400).json({ success: false, message: 'Некорректный новый пароль' });
            }
            hasChanges = true;
        }

        // If there are changes, update the user's data in the database
        if (hasChanges) {
            const updateQuery = 'UPDATE Users SET Username = ?, Email = ?, Password = ? WHERE Username = ? AND Password = ?';
            db.query(updateQuery, [currentUsername, currentEmail, currentPassword, username, password], (err, updateResult) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Ошибка при обновлении данных пользователя' });
                }
                if (updateResult.affectedRows === 0) {
                    return res.status(400).json({ success: false, message: 'Не удалось обновить данные пользователя' });
                }
                message = 'Данные пользователя обновлены успешно';
            });
        }

        // Send an alert message back to the client
        return res.status(200).json({ success: true, message: message });
    });
});

// Helper functions for validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateUsername(username) {
    // Username should be at least 3 characters long and contain only letters and digits
    const usernameRegex = /^[A-Za-z\d]{3,}$/;
    return usernameRegex.test(username);
}

function validatePassword(password) {
    // Password should be at least 8 characters long and contain at least one letter and one digit
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
}
app.post('/getUserTexts', (req, res) => {
    const { username, password } = req.body;

    // Проверяем существование пользователя с заданным именем и паролем
    const userQuery = `SELECT UserID FROM Users WHERE Username = ? AND Password = ?`;
    const userValues = [username, password];

    db.query(userQuery, userValues, (error, results) => {
        if (error) {
            console.error('Ошибка при проверке пользователя:', error);
            return res.status(500).json({ success: false, message: 'Ошибка сервера при проверке пользователя' });
        }

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Неверное имя пользователя или пароль' });
        }

        // Получаем ID пользователя
        const userID = results[0].UserID;

        // SQL-запрос для получения всех текстов пользователя
        const textsQuery = `SELECT TextID, TextContent, SavedAt FROM Texts WHERE UserID = ?`;
        const textsValues = [userID];

        db.query(textsQuery, textsValues, (error, results) => {
            if (error) {
                console.error('Ошибка при получении текстов пользователя:', error);
                return res.status(500).json({ success: false, message: 'Ошибка сервера при получении текстов пользователя' });
            }

            res.status(200).json({ success: true, userTexts: results });
        });
    });
});

app.post('/saveText', (req, res) => {
    const { username, password, textContent } = req.body;

    // Проверка размера текста
    if (textContent.length < 10) {
        return res.status(400).json({ success: false, message: 'Текст должен быть не менее 10 символов' });
    }
    if (textContent.length > 4000) {
        return res.status(400).json({ success: false, message: 'Текст должен быть не более 4000 символов' });
    }

    // Проверка количества сохраненных текстов для пользователя
    const textCountQuery = `SELECT COUNT(*) AS TextCount FROM Texts WHERE UserID = (SELECT UserID FROM Users WHERE Username = ? AND Password = ?)`;
    const textCountValues = [username, password];

    db.query(textCountQuery, textCountValues, (error, results) => {
        if (error) {
            console.error('Ошибка при проверке количества сохраненных текстов:', error);
            return res.status(500).json({ success: false, message: 'Ошибка сервера при проверке количества сохраненных текстов' });
        }

        const textCount = results[0].TextCount;
        if (textCount >= 10) {
            return res.status(400).json({ success: false, message: 'Превышено максимальное количество сохраненных текстов (10)' });
        }

        // Пользователь может сохранить текст
        const userQuery = `SELECT UserID FROM Users WHERE Username = ? AND Password = ?`;
        const userValues = [username, password];

        db.query(userQuery, userValues, (error, results) => {
            if (error) {
                console.error('Ошибка при проверке пользователя:', error);
                return res.status(500).json({ success: false, message: 'Ошибка сервера при проверке пользователя' });
            }

            if (results.length === 0) {
                return res.status(401).json({ success: false, message: 'Неверное имя пользователя или пароль' });
            }

            const userID = results[0].UserID;
            const savedAt = new Date();

            const textQuery = `INSERT INTO Texts (UserID, TextContent, SavedAt) VALUES (?, ?, ?)`;
            const textValues = [userID, textContent, savedAt];

            db.query(textQuery, textValues, (error, results) => {
                if (error) {
                    console.error('Ошибка при сохранении текста:', error);
                    return res.status(500).json({ success: false, message: 'Ошибка сервера при сохранении текста' });
                }

                res.status(200).json({ success: true, message: 'Текст успешно сохранен' });
            });
        });
    });
});

app.post('/deleteText', (req, res) => {
    const { enteredUsername, password, textId } = req.body;

    // Проверка пользователя по имени и паролю
    const userQuery = 'SELECT UserID FROM Users WHERE Username = ? AND Password = ?';
    db.query(userQuery, [enteredUsername, password], (error, userResults) => {
        if (error) {
            console.error('Ошибка при проверке пользователя:', error);
            return res.status(500).json({ success: false, message: 'Ошибка сервера при проверке пользователя' });
        }

        if (userResults.length === 0) {
            return res.status(401).json({ success: false, message: 'Неверное имя пользователя или пароль' });
        }

        const userID = userResults[0].UserID;

        // Удаление текста
        const deleteTextQuery = 'DELETE FROM Texts WHERE TextID = ? AND UserID = ?';
        db.query(deleteTextQuery, [textId, userID], (error, deleteResults) => {
            if (error) {
                console.error('Ошибка при удалении текста:', error);
                return res.status(500).json({ success: false, message: 'Ошибка сервера при удалении текста' });
            }

            if (deleteResults.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Текст не найден или пользователь не имеет прав на удаление' });
            }

            res.status(200).json({ success: true, message: 'Текст успешно удален' });
        });
    });
});

// Маршрут для сохранения данных в таблицу TextChecks
app.post('/save-check', (req, res) => {
    const {
        UserID,
        UniqueWords,
        SpamPercentage,
        OriginalityPercentage,
        ErrorCount,
        WordCount,
        CharacterCount,
        Language,
        TextStyle,
        IPAddress
    } = req.body;

    const sql = `INSERT INTO TextChecks (
        UserID,
        UniqueWords,
        SpamPercentage,
        OriginalityPercentage,
        ErrorCount,
        WordCount,
        CharacterCount,
        Language,
        TextStyle,
        IPAddress
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
        UserID,
        UniqueWords,
        SpamPercentage,
        OriginalityPercentage,
        ErrorCount,
        WordCount,
        CharacterCount,
        Language,
        TextStyle,
        IPAddress
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Ошибка выполнения запроса:', err);
            res.status(500).send('Ошибка выполнения запроса');
            return;
        }
        res.status(200).send('Данные успешно сохранены');
    });
});

app.get('/get-client-ip', (req, res) => {
    // Получаем IP-адрес клиента из объекта запроса req
    const ipAddress = req.ip || req.connection.remoteAddress;
    res.send(ipAddress);
});

app.post('/getUserChecks', (req, res) => {
    const { username, password } = req.body;

    const userQuery = 'SELECT UserID FROM Users WHERE Username = ? AND Password = ?';
    db.query(userQuery, [username, password], (error, userResults) => {
        if (error) {
            console.error('Ошибка при проверке пользователя:', error);
            return res.status(500).json({ success: false, message: 'Ошибка сервера при проверке пользователя' });
        }

        if (userResults.length === 0) {
            return res.status(401).json({ success: false, message: 'Неверное имя пользователя или пароль' });
        }

        const userID = userResults[0].UserID;
        const checksQuery = `SELECT * FROM TextChecks WHERE UserID = ?`;
        db.query(checksQuery, [userID], (error, checksResults) => {
            if (error) {
                console.error('Ошибка при получении проверок пользователя:', error);
                return res.status(500).json({ success: false, message: 'Ошибка сервера при получении проверок пользователя' });
            }

            res.status(200).json({ success: true, userChecks: checksResults });
        });
    });
});

app.post('/getAllChecks', (req, res) => {
    const { username, password } = req.body;
    const userQuery = 'SELECT UserID FROM Users WHERE Username = ? AND Password = ?';
    db.query(userQuery, [username, password], (error, userResults) => {
        if (error) {
            console.error('Ошибка при проверке пользователя:', error);
            return res.status(500).json({ success: false, message: 'Ошибка сервера при проверке пользователя' });
        }

        if (userResults.length === 0) {
            return res.status(401).json({ success: false, message: 'Неверное имя пользователя или пароль' });
        }

        const userID = userResults[0].UserID;
        const checksQuery = `SELECT * FROM TextChecks`;
        db.query(checksQuery, [userID], (error, checksResults) => {
            if (error) {
                console.error('Ошибка при получении проверок:', error);
                return res.status(500).json({ success: false, message: 'Ошибка сервера при получении проверок пользователя' });
            }

            res.status(200).json({ success: true, userChecks: checksResults });
        });
    });
});