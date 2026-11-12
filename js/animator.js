(function () {
  'use strict';

  var root = document.getElementById('animator-root');
  var animators = window.ANIMATORS;
  if (!root || !animators) { return; }

  var id = new URLSearchParams(window.location.search).get('id');
  var animator = animators[id];

  function escapeHtml(text) {
    var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(text).replace(/[&<>"']/g, function (char) { return map[char]; });
  }

  if (!animator) {
    root.innerHTML =
      '<div class="alert alert-warning" role="alert">Аниматор не найден. ' +
      '<a class="alert-link" href="catalog.html">Вернуться в каталог</a></div>';
    return;
  }

  document.title = animator.name + ' — аниматор на детский праздник · Конфетти';

  var badges = animator.formats.map(function (format) {
    return '<span class="badge text-bg-light border">' + escapeHtml(format) + '</span> ';
  }).join('');
  var programs = animator.programs.map(function (program) {
    return '<li class="list-group-item">' + escapeHtml(program) + '</li>';
  }).join('');

  root.innerHTML =
    '<nav aria-label="breadcrumb"><ol class="breadcrumb">' +
    '<li class="breadcrumb-item"><a href="index.html">Главная</a></li>' +
    '<li class="breadcrumb-item"><a href="catalog.html">Каталог</a></li>' +
    '<li class="breadcrumb-item active" aria-current="page">' +
    escapeHtml(animator.name) + '</li></ol></nav>' +
    '<div class="row g-4">' +
    '<div class="col-12 col-md-5"><img class="img-fluid rounded shadow-sm" width="600" ' +
    'height="400" src="images/' + animator.img + '" alt="' + escapeHtml(animator.name) +
    '"></div>' +
    '<div class="col-12 col-md-7">' +
    '<h1 class="h2 mb-1">' + escapeHtml(animator.name) + '</h1>' +
    '<p class="text-muted">' + escapeHtml(animator.topic) + ' · ' +
    escapeHtml(animator.city) + '</p>' +
    '<p class="mb-2"><span class="text-warning">★</span> <strong id="avgRating"></strong> ' +
    '<span class="text-muted small" id="reviewCount"></span></p>' +
    '<p class="mb-2">' + badges + '</p>' +
    '<p class="text-muted small">Возраст детей: ' + escapeHtml(animator.age) + '</p>' +
    '<p class="fw-bold fs-4">от ' + animator.price.toLocaleString('ru-RU') +
    ' ₽ <span class="fs-6 fw-normal text-muted">за 1 час</span></p>' +
    '<div class="d-flex flex-wrap gap-2" id="actions">' +
    '<a class="btn btn-primary" href="contacts.html#order">Заказать</a></div>' +
    '</div></div>' +
    '<section class="mt-5"><h2 class="h4">О программе</h2>' +
    '<p>' + escapeHtml(animator.about) + '</p>' +
    '<ul class="list-group">' + programs + '</ul></section>' +
    '<section class="mt-5" aria-labelledby="reviewsTitle">' +
    '<h2 class="h4" id="reviewsTitle">Отзывы родителей</h2>' +
    '<div id="reviewList"></div>' +
    '<form class="card card-body shadow-sm mt-4" id="reviewForm" novalidate>' +
    '<h3 class="h5">Оставить отзыв</h3><div class="row g-3">' +
    '<div class="col-md-6"><label class="form-label" for="rName">Ваше имя *</label>' +
    '<input class="form-control" id="rName" required minlength="2" maxlength="40">' +
    '<div class="invalid-feedback">Введите имя (от 2 символов).</div></div>' +
    '<div class="col-md-6"><label class="form-label" for="rRating">Оценка *</label>' +
    '<select class="form-select" id="rRating" required><option value="">Выберите</option>' +
    '<option value="5">5 — отлично</option><option value="4">4 — хорошо</option>' +
    '<option value="3">3 — нормально</option><option value="2">2 — плохо</option>' +
    '<option value="1">1 — ужасно</option></select>' +
    '<div class="invalid-feedback">Выберите оценку.</div></div>' +
    '<div class="col-12"><label class="form-label" for="rText">Отзыв *</label>' +
    '<textarea class="form-control" id="rText" rows="3" required minlength="10" ' +
    'maxlength="500"></textarea>' +
    '<div class="invalid-feedback">Напишите хотя бы 10 символов.</div></div></div>' +
    '<div class="mt-3">' +
    '<button class="btn btn-primary" type="submit">Отправить отзыв</button></div>' +
    '<div id="reviewMsg" class="mt-3" role="status"></div></form></section>';

  document.getElementById('actions').appendChild(
    window.Favorites.createButton(id, 'btn-outline-danger', true)
  );

  var REVIEWS_KEY = 'konfetti:reviews:' + id;

  function loadOwn() {
    try {
      return JSON.parse(localStorage.getItem(REVIEWS_KEY)) || [];
    } catch (error) {
      return [];
    }
  }

  function saveOwn(reviews) {
    try {
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
    } catch (error) { /* хранилище недоступно */ }
  }

  function stars(value) {
    return '★★★★★'.slice(0, value) + '☆☆☆☆☆'.slice(0, 5 - value);
  }

  function reviewHtml(review, index) {
    var own = index >= 0;
    return '<article class="card card-body shadow-sm mb-3">' +
      '<div class="d-flex justify-content-between align-items-start"><div>' +
      '<strong>' + escapeHtml(review.a) + '</strong>' +
      (own ? ' <span class="badge text-bg-light border">Ваш отзыв</span>' : '') +
      '<div class="text-warning" role="img" aria-label="Оценка ' + review.r + ' из 5">' +
      stars(review.r) + '</div></div>' +
      '<span class="text-muted small">' + escapeHtml(review.d) + '</span></div>' +
      '<p class="mb-0 mt-2">' + escapeHtml(review.t) + '</p>' +
      (own ? '<button type="button" class="btn btn-link btn-sm text-danger p-0 mt-2 ' +
        'align-self-start js-delete" data-index="' + index + '">Удалить</button>' : '') +
      '</article>';
  }

  function renderReviews() {
    var own = loadOwn();
    var sum = own.reduce(function (total, review) { return total + review.r; }, 0);
    var count = animator.count + own.length;

    document.getElementById('avgRating').textContent =
      ((animator.rating * animator.count + sum) / count).toFixed(1);
    document.getElementById('reviewCount').textContent = '(' + count + ' отзывов)';
    document.getElementById('reviewList').innerHTML =
      own.map(reviewHtml).concat(
        animator.reviews.map(function (review) { return reviewHtml(review, -1); })
      ).join('');
  }

  var form = document.getElementById('reviewForm');
  var nameInput = document.getElementById('rName');
  var ratingInput = document.getElementById('rRating');
  var textInput = document.getElementById('rText');

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    [nameInput, textInput].forEach(function (field) {
      var long = field.value.trim().length >= field.minLength;
      field.setCustomValidity(long ? '' : 'Слишком коротко');
    });

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    var own = loadOwn();
    own.unshift({
      a: nameInput.value.trim(),
      r: Number(ratingInput.value),
      d: new Date().toLocaleDateString('ru-RU'),
      t: textInput.value.trim()
    });
    saveOwn(own);

    form.reset();
    form.classList.remove('was-validated');
    document.getElementById('reviewMsg').innerHTML =
      '<div class="alert alert-success mb-0">Спасибо! Ваш отзыв добавлен.</div>';
    renderReviews();
  });

  document.getElementById('reviewList').addEventListener('click', function (event) {
    var button = event.target.closest('.js-delete');
    if (!button) { return; }
    var own = loadOwn();
    own.splice(Number(button.dataset.index), 1);
    saveOwn(own);
    renderReviews();
  });

  renderReviews();
})();
