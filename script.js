document.addEventListener('DOMContentLoaded', () => {
    const currentTimeElement = document.getElementById('current-time');
    const fajrTimeElement = document.getElementById('fajr-time');
    const dhuhrTimeElement = document.getElementById('dhuhr-time');
    const asrTimeElement = document.getElementById('asr-time');
    const maghribTimeElement = document.getElementById('maghrib-time');
    const ishaTimeElement = document.getElementById('isha-time');
    const azanSound = document.getElementById('azanSound');
    const playAzanBtn = document.getElementById('playAzanBtn');

    // Shah Alam coordinates (approximate)
    const latitude = 3.0738;
    const longitude = 101.5183;
    const method = 11; // JAKIM (Jabatan Kemajuan Islam Malaysia) method for Malaysia

    let azanTimesToday = {}; // To store today's azan times

    // --- Function to update current time ---
    function updateCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        currentTimeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }

    // --- Function to fetch Azan times (Requires API Integration) ---
    async function fetchAzanTimes() {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // Month is 0-indexed

        // Using Aladhan API for example. Replace with your preferred API.
        // You might need an API key for some services.
        const apiUrl = `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${latitude}&longitude=${longitude}&method=${method}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Find today's prayer times
            const todayData = data.data.find(day => new Date(day.date.readable).getDate() === date.getDate());

            if (todayData) {
                const timings = todayData.timings;
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
                // Set default/placeholder times if API fails or no data
                fajrTimeElement.textContent = '--:--';
                dhuhrTimeElement.textContent = '--:--';
                asrTimeElement.textContent = '--:--';
                maghribTimeElement.textContent = '--:--';
                ishaTimeElement.textContent = '--:--';
            }
        } catch (error) {
            console.error('Error fetching Azan times:', error);
            alert('Failed to fetch Azan times. Please check your internet connection or API settings.');
            // Set default/placeholder times on error
            fajrTimeElement.textContent = '--:--';
            dhuhrTimeElement.textContent = '--:--';
            asrTimeElement.textContent = '--:--';
            maghribTimeElement.textContent = '--:--';
            ishaTimeElement.textContent = '--:--';
        }
    }

    // --- Function to play Azan sound ---
    function playAzanSound() {
        if (azanSound) {
            azanSound.play().catch(e => console.error("Error playing sound:", e));
        } else {
            console.warn("Azan sound element not found.");
        }
    }

    // --- Function to set reminders and play Azan ---
    function checkAzanAndReminders() {
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();

        for (const prayer in azanTimesToday) {
            if (azanTimesToday.hasOwnProperty(prayer)) {
                const [azanHours, azanMinutes] = azanTimesToday[prayer].split(':').map(Number);

                // Calculate time difference in minutes
                const totalCurrentMinutes = currentHours * 60 + currentMinutes;
                const totalAzanMinutes = azanHours * 60 + azanMinutes;

                // Reminder 5 minutes before
                const reminderMinutes = totalAzanMinutes - 5;
                if (totalCurrentMinutes === reminderMinutes) {
                    // Prevent multiple reminders in the same minute
                    if (!sessionStorage.getItem(`reminder-${prayer}-${currentHours}:${currentMinutes}`)) {
                        alert(`Reminder: ${prayer} Azan in 5 minutes!`);
                        console.log(`Reminder for ${prayer} at ${currentHours}:${currentMinutes}`);
                        sessionStorage.setItem(`reminder-${prayer}-${currentHours}:${currentMinutes}`, 'set');
                    }
                }

                // Play Azan at actual time
                if (totalCurrentMinutes === totalAzanMinutes) {
                    // Prevent multiple plays in the same minute
                    if (!sessionStorage.getItem(`played-${prayer}-${currentHours}:${currentMinutes}`)) {
                        playAzanSound();
                        console.log(`Playing Azan for ${prayer} at ${currentHours}:${currentMinutes}`);
                        sessionStorage.setItem(`played-${prayer}-${currentHours}:${currentMinutes}`, 'true');
                    }
                }
            }
        }
    }

    // --- Event Listeners ---
    playAzanBtn.addEventListener('click', playAzanSound);

    // --- Initial calls and intervals ---
    updateCurrentTime(); // Call once immediately
    setInterval(updateCurrentTime, 1000); // Update every second

    fetchAzanTimes(); // Fetch azan times on load
    // Check azan and reminders every minute
    setInterval(checkAzanAndReminders, 60 * 1000); // Every minute

    // Optional: Refresh Azan times daily (e.g., at midnight)
    function setDailyAzanFetch() {
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5); // 5 seconds past midnight
        const timeToWait = tomorrow.getTime() - now.getTime();

        setTimeout(() => {
            fetchAzanTimes();
            // Clear session storage for the new day's reminders/plays
            sessionStorage.clear();
            setDailyAzanFetch(); // Set timeout for the next day
        }, timeToWait);
    }
    setDailyAzanFetch(); // Start the daily fetch cycle
});