# SAFE Conversion Calculator

SAFE Conversion Calculator is a web app designed to help founders and investors understand how their SAFE notes convert to equity in a priced round. As a former founder, I was surprised by the lack of transparency and understanding about how the mechanics of this process work and how complex the conversion process can be given the lack of a closed form solution.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Pre-Money and Post-Money SAFE Conversion**: Supports both Pre-Money and Post-Money SAFE conversion or a mix of both.
- **Configurable ESOP**: Allows users to see how changing the size of their ESOP affects their conversion.
- **Responsive Design**: Ensures optimal viewing on various devices.
- **Import/Export**: Import and export investor data from a CSV file.
- **Results Table & Charts**: View the results of the conversion in a table and pie chart.
- **Explainer with Mathematical Expressions**: Provides an explanation of the conversion process complete with formulas and LaTeX notation.

## Installation

To set up the project locally:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/rwong01/safe-conversion-calc.git
   cd safe-conversion-calc
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

   or

   ```bash
   yarn install
   ```

3. **Start the development server**:

   ```bash
   npm run dev
   ```

   or

   ```bash
   yarn dev
   ```

   The application will be accessible at `http://localhost:3000`.

## Usage

After starting the development server:

- Navigate to `http://localhost:3000` in your browser.
- Input the current round details, outstanding SAFEs, and future round details.
- View the results in the table and pie chart.
- Utilize the explainer to understand the conversion process.

## Technologies Used

- **Next.js**: Framework for server-rendered React applications.
- **React**: JavaScript library for building user interfaces.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Radix UI**: Accessible React components for building high-quality interfaces.
- **Chart.js**: JavaScript library for data visualization.
- **KaTeX**: Fast math typesetting library.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch:

   ```bash
   git checkout -b feature-name
   ```

3. Make your changes.
4. Commit your changes:

   ```bash
   git commit -m 'Add feature'
   ```

5. Push to the branch:

   ```bash
   git push origin feature-name
   ```

6. Open a pull request detailing your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
