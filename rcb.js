const https = require('https');
const { spawn } = require('child_process');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
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
  const form = new FormData();
  form.append('chat_id', CHAT_ID);
  form.append('audio', fs.createReadStream('./audio.mp3'));

  axios.post(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendAudio`,
    form,
    { headers: form.getHeaders() }
  ).catch(err => console.error(err.response?.data || err.message));
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
        if (lastResponse && currentResponse !== lastResponse) {
          clearInterval(intervalId);
          sendTelegramAlert();            // 🔊 START alarm
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
