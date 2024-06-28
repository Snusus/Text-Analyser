// textCheck.js
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

const useTextCheck = () => {
  const { t } = useTranslation();

  const checkText = async (text) => {
    try {
      const response = await axios.post('https://languagetool.org/api/v2/check', null, {
        params: {
          text: text,
          language: i18n.language,
        },
      });

      console.log('Response from LanguageTool:', response.data);

      if (response.data.matches && response.data.matches.length > 0) {
        return response.data.matches;
      } else {
        console.log('Ошибок не найдено.');
        return [{ message: t('app.noErrorsFound') }];
      }
    } catch (error) {
      console.error('Ошибка при проверке текста:', error);
      alert(t('app.textCheckError'));
      return [];
    }
  };

  return { checkText };
};

export default useTextCheck;
