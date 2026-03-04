// 1. YOUR DATABASE LINK GOES HERE
// Replace the text inside the quotes with your actual Google Apps Script URL
const DATABASE_URL = 'https://script.google.com/macros/s/AKfycbzLvv_7N4ZepcPOBBRs_2DZcjVSknC7fKaSPT0bgsKj0qef_zAQwsvjdWKqeQQiD17mjQ/exec';

// 2. THE ENGINE: This function pulls the data and updates the website
async function loadTerminalData() {
    try {
        // Fetch the data from Google
        const response = await fetch(DATABASE_URL);
        const data = await response.json();

        // --- UPDATE THE TICKER ---
        const tickerElement = document.getElementById('ticker-data');
        const marketRow = data.Market[0]; // Grabs the first row of your Market tab
        tickerElement.innerText = `LIVE: ${marketRow.Ticker_Symbol} | PRICE: $${marketRow.Spot_Price_AUD} AUD | TREND: ${marketRow.Trend}`;

        // --- UPDATE THE ISSUANCE LEDGER ---
        const ledgerList = document.getElementById('ledger-list');
        ledgerList.innerHTML = ''; // Clears the "Connecting..." text

        // Loop through your Ledger tab and create a list item for each row
        data.Ledger.forEach(transaction => {
            const listItem = document.createElement('li');
            listItem.innerText = `${transaction.Date} | TX: ${transaction.Tx_ID} | ACCUs: ${transaction.ACCUs_Issued} | Value: $${transaction.Value_AUD}`;
            ledgerList.appendChild(listItem);
        });

        // --- UPDATE PLACEHOLDERS FOR CHARTS & MAPS ---
        // (We will add the actual map and chart graphics in the next phase)
        document.getElementById('methodology-chart').innerText = 
            `Database Connected. Tracking ${data.Projects.length} Active Projects.`;
            
        document.getElementById('map-container').innerText = 
            `Geospatial Engine Ready. Loaded ${data.Geospatial.length} coordinate points.`;

    } catch (error) {
        // If something goes wrong, show an error in the ticker
        document.getElementById('ticker-data').innerText = "SYSTEM ERROR: UNABLE TO CONNECT TO DATABASE.";
    }
}

// 3. Start the engine when the website loads
loadTerminalData();
