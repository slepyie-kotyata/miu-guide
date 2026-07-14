# ММУ — Цифровой куратор

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

**ММУ — Цифровой куратор** — приложение с цифровым персонажем **Мико**, который встречает нового
студента и проводит его по университету как живой куратор, только цифровой. Мико —
это котик с мягким тоном общения, который помогает освоиться, показывает карту
корпуса, рассказывает правила и подсказывает, где следующая пара.

### Уровни реализации (по брифу хакатона)

| Уровень    | Описание                                                                       | Статус          |
|------------|--------------------------------------------------------------------------------|-----------------|
| **MVP**    | Персонаж + сценарий «Первый день в ММУ» + карта с кликабельными пространствами | ✅ Готово        |
| **Target** | Несколько сценариев, расписание, маршруты по корпусу                           | ✅ Готово        |
| **Star ★** | Маскот знает расписание студента и показывает, где следующая пара              | ✅ Готово        |

---

## Технологии

| Слой | Технологии |
|------|-----------|
| **Frontend** | Ionic 8, Angular 20, TypeScript 5.9, Capacitor 8, pinch-zoom-element,Signals, Standalone Components |
| **Backend** | Go 1.26, Echo v5, Redis (go-redis v9), Swagger (echo-swagger v2), godotenv, imroc/req v3 (Chrome impersonation) |
| **Mobile** | Capacitor 8, Android (Gradle, Java 21, Android SDK 35), @capacitor/assets |
| **Infra** | Docker (multi-stage, scratch), GitHub Actions, Node 24 |

---

## Дизайн

Макеты приложения доступны в Figma:

