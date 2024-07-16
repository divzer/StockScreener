const API_KEY = 'YOUR_ALPHA_VANTAGE_API_KEY'; // Replace with your API key
const symbols = ['AAPL', 'GOOGL', 'MSFT']; // Example stock symbols to monitor
const percentageThreshold = 10; // Threshold percentage increase

// Function to fetch stock prices
async function fetchStockPrices() {
    try {
        const promises = symbols.map(symbol => {
            return fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=1min&apikey=${API_KEY}`)
                .then(response => response.json())
                .then(data => {
                    // Extract latest stock data
                    const latestData = data['Time Series (1min)'];
                    const lastRefreshed = Object.keys(latestData)[0];
                    const price = parseFloat(latestData[lastRefreshed]['4. close']);
                    return { symbol, price };
                });
        });

        const results = await Promise.all(promises);
        return results;
    } catch (error) {
        console.error('Error fetching stock prices:', error);
        return [];
    }
}

// Function to check and alert on percentage increase
function checkStocksAndAlert(stocks) {
    stocks.forEach(stock => {
        const { symbol, price } = stock;
        const initialPrice = localStorage.getItem(`${symbol}_initialPrice`);
        
        if (initialPrice) {
            const percentageChange = ((price - parseFloat(initialPrice)) / parseFloat(initialPrice)) * 100;
            if (percentageChange >= percentageThreshold) {
                playAlertSound();
                console.log(`${symbol} has increased by ${percentageChange.toFixed(2)}%`);
            }
        } else {
            // Set initial price if not already set
            localStorage.setItem(`${symbol}_initialPrice`, price.toString());
        }
    });
}

// Function to play alert sound
function playAlertSound() {
    const alertSound = document.getElementById('alertSound');
    alertSound.play();
}

// Main function to fetch data periodically and check for alerts
async function main() {
    try {
        const stocks = await fetchStockPrices();
        checkStocksAndAlert(stocks);
    } catch (error) {
        console.error('Error in main function:', error);
    }
    
    // Check every minute (adjust interval as needed)
    setTimeout(main, 60000);
}

// Start the main function
main();
