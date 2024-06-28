// languageDetection.js
import franc from 'franc';
import { useTranslation } from 'react-i18next';

const useLanguageDetection = () => {
    const { t } = useTranslation();

    const detectLanguage = (text) => {
        try {
            const detectedLanguage = franc(text).toLowerCase();
            const languageKey = `languages.${detectedLanguage}`;
            if (t(languageKey) !== languageKey) {
                return t(languageKey);
            } else {
                return t('languages.unknown');
            }
        } catch (error) {
            return t('languages.unknown');
        }
    };

    return { detectLanguage };
};

export default useLanguageDetection;
