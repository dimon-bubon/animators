(function(){
  var cards=[].slice.call(document.querySelectorAll('[data-animator]'));
  var list=document.getElementById('list');
  var el={date:f('f-date'),city:f('f-city'),district:f('f-district'),format:f('f-format'),sort:f('f-sort')};
  function f(id){return document.getElementById(id);}
  function fillDistricts(){
    var city=el.city.value,seen={};
    el.district.innerHTML='<option value="">Все районы</option>';
    cards.forEach(function(c){
      var d=c.dataset.district;
      if((!city||c.dataset.city===city)&&!seen[d]){seen[d]=1;el.district.add(new Option(d,d));}
    });
  }
  function apply(){
    var shown=0;
    cards.forEach(function(c){
      var ok=(!el.city.value||c.dataset.city===el.city.value)
        &&(!el.district.value||c.dataset.district===el.district.value)
        &&(!el.format.value||c.dataset.formats.split(' ').indexOf(el.format.value)>-1)
        &&(!el.date.value||c.dataset.busy.split(',').indexOf(el.date.value)===-1);
      c.classList.toggle('d-none',!ok);if(ok)shown++;
    });
    cards.sort(function(a,b){
      return el.sort.value==='price'?a.dataset.price-b.dataset.price:b.dataset.rating-a.dataset.rating;
    }).forEach(function(c){list.appendChild(c);});
    f('count').textContent=shown;
    f('empty').classList.toggle('d-none',shown>0);
  }
  var p=new URLSearchParams(location.search);
  ['date','city','format'].forEach(function(k){if(p.get(k))el[k].value=p.get(k);});
  fillDistricts();
  el.city.addEventListener('change',function(){fillDistricts();apply();});
  ['date','district','format','sort'].forEach(function(k){el[k].addEventListener('change',apply);});
  f('f-reset').addEventListener('click',function(){
    document.getElementById('filters').reset();fillDistricts();apply();
  });
  apply();
})();
