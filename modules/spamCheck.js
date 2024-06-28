const Filter = require('bad-words');
const linkify = require('linkify-it')();
const franc = require('franc');
const stopword = require('stopword');

const spamSignalsSource = [
  'win', 'free', 'prize', 'click', 'offer', 'buy', 'cheap', 'urgent', 'cash', 'limited', 'guarantee', 'sale',
  'deal', 'discount', 'earn', 'money', 'credit', 'loan', 'winner', 'congratulations', 'best price', 'exclusive',
  'act now', 'limited time', 'investment', 'lottery', 'miracle', 'one time', 'profit', 'promotion', 'risk-free',
  'save big', 'special offer', 'urgent', 'weight loss', 'cheap', 'bonus', 'amazing', 'bargain', 'выиграй', 'бесплатно',
  'приз', 'кликни', 'предложение', 'купить', 'дешево', 'срочно', 'наличные', 'ограничено',
  'гарантия', 'распродажа', 'сделка', 'скидка', 'заработать', 'деньги', 'кредит', 'заем', 'победитель', 'поздравляем',
  'лучшая цена', 'эксклюзив', 'действуй сейчас', 'ограниченное время', 'инвестиции', 'лотерея', 'чудо', 'единственный раз',
  'прибыль', 'акция', 'без риска', 'сэкономить', 'специальное предложение', 'экстренно', 'похудение', 'дешево', 'бонус',
  'удивительный', 'выгодное предложение'
];

const meaninglessPhrasesSource = [
  'lorem ipsum', 'quick brown fox', 'the lazy dog', 'as soon as possible', 'at the end of the day',
  'in order to', 'needless to say', 'first and foremost', 'in the final analysis', 'for all intents and purposes',
  'in a manner of speaking', 'as a matter of fact', 'in the nick of time', 'for what it’s worth', 'all things considered',
  'time and time again', 'each and every', 'last but not least', 'nobody’s perfect', 'let’s face it',
  'by the same token', 'when all is said and done', 'the fact of the matter is', 'in this day and age',
  'the bottom line is', 'the long and short of it', 'without a doubt', 'needless to say',
  'лора ипсум', 'быстрая коричневая лиса', 'ленивый пес', 'как можно скорее', 'в конце концов',
  'для того чтобы', 'не стоит и говорить', 'в первую очередь', 'в конечном итоге', 'по сути дела',
  'в некотором роде', 'фактически', 'в последний момент', 'чего бы это ни стоило', 'в конечном счете',
  'раз за разом', 'каждый и всякий', 'последний, но не менее важный', 'никто не совершенен', 'давайте признаем',
  'по той же логике', 'когда все сказано и сделано', 'дело в том, что', 'в наши дни',
  'итог таков', 'если коротко', 'без сомнения', 'нет смысла говорить'
];
const useSpamCheck = (text) => {
  const checkSpam = (text) => {
    let spamScore = 0;
    try {
      if (typeof text !== 'string' || text.trim() === '') {
        console.warn('Input text must be a non-empty string');
        return spamScore.toFixed(2)
      }

      const filter = new Filter();
      const detectedLanguage = franc(text);
      const words = text.split(/\s+/).map(word => word.toLowerCase());
      const totalWords = words.length;
      const spamSignals = spamSignalsSource;
      const meaninglessPhrases = meaninglessPhrasesSource;
      const filteredWords = stopword.removeStopwords(words, stopword[detectedLanguage] || stopword.en);

      const spamWordsCount = filteredWords.filter(word => {
        return spamSignals.includes(word) || filter.isProfane(word);
      }).length;

      const hasSuspiciousLinks = linkify.test(text);
      const repeatPattern = /(.)\1{4,}/;
      const hasRepeatedChars = repeatPattern.test(text);

      const wordFrequency = {};
      filteredWords.forEach(word => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      });
      const repeatedWordsCount = Object.values(wordFrequency).filter(count => count > 2).length;

      const containsMeaninglessPhrases = meaninglessPhrases.some(phrase => text.toLowerCase().includes(phrase));

      spamScore = (spamWordsCount / totalWords) * 100;
      if (hasSuspiciousLinks) spamScore += 20;
      if (hasRepeatedChars) spamScore += 10;
      if (repeatedWordsCount > 0) spamScore += repeatedWordsCount * 5;
      if (containsMeaninglessPhrases) spamScore += 15;

      spamScore = Math.min(spamScore, 100);

      return spamScore.toFixed(2);
    } catch (error) {
      return spamScore.toFixed(2);
    }
  };
  return { checkSpam };
};
module.exports = useSpamCheck;
