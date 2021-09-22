$( document ).ready(function() {
  loadPlayer();
  getItemFromApi();
  affixScriptToHead(window["env"]["api"] + '/socket.io/socket.io.js', function () { 
    initSocket();
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
    setItem(item)
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