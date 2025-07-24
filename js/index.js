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
  renderCopyRightYear();
  loadPlayer();
  getItemFromApi();
  reloadPlaylist();
  getVersion();
  affixScriptToHead(window["env"]["api"] + '/socket.io/socket.io.js', function () { 
    initSocket();
  });
  var urlParams = new URLSearchParams(window.location.search);
  let reloadEnabled = urlParams.has('reload');
  let lastState = state;

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

        // Add reload logic here
        if (reloadEnabled) {
          lastState = state;
          setInterval(function() {
            getServerTime(function(err, time) {
              if (!err) {
                let newState = setStateByTime(time);
                if (newState !== lastState) {
                  location.reload();
                }
              }
            });
          }, 60000); // check every 60 seconds
        }
      }
    });
  }
  if(urlParams.has('logo')) {
    let logo = urlParams.get('logo');
    if(logo == '0') {
      $('header').hide();
    } else {
      $('header').show();
    }
  } else {
    $('header').show();
  }
  if(urlParams.has('footer')) {
    footer = urlParams.get('footer');
    if(footer == '0') {
      $('footer').hide();
    } else {
      $('footer').show();
    }
  } else {
    $('footer').show();
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
  let data = {
    show: item.Show_Name || 'SHOW NAME MISSING',
    title: item.Title || 'TITLE MISSING',
    interpret: item.Music_Performer || 'PERFORMER MISSING',
    from: item.Show_Time_Start || 'YYYY-MM-DD HH:mm:ss.fff',
    to: item.Show_Time_Stop || 'YYYY-MM-DD HH:mm:ss.fff',
  }
  $('#show').html(data.show);
  if(item.Class && item.Class == 'Music') {
    $('#now_running_ul').show();
    $('#interpret').html(data.interpret);
    $('#title').html(data.title);
  } else {
    $('#now_running_ul').hide();
    $('#interpret').html('');
    $('#title').html('');
  }
  if(item.Show_Team_Presenter && item.Show_Team_Presenter.length > 0) {
    $('#presenter').html(item.Show_Team_Presenter);
    $('#presenter_present').show();
  } else {
    $('#presenter').html('');
    $('#presenter_present').hide();
  }
  
  $('#from').html(isoToClock(data.from));
  $('#to').html(isoToClock(data.to));
}
function reloadPlaylist() {
  $.getJSON( window["env"]["api"] + '/past', function( data ) {
    let list = data.reverse();
    console.log('Got Playlist', JSON.stringify(list))
    $('#playlist_ul').empty();
    for(let i = 0; i < 3; i++) {
      if(list[i]) {
        let item = list[i];
        if (item.Class && item.Class == 'Music') {
          $('#playlist_ul').append('<li class="playlist_item">' + item.Music_Performer + ' - ' + item.Title + '</li>');
        }
      }
    }
  })
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
  switch(day) {
    case 0: // Monday
    case 1: // Tuesday
    case 2: // Wednesday
    case 3: // Thursday
      return 'nothing';
    case 4: // friday
      if (hours => 21) {
        return 'szene';
      } else {
        return 'nothing';
      }
    case 5: // saturday
      if (hours => 0 && hours < 7) {
        return 'szene';
      } else if (hours => 7 && hours <= 12) {
        return 'kinder';
      } else {
        return 'szene';
      }
    case 6: // sunday
      if (hours => 0 && hours < 6) {
        return 'szene';
      } else if (hours => 6 && hours <= 9) {
        return 'kinder';
      } else {
        return 'szene';
      }
      default:
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
function renderCopyRightYear() {
  let year = new Date().getFullYear();
  $('#copy_right_year').html(year);
}