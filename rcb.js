const https = require('https');
const { spawn } = require('child_process');
const axios = require('axios');

const BOT_TOKEN = '8599704447:AAFZNMPMA-3H0W7z8T0i8iovSTYFhsQMx_k';
const CHAT_ID = '6533691877';
const url = 'https://rcbscaleapi.ticketgenie.in/ticket/eventlist/O';

let lastResponse = null;
let alarmPlaying = false;
let alarmProcess = null;
let intervalId = null; // to stop polling

// 🔊 Start looping MP3 using ffplay
// 🔊 Start looping MP3 using VLC\

function sendTelegramAlert() {
  return axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendAudio`, {
    chat_id: CHAT_ID,
    audio: 'https://www.soundjay.com/misc/sounds/alarm-clock-01.mp3'
  });
}

function startAlarm() {
  if (alarmPlaying) return;
  alarmPlaying = true;

  console.log('🚨 CHANGE DETECTED! STOPPING FETCH & PLAYING ALARM 🚨');

  function playLoop() {
    if (!alarmPlaying) return;

    alarmProcess = spawn(
      'C:\\Program Files\\VideoLAN\\VLC\\vlc.exe',
      [
        '--intf', 'dummy',        // no UI
        '--play-and-exit',        // exit after playback
        './vivo_v9_ringtone.mp3'
      ],
      {
        stdio: 'ignore'
      }
    );

    alarmProcess.on('exit', () => {
      if (alarmPlaying) {
        playLoop(); // loop again
      }
    });

    alarmProcess.on('error', (err) => {
      console.error('Error starting VLC:', err.message);
    });
  }

  playLoop();
}

function fetchData() {
  https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const json = JSON.parse(data);

        console.clear();
        console.log('Response at:', new Date().toLocaleTimeString());
        console.log(json);

        const currentResponse = JSON.stringify(json);

        // ✅ CORRECT change detection
        if (lastResponse && lastResponse !== currentResponse) {
          clearInterval(intervalId);
          sendTelegramAlert();  
          startAlarm();              // 🔊 START alarm
          return;
        }

        lastResponse = currentResponse;

      } catch (err) {
        console.error('JSON parse error:', err.message);
      }
    });

  }).on('error', (err) => {
    console.clear();
    console.error('Error:', err.message);
  });
}

// ⏱️ Start polling
intervalId = setInterval(fetchData, 1000);


// 🛑 Stop alarm with any key press
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', () => {
  console.log('🛑 Alarm stopped');
  alarmPlaying = false;

  if (alarmProcess) {
    alarmProcess.kill('SIGKILL');
  }

  process.exit();
});