import axios from 'axios';

const useTextUpgrader = (text) => {
    const apiKey = 'sk-a0d6731cba2248cdabcad3f3f8306a20'; // Замените на ваш собственный API ключ
    const apiUrl = 'https://api.deepseek.com/v1/chat/completions'; // Замените на правильный URL вашего API

    const sanitizeText = (inputText) => {
        // Удаляем символы ** и заменяем \n на перенос строки
        const sanitizedText = inputText
            .replace(/\*\*/g, '') // Удаляем **
            .replace(/\`\`\`/g, '') // Удаляем ```
            .replace(/\n/g, '\n'); // Заменяем \n на перенос строки

        return sanitizedText.trim(); // Удаляем пробелы в начале и конце строки после санитизации
    };

    const upgradeText = async (inputText) => {
        console.log("IF THE ENTERED TEXT DOES NOT MAKE SENSE OR IS OFFENSIVE, SEND 'rejected' AND NOTHING MORE. IMPROVE THE TEXT PROVIDED AFTER: FROM THE POINT OF VIEW OF GRAMMAR, PUNCTUATION, SEQUENCE AND CONCISENESS, YOU CAN ALSO ADD SOME ADDITIONAL DETAILS. UNDER NO CIRCUMSTANCES SHOULD YOU CHANGE THE ORIGINAL LANGUAGE OF THE TEXT.\n" + inputText);
        
        // Проверяем, что текст определен и не пустой
        if (typeof inputText !== 'string' || !inputText.trim()) {
            throw new Error('Недопустимый текст');
        }

        const data = JSON.stringify({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: inputText } // Используем исходный текст без изменений
            ],
            frequency_penalty: 0,
            max_tokens: 4096,
            presence_penalty: 0,
            stop: null,
            stream: false,
            temperature: 0.7,
            top_p: 1,
            logprobs: false,
            top_logprobs: null
        });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: apiUrl,
            headers: { 
                'Content-Type': 'application/json', 
                'Accept': 'application/json', 
                'Authorization': `Bearer ${apiKey}`
            },
            data: data
        };

        try {
            const response = await axios(config);
            const upgradedText = response.data.choices[0].message.content;

            // Санитизация улучшенного текста перед возвратом
            const sanitizedText = sanitizeText(upgradedText);
            console.log("Upgraded and sanitized text:\n" + sanitizedText);

            return sanitizedText;
        } catch (error) {
            console.error('Ошибка при улучшении текста:', error.response ? error.response.data : error.message);
            throw error;
        }
    };

    return { upgradeText };
};

export default useTextUpgrader;