[ММУ — Цифровой куратор в Figma](https://www.figma.com/design/e7qhNexTiwZUSXTxVxeH9D/%D0%9C%D0%9C%D0%A3---%D0%A6%D0%B8%D1%84%D1%80%D0%BE%D0%B2%D0%BE%D0%B9-%D0%BA%D1%83%D1%80%D0%B0%D1%82%D0%BE%D1%80)

---

## Реализованный функционал

### Frontend

#### Аутентификация
- Вход по логину и паролю от личного кабинета ММУ (FormData POST на backend, который проксирует запрос к Moodle API)
- Токен и `user_id` хранятся в `localStorage`
- `AuthInterceptor` автоматически добавляет `Authorization: Bearer <token>` на `/access/*` запросы
- `authGuard` защищает страницы расписания, профиля и дисциплин; неавторизованный пользователь перенаправляется на `/login`
- Приложение работает без авторизации: доступна карта, onboarding и чат с маскотом

#### Профиль студента
- ФИО, группа, курс, направление подготовки, специализация, институт
- Кнопка копирования направления в буфер обмена с toast-уведомлением
- Список дисциплин текущего семестра (отдельная страница, защищена authGuard)
- Ссылки на Moodle и FAQ
- Выход из аккаунта (очистка токена + localStorage)
- Skeleton-загрузка данных

#### Расписание
- Недельный навигатор с переключением между неделями (стрелки вперёд/назад)
- Определение типа недели (чётная / нечётная) через ISO-номер недели
- Выбор конкретного дня из ленты дней недели
- Загрузка расписания по `group_id` и дате (`formatApiDate` — локальное время, без UTC-сдвига)
- Интеграция с чатом: маскот может отправить пользователя на расписание сегодня/завтра/текущей недели (через `ChatNavigationService` → `pendingScheduleDay` signal)
- Состояние загрузки и обработка ошибок (эмодзи-реакция маскота при ошибке)

#### Интерактивная карта корпуса
- Два корпуса: **Главный корпус (ГК)** — 6 этажей, **Зельев переулок (ЗП)** — 4 этажа
- SVG-карты с pinch-zoom (`pinch-zoom-element`)
- Кликабельные точки интереса (POI) — модальное окно с названием, категорией и описанием помещения
- 14 предзаданных помещений (атриум, столовая, библиотека, кофейня, буфет, типография, МАЗ, БАЗ, деканат, бухгалтерия, и др.)
- Автоматическое переключение этажа во время onboarding-экскурсии
- Зум к точке при onboarding-подсветке (2x scale, целевая позиция 40% по вертикали — чтобы диалог не перекрывал)
- Сброс состояния карты при смене этажа, корпуса или возврате на вкладку (`triggerMapReset`)
- Модальное окно мероприятий Дня знаний для направления студента

#### Маскот Мико — Onboarding-движок
- **61-шаговый JSON-сценарий** (`mascot-script-firstday.json`) — приветствие → выбор авторизации → правила → экскурсия по корпусу → знакомство с функциями приложения → прощание
- **Persistence**: прогресс сохраняется в `localStorage` (`onboardingStepId`), возобновляется при перезагрузке
- **Интерполяция текста**: подстановка направления подготовки (`&value`), имени студента (`&value`)
- **Тёмный/светлый backdrop**: шаги 1–18 и 56+ — тёмный overlay; шаги 19–55 — светлый (карта видна во время экскурсии)
- **Ветвление**: шаг 2 (выбор авторизации) → `/login` или `/profile`; шаг 3 (выбор направления) → dropdown с направлениями из API
- **Спец-переходы**: шаг 5 (AUTH_REDIRECT) ↔ шаг 9 (POST_AUTH) — двухсторонняя навигация
- **Restart-сегменты** из чата: «Повторить правила» (шаги 9–15), «Повтор экскурсии» (шаги 16–53)
- **Пропуск**: кнопка «Пропустить» доступна с шага 9
- **9 эмоций маскота**: `sit`/`paw` (поза) × `eopen`/`eclosed` (глаза) × `mopen`/`mclosed` (рот) + `sad` — WebP-спрайты в `assets/cat/`
- **Видимость**: маскот отображается только на `/tabs/map` и `/tabs/schedule` (для авторизованных); при активном onboarding — на всех страницах
- Tab bar затемняется и блокируется во время onboarding (`isOverlayActive`)

#### Чат с маскотом
- **Intent-матчер**: TF-IDF cosine similarity (вес 0.6) + Levenshtein token similarity (вес 0.4), порог 0.15
- **16 интентов**: `next_class_location`, `schedule_today`, `schedule_tomorrow`, `schedule_week`, `find_teacher`, `exam_session_unavailable`, `about_atrium`, `find_coffee`, `repeat_rules`, `repeat_excursion`, `rofl`, `rof2`, `rof3`, `fallback_unknown1/2/3`
- **Suggested questions**: карточки с предзаданными вопросами (`standard_question: true`)
- **Typing indicator**: анимация трёх точек, задержка пропорциональна длине ответа (800–3000 мс)
- **Поиск преподавателей**: двухшаговый режим — пользователь спрашивает «Как зовут преподавателя?», маскот просит уточнить фамилию, затем запрашивает API
- **Навигация из чата**: интенты `schedule_today/tomorrow/week` и `next_class_location` перенаправляют на вкладку расписания
- **Обработка ошибок**: offline-сообщения, server-error фразы (random из 3 вариантов)
- **Эмоции**: реакция маскота зависит от интента (rofl → `paw-eclosed-mopen`, schedule → `sit-eopen-mopen`, default → `paw-eopen-mopen`)

#### Нативные сервисы (Capacitor)
- **Haptics**: impact (Light/Medium), notification (Success/Error), selection — только на native-платформе
- **StatusBar**: белый фон, светлый стиль, non-overlay
- **Keyboard**: resize mode `ionic`, resize on full screen

#### Дизайн-система
- CSS-переменные `--miu-*`: жёлтая брендовая палитра (`#fbc02d`, `#ffd600`), текстовые цвета, фоны, тени, border-radius
- Тёмный tab bar (`#111111`) на нижней панели навигации
- Карточные тени (`--miu-card-shadow`, `--miu-card-shadow-yellow`)
- SCSS-миксины (`safe-area-top`, `page-title`, `yellow-card`, `sheet-modal`)
- Shared-компонент `ActionButtonComponent` — переиспользуемая жёлтая кнопка

### Backend

#### Аутентификация
- `POST /auth` — проксирование логина/пароля к Moodle Mobile API (Chrome impersonation через `imroc/req v3`)
- Возвращает `{token, user_id}`; Moodle `wstoken` используется для последующих запросов

#### Информация о пользователе
- `GET /access/users/:id` — enriched-данные: ФИО, группа, `group_id`, направление, специализация, курс (вычисляется из названия группы), институт
- `GET /access/users/:id/subjects` — дисциплины текущего семестра: фильтрация по `весна`/`осень` + merge дубликатов с объединением преподавателей
- Bearer-token middleware на группе `/access/*`

#### Расписание
- `GET /schedule/:group?day=YYYY.MM.DD` — расписание группы на конкретный день
- `GET /schedule/:group/today` — расписание на сегодня (московское время)
- Redis-кэширование: cache-first, TTL 24 часа, асинхронная запись в фон (500 мс context)
- Фильтрация и группировка: объединение преподавников по аудиториям, сортировка по номеру пары

#### Поиск
- `GET /search?lecturer=...` — поиск преподавателей по фамилии во внешнем API расписания

#### Mock-данные
- `GET /majors` — список уникальных направлений подготовки (17 групп-кодов → 13 направлений)
- `GET /events?major=...` — расписание мероприятий Дня знаний для направления

#### Инфраструктура
- CORS middleware (`ALLOW_ORIGINS` из env)
- Структурированный JSON-логгер (`slog`, уровень через `LOG_LEVEL`)
- Централизованная обработка ошибок (`apperror.AppError` с `Source` и HTTP-маппингом)
- Swagger UI на `/swagger/*`

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
npm start
```

Приложение будет доступно на `http://localhost:8100`.

> **Важно:** бэкенд настроен на CORS с `http://localhost:8100`
> (см. `backend/cmd/server/main.go`). Используйте именно этот порт.

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

### Swagger

Локально:
```
http://localhost:1323/swagger/index.html
```

Production:
```
https://miu-api.enjine.ru/swagger/index.html
```

---

## Docker-запуск

В корне проекта есть `docker-compose.yml` для запуска backend:

```bash
docker compose up --build
```

Backend собирается в **multi-stage Docker-образ** на базе `scratch`:
- **Stage 1** (`golang:1.26.5-alpine`): сборка статического бинарника + `tzdata` + `ca-certificates`
- **Stage 2** (`scratch`): только бинарник, zoneinfo и CA-сертификаты

> **Примечание:** `docker-compose.yml` описывает только backend.
> Frontend запускается локально через `npm start`.

---

## Переменные окружения

Скопируйте `.env.example` в `.env` и заполните значения:

```bash
cp .env.example .env
```

| Переменная                  | Описание                                                     | Обязательно |
|-----------------------------|--------------------------------------------------------------|-------------|
| `MIU_SCHEDULE_BASE_API_URL` | Базовый URL внешнего API расписания ММУ                      | ✅          |
| `MIU_SCHEDULE_API_USERNAME` | Логин для Basic Auth к API расписания                        | ✅          |
| `MIU_SCHEDULE_API_PASSWORD` | Пароль для Basic Auth к API расписания                       | ✅          |
| `MIU_API_LOGIN_URL`         | URL Moodle API для авторизации (login/token)                 | ✅          |
| `MIU_API_ACCOUNT_URL`       | URL Moodle API для запросов данных (webservice/rest)         | ✅          |
| `REDIS_CONNECTION_URL`      | URL подключения к Redis (например, `redis://localhost:6379`) | ✅          |
| `ALLOW_ORIGINS`             | Разрешённые CORS-origins (через запятую)                     | ❌          |
| `LOG_LEVEL`                 | Уровень логирования (DEBUG, INFO, WARN, ERROR)               | ❌          |

---

## API-документация (Swagger)

**Production:** https://miu-api.enjine.ru/swagger/index.html

**Локально:** http://localhost:1323/swagger/index.html

### Эндпоинты

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| `POST` | `/auth` | — | Авторизация (прокси к Moodle API), возвращает `{token, user_id}` |
| `GET` | `/access/users/:id` | Bearer | Информация о пользователе (ФИО, группа, курс, направление, специализация) |
| `GET` | `/access/users/:id/subjects` | Bearer | Дисциплины текущего семестра (отфильтрованные, без дубликатов) |
| `GET` | `/schedule/:group?day=YYYY.MM.DD` | — | Расписание группы на конкретный день |
| `GET` | `/schedule/:group/today` | — | Расписание группы на сегодня (московское время) |
| `GET` | `/search?lecturer=...` | — | Поиск преподавателей по фамилии |
| `GET` | `/majors` | — | Список направлений подготовки |
| `GET` | `/events?major=...` | — | Расписание мероприятий Дня знаний для направления |
| `GET` | `/swagger/*` | — | Swagger UI |

Расписание кэшируется в Redis на 24 часа. При запросе сначала проверяется кэш;
при промахе данные запрашиваются у внешнего API расписания ММУ, фильтруются и
сохраняются в кэш.

---

## Структура проекта

```
miu-guide/
├── backend/                               # Go API-сервер
│   ├── cmd/server/main.go                 # Точка входа
│   ├── internal/
│   │   ├── apperror/                      # Кастомные ошибки + HTTP-маппинг
│   │   ├── client/                        # HTTP-клиенты (miu.go, schedule.go)
│   │   ├── connection/                    # Подключение к Redis
│   │   ├── env/                           # Чтение переменных окружения
│   │   ├── filter/                        # Фильтрация расписания и дисциплин
│   │   ├── handlers/                      # HTTP-обработчики + middleware
│   │   ├── logger/                        # Структурированный логгер (slog)
│   │   ├── models/                        # Модели данных (user, schedule, major, events)
│   │   ├── routes/                        # Регистрация маршрутов (auth, schedule, search, user, mock)
│   │   ├── service/                       # Бизнес-логика (schedule + Redis-кэш)
│   │   └── utils/                         # Утилиты (дата, московское время)
│   ├── docs/                              # Сгенерированная Swagger-документация
│   ├── Dockerfile                         # Multi-stage build (golang:alpine → scratch)
│   ├── Makefile                           # make run, make swag
│   └── go.mod / go.sum
├── frontend/                              # Ionic + Angular приложение
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── assistant-cat/         # Компонент маскота Мико (onboarding + chat)
│   │   │   │   └── shared/                # Shared-компоненты (ActionButtonComponent)
│   │   │   ├── constants/                 # app-links.ts (URL'ы Moodle, FAQ, сайт)
│   │   │   ├── data/                       # map-data.ts (14 POI)
│   │   │   ├── guards/                    # authGuard
│   │   │   ├── models/                    # User, Lesson, Lecturer, WeekDay
│   │   │   ├── pages/
│   │   │   │   ├── about/                 # О приложении
│   │   │   │   ├── login/                 # Экран авторизации
│   │   │   │   ├── map/                    # Карта корпуса (pinch-zoom, этажи, POI)
│   │   │   │   ├── profile/               # Профиль студента
│   │   │   │   ├── schedule/              # Расписание (недельный навигатор)
│   │   │   │   ├── subjects/              # Дисциплины текущего семестра
│   │   │   │   └── tabs/                  # Навигация по вкладкам
│   │   │   ├── services/
│   │   │   │   ├── assistant/             # 10 сервисов маскота (onboarding, chat, emotions, visibility, loader, persistence, matching, navigation, teacher-search, mascot-data)
│   │   │   │   ├── capacitor/             # Нативные сервисы (haptics, keyboard, status-bar)
│   │   │   │   ├── auth.service.ts        # Авторизация (token, user_id)
│   │   │   │   ├── user.service.ts        # Данные пользователя + дисциплины
│   │   │   │   ├── schedule.service.ts    # Запрос расписания
│   │   │   │   ├── search.service.ts      # Поиск преподавателей, направления, мероприятия
│   │   │   │   └── map-svg-render.service.ts  # Загрузка/подсветка/зум SVG-карты
│   │   │   ├── utils/                     # date-utils, event-parser
│   │   │   ├── app.component.ts           # Root (status bar, keyboard, onboarding, assistant-cat)
│   │   │   ├── app.routes.ts              # Маршруты (login, tabs, subjects, about, wildcard)
│   │   │   └── auth.interceptor.ts        # HTTP-interceptor (Bearer token на /access/*)
│   │   ├── assets/
│   │   │   ├── cat/                       # 9 WebP эмоций маскота
│   │   │   ├── icons/                     # 13 SVG/PNG иконок
│   │   │   ├── maps/                      # SVG-карты (maps_1: 6 этажей ГК, maps_2: 4 этажа ЗП)
│   │   │   └── mascot/                    # JSON-сценарии (phrases, questions, firstday)
│   │   ├── environments/                  # environment.ts, environment.prod.ts, version.ts (auto-gen)
│   │   └── theme/                         # variables.scss (дизайн-токены), mixins/
│   ├── resources/                          # Исходники иконок (icon.png, splash.png, adaptive)
│   ├── scripts/generate-version.js         # Генерация version.ts из package.json
│   ├── capacitor.config.ts                # appId, appName, StatusBar, Keyboard
│   ├── angular.json
│   └── package.json
├── design/                                # Исходники маскота
│   ├── png-ver/                           # 8 PNG эмоций
│   └── webp-ver/                          # 8 WebP эмоций
├── docs/                                  # Документация сценария
│   ├── first-day.md                       # Сценарий «Первый день в ММУ»
│   ├── mascot.md                          # Описание персонажа Мико
│   ├── poi.md                             # 14 точек интереса на карте
│   ├── mascot-phrases.json                # Фразы маскота (onboarding, greeting, errors, POI-taps)
│   └── mascot-questions.json              # Вопросы/интенты маскота
├── .github/workflows/build-apk.yml        # CI: сборка release Android APK
├── docker-compose.yml                     # Backend (Go + Redis)
├── .env.example
├── .nvmrc                                 # Node 24
└── LICENSE                                # MIT
```

---

## CI/CD

Сборка Android APK автоматизирована через GitHub Actions
(`.github/workflows/build-apk.yml`).

**Триггер:** Pull Request из ветки `dev/front` в `main`
(а также ручной запуск через `workflow_dispatch`).

**Пайплайн:**

1. Checkout с полной историей (`fetch-depth: 0`) для подсчёта коммитов
2. Вычисление версии: `versionName` из `package.json`, `versionCode` = `git rev-list --count HEAD`
3. Установка Node 24 + `npm ci`
4. Инъекция версии в `package.json`
5. Сборка веб-приложения (`npm run build` + `prebuild` генерация `version.ts`)
6. Установка Java 21 + Android SDK 35
7. `npx cap add android` — добавление платформы
8. `npx capacitor-assets generate --android` — генерация иконок и splash из `resources/`
9. Инъекция `versionCode` в `build.gradle`
10. Декодирование release-keystore из GitHub Secrets (`ANDROID_KEYSTORE_BASE64`)
11. `npx cap sync android`
12. `./gradlew assembleRelease` — release-сборка с подписанием (keystore из Secrets)
    - Если keystore не настроен — fallback на `assembleDebug`
13. Загрузка APK-артефакта (`miu-guide-release-apk`, хранение 14 дней)
14. При мерже PR в `main` — создание GitHub Release с названием «ММУ — Цифровой куратор v…» и APK

**Секреты GitHub** (для release-подписи):

| Secret | Описание |
|--------|----------|
| `ANDROID_KEYSTORE_BASE64` | Base64-кодированный `.keystore` файл |
| `KEYSTORE_PASSWORD` | Пароль от keystore |
| `KEY_ALIAS` | Алиас ключа (например, `miu`) |
| `KEY_PASSWORD` | Пароль от ключа |

---

## Команда и вклад

Проект разработан командой **«Слепые Котята»** в рамках хакатона
MIU Code & Connect 2026.

- Репозиторий: [slepyie-kotyata/miu-guide](https://github.com/slepyie-kotyata/miu-guide)
- Лицензия: [MIT](LICENSE)

---

## Что дальше

- [ ] Маршруты по картам (pathfinding между точками)
- [ ] Ссылки на занятия (маскот запрашивает ссылку на текущую пару через API и отправляет пользователю)
- [ ] Пуш-уведомления о парах и мероприятиях
- [ ] iOS-сборка
- [ ] Расширенные ответы в чате с маскотом (контекстные, на основе расписания)
