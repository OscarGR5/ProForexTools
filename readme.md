# ProForexTools

Welcome to ProForexTools. This website offers a variety of tools and educational resources to enhance your trading.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [License](#license)

## Overview

ProForexTools provides traders with essential tools and resources to improve their trading strategies and knowledge. Our platform includes a strength chart, position size calculator, recommended Forex books, and a comprehensive guide to the Ichimoku Kinko Hyo indicator.

## Features

- **Strength Chart**: Visualize the strength of major currencies, updated every 5 minutes.
- **Position Size Calculator**: Calculate the ideal position size for your trades based on your risk tolerance and account size.
- **Best Forex Books**: Discover essential books on Forex trading recommended by experts.
- **Ichimoku Kinko Hyo**: Master the Ichimoku Kinko Hyo indicator with our comprehensive guide and resources.

## Getting Started

To explore our tools and resources, visit our website:

- [Strength Chart](strength-chart.html)
- [Position Size Calculator](position-size-calculator.html)
- [Best Forex Books](best-forex-books.html)
- [Ichimoku Kinko Hyo](ichimoku.html)

## Contributing

We welcome contributions to improve our website and resources. If you have any suggestions or would like to contribute, please contact us through our [Contact Us](https://forms.gle/SkveNRwANXp6D2cc9) form.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Thank you for visiting ProForexTools. We hope our resources help you become a successful Forex trader.
## Technical Details

### Strength Chart

The Strength Chart is a dynamic tool that visualizes the strength of major currencies. It updates every 5 minutes using an AWS Lambda function, which fetches the latest currency data from an external API. The data is then processed and displayed on the chart, allowing traders to make informed decisions based on real-time information.

### Hosting and Infrastructure

Our website is hosted on an Amazon S3 bucket, ensuring high availability and scalability. The static assets, including HTML, CSS, and JavaScript files, are served directly from the S3 bucket, providing a fast and reliable user experience.

### Position Size Calculator

The Position Size Calculator helps traders determine the optimal position size for their trades based on their account balance, risk percentage, and stop loss. It uses real-time market prices to provide accurate calculations, ensuring that traders can manage their risk effectively.

### Data Fetching and Processing

Both the Strength Chart and Position Size Calculator rely on real-time data fetched from external APIs. The data is processed client-side using JavaScript, ensuring that the tools are always up-to-date with the latest market information.

For more details, refer to the source code of the respective HTML files:

- [Strength Chart](#file:strength-chart.html)
- [Position Size Calculator](#file:position-size-calculator.html)
## Current Status

Please note that the website is currently inactive, and the AWS Lambda function responsible for updating the Strength Chart has been turned off. As a result, the tools and resources may not reflect the latest market data.