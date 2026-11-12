(function () {
  'use strict';

  var list = document.getElementById('list');
  var form = document.getElementById('filters');
  if (!list || !form) { return; }

  var items = Array.prototype.slice.call(list.children);
  var fields = {
    search: document.getElementById('fSearch'),
    city: document.getElementById('fCity'),
    format: document.getElementById('fFormat'),
    sort: document.getElementById('fSort'),
    price: document.getElementById('fPrice'),
    rating: document.getElementById('fRating'),
    favorite: document.getElementById('fFavorite')
  };
  var info = document.getElementById('resultInfo');
  var emptyMessage = document.getElementById('emptyMessage');
  var favCount = document.getElementById('favCount');

  items.forEach(function (item, index) {
    item.dataset.order = index;
    item.querySelector('.position-relative').appendChild(
      window.Favorites.createButton(
        item.dataset.id, 'btn-light btn-sm position-absolute top-0 end-0 m-2'
      )
    );
  });

  function by(field, direction) {
    return function (a, b) {
      return (a.dataset[field] - b.dataset[field]) * direction ||
        a.dataset.order - b.dataset.order;
    };
  }

  var SORTS = {
    'default': by('order', 1),
    'price-asc': by('price', 1),
    'price-desc': by('price', -1),
    rating: by('rating', -1),
    reviews: by('reviews', -1)
  };

  function apply() {
    var query = fields.search.value.trim().toLowerCase();
    var maxPrice = Number(fields.price.value) || Infinity;
    var minRating = Number(fields.rating.value) || 0;
    var favorites = window.Favorites.all();
    var shown = 0;

    items.sort(SORTS[fields.sort.value] || SORTS['default']);
    items.forEach(function (item) {
      var d = item.dataset;
      var match =
        (!query || d.search.indexOf(query) !== -1) &&
        (!fields.city.value || d.city === fields.city.value) &&
        (!fields.format.value || d.formats.split('|').indexOf(fields.format.value) !== -1) &&
        Number(d.price) <= maxPrice &&
        Number(d.rating) >= minRating &&
        (!fields.favorite.checked || favorites.indexOf(d.id) !== -1);

      item.hidden = !match;
      list.appendChild(item);
      if (match) { shown += 1; }
    });

    info.textContent = 'Найдено аниматоров: ' + shown + ' из ' + items.length;
    emptyMessage.hidden = shown !== 0;
    favCount.textContent = favorites.length;
  }

  form.addEventListener('input', apply);
  form.addEventListener('change', apply);
  form.addEventListener('submit', function (event) { event.preventDefault(); });
  form.addEventListener('reset', function () { setTimeout(apply, 0); });
  document.addEventListener('favorites:change', apply);

  apply();
})();
