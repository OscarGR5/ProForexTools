const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
};
const cacheBuster = `?_=${new Date().getTime()}`;
let response = await fetch("https://s3.eu-west-1.amazonaws.com/www.proforextools.com/latest_rates.json" + cacheBuster, { headers });
let data = await response.json();

const pairs_last_price = {};

// Extract the latest exchange rates from the JSON data
const latest_rates = {
    "AUD": data.AUD[data.AUD.length - 1],
    "EUR": data.EUR[data.EUR.length - 1],
    "GBP": data.GBP[data.GBP.length - 1],
    "CAD": data.CAD[data.CAD.length - 1],
    "JPY": data.JPY[data.JPY.length - 1],
    "CHF": data.CHF[data.CHF.length - 1],
    "NZD": data.NZD[data.NZD.length - 1],
};

// Define the pairs you want to calculate
const pairs = [
    "AUD/CAD", "AUD/CHF", "AUD/JPY", "AUD/NZD", "AUD/USD", "CAD/CHF", "CAD/JPY", "CHF/JPY", "EUR/AUD", 
    "EUR/CAD", "EUR/CHF", "EUR/GBP", "EUR/JPY", "EUR/NZD", "EUR/USD", "GBP/AUD", "GBP/CAD", "GBP/CHF",
    "GBP/JPY", "GBP/NZD", "GBP/USD", "NZD/CAD", "NZD/CHF", "NZD/JPY", "NZD/USD", "USD/CAD", "USD/CHF",
    "USD/JPY"
];

pairs.forEach(pair => {
    const [base, quote] = pair.split('/');
    if (base === 'USD') {
        pairs_last_price[pair] = latest_rates[quote];
    } else if (quote === 'USD') {
        pairs_last_price[pair] = 1 / latest_rates[base];
    } else {
        pairs_last_price[pair] = latest_rates[quote] / latest_rates[base];
    }
});

document.getElementById('calculatebutton').onclick = function() {
    // Get input values
    let accountCurrency = document.getElementById("account-currency").value;
    let accountBalance = parseFloat(document.getElementById("account-balance").value);
    let riskPercentage = parseFloat(document.getElementById("risk-percentage").value) / 100;
    let stopLoss = parseFloat(document.getElementById("stop-loss").value);
    let currencyPair = document.getElementById("currency-pair").value;
    // Handle not all fields filled in
    function showAlert(message) {
        alertMessage.innerText = message;
        customAlert.style.display = "block";
    }
    const closeAlert = document.getElementsByClassName("close")[0];
    closeAlert.onclick = function() {
        customAlert.style.display = "none";
    };

    if (isNaN(accountBalance)  || isNaN(riskPercentage) || isNaN(stopLoss)) {
        showAlert("Please fill in all fields before calculating.");
        return 0; // Operation cannot be performed.
    } else {
        showAlert("");
    }

    // Calculate result
    const result = calculatePositionSize(accountCurrency, accountBalance, riskPercentage, stopLoss, currencyPair)

    // Display results
    document.getElementById("amountAtRisk").textContent = result.amountAtRisk;
    document.getElementById("accountCurrency").textContent = accountCurrency;
    document.getElementById("positionSize").textContent = result.positionSize;
    document.getElementById("standardLots").textContent = result.standardLots;
};

function calculatePositionSize(accountCurrency, accountBalance, riskPercentage, stopLoss, currencyPair) {
    const amountAtRisk = accountBalance * riskPercentage;

    let minPipChange = (currencyPair.includes("JPY")) ? 0.01 : 0.0001;

    const [baseCurrency, quoteCurrency] = currencyPair.split('/');

    let pipValueInBaseCurr = amountAtRisk / stopLoss;
    if (accountCurrency !== quoteCurrency) {
        pipValueInBaseCurr = convertCurrency(pipValueInBaseCurr, quoteCurrency, accountCurrency);
    }

    // Calculate Position Size
    const positionSize = pipValueInBaseCurr / minPipChange;

    // Calculate Standard Lots
    const standardLots = positionSize / 100000;

    // Function to format numbers
    function formatNumber(num) {
        const roundedNum = num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
        const formattedNum = roundedNum.toLocaleString();
        // Add commas as thousands separators
        return formattedNum.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    return {
        amountAtRisk: formatNumber(amountAtRisk),
        positionSize: formatNumber(positionSize),
        standardLots: formatNumber(standardLots),
    };
}

function convertCurrency(pipValueInBaseCurr, from, to) {
    const conversionPair = (`${from}/${to}` in pairs_last_price) ? `${from}/${to}` : `${to}/${from}`
    const baseCurr = conversionPair.split('/')[0];
    const rate = pairs_last_price[conversionPair]

    if (from == baseCurr) {
        pipValueInBaseCurr /= rate;
    } else {
        pipValueInBaseCurr *= rate;
    }
    return pipValueInBaseCurr
}

function preventMinusSignInput(event) {
    if (event.key === "-") {
        event.preventDefault();
    }
}

document.getElementById("account-balance").addEventListener("keydown", preventMinusSignInput);
document.getElementById("risk-percentage").addEventListener("keydown", preventMinusSignInput);
document.getElementById("stop-loss").addEventListener("keydown", preventMinusSignInput);

const select = document.getElementById("currency-pair");
pairs.forEach(pair => {
    const option = document.createElement("option");
    option.value = pair;
    option.textContent = pair;
    select.appendChild(option);
});

