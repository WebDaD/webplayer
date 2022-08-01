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
  getVersion();
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
    reloadPlaylist();
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
  if(item.Show_Team_Presenter && item.Show_Team_Presenter.length > 0) {
    $('#presenter').html(item.Show_Team_Presenter);
    $('#presenter_present').show();
  } else {
    $('#presenter').html('');
    $('#presenter_present').hide();
  }
  
  $('#from').html(isoToClock(item.Show_Time_Start));
  $('#to').html(isoToClock(item.Show_Time_Stop));
}
function reloadPlaylist() {
  $('#playlist').empty();
  $.getJSON( window["env"]["api"] + '/past', function( data ) {
    console.log('Got Playlist', JSON.stringify(data))
    for(let i = 0; i < 3; i++) {
      if(data[i]) {
        let item = data[i];
        $('#playlist').append('<li class="playlist_item">' + item.Music_Performer + ' - ' + item.Title + '</li>');
      }
    }
  }
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
  $.get( '/time', function( data ) { // 2022-08-01T08:10:31+00:00
    console.log('Got Time', data)
    var arr = data.split(/[-T:+]/),
    date = new Date(arr[0], arr[1]-1, arr[2], arr[3], arr[4], arr[5]);
    callback(undefined, date);
  }).fail(function() {
    console.log( "error getting time" );
    callback(new Error('Error getting time'));
  })
}
function getVersion() {
  $.get( '/version.txt', function( data ) {
    $('#version').html(data);
  }).fail(function() {
    console.log( "error getting version" );
  })
}
function setStateByTime(time) {
  let day = time.getDay() || 7 - 1
  let hour = time.getHours()
  console.log(day, hour)
/*
    Kinder-Programm: 
    Sa 7-12 Uhr & So 6-9 Uhr

    Szene-Programm: 
    Fr 21 - Sa 7 Uhr & Sa 12-24 Uhr
    */
    if (
      (
        day == 5 && (hour >= 7 && hour <= 12)
      ) 
    || 
      (
        day == 6 && (hour >= 6 && hour <= 9)
      )
    ) {
      console.log('Kinder-Programm')
      return 'kinder';
    } else if (
      (
        day == 4 && hour >= 21
      ) 
    || 
      (
        day == 5 && hour <= 7
      )
    || 
      (
        day == 5 && (hour >= 12 && hour <= 24)
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
function isoToClock(iso) { // iso: "2022-07-31 23:00:00.000"
  let split  = iso.split(' ')[1].split(':');
  return split[0].padStart(2, '0') + ':' + split[1].padStart(2, '0');
}