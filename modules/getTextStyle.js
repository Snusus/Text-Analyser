import axios from 'axios';

const useTextStyleClassifier = () => {
  const apiKey = 'sk-a0d6731cba2248cdabcad3f3f8306a20'; // Замените на ваш собственный API ключ
  const apiUrl = 'https://api.deepseek.com/v1/chat/completions'; // Замените на правильный URL вашего API

  const classifyTextStyle = async (text) => {
    // Проверяем, что текст определен и не пустой
    if (typeof text !== 'string' || !text.trim()) {
      throw new Error('Недопустимый текст');
    }

    // Формируем запрос к нейросети
    const prompt = `Please classify the following text into one of the following styles: 0. Unknown or text with no sense 1. Scientific, 2. Official, 3. Journalistic, 4. Сonversational, 5. Artistic. Return only the number corresponding to the style.\n\n${text}`;

    const data = JSON.stringify({
        model: 'deepseek-chat',
        messages: [
            { role: 'system', content: prompt }
        ],
        frequency_penalty: 0,
        max_tokens: 10,
        presence_penalty: 0,
        stop: null,
        stream: false,
        temperature: 0.0,
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
      const result = response.data.choices[0].message.content.trim();
      const styleCode = parseInt(result, 10);
      console.log(response);
      if (isNaN(styleCode) || styleCode < 0 || styleCode > 5) {
        throw new Error('Ошибка в классификации текста');
      }

      return styleCode;
    } catch (error) {
      console.error('Ошибка при классификации текста:', error.response ? error.response.data : error.message);
      throw error;
    }
  };

  return { classifyTextStyle };
};

export default useTextStyleClassifier;
