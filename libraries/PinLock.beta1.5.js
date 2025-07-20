/*
 * PinLock — (Beta)
 * Версия: 1.5.0 (Beta)
 * Дата: 2025-07-14
 * GitHub: https://github.com/Leha2cool
 */

(function() {
  // Проверка уникального идентификатора библиотеки
  if (window.__pinLockLibraryLoaded) {
    console.warn('Pin Lock Library already loaded');
    return;
  }
  window.__pinLockLibraryLoaded = true;

  // Конфигурация по умолчанию
  const defaultConfig = {
    telegramChannel: '@WeeklyCode',
    customPinGenerator: null,
    storageKey: 'pinAcceptedWeekpin',
    maxAttempts: 3,
    lockTime: 60000, // 60 секунд
    colors: {
      primary: '#8A2BE2',
      text: '#000000',
      error: '#FF0000',
      buttonText: '#000000',
      inputBg: '#8A2BE2',
      inputText: '#FFFFFF',
      textTimer: '#8A2BE2',
      colorBg: '#fff'
    },
    messages: {
      instruction: 'Каждую неделю нужно вводить новый код, который вы сможете найти в нашем телеграм-канале {channel}.',
      placeholder: 'Введите PIN-код',
      button: 'OK',
      error: 'Неверный код!',
      attempts: 'Осталось попыток: {attempts}',
      locked: 'Слишком много попыток! Попробуйте через {seconds} секунд',
      expired: 'Срок действия кода истек!'
    }
  };

  // Слияние с пользовательской конфигурацией
  const config = { 
    ...defaultConfig, 
    ...(window.PinLockConfig || {}) 
  };

  // Добавление стилей в DOM
  const style = document.createElement('style');
  style.textContent = `
    #pinOverlayLock {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.8);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      font-family: Arial, sans-serif;
    }
    #pinOverlayLock .modalLock {
      background: ${config.colors.colorBg};
      padding: 25px;
      border-radius: 10px;
      max-width: 350px;
      width: 90%;
      text-align: center;
      box-shadow: 0 5px 15px rgba(0,0,0,0.5);
    }
    #pinOverlayLock .modalLock p {
      color: ${config.colors.text};
      margin-bottom: 15px;
      line-height: 1.5;
    }
    #pinOverlayLock .modalLock input {
      width: 100%;
      padding: 12px;
      margin-bottom: 15px;
      font-size: 18px;
      border: 2px solid ${config.colors.primary};
      background: ${config.colors.inputBg};
      color: ${config.colors.inputText};
      border-radius: 6px;
      box-sizing: border-box;
      text-align: center;
      letter-spacing: 2px;
    }
    #pinOverlayLock .modalLock input::placeholder {
      color: rgba(255,255,255,0.8);
    }
    #pinOverlayLock .modalLock button {
      padding: 10px 20px;
      font-size: 18px;
      background: ${config.colors.primary};
      border: none;
      color: ${config.colors.buttonText};
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: bold;
    }
    #pinOverlayLock .modalLock button:hover {
      background: #6a1bc0;
      transform: translateY(-2px);
    }
    #pinOverlayLock .modalLock .pinError {
      color: ${config.colors.error};
      display: none;
      margin: 10px 0;
      font-weight: bold;
    }
    #pinOverlayLock .modalLock {
      color: ${config.colors.primary};
      margin: 10px 0;
      font-weight: bold;
    }
    .attemptsInfo {
      color: ${config.colors.textTimer};
      margin: 10px 0;
      font - weight: bold;
    }
    #pinOverlayLock .modalLock .expiredInfo {
      color: ${config.colors.error};
      margin: 10px 0;
      font-weight: bold;
      display: none;
    }
    #pinOverlayLock .modalLock .timer {
      color: ${config.colors.text};
      margin-top: 15px;
      font-size: 14px;
    }
  `;
  document.head.appendChild(style);

  // Добавление HTML-структуры
  const overlayHTML = `
    <div id="pinOverlayLock">
      <div class="modalLock">
        <p>${config.messages.instruction.replace('{channel}', `<strong>${config.telegramChannel}</strong>`)}</p>
        <input id="pinInputLock" type="text" placeholder="${config.messages.placeholder}" maxlength="6">
        <button id="pinSubmitLock">${config.messages.button}</button>
        <div id="pinErrorLock" class="pinError">${config.messages.error}</div>
        <div id="attemptsInfoLock" class="attemptsInfo"></div>
        <div id="expiredInfoLock" class="expiredInfo">${config.messages.expired}</div>
        <div id="timerLock" class="timer"></div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', overlayHTML);

  // API библиотеки
  window.PinLockLibrary = {
    // Принудительно показать окно ввода PIN
    showPinDialog: function() {
      initPinLock(true);
    },
    
    // Сбросить статус верификации
    resetVerification: function() {
      localStorage.removeItem(config.storageKey);
      sessionStorage.removeItem('pinAttempts');
      sessionStorage.removeItem('pinLockTime');
    },
    
    // Проверить статус верификации
    isVerified: function() {
      return localStorage.getItem(config.storageKey) === getWeekKey();
    },
    
    // Установить пользовательский генератор PIN
    setCustomPinGenerator: function(generator) {
      if (typeof generator === 'function') {
        config.customPinGenerator = generator;
      }
    },
    
    // Обновить конфигурацию
    updateConfig: function(newConfig) {
      Object.assign(config, newConfig);
      applyConfigUpdates();
    }
  };

  // Применение изменений конфигурации
  function applyConfigUpdates() {
    const instruction = document.querySelector('#pinOverlayLock .modalLock p');
    if (instruction) {
      instruction.innerHTML = config.messages.instruction.replace('{channel}', `<strong>${config.telegramChannel}</strong>`);
    }
    
    const input = document.getElementById('pinInputLock');
    if (input) {
      input.placeholder = config.messages.placeholder;
      input.style.backgroundColor = config.colors.inputBg;
      input.style.color = config.colors.inputText;
      input.style.borderColor = config.colors.primary;
    }
    
    const button = document.getElementById('pinSubmitLock');
    if (button) {
      button.textContent = config.messages.button;
      button.style.backgroundColor = config.colors.primary;
      button.style.color = config.colors.buttonText;
    }
    
    const error = document.getElementById('pinErrorLock');
    if (error) {
      error.textContent = config.messages.error;
      error.style.color = config.colors.error;
    }
    
    const expired = document.getElementById('expiredInfoLock');
    if (expired) {
      expired.textContent = config.messages.expired;
    }
    
    // Обновление стилей
    const styleUpdate = document.createElement('style');
    styleUpdate.textContent = `
      #pinOverlayLock .modalLock p { color: ${config.colors.text}; }
      #pinOverlayLock .modalLock input { 
        background: ${config.colors.inputBg}; 
        color: ${config.colors.inputText};
        border-color: ${config.colors.primary};
      }
      #pinOverlayLock .modalLock button { 
        background: ${config.colors.primary}; 
        color: ${config.colors.buttonText};
      }
      .pinError { color: ${config.colors.error}; }
      .attemptsInfo { color: ${config.colors.primary}; }
    `;
    document.head.appendChild(styleUpdate);
  }

  // Получение ключа недели
  function getWeekKey() {
    const today = new Date();
    const dow = today.getDay();
    const diffToMon = (dow + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMon);

    const pad = n => n < 10 ? '0' + n : n;
    return [
      monday.getFullYear(),
      pad(monday.getMonth() + 1),
      pad(monday.getDate())
    ].join('-');
  }

  // Генерация PIN-кода
  function generatePinCode() {
    if (typeof config.customPinGenerator === 'function') {
      return config.customPinGenerator();
    }

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

  // Проверка срока действия недели
  function isWeekExpired() {
    const acceptedDate = localStorage.getItem(config.storageKey);
    if (!acceptedDate) return false;
    
    const accepted = new Date(acceptedDate.replace(/(\d+)-(\d+)-(\d+)/, '$1/$2/$3'));
    const today = new Date();
    const weekLater = new Date(accepted);
    weekLater.setDate(accepted.getDate() + 7);
    
    return today > weekLater;
  }

  // Основная функция инициализации
  function initPinLock(forceShow = false) {
    const weekKey = getWeekKey();
    
    // Проверка существующей авторизации
    if (!forceShow && localStorage.getItem(config.storageKey) === weekKey) {
      return;
    }
    
    // Проверка блокировки
    const lockTime = parseInt(sessionStorage.getItem('pinLockTime'));
    if (lockTime && lockTime > Date.now()) {
      const secondsLeft = Math.ceil((lockTime - Date.now()) / 1000);
      showLockedMessage(secondsLeft);
      return;
    }

    // Сброс блокировки при истечении времени
    if (lockTime && lockTime <= Date.now()) {
      sessionStorage.removeItem('pinLockTime');
      sessionStorage.removeItem('pinAttempts');
    }

    // Генерация PIN-кода
    const pinCode = generatePinCode();

    // Элементы интерфейса
    const overlay = document.getElementById('pinOverlayLock');
    const inp = document.getElementById('pinInputLock');
    const btn = document.getElementById('pinSubmitLock');
    const err = document.getElementById('pinErrorLock');
    const attemptsInfo = document.getElementById('attemptsInfoLock');
    const expiredInfo = document.getElementById('expiredInfoLock');
    const timer = document.getElementById('timerLock');
    
    // Проверка истечения срока
    if (isWeekExpired()) {
      expiredInfo.style.display = 'block';
      localStorage.removeItem(config.storageKey);
    } else {
      expiredInfo.style.display = 'none';
    }
    
    // Получение количества попыток
    let attempts = parseInt(sessionStorage.getItem('pinAttempts')) || config.maxAttempts;
    updateAttemptsInfo(attemptsInfo, attempts);
    
    overlay.style.display = 'flex';
    inp.focus();

    // Обновление информации о попытках
    function updateAttemptsInfo(el, count) {
      if (count > 0) {
        el.textContent = config.messages.attempts.replace('{attempts}', count);
        el.style.display = 'block';
      } else {
        el.style.display = 'none';
      }
    }

    // Отображение сообщения о блокировке
    function showLockedMessage(seconds) {
      overlay.style.display = 'flex';
      document.querySelector('.modalLock > p').style.display = 'none';
      inp.style.display = 'none';
      btn.style.display = 'none';
      err.style.display = 'none';
      attemptsInfo.style.display = 'none';
      
      const lockedMsg = document.createElement('div');
      lockedMsg.className = 'lockedMessage';
      lockedMsg.innerHTML = `<p>${config.messages.locked.replace('{seconds}', seconds)}</p>`;
      document.querySelector('.modalLock').prepend(lockedMsg);
      
      let remaining = seconds;
      timer.textContent = `Осталось: ${remaining} сек.`;
      timer.style.display = 'block';
      
      const countdown = setInterval(() => {
        remaining--;
        timer.textContent = `Осталось: ${remaining} сек.`;
        
        if (remaining <= 0) {
          clearInterval(countdown);
          sessionStorage.removeItem('pinLockTime');
          sessionStorage.removeItem('pinAttempts');
          location.reload();
        }
      }, 1000);
    }

    // Функция проверки кода
    function checkPin() {
      const enteredPin = parseInt(inp.value, 10);
      
      if (enteredPin === pinCode) {
        // Успешная проверка
        localStorage.setItem(config.storageKey, weekKey);
        overlay.style.display = 'none';
        err.style.display = 'none';
        sessionStorage.removeItem('pinAttempts');
        sessionStorage.removeItem('pinLockTime');
        
        // Генерация события
        const event = new Event('pinLockSuccess');
        document.dispatchEvent(event);
      } else {
        // Неверный код
        attempts--;
        sessionStorage.setItem('pinAttempts', attempts);
        updateAttemptsInfo(attemptsInfo, attempts);
        
        if (attempts <= 0) {
          // Блокировка ввода
          const lockTime = Date.now() + config.lockTime;
          sessionStorage.setItem('pinLockTime', lockTime);
          showLockedMessage(Math.ceil(config.lockTime / 1000));
        } else {
          err.style.display = 'block';
          inp.value = '';
          setTimeout(() => inp.focus(), 50);
        }
      }
    }

    // Обработчики событий
    btn.addEventListener('click', checkPin);
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') checkPin();
    });
    
    // Таймер обновления недели
    const now = new Date();
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + (7 - now.getDay() + 1) % 7 || 7);
    nextMonday.setHours(0, 0, 1, 0);
    
    const updateTimer = setInterval(() => {
      const diff = nextMonday - new Date();
      if (diff <= 0) {
        clearInterval(updateTimer);
        timer.textContent = 'Код обновлен!';
        setTimeout(() => location.reload(), 3000);
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      timer.textContent = `Обновление кода через: ${days}д ${hours}ч ${minutes}м`;
      timer.style.display = 'block';
    }, 0);
    updateTimer();
  }

  // Инициализация после загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initPinLock());
  } else {
    setTimeout(() => initPinLock(), 0);
  }
})();