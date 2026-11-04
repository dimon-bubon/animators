document.querySelectorAll('form.js-form').forEach(function(f){
  f.addEventListener('submit',function(e){
    e.preventDefault();
    if(!f.checkValidity()){f.classList.add('was-validated');return;}
    var m=f.querySelector('.form-msg');
    if(m){m.innerHTML='<div class="alert alert-success" role="alert">Спасибо! Заявка принята — мы свяжемся с вами в течение 15 минут.</div>';}
    f.reset();f.classList.remove('was-validated');
  });
});
