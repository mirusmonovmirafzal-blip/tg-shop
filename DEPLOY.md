# Деплой: Telegram Mini App

## Шаг 1 — GitHub

1. Создай новый репозиторий на github.com (например `tg-shop`)
2. Загрузи все файлы:
```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/ТВОЙusername/tg-shop.git
git push -u origin main
```

---

## Шаг 2 — Railway

1. Зайди на [railway.app](https://railway.app) → войди через GitHub
2. **New Project → Deploy from GitHub repo** → выбери `tg-shop`
3. Railway автоматически подхватит `railway.toml` и задеплоит

4. После деплоя зайди в проект → **Variables** → добавь все переменные из `.env.example`:

| Ключ | Значение |
|------|----------|
| `MOYSKLAD_TOKEN` | `6975e188b8f9fffa03957b3eecc2598c3e99fd5a` |
| `TELEGRAM_BOT_TOKEN` | `8921043959:AAGlf9C2mA54As92xoFh-0WQd1PHVBXPsPc` |
| `TELEGRAM_ADMIN_ID` | `17666515` |
| `CLICK_SERVICE_ID` | `72796` |
| `CLICK_MERCHANT_ID` | `39704` |
| `CLICK_SECRET_KEY` | `WMrDq56LGIDkb7` |
| `CLICK_MERCHANT_USER_ID` | `55525` |
| `APP_URL` | `https://tg-shop-production.up.railway.app` (твой URL из Railway) |

5. Зайди в **Settings → Networking → Generate Domain** — получишь URL вида `https://xxx.railway.app`
6. Скопируй этот URL — он понадобится дальше

---

## Шаг 3 — BotFather (настройка Mini App)

1. Открой [@BotFather](https://t.me/BotFather) в Telegram
2. Отправь `/mybots` → выбери своего бота
3. **Bot Settings → Menu Button → Configure menu button**
   - URL: `https://xxx.railway.app`
4. Или используй `/newapp`:
   - `/newapp` → выбери бота → введи название → загрузи иконку → введи URL приложения

---

## Шаг 4 — Click: настройка callback URL

В личном кабинете Click (merchant.click.uz):

- **Prepare URL**: `https://xxx.railway.app/api/click/prepare`
- **Complete URL**: `https://xxx.railway.app/api/click/complete`

---

## Готово!

Открой бота в Telegram → нажми кнопку меню → приложение откроется.

---

## Локальный запуск (для разработки)

```bash
# Установить зависимости
npm install
cd client && npm install && cd ..

# Скопировать .env
cp .env.example .env
# Отредактировать .env (APP_URL=http://localhost:3000)

# Запустить
npm run dev
# Фронтенд отдельно (для hot reload):
cd client && npm run dev
```
