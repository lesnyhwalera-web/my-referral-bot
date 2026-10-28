const TelegramBot = require('node-telegram-bot-api');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

// 1. Подключаем ключ Firebase из настроек сервера (Render)
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// 2. Подключаем бота (ВАШ ТОКЕН)
const token = '8947148164:AAF8ESumSy73yuu68B0kJQtm65xPt4gewNI';
const bot = new TelegramBot(token, { polling: true });

// 3. Ловим команду /start
bot.onText(/\/start(?: (.+))?/, async (msg, match) => {
  const userId = String(msg.chat.id);
  const referrerId = match && match[1] ? match[1] : null; 

  if (referrerId) {
    try {
      await db.collection('users').doc(userId).set({
        referred_by: referrerId,
        joined_at: FieldValue.serverTimestamp()
      }, { merge: true });

      bot.sendMessage(userId, 'Добро пожаловать! Вы пришли по приглашению.');
    } catch (error) {
      console.error('Ошибка записи в Firebase:', error);
      bot.sendMessage(userId, 'Произошла ошибка, но вы все равно в игре!');
    }
  } else {
    bot.sendMessage(userId, 'Добро пожаловать!');
  }
});

console.log('Бот запущен и работает...');