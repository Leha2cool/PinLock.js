# Библиотека PinLock: Документация и Руководство (Beta) 1.5.0

## Обзор
PinLock - это JavaScript библиотека для защиты веб-сайтов с помощью еженедельно обновляемого PIN-кода. Она обеспечивает контроль доступа к контенту, требуя от пользователей регулярного ввода нового кода, который публикуется в указанном Telegram-канале.

### Основные возможности:
- **Еженедельная ротация PIN-кодов**
- **Гибкая система конфигурации**
- **Ограничение попыток ввода**
- **Временная блокировка при превышении попыток**
- **Кастомизируемый интерфейс**
- **API для программного управления**

## Установка

### 1. Подключение библиотеки
Добавьте скрипт библиотеки перед закрывающим тегом `</body>`:

```html
<script src="PinLock.js"></script>
```

### 2. Проверка загрузки
Сразу после подключения добавьте проверку:

```html
<script>
  if (!window.__pinLockLibraryLoaded) {
    document.body.innerHTML = `
      <div style="
        color: red;
        padding: 20px;
        text-align: center;
        font-size: 24px;
        font-family: Arial, sans-serif;
        background: #ffecec;
        border: 2px solid red;
        margin: 20px;
      ">
        ОШИБКА: Библиотека проверки PIN не загружена! Сайт не может работать без неё.
      </div>
    `;
    throw new Error('Pin Lock Library required!');
  }
</script>
```

## Конфигурация
Перед подключением библиотеки можно задать конфигурацию:

```html
<script>
  window.PinLockConfig = {
    telegramChannel: '@MySecretChannel',  // Ваш Telegram-канал
    customPinGenerator: null,             // Функция кастомной генерации PIN
    storageKey: 'myAppPinVerification',   // Ключ для localStorage
    maxAttempts: 3,                       // Макс. количество попыток
    lockTime: 120000,                     // Время блокировки (2 минуты)
    colors: {                             // Цветовая схема
      primary: '#E91E63',
      text: '#333333',
      error: '#F44336',
      buttonText: '#FFFFFF',
      inputBg: '#9C27B0',
      inputText: '#FFFFFF'
    },
    messages: {                           // Кастомизация текстов
      instruction: 'Получите код в канале {channel}',
      placeholder: 'Введите код доступа',
      button: 'Проверить',
      error: 'Неверный код! Попробуйте снова',
      attempts: 'Осталось попыток: {attempts}',
      locked: 'Доступ заблокирован на {seconds} секунд',
      expired: 'Код устарел! Ожидайте новый код'
    }
  };
</script>
<script src="pin-lock-library.js"></script>
```

## API библиотеки

### `PinLockLibrary.showPinDialog()`
Принудительно открывает диалог ввода PIN-кода.

**Пример:**
```javascript
// Открыть диалог при клике на кнопку
document.getElementById('show-pin-btn').addEventListener('click', () => {
  PinLockLibrary.showPinDialog();
});
```

### `PinLockLibrary.resetVerification()`
Сбрасывает статус верификации и удаляет все связанные данные.

**Пример:**
```javascript
// Сброс верификации при выходе пользователя
document.getElementById('logout-btn').addEventListener('click', () => {
  PinLockLibrary.resetVerification();
  alert('Верификация сброшена!');
});
```

### `PinLockLibrary.isVerified()`
Возвращает `true`, если пользователь верифицирован для текущей недели.

**Пример:**
```javascript
// Проверка статуса перед показом премиум-контента
function showPremiumContent() {
  if (PinLockLibrary.isVerified()) {
    // Показать премиум-контент
  } else {
    alert('Требуется верификация!');
    PinLockLibrary.showPinDialog();
  }
}
```

### `PinLockLibrary.setCustomPinGenerator(generator)`
Устанавливает пользовательскую функцию для генерации PIN-кода.

**Пример:**
```javascript
// Кастомный генератор PIN на основе недели и секретного ключа
PinLockLibrary.setCustomPinGenerator(() => {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1); // Понедельник
  const weekNum = Math.floor(weekStart / (1000 * 60 * 60 * 24 * 7));
  const secretKey = 12345; // Ваш секретный ключ
  return (weekNum * secretKey) % 10000; // 4-значный PIN
});
```

### `PinLockLibrary.updateConfig(newConfig)`
Обновляет конфигурацию библиотеки.

**Пример:**
```javascript
// Динамическое изменение цветовой схемы
document.getElementById('dark-mode').addEventListener('click', () => {
  PinLockLibrary.updateConfig({
    colors: {
      primary: '#000000',
      text: '#000000',
      error: '#FF0000',
      buttonText: '#ffffff',
      inputBg: '#101010',
      inputText: '#FFFFFF',
      textTimer: '#404040',
      colorBg: '#fff'
  }
  });
});
```

