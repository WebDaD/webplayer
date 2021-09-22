(function(window) {
  window["env"] = window["env"] || {};

  // Environment variables
  window["env"]["api"] = "${API}";
  window["env"]["stream_mp3_1"] = "${STREAM_MP3_1} || https://live.feierwerk.de:8443/live.mp3";
  window["env"]["stream_mp3_2"] = "${STREAM_MP3_2} || http://live.feierwerk.de:8000/live.mp3";
  window["env"]["stream_ogg_1"] = "${STREAM_OGG_1} || https://live.feierwerk.de:8443/live.ogg";
  window["env"]["stream_ogg_2"] = "${STREAM_OGG_2} || http://live.feierwerk.de:8000/live.ogg";
})(this);
