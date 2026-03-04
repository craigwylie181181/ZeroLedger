// 1. YOUR DATABASE LINK
const DATABASE_URL = 'https://script.google.com/macros/s/AKfycbzLvv_7N4ZepcPOBBRs_2DZcjVSknC7fKaSPT0bgsKj0qef_zAQwsvjdWKqeQQiD17mjQ/exec';

async function loadTerminalData() {
    try {
        const response = await fetch(DATABASE_URL);
        const data = await response.json();

        // --- TICKER & LEDGER ---
        const marketRow = data.Market[0];
        document.getElementById('ticker-data').innerText = `LIVE: ${marketRow.Ticker_Symbol} | PRICE: $${marketRow.Spot_Price_AUD} AUD | TREND: ${marketRow.Trend}`;

        const ledgerList = document.getElementById('ledger-list');
        ledgerList.innerHTML = '';
        data.Ledger.forEach(tx => {
            const li = document.createElement('li');
            li.innerText = `${tx.Date} | TX: ${tx.Tx_ID} | ACCUs: ${tx.ACCUs_Issued} | $${tx.Value_AUD}`;
            ledgerList.appendChild(li);
        });

        // --- 2. RENDER THE MAP ---
        // Centers the map on Australia and uses a dark-mode forensic theme
        const map = L.map('map-container').setView([-25.2744, 133.7751], 4);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        // Plots your Geospatial tab coordinates onto the map
        data.Geospatial.forEach(point => {
            L.circleMarker([point.Latitude, point.Longitude], {
                radius: point.Data_Spike_Height / 10, // Scales the dot size
                color: '#2D5A27', // Eucalyptus Green
                fillOpacity: 0.7
            }).bindPopup(`Project: ${point.Project_ID}`).addTo(map);
        });

        // --- 3. RENDER THE DONUT CHART ---
        // Counts how many projects use each methodology
        const methodCounts = {};
        data.Projects.forEach(proj => {
            methodCounts[proj.Methodology] = (methodCounts[proj.Methodology] || 0) + 1;
        });

        // Draws the actual chart using your System tab colors
        const ctx = document.getElementById('methodology-chart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(methodCounts),
                datasets: [{
                    data: Object.values(methodCounts),
                    backgroundColor: ['#2D5A27', '#8B4513', '#D2B48C'], // Green, Ochre, Tan
                    borderColor: '#111',
                    borderWidth: 2
                }]
            },
            options: {
                plugins: { legend: { labels: { color: '#e0e0e0' } } }
            }
        });

    } catch (error) {
        document.getElementById('ticker-data').innerText = "SYSTEM ERROR: UNABLE TO CONNECT TO DATABASE.";
    }
}

loadTerminalData();
