# MIU Guide

> Интерактивный цифровой куратор для студентов Московского Международного Университета (ММУ).

Проект создан в рамках хакатона **MIU Code & Connect 2026** командой **«Слепые Котята»**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node-24-green.svg)](.nvmrc)
[![Go](https://img.shields.io/badge/Go-1.26-00ADD8.svg)](backend/go.mod)
[![Ionic](https://img.shields.io/badge/Ionic-8-3880ff.svg)](frontend/package.json)
[![Angular](https://img.shields.io/badge/Angular-20-dd0031.svg)](frontend/package.json)

---

## О проекте

### Контекст

Первый день в новом университете — это стресс. Где деканат? Где библиотека? Где моя
аудитория? Новый студент или абитуриент попадает в незнакомое пространство и остаётся
один на один с навигацией. Сайт университета есть, но он не провожает, а просто
информирует.

### Проблема

Человек не знает, где что находится, к кому обратиться и как устроена жизнь в ММУ.

### Решение

**MIU Guide** — приложение с цифровым персонажем **Мико**, который встречает нового
студента и проводит его по университету как живой куратор, только цифровой. Мико —
это котик с мягким тоном общения, который помогает освоиться, показывает карту
корпуса, рассказывает правила и подсказывает, где следующая пара.

### Уровни реализации (по брифу хакатона)

| Уровень    | Описание                                                                       | Статус          |
|------------|--------------------------------------------------------------------------------|-----------------|
| **MVP**    | Персонаж + сценарий «Первый день в ММУ» + карта с кликабельными пространствами | Готово          |
| **Target** | Несколько сценариев, расписание, маршруты по корпусу                           | В работе        |
| **Star ★** | Маскот знает расписание студента и показывает, где следующая пара              | В работе        |

---

## Технологии

| Слой | Технологии |
|------|-----------|
| **Frontend** | Ionic 8, Angular 20, TypeScript 5.9, Capacitor 8, pinch-zoom-element |
| **Backend** | Go 1.26, Echo v5, Redis (go-redis v9), Swagger (echo-swagger v2), godotenv |
| **Mobile** | Capacitor 8, Android (Gradle, Java 21, Android SDK 35) |
| **Infra** | Docker, GitHub Actions, Node 24 |

---

## Быстрый старт (локально)

### Требования

- **Node.js** 24 (см. `.nvmrc`)
- **Go** 1.26+
- **Redis** (локально или по URL)

### Frontend

```bash
cd frontend
npm install
npm start -- --port 8100
```

Приложение будет доступно на `http://localhost:8100`.

> **Важно:** бэкенд настроен на CORS с `http://localhost:8100`
> (см. `backend/cmd/server/main.go`). Используйте именно этот порт.
> Также можно запустить через Ionic CLI: `ionic serve`.

### Backend

1. Создайте файл `.env` в корне проекта на основе `.env.example`
   (см. раздел [Переменные окружения](#переменные-окружения)).

2. Запустите Redis (например, через Docker):
   ```bash
   docker run -d -p 6379:6379 redis
   ```

3. Запустите backend:
   ```bash
   cd backend
   make run
   ```

Сервер будет доступен на `http://localhost:1323`.

---

## Docker-запуск

В корне проекта есть `docker-compose.yml` для запуска backend:

```bash
docker compose up --build
```

> **Примечание:** в текущей версии `docker-compose.yml` описан только backend.
> Frontend запускается локально через `npm start`.

---

## Переменные окружения

Скопируйте `.env.example` в `.env` и заполните значения:

```bash
cp .env.example .env
```

| Переменная                  | Описание                                                     |
|-----------------------------|--------------------------------------------------------------|
| `MIU_SCHEDULE_BASE_API_URL` | Базовый URL API расписания ММУ                               |
| `MIU_SCHEDULE_API_USERNAME` | Логин для Basic Auth к API расписания                        |
| `MIU_SCHEDULE_API_PASSWORD` | Пароль для Basic Auth к API расписания                       |
| `REDIS_CONNECTION_URL`      | URL подключения к Redis (например, `redis://localhost:6379`) |

---

## API-документация (Swagger)

После запуска backend Swagger UI доступен по адресу:

```
http://localhost:1323/swagger/index.html
```

### Эндпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/schedule/:group` | Расписание группы на конкретный день (`?day=YYYY.MM.DD`) |
| `GET` | `/schedule/:group/today` | Расписание группы на сегодня |
| `GET` | `/test` | Тестовый эндпоинт для проверки работоспособности |

Расписание кэшируется в Redis на 24 часа. При запросе сначала проверяется кэш;
при промахе данные запрашиваются у внешнего API расписания ММУ, фильтруются и
сохраняются в кэш.

---

## Структура проекта

```
miu-guide/
├── backend/                           # Go API-сервер
│   ├── cmd/server/main.go             # Точка входа
│   ├── internal/
│   │   ├── client/                    # HTTP-клиент внешнего API расписания
│   │   ├── connection/                # Подключение к Redis
│   │   ├── env/                       # Чтение переменных окружения
│   │   ├── filter/                    # Фильтрация и группировка расписания
│   │   ├── handlers/                  # HTTP-обработчики
│   │   ├── models/                    # Модели данных
│   │   └── routes/                    # Регистрация маршрутов
│   ├── docs/                          # Сгенерированная Swagger-документация
│   ├── Dockerfile
│   ├── Makefile
│   └── go.mod / go.sum
├── frontend/                          # Ionic + Angular приложение
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/assistant-cat/  # Компонент маскота Мико
│   │   │   ├── login/                # Экран авторизации
│   │   │   ├── services/             # AuthService, AssistantService
│   │   │   ├── tab1/                 # Карта корпуса (pinch-zoom, этажи)
│   │   │   ├── tab2/                 # Расписание
│   │   │   ├── tab3/                 # Профиль
│   │   │   └── tabs/                 # Навигация по вкладкам
│   │   ├── assets/                   # Карты (SVG), эмоции Мико (webp), иконки
│   │   └── theme/                    # Тема оформления
│   ├── capacitor.config.ts           # Конфигурация Android-сборки
│   ├── angular.json
│   └── package.json
├── design/                           # Исходники маскота (PNG / WebP)
├── docs/                             # Сценарии, POI, фразы и вопросы маскота
│   ├── first-day.md                  # Сценарий «Первый день в ММУ»
│   ├── mascot.md                     # Описание персонажа Мико
│   ├── poi.md                        # Точки интереса на карте
│   ├── mascot-phrases.json           # Фразы маскота
│   └── mascot-questions.json         # Вопросы маскота
├── .github/workflows/build-apk.yml   # CI: сборка Android APK
├── docker-compose.yml
├── .env.example
├── .nvmrc                            # Node 24
└── LICENSE                           # MIT
```

---

## CI/CD

Сборка Android APK автоматизирована через GitHub Actions
(`.github/workflows/build-apk.yml`).

**Триггер:** Pull Request из ветки `dev/front` в `main`
(а также ручной запуск через `workflow_dispatch`).

**Пайплайн:**

1. Установка Node 24 и зависимостей (`npm ci`)
2. Сборка веб-приложения (`npm run build`)
3. Установка Java 21 и Android SDK 35
4. Добавление платформы Android через Capacitor (`npx cap add android`)
5. Синхронизация Capacitor (`npx cap sync android`)
6. Сборка debug APK (`./gradlew assembleDebug`)
7. Загрузка артефакта `miu-guide-debug-apk` (хранение 14 дней)
8. При мерже PR в `main` — автоматическое создание GitHub Release с APK

---

## Команда и вклад

Проект разработан командой **«Слепые Котята»** в рамках хакатона
MIU Code & Connect 2026.

- Репозиторий: [slepyie-kotyata/miu-guide](https://github.com/slepyie-kotyata/miu-guide)
- Лицензия: [MIT](LICENSE)

---

## Дорожная карта

- [x] **MVP** — цифровой персонаж Мико, сценарий «Первый день в ММУ»,
      интерактивная карта корпуса с переключением этажей
- [ ] **Target** — API расписания с Redis-кэшированием, экран расписания,
      маршруты по корпусу (ГК / ЗП), профиль студента
- [ ] **Star ★** — маскот знает расписание студента и подсказывает,
      где следующая пара; интеграция чата с бэкендом
