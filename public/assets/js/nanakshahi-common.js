var langModal = new BSN.Modal(
  '#langModal', // target selector
  { // options object
    content: '<div class="modal-header"><h5 class="modal-title">Pick a Language</h5></div><div class="modal-body">Pick a language from the options below. This can always be changed later.</div><div class="modal-footer"><a class="btn btn-secondary" onclick="setLanguage(\'en\')" href="javascript:void(0);">English</a><a class="btn btn-primary" onclick="setLanguage(\'pa\')" href="javascript:void(0);">ਪੰਜਾਬੀ</a></div>',
    backdrop: 'static',
    keyboard: false 
  }
);

function setLanguage( language ) {
  if(!language) {
    localStorage.setItem('language', 'en');
  }
  localStorage.setItem('language', language);
  window.location.reload(false);
}

function checkPunjabi() {
  if(localStorage.getItem('language') === null) {
    langModal.show();
  }
  var check = localStorage.getItem('language') === 'pa';
  if(check){
    document.documentElement.setAttribute('lang', "pa");
    try {
      document.getElementById('language_en').className = 'dropdown-item';
      document.getElementById('language_pa').className = 'dropdown-item active';
    } catch(e) {
      console.log(e);
    }
  }
  return check;
}

function formatPunjabiDate(date, options = { year: true, weekday: true, short: false, punjabi: false }) {
  var months = ['ਜਨਵਰੀ', 'ਫ਼ਰਵਰੀ', 'ਮਾਰਚ', 'ਅਪ੍ਰੈਲ', 'ਮਈ', 'ਜੂਨ', 'ਜੁਲਾਈ', 'ਅਗਸਤ', 'ਸਤੰਬਰ', 'ਅਕਤੂਬਰ', 'ਨਵੰਬਰ', 'ਦਸੰਬਰ'];
  var weekdays = [{long:'ਐਤਵਾਰ', short:'ਐਤ'}, {long:'ਸੋਮਵਾਰ', short: 'ਸੋਮ'},{long: 'ਮੰਗਲਵਾਰ', short: 'ਮੰਗਲ'}, {long: 'ਬੁੱਧਵਾਰ', short: 'ਬੁੱਧ'}, {long: 'ਵੀਰਵਾਰ', short:'ਵੀਰ' }, {long:'ਸ਼ੁੱਕਰਵਾਰ', short:'ਸ਼ੁੱਕਰ'}, {long:'ਸ਼ਨੀਵਾਰ', short: 'ਸ਼ਨੀ'}];
  var string = ''
  if(options.weekday && options.short) {
    string += (options.punjabi ? weekdays[date.getDay()].short : date.toLocaleDateString('en', { weekday: 'short'}) ) + ', ';
  } else if (options.weekday) {
    string += (options.punjabi ? weekdays[date.getDay()].long : date.toLocaleDateString('en', { weekday: 'long'}) ) + ', ';
  }
  return string + date.getDate() + ' ' + months[date.getMonth()] + ( options.year ? ', ' + date.getFullYear() : '');
};