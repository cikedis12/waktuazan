document.addEventListener('DOMContentLoaded', function() {
    var currentTimeElement = document.getElementById('current-time');
    var fajrTimeElement = document.getElementById('fajr-time');
    var dhuhrTimeElement = document.getElementById('dhuhr-time');
    var asrTimeElement = document.getElementById('asr-time');
    var maghribTimeElement = document.getElementById('maghrib-time');
    var ishaTimeElement = document.getElementById('isha-time');
    var azanSound = document.getElementById('azanSound');
    var playAzanBtn = document.getElementById('playAzanBtn');

    // Shah Alam coordinates (approximate)
    var latitude = 3.0738;
    var longitude = 101.5183;
    var method = 11; // JAKIM (Jabatan Kemajuan Islam Malaysia) method for Malaysia

    var azanTimesToday = {}; // To store today's azan times

    // --- Polyfill for String.prototype.padStart (Not in IE) ---
    function _padStart(str, targetLength, padString) {
        str = String(str);
        targetLength = targetLength >> 0; // Floor targetLength
        padString = String(typeof padString !== 'undefined' ? padString : ' ');
        if (str.length > targetLength) {
            return String(str);
        }
        targetLength = targetLength - str.length;
        if (targetLength > padString.length) {
            padString += padString.repeat(targetLength / padString.length); // Append to original string to ensure we have enough padding
        }
        return padString.slice(0, targetLength) + String(str);
    }

    // --- Basic XMLHttpRequest for API calls (Replaces fetch in IE) ---
    function _fetchPolyfill(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        callback(null, JSON.parse(xhr.responseText));
                    } catch (e) {
                        callback(new Error('Failed to parse JSON: ' + e.message));
                    }
                } else {
                    callback(new Error('HTTP Error: ' + xhr.status));
                }
            }
        };
        xhr.open('GET', url, true);
        xhr.send();
    }

    // --- Function to update current time ---
    function updateCurrentTime() {
        var now = new Date();
        var hours = _padStart(now.getHours(), 2, '0');
        var minutes = _padStart(now.getMinutes(), 2, '0');
        var seconds = _padStart(now.getSeconds(), 2, '0');
        currentTimeElement.textContent = hours + ':' + minutes + ':' + seconds;
    }

    // --- Function to fetch Azan times ---
    function fetchAzanTimes() {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1; // Month is 0-indexed

        var apiUrl = 'https://api.aladhan.com/v1/calendar/' + year + '/' + month + '?latitude=' + latitude + '&longitude=' + longitude + '&method=' + method;

        _fetchPolyfill(apiUrl, function(error, data) {
            if (error) {
                console.error('Error fetching Azan times:', error);
                alert('Failed to fetch Azan times. Please check your internet connection or API settings.');
                fajrTimeElement.textContent = '--:--';
                dhuhrTimeElement.textContent = '--:--';
                asrTimeElement.textContent = '--:--';
                maghribTimeElement.textContent = '--:--';
                ishaTimeElement.textContent = '--:--';
                return;
            }

            var todayData = null;
            var i;
            // Manual loop for Array.prototype.find() (Not in IE)
            for (i = 0; i < data.data.length; i++) {
                if (new Date(data.data[i].date.readable).getDate() === date.getDate()) {
                    todayData = data.data[i];
                    break;
                }
            }

            if (todayData) {
                var timings = todayData.timings;
                azanTimesToday = {
                    fajr: timings.Fajr.split(' ')[0], // Remove timezone part
                    dhuhr: timings.Dhuhr.split(' ')[0],
                    asr: timings.Asr.split(' ')[0],
                    maghrib: timings.Maghrib.split(' ')[0],
                    isha: timings.Isha.split(' ')[0]
                };

                fajrTimeElement.textContent = azanTimesToday.fajr;
                dhuhrTimeElement.textContent = azanTimesToday.dhuhr;
                asrTimeElement.textContent = azanTimesToday.asr;
                maghribTimeElement.textContent = azanTimesToday.maghrib;
                ishaTimeElement.textContent = azanTimesToday.isha;
            } else {
                console.error("Could not find today's azan times.");
                fajrTimeElement.textContent = '--:--';
                dhuhrTimeElement.textContent = '--:--';
                asrTimeElement.textContent = '--:--';
                maghribTimeElement.textContent = '--:--';
                ishaTimeElement.textContent = '--:--';
            }
        });
    }

    // --- Function to play Azan sound ---
    function playAzanSound() {
        if (azanSound) {
            // Error handling for play() method in IE might be different, but catch() is standard ES5+
            azanSound.play().catch(function(e) { console.error("Error playing sound:", e); });
        } else {
            console.warn("Azan sound element not found.");
        }
    }

    // --- Function to set reminders and play Azan ---
    function checkAzanAndReminders() {
        var now = new Date();
        var currentHours = now.getHours();
        var currentMinutes = now.getMinutes();
        var currentSeconds = now.getSeconds();

        var prayer;
        for (prayer in azanTimesToday) {
            if (Object.prototype.hasOwnProperty.call(azanTimesToday, prayer)) {
                var azanTime = azanTimesToday[prayer];
                var parts = azanTime.split(':').map(Number);
                var azanHours = parts[0];
                var azanMinutes = parts[1];

                var totalCurrentMinutes = currentHours * 60 + currentMinutes;
                var totalAzanMinutes = azanHours * 60 + azanMinutes;

                // Reminder 5 minutes before (check only at the start of the minute)
                var reminderMinutes = totalAzanMinutes - 5;
                if (totalCurrentMinutes === reminderMinutes && currentSeconds === 0) {
                    if (!sessionStorage.getItem('reminder-' + prayer + '-' + currentHours + ':' + currentMinutes)) {
                        alert('Reminder: ' + prayer + ' Azan in 5 minutes!');
                        console.log('Reminder for ' + prayer + ' at ' + currentHours + ':' + currentMinutes);
                        sessionStorage.setItem('reminder-' + prayer + '-' + currentHours + ':' + currentMinutes, 'set');
                    }
                }

                // Play Azan at actual time (check only at the start of the minute)
                if (totalCurrentMinutes === totalAzanMinutes && currentSeconds === 0) {
                    if (!sessionStorage.getItem('played-' + prayer + '-' + currentHours + ':' + currentMinutes)) {
                        playAzanSound();
                        console.log('Playing Azan for ' + prayer + ' at ' + currentHours + ':' + currentMinutes);
                        sessionStorage.setItem('played-' + prayer + '-' + currentHours + ':' + currentMinutes, 'true');
                    }
                }
            }
        }
    }

    // --- Event Listeners ---
    playAzanBtn.addEventListener('click', playAzanSound);

    // --- Initial calls and intervals ---
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);

    fetchAzanTimes();
    setInterval(checkAzanAndReminders, 1000);

    function setDailyAzanFetch() {
        var now = new Date();
        var tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5);
        var timeToWait = tomorrow.getTime() - now.getTime();

        setTimeout(function() {
            fetchAzanTimes();
            sessionStorage.clear();
            setDailyAzanFetch();
        }, timeToWait);
    }
    setDailyAzanFetch();
});
