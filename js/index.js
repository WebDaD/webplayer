// TODO: object with graphical information and texts
var elements = {
  background: {
    kinder: '#a41344',
    szene: '#2b4154',
    nothing: '#2b4154'
  },
  font: {
    kinder: '#feee00',
    szene: '#fff59b',
    nothing: '#fff59b'
  }
}

$( document ).ready(function() {
  state = 'nothing'; // can be: nothing, szene, kinder
  loadPlayer();
  getItemFromApi();
  affixScriptToHead(window["env"]["api"] + '/socket.io/socket.io.js', function () { 
    initSocket();
  });
  var urlParams = new URLSearchParams(window.location.search);
  if(urlParams.has('state')) {
    state = urlParams.get('state');
    loadGraphicalElements(state);
  } else {
    getServerTime(function(err, time) {
      if(err) {
      console.log(err);
      } else {
        state = setStateByTime(time);
        loadGraphicalElements(state);
      }
    });
  }
  let audio = $("audio").get(0);
  if(audio.paused) {
    audio.play();
  }
  $('.player_control').click(function() {
    let audio = $("audio").get(0);
    if(audio.paused) {
      audio.play();
      $(".player_control").removeClass("rotate");
      $("#button_szene").attr("src", "images/button_szene.png")
      $("#button_kinder").attr("src", "images/button_kinder.png")
    } else {
      audio.pause();
      $(".player_control").addClass("rotate");
      $("#button_szene").attr("src", "images/button_szene_pause.png")
      $("#button_kinder").attr("src", "images/button_kinder_pause.png")
    }
  });
});
function getItemFromApi() {
  $.getJSON( window["env"]["api"] + '/present', function( data ) {
    console.log('Got Item', JSON.stringify(data))
    setItem(data)
  }).fail(function() {
    console.log( "error" );
  })
} 
function initSocket() {
  var socket = io(window["env"]["api"]);
  console.log('connected socket')
  socket.on('present_update', function(item) {
    console.log('New Item', JSON.stringify(item))
    addItemToPlaylist();
    setItem(item)
    getServerTime(function(err, time) {
      if(err) {
      console.log(err);
      } else {
        state = setStateByTime(time);
        loadGraphicalElements(state);
      }
    });
  });
  socket.on('error', function(item) {
    console.error(item)
  });
}
function loadPlayer() {
  $('#src_mp3_1').attr('src', window["env"]["stream_mp3_1"])
  $('#src_mp3_2').attr('src', window["env"]["stream_mp3_2"])
  $('#src_ogg_1').attr('src', window["env"]["stream_ogg_1"])
  $('#src_ogg_2').attr('src', window["env"]["stream_ogg_2"])
  var audio = $("audio").get(0);
  audio.load();
}
function setItem(item) {
  $('#show').html(item.Show_Name);
  $('#interpret').html(item.Music_Performer);
  $('#title').html(item.Title);
  if(item.Presenter && item.Presenter.length > 0) {
    $('#presenter').html(item.Presenter);
    $('#presenter_present').show();
  } else {
    $('#presenter').html('');
    $('#presenter_present').hide();
  }
  
  $('#from').html(isoToClock(item.Show_Time_Start));
  $('#to').html(isoToClock(item.Show_Time_Stop));
}
function addItemToPlaylist() {
  $('#playlist').append('<li class="playlist_item">' + $('#interpret').html() + ' - ' + $('#title').html() + '</li>');
}
function loadError(oError) {
  throw new URIError("The script " + oError.target.src + " didn't load correctly.");
}

function affixScriptToHead(url, onloadFunction) {
  var newScript = document.createElement("script");
  newScript.onerror = loadError;
  if (onloadFunction) { newScript.onload = onloadFunction; }
  document.head.appendChild(newScript);
  newScript.src = url;
}
function getServerTime(callback) {
  $.get( '/time', function( data ) {
    console.log('Got Time', data)
    callback(undefined, new Date(data));
  }).fail(function() {
    console.log( "error getting time" );
    callback(new Error('Error getting time'));
  })
}
function setStateByTime(time) {
  console.log(time.getDay(), time.getHours())
/*
    Kinder-Programm: 
    Sa 7-12 Uhr & So 6-9 Uhr

    Szene-Programm: 
    Fr 21 - Sa 7 Uhr & Sa 12-24 Uhr
    */
    if (
      (
        time.getDay() == 5 && (time.getHours() >= 7 && time.getHours() <= 12)
      ) 
    || 
      (
        time.getDay() == 6 && (time.getHours() >= 6 && time.getHours() <= 9)
      )
    ) {
      console.log('Kinder-Programm')
      return 'kinder';
    } else if (
      (
        time.getDay() == 4 && time.getHours() >= 21
      ) 
    || 
      (
        time.getDay() == 5 && time.getHours() <= 7
      )
    || 
      (
        time.getDay() == 5 && (time.getHours() >= 12 && time.getHours() <= 24)
      )
    ) {
      console.log('Szene-Programm')
      return 'szene';
    } else {
      console.log('Nothing-Programm')
      return 'nothing';
    }
  }
function loadGraphicalElements(state) {
  $('body').css('background-color', elements.background[state]);
  $('body').css('color', elements.font[state]);
  $('a').css('color', elements.font[state]);
  $('footer').css('border-top-color', elements.font[state]);
  $('#playlist ul li').css('background-color', elements.font[state]);
  $('#playlist ul li').css('color', elements.background[state]);

  switch(state) {
    case 'kinder':
      $('#metadata').show();
      $('#button_kinder').show();
      $('#button_szene').hide();
      $('#player').hide();
      $('#nothing').hide();
      $('#playlist').show();
      break;
    case 'szene':
      $('#metadata').show();
      $('#button_kinder').hide();
      $('#button_szene').show();
      $('#player').hide();
      $('#nothing').hide();
      $('#playlist').show();
      break;
    case 'nothing':
      $('#metadata').hide();
      $('#button_kinder').hide();
      $('#button_szene').hide();
      $('#player').hide();
      $('#nothing').show();
      $('#playlist').hide();
      break;
  } 
}
function isoToClock(iso) {
  var date = new Date(iso);
  return date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
}