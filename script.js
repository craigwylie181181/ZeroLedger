// 1. YOUR DATABASE LINK
const DATABASE_URL = 'https://script.google.com/macros/s/AKfycbzLvv_7N4ZepcPOBBRs_2DZcjVSknC7fKaSPT0bgsKj0qef_zAQwsvjdWKqeQQiD17mjQ/exec';

async function loadTerminalData() {
    try {
        const response = await fetch(DATABASE_URL);
        const data = await response.json();

        // --- TICKER ---
        const marketRow = data.Market[0];
        document.getElementById('ticker-data').innerText = `LIVE: ${marketRow.Ticker_Symbol} | PRICE: $${marketRow.Spot_Price_AUD} AUD | TREND: ${marketRow.Trend}`;

        // --- ISSUANCE LEDGER (WITH DATE FIX) ---
        const ledgerList = document.getElementById('ledger-list');
        ledgerList.innerHTML = '';
        
        data.Ledger.forEach(tx => {
            // This translates the ugly timestamp into a clean date
            const rawDate = new Date(tx.Date);
            const cleanDate = rawDate.toLocaleDateString('en-AU', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
            });

            const li = document.createElement('li');
            li.innerText = `${cleanDate} | TX: ${tx.Tx_ID} | ACCUs: ${tx.ACCUs_Issued} | $${tx.Value_AUD}`;
            ledgerList.appendChild(li);
        });

        // --- MAP ENGINE ---
        const map = L.map('map-container').setView([-25.2744, 133.7751], 4);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        data.Geospatial.forEach(point => {
            L.circleMarker([point.Latitude, point.Longitude], {
                radius: point.Data_Spike_Height / 10,
                color: '#2D5A27', 
                fillOpacity: 0.7
            }).bindPopup(`Project: ${point.Project_ID}`).addTo(map);
        });

        // --- DONUT CHART ---
        const methodCounts = {};
        data.Projects.forEach(proj => {
            methodCounts[proj.Methodology] = (methodCounts[proj.Methodology] || 0) + 1;
        });

        const ctx = document.getElementById('methodology-chart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(methodCounts),
                datasets: [{
                    data: Object.values(methodCounts),
                    backgroundColor: ['#2D5A27', '#8B4513', '#D2B48C'],
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
