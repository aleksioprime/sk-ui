# sk-ui

Общие компоненты интерфейса школьных сервисов гимназии (Конкурсы, Опросы, Диагностика) на Vue 3 и Tailwind 4:

- элементы формы и раскладки: `UiButton`, `UiInput`, `UiSelect` (свой выпадающий список с поиском и выбором
  нескольких), `UiConfirm` (модальное подтверждение), `UiCard`, `UiBadge`, `UiCopyField`;
- заглушки загрузки: `UiSkeleton`, `SkeletonTable`, `SkeletonList`, `SkeletonPage`;
- бренд гимназии: `BrandMark` (логотип и название сервиса в шапке и на странице входа), `SchoolFooter`
  (ссылка на хаб skolhub.ru и сайт гимназии), `createBrand` для заголовков вкладок;
- `OverflowNav`: меню шапки, лишние пункты уходят в «Ещё», на узких экранах (меньше `sm`) бургер у правого края
  с пунктами и слотом `burger-footer` для блока пользователя;
- `http`: клиент axios под контракт sk-common (продление сессии по 401, `errorMessage`);
- `base.css`: шрифт Golos Text, радиусы, фокус, курсор у кликабельного, единый вид полей и флажков.

Сервисы подключают пакет одинаково, поэтому кнопка, поле или футер правятся один раз.
Палитра у каждого сервиса своя: компоненты ссылаются только на имена токенов.

## Подключение

`package.json` сервиса - архив тега с GitHub (git в образе не нужен):

```json
"sk-ui": "https://github.com/aleksioprime/sk-ui/archive/refs/tags/v0.1.3.tar.gz"
```

Пакет отдаёт исходники `.vue`, поэтому Vite не должен их предсобирать, а vitest должен
обрабатывать их как свой код:

```js
// vite.config.js
export default defineConfig({
  optimizeDeps: { exclude: ['sk-ui'] },
  test: { environment: 'jsdom', server: { deps: { inline: ['sk-ui'] } } },
})
```

### Стили

```css
/* src/styles/main.css */
@import 'tailwindcss';
@import 'sk-ui/base.css';

@theme {
  --color-brand-50: #f4f0ff;
  --color-brand-100: #e9e1ff;
  --color-brand-200: #d4c6fe;
  --color-brand-500: #7c3aed;
  --color-brand-600: #6d28d9;
  --color-brand-700: #5b21b6;
  --color-brand-900: #2e1065;

  --color-surface: #ffffff;
  --color-canvas: #f8f7fc;
  --color-line: #e4e0f0;
  --color-ink: #1d1a2b;
  --color-ink-muted: #5f5a75;
}
```

`base.css` объявляет `@source` на компоненты пакета, отдельно указывать `node_modules` не нужно.
Токены `--color-score-*` нужны только `UiBadge tone="score"` (Конкурсы). Шрифт подключает
`index.html` сервиса ссылкой на Google Fonts.

### Бренд

```js
// src/brand.js
import { createBrand } from 'sk-ui'
export const { SERVICE_NAME, SCHOOL, HUB, pageTitle } = createBrand('Конкурсы')

// src/main.js
import { skUi } from 'sk-ui'
import { SERVICE_NAME } from './brand'
createApp(App).use(skUi, { serviceName: SERVICE_NAME }).mount('#app')
```

`BrandMark` показывает логотип сервиса из бренда (по умолчанию `/favicon.svg` приложения,
иначе `createBrand('Конкурсы', { logo })`); логотип гимназии лежит в пакете.

### Компоненты

```vue
<script setup>
import { SkeletonTable, UiBadge, UiButton, UiCard, UiInput } from 'sk-ui'
</script>
```

## Разработка

```
npm ci
npm run lint
npm test
```

Пакет вместе с сервисом: в `package.json` сервиса временно `"sk-ui": "file:../sk-ui"` и `npm install`;
перед слиянием вернуть архив тега.

## Версии

| Версия | Что изменилось |
|---|---|
| `v0.1.0` | компоненты, бренд, клиент API и базовые стили, вынесенные из Конкурсов, Опросов и Диагностики |
| `v0.1.1` | `UiInput` сжимается до ширины, заданной классом (например, `w-24`) |
| `v0.1.2` | `OverflowNav`: бургер на узких экранах, скрытый ряд измерения не расширяет страницу, «Ещё» не выходит за край экрана |
| `v0.1.3` | `OverflowNav`: бургер у правого края, слот `burger-footer` для блока пользователя, Escape возвращает фокус на кнопку |

Выпуск: поднять `version` в `package.json`, тег `vX.Y.Z`, затем в каждом сервисе новый адрес архива,
`npm install`, зелёные проверки, слияние. Сервисы обновляются по одному.