## События

### `pinLockSuccess`
Генерируется при успешной верификации PIN-кода.

**Пример:**
```javascript
document.addEventListener('pinLockSuccess', () => {
  console.log('Пользователь успешно верифицирован!');
  // Обновить интерфейс
  document.getElementById('premium-section').style.display = 'block';
});
```

## Алгоритм генерации PIN по умолчанию
По умолчанию библиотека использует следующий алгоритм генерации PIN:

```javascript
function defaultPinGenerator() {
  const today = new Date();
  const dow = today.getDay();
  const diffToMon = (dow + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - diffToMon);

  const wed = new Date(monday);
  wed.setDate(monday.getDate() + 2);
  const thu = new Date(monday);
  thu.setDate(monday.getDate() + 3);

  const year = wed.getFullYear();
  const wedDay = wed.getDate();
  const thuDay = thu.getDate();
  
  return year * wedDay + Math.floor(thuDay / 7);
}
```

## Примеры использования

### Базовый пример
```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Защищенный сайт</title>
</head>
<body>
  <h1>Добро пожаловать на наш сайт!</h1>
  <p>Этот контент защищен системой верификации PIN</p>
  
  <script>
    window.PinLockConfig = {
      telegramChannel: '@MySecureChannel'
      colors: {
        primary: '#000000',
        text: '#000000',
        error: '#FF0000',
        buttonText: '#ffffff',
        inputBg: '#101010',
        inputText: '#FFFFFF',
        textTimer: '#404040',
        colorBg: '#fff'
      }
    };
  </script>
  <script src="pin-lock-library.js"></script>
  <script>
    if (!window.__pinLockLibraryLoaded) {
      document.body.innerHTML = '<div class="error">ОШИБКА: Библиотека не загружена!</div>';
    }
    
    document.addEventListener('pinLockSuccess', () => {
      document.getElementById('premium').style.display = 'block';
    });
  </script>
  
  <div id="premium" style="display:none;">
    <h2>Премиум контент</h2>
    <p>Этот контент доступен только верифицированным пользователям</p>
  </div>
</body>
</html>
```

### Расширенный пример с кастомным генератором
```html
<script>
  // Конфигурация перед подключением библиотеки
  window.PinLockConfig = {
    telegramChannel: '@MyAppCodes',
    maxAttempts: 5,
    lockTime: 300000, // 5 минут
    messages: {
      instruction: 'Введите еженедельный код из канала {channel}',
      button: 'Подтвердить'
    },
    customPinGenerator: function() {
      // Генерация PIN на основе номера недели и секрета
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
      const week = Math.ceil(days / 7);
      const secret = 12345; // Ваш секретный ключ
      return (week * secret) % 10000; // 4-значный PIN
    }
  };
</script>
<script src="pin-lock-library.js"></script>
<script>
  // API использование после загрузки
  document.getElementById('verify-btn').addEventListener('click', () => {
    PinLockLibrary.showPinDialog();
  });
  
  document.getElementById('reset-btn').addEventListener('click', () => {
    PinLockLibrary.resetVerification();
    alert('Верификация сброшена!');
  });
</script>
```

## Лучшие практики

1. **Безопасность генерации PIN**:
   - Используйте кастомный генератор с секретным ключом
   - Регулярно меняйте алгоритм генерации
   - Не передавайте алгоритм генерации клиенту

2. **Управление доступом**:
   - Ограничьте количество попыток (рекомендуется 3-5)
   - Установите разумное время блокировки (1-5 минут)
   - Регулярно обновляйте PIN в Telegram-канале

3. **Пользовательский опыт**:
   - Предоставьте понятные инструкции
   - Используйте адаптивный дизайн диалога
   - Давайте обратную связь при ошибках

## Ограничения

1. Защита основана на клиентской реализации и может быть обойдена технически подкованными пользователями
2. PIN-код хранится в localStorage, что не обеспечивает максимальную безопасность
3. Для критически важных систем рекомендуется дополнительная серверная проверка

## Заключение
Библиотека PinLock предоставляет гибкое решение для контроля доступа к веб-контенту с помощью еженедельно обновляемых PIN-кодов. Она легко интегрируется, кастомизируется и расширяется под нужды вашего проекта.

Для максимальной эффективности:
1. Регулярно публикуйте новые PIN-коды в Telegram-канале
2. Используйте кастомный генератор PIN
3. Сочетайте с другими методами аутентификации для важных разделов

Примеры кода и последнюю версию библиотеки можно найти на [GitHub-репозитории проекта](https://github.com/yourusername/pin-lock-library).