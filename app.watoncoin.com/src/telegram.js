export const getTelegramInitData = () => {
  const tg = window.Telegram?.WebApp;
  if (!tg) {
    console.error("Telegram WebApp not initialized.");
    return null;
  }
  return tg.initData;
};