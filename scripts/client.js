let myChart;  

function runMyScript() {
    // console.log("Running script at: " + new Date().toLocaleTimeString());

    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    };
    const cacheBuster = `?_=${new Date().getTime()}`;
    fetch("https://s3.eu-west-1.amazonaws.com/www.proforextools.com/latest_rates.json" + cacheBuster, { headers })
        .then(response => response.json())
        .then(data => {
            // Compute USD prices
            function computeUSDPrices(data) {
                const keys = Object.keys(data);
                const numTimestamps = data.timestamps.length;

                data.USD = new Array(numTimestamps).fill(0);

                for (let i = 0; i < numTimestamps; i++) {
                    let sumReciprocals = 0;
                    let numCurrencies = 0;

                    keys.forEach(key => {
                        if (key !== 'timestamps' && key !== 'USD') {
                            sumReciprocals += 1 / data[key][i];
                            numCurrencies++;
                        }
                    });

                    data.USD[i] = sumReciprocals / numCurrencies;
                }
                data.USD[data.USD.length - 1] = data.USD[data.USD.length - 2];
                return data;
            }

            // Function to calculate relative strength
            function calculateRelativeStrength(data) {
                data = computeUSDPrices(data);
                const currencies = Object.keys(data).filter(key => key !== 'timestamps');
                const numPoints = data.timestamps.length;

                // Initialize currency change object
                const currencyChange = {};
                currencies.forEach(currency => {
                    currencyChange[currency] = Array(numPoints).fill(1);
                });

                // Calculate relative changes
                for (let i = 1; i < numPoints; i++) {
                    currencies.forEach(currency => {
                        const prevRate = data[currency][i - 1];
                        const currRate = data[currency][i];
                        currencyChange[currency][i] = prevRate / currRate; // Calculate inverse change to USD
                    });
                }

                // Compute cumulative rates
                const cumulativeRates = {};
                currencies.forEach(currency => {
                    cumulativeRates[currency] = Array(numPoints).fill(0);
                    cumulativeRates[currency][0] = 0; // Initial value is 0
                    for (let i = 1; i < numPoints; i++) {
                        cumulativeRates[currency][i] = cumulativeRates[currency][i - 1] + (currencyChange[currency][i] - 1);
                    }
                });

                // Adjust cumulative rates to make them comparable
                let maxAbsoluteValue = 0;
                let minAbsoluteValue = Infinity; // Initialize minimum value to positive infinity
                currencies.forEach(currency => {
                    const firstValue = cumulativeRates[currency][0];
                    for (let i = 0; i < numPoints; i++) {
                        cumulativeRates[currency][i] = cumulativeRates[currency][i] - firstValue;
                        maxAbsoluteValue = Math.max(maxAbsoluteValue, Math.abs(cumulativeRates[currency][i]));
                        minAbsoluteValue = Math.min(minAbsoluteValue, Math.abs(cumulativeRates[currency][i])); // Update minimum value
                    }
                });

                // Normalize values to be between [xx, xx]
                let maxNormalizedValue = 0;
                let minNormalizedValue = 0;
                currencies.forEach(currency => {
                    for (let i = 0; i < numPoints; i++) {
                        cumulativeRates[currency][i] = (cumulativeRates[currency][i] / maxAbsoluteValue) * 20; // change interval here
                        maxNormalizedValue = Math.max(maxNormalizedValue, cumulativeRates[currency][i]);
                        minNormalizedValue = Math.min(minNormalizedValue, cumulativeRates[currency][i]); // Update minimum value
                    }
                });

                // Calculate relative strength points
                const relativeStrengthPoints = {};
                data.timestamps.forEach((timestamp, index) => {
                    relativeStrengthPoints[timestamp] = {};
                    currencies.forEach(currency => {
                        relativeStrengthPoints[timestamp][currency] = cumulativeRates[currency][index];
                    });
                });
                return { relativeStrengthPoints, maxNormalizedValue, minNormalizedValue };
            }

            // Calculate relative strength
            const { relativeStrengthPoints, maxNormalizedValue, minNormalizedValue } = calculateRelativeStrength(data);

            // PLOT GRAPH
            const ctx = document.getElementById('exchangeRatesChart').getContext('2d');

            const timestamps = data.timestamps;

            const labels = timestamps.map(ts => new Date(ts * 1000).toLocaleTimeString().slice(0, 5));

            const lineColors = [
                'rgba(255, 153, 0, 1)',      // USD
                'rgba(255, 0, 0, 1)',        // EUR
                'rgba(0, 204, 0, 1)',        // GBP
                'rgba(0, 204, 255, 1)',      // JPY
                'rgba(153, 102, 0, 1)',      // CHF
                'rgba(0, 51, 255, 1)',       // AUD
                'rgba(153, 0, 255, 1)',      // CAD
                'rgba(255, 51, 204, 1)'      // NZD
            ];

            const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD'];
            const datasets = currencies.map((currency, index) => ({
                label: currency,
                data: timestamps.map(ts => relativeStrengthPoints[ts][currency]),
                borderWidth: 1,
                backgroundColor: lineColors[index],
                borderColor: lineColors[index],
                pointRadius: 0,
                fill: false
            }));

            // Destroy previous chart instance if it exists
            if (myChart) {
                myChart.destroy();
            }

            // Create new chart instance
            myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options: {
                    animation: {
                        duration: 0
                    },
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                font: {
                                    size: 12,
                                    font: "calibri",
                                }
                            },
                            onHover: (event) => {
                                event.native.target.style.cursor = "pointer";
                            },
                            onLeave: (event) => {
                                event.native.target.style.cursor = "default";
                            }
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            ticks: {
                                autoSkip: false,
                                callback: function(value, index, values) {
                                    // Extract hours and minutes
                                    const time = this.getLabelForValue(value);
                                    const [hours, minutes] = time.split(':');

                                    // Show labels where minutes are "00" (hourly)
                                    if (minutes === '00') {
                                        return time;
                                    }
                                    // Always show the last label
                                    // if (index === labels.length - 1) {
                                    //     return time;
                                    // }

                                    // Otherwise, return an empty string
                                    return '';
                                },
                                font: {
                                    size: 13,
                                    family: 'Arial',
                                    weight: "550"
                                }
                            },
                            grid: {
                                display: true,
                                drawTicks: true,
                                color: function(context) {
                                    const time = context.tick.label;
                                    const [hours, minutes] = time.split(':');

                                    if (minutes === '00' || context.tick.label === labels[labels.length - 1]) {
                                        return '#e0e0e0';
                                    }
                                    return 'transparent';
                                }
                            }
                        },
                        y: {
                            min: minNormalizedValue,
                            max: maxNormalizedValue,
                            ticks: {
                                font: {
                                    size: 12,
                                    family: 'Arial',
                                    weight: "550"
                                }
                            }
                        }
                    },
                }
            });

            const last_point_list = document.getElementById('last-points');

            // Clear the last_point_list contents before adding new values
            last_point_list.innerHTML = '';

            const lastTime = `
                <div class="lastTimeLabel">
                    <p><b>${labels[labels.length - 1]}</b></p>
                </div>
            `;

            last_point_list.innerHTML += lastTime;

            const currencyData = currencies.map((curr, index) => {
                return {
                    currency: curr,
                    lastElement: relativeStrengthPoints[timestamps[timestamps.length - 1]][curr],
                    color: lineColors[index]
                };
            });

            currencyData.sort((a, b) => b.lastElement - a.lastElement);

            currencyData.forEach(item => {
                const children = `
                    <div class="currency-label">
                        <p><span style="color: ${item.color};"><b>${item.currency}</b></span>: ${item.lastElement.toFixed(2)}</p>
                    </div>
                `;
                last_point_list.innerHTML += children;
            });

        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

function startTimer() {
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();

    // Calculate the minutes to the next multiple of 5
    const minutesToNextMultipleOf5 = (5 - (minutes % 5)) % 5;
    const millisecondsToNextMultipleOf5 = minutesToNextMultipleOf5 * 60 * 1000 - (seconds * 1000 + milliseconds);

    // Run the script immediately after loading
    runMyScript();

    // Set timeout to run the script at the next multiple of 5 minutes
    setTimeout(() => {
        runMyScript();
        // Set interval to run the script every 5 minutes thereafter + 10 sec delay
        setInterval(runMyScript, 5 * 60 * 1000 + 20000);
    }, millisecondsToNextMultipleOf5 + 20000);
}

// Start the timer
startTimer();
