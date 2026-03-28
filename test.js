const player = require('play-sound')({
  player: 'C:\\Program Files\\VideoLAN\\VLC\\vlc.exe'
});

let alarmPlaying = false;

function startAlarm() {
  if (alarmPlaying) return;
  alarmPlaying = true;

  console.log('🚨 ALARM STARTED 🚨');

  function playLoop() {
    player.play('./vivo_v9_ringtone.mp3', (err) => {
      if (err) {
        console.error('Error playing sound:', err);
        return;
      }

      if (alarmPlaying) {
        playLoop();
      }
    });
  }

  playLoop();
}

// test
startAlarm();