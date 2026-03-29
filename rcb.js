const https = require('https');
const { spawn } = require('child_process');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const BOT_TOKEN = '8599704447:AAFZNMPMA-3H0W7z8T0i8iovSTYFhsQMx_k';
const CHAT_IDS = [
  '6533691877',   // your phone
  '8137670107',
  '1736583692',
  '5055670024',
  '6778719534',
  '6780280722',
  '6200439674',
  '1803061111',
  '1999110250',
  '6768393827',
  '6859632939',
  '5218771707'
];
const url = 'https://rcbscaleapi.ticketgenie.in/ticket/eventlist/O';

let lastResponse = null;
let alarmPlaying = false;
let alarmProcess = null;
let intervalId = null; // to stop polling

// 🔊 Start looping MP3 using ffplay
// 🔊 Start looping MP3 using VLC\
function sendTelegramAlert() {
  CHAT_IDS.forEach(chatId => {
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          chat_id: chatId,
          text: '🚨 RCB TICKETS AVAILABLE 🚨'
        }).catch(err => console.error(err.response?.data || err.message));
      }, i * 5000);
    }
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
