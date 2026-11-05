
(function () {
  'use strict';

  /** Маска телефона: только цифры (не больше 10), формат 900 123-45-67. */
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

  /** Кнопка «Наверх»: показывается после прокрутки и плавно возвращает к началу страницы. */
  var toTop = document.getElementById('toTop');

  if (toTop) {
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('is-visible', window.scrollY > 300);
    });

    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /** Плавный переход между страницами: затухание перед загрузкой новой страницы. */
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

    // Возврат кнопкой «Назад»: страница могла восстановиться из кэша с затуханием
    window.addEventListener('pageshow', function () {
      document.body.classList.remove('page-leave');
    });
  }
})();
