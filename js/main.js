
(function () {
  'use strict';

  // Переключатель светлой и тёмной темы с сохранением выбора.
  var THEME_KEY = 'konfetti:theme';
  var themeToggle = document.getElementById('themeToggle');

  function applyTheme(theme) {
    var dark = theme === 'dark';
    document.documentElement.setAttribute('data-bs-theme', dark ? 'dark' : 'light');
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(dark));
      themeToggle.setAttribute(
        'aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему'
      );
      themeToggle.innerHTML = dark
        ? '<span class="theme-icon" aria-hidden="true">☀️</span><span class="d-none d-xl-inline">Светлая тема</span>'
        : '<span class="theme-icon" aria-hidden="true">🌙</span><span class="d-none d-xl-inline">Тёмная тема</span>';
    }
  }

  var savedTheme = 'light';
  try {
    savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  } catch (error) {
    savedTheme = 'light';
  }
  applyTheme(savedTheme === 'dark' ? 'dark' : 'light');

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var nextTheme = document.documentElement.getAttribute('data-bs-theme') === 'dark'
        ? 'light' : 'dark';
      applyTheme(nextTheme);
      try {
        localStorage.setItem(THEME_KEY, nextTheme);
      } catch (error) {
        // Тема продолжит работать до закрытия страницы, даже если хранилище недоступно.
      }
    });
  }


  function formatPhone(value, addTrailing) {
    var digits = value.replace(/[^0-9]/g, '');
    if (digits.length > 10 && (digits[0] === '7' || digits[0] === '8')) {
      digits = digits.slice(1);
    }
    digits = digits.slice(0, 10);

    var result = digits.slice(0, 3);
    if (digits.length > 3) { result += ' ' + digits.slice(3, 6); }
    if (digits.length > 6) { result += '-' + digits.slice(6, 8); }
    if (digits.length > 8) { result += '-' + digits.slice(8, 10); }

    if (addTrailing) {
      if (digits.length === 3) { result += ' '; }
      if (digits.length === 6 || digits.length === 8) { result += '-'; }
    }
    return result;
  }

  document.querySelectorAll('input[type="tel"]').forEach(function (input) {
    input.addEventListener('input', function (event) {
      var deleting = event.inputType && event.inputType.indexOf('delete') === 0;
      input.value = formatPhone(input.value, !deleting);
    });
  });

  var SUCCESS_HTML =
    '<div class="alert alert-success" role="alert">' +
    'Спасибо! Заявка принята — мы свяжемся с вами в течение 15 минут.' +
    '</div>';

  document.querySelectorAll('form.js-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      var message = form.querySelector('.form-msg');
      if (message) {
        message.innerHTML = SUCCESS_HTML;
      }

      form.reset();
      form.classList.remove('was-validated');
    });
  });

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var toTop = document.getElementById('toTop');

  if (toTop) {
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('is-visible', window.scrollY > 300);
    });

    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  if (!reduceMotion) {
    document.querySelectorAll('a[href]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var href = link.getAttribute('href');
        var external = link.hostname !== window.location.hostname;
        var samePage = link.pathname === window.location.pathname;

        if (
          event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey ||
          link.target === '_blank' || link.hasAttribute('download') ||
          /^(#|mailto:|tel:)/.test(href) || external || samePage
        ) {
          return;
        }

        event.preventDefault();
        document.body.classList.add('page-leave');
        setTimeout(function () { window.location.href = link.href; }, 300);
      });
    });

    window.addEventListener('pageshow', function () {
      document.body.classList.remove('page-leave');
    });
  }


  var FAV_KEY = 'konfetti:favorites';

  function readFavorites() {
    try {
      return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
    } catch (error) {
      return [];
    }
  }

  window.Favorites = {
    all: readFavorites,

    has: function (id) {
      return readFavorites().indexOf(id) !== -1;
    },

    toggle: function (id) {
      var list = readFavorites();
      var index = list.indexOf(id);
      if (index === -1) { list.push(id); } else { list.splice(index, 1); }
      try {
        localStorage.setItem(FAV_KEY, JSON.stringify(list));
      } catch (error) {
        return;
      }
      document.dispatchEvent(new CustomEvent('favorites:change'));
    },

    createButton: function (id, classes, withLabel) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn fav-btn ' + classes;

      function sync() {
        var active = window.Favorites.has(id);
        var label = active ? ' В избранном' : ' В избранное';
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
        button.setAttribute(
          'aria-label', active ? 'Убрать из избранного' : 'Добавить в избранное'
        );
        button.textContent = (active ? '♥' : '♡') + (withLabel ? label : '');
      }

      button.addEventListener('click', function () { window.Favorites.toggle(id); });
      document.addEventListener('favorites:change', sync);
      sync();
      return button;
    }
  };



  var CALL_LINK = ['Оставить заявку', 'contacts.html#order'];
  var CATALOG_LINK = ['Открыть каталог', 'catalog.html'];


  var REPLIES = [
    {
      re: /привет|здравств|добрый/i,
      text: 'Здравствуйте! Спрашивайте про цены, форматы, перенос или подбор аниматора.'
    },
    {
      re: /отмен|перенос|перенест/i,
      text: 'Перенос и отмена бесплатны за 3 дня до праздника. ' +
        'Если аниматор не сможет прийти, подберём замену.'
    },
    {
      re: /цен|стоим|сколько|руб/i,
      text: 'Цена в каталоге указана «от» за 1 час программы, от 3 000 ₽. ' +
        'Точную стоимость назовём после заявки.',
      link: CATALOG_LINK
    },
    {
      re: /формат|дом|кафе|клуб|школ|сад|онлайн|где/i,
      text: 'Аниматоры работают на дому, в кафе или клубе, в школе или саду и онлайн. ' +
        'Нужный формат можно выбрать в фильтрах каталога.',
      link: CATALOG_LINK
    },
    {
      re: /быстр|срок|долго|подбор|подобр/i,
      text: 'Подбираем аниматора за 15 минут в рабочее время. ' +
        'Заявки вне графика обрабатываем утром.',
      link: CALL_LINK
    },
    {
      re: /телефон|позвон|связ|контакт|почт|график|работа/i,
      text: 'Телефон: +7 (800) 555-35-35, почта: hello@konfetti.example. ' +
        'Пн–Пт 09:00–21:00, Сб–Вс 10:00–20:00.'
    },
    {
      re: /заявк|заказ|брон/i,
      text: 'Оставьте заявку на странице «Контакты»: менеджер перезвонит и предложит варианты.',
      link: CALL_LINK
    }
  ];

  var FALLBACK = {
    text: 'Не уверен, что понял вопрос. Позвоните +7 (800) 555-35-35 ' +
      'или оставьте заявку, и мы поможем.',
    link: CALL_LINK
  };

  var QUICK_QUESTIONS = [
    'Сколько стоит?', 'Какие форматы?', 'Как перенести?', 'Как быстро подберёте?'
  ];


  function initConsultant() {
    var root = document.createElement('div');
    root.innerHTML =
      '<button class="btn btn-warning shadow consultant-toggle" type="button" ' +
      'aria-expanded="false" aria-controls="consultantPanel">💬 Консультант</button>' +
      '<section class="card shadow consultant-panel" id="consultantPanel" ' +
      'aria-label="Чат с консультантом" hidden>' +
      '<div class="card-header bg-primary text-white d-flex justify-content-between ' +
      'align-items-center"><strong>Консультант «Конфетти»</strong>' +
      '<button type="button" class="btn-close btn-close-white" aria-label="Закрыть"></button>' +
      '</div><div class="card-body consultant-log" role="log" aria-live="polite"></div>' +
      '<div class="px-3 pb-2 d-flex flex-wrap gap-1"></div>' +
      '<form class="card-footer input-group">' +
      '<label class="visually-hidden" for="consultantInput">Ваш вопрос</label>' +
      '<input class="form-control" id="consultantInput" placeholder="Напишите вопрос" ' +
      'autocomplete="off" required>' +
      '<button class="btn btn-primary" type="submit">Отправить</button></form></section>';
    document.body.appendChild(root);

    var toggle = root.querySelector('.consultant-toggle');
    var panel = root.querySelector('.consultant-panel');
    var log = root.querySelector('.consultant-log');
    var chips = root.querySelector('.px-3');
    var form = root.querySelector('form');
    var input = root.querySelector('input');
    var greeted = false;


    function addMessage(text, who, link) {
      var message = document.createElement('div');
      message.className = 'consultant-msg ' + (who === 'user' ? 'is-user' : 'is-bot');
      message.textContent = text;
      if (link) {
        var anchor = document.createElement('a');
        anchor.className = 'd-block fw-bold mt-1';
        anchor.textContent = link[0];
        anchor.href = link[1];
        message.appendChild(anchor);
      }
      log.appendChild(message);
      log.scrollTop = log.scrollHeight;
    }


    function ask(question) {
      var reply = FALLBACK;
      addMessage(question, 'user');
      for (var i = 0; i < REPLIES.length; i += 1) {
        if (REPLIES[i].re.test(question)) { reply = REPLIES[i]; break; }
      }
      setTimeout(function () { addMessage(reply.text, 'bot', reply.link); }, 400);
    }

    function setOpen(open) {
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (open && !greeted) {
        greeted = true;
        addMessage(
          'Здравствуйте! Я консультант «Конфетти». Выберите тему или задайте вопрос.', 'bot'
        );
      }
      (open ? input : toggle).focus();
    }

    QUICK_QUESTIONS.forEach(function (question) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'btn btn-outline-primary btn-sm';
      chip.textContent = question;
      chip.addEventListener('click', function () { ask(question); });
      chips.appendChild(chip);
    });

    toggle.addEventListener('click', function () { setOpen(panel.hidden); });
    root.querySelector('.btn-close').addEventListener('click', function () { setOpen(false); });
    panel.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { setOpen(false); }
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var question = input.value.trim();
      if (question) { ask(question); }
      input.value = '';
    });
  }

  initConsultant();
})();
