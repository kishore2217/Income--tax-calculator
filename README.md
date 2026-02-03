# Income Tax Calculator 💰

A modern, fast, and responsive web application designed to help users estimate their income tax liabilities efficiently. Built with the latest web technologies for a seamless user experience.

## ✨ Features

- **Real-time Calculation**: Instant feedback as you input your financial details.
- **Robust Validation**: Ensures data integrity with mandatory field checks and non-negative value constraints.
- **Comprehensive Analysis**: Supports Salary, House Property (with **30% Standard Deduction u/s 24(a)**), PGBP, Other Sources, and LTCG.
- **Detailed Tax Breakdown**: Transparent view of Standard Deduction, Surcharge, Cess, and Regime-specific slabs.
- **Dual Regime Support**: Compare taxes under both the **New Regime** and **Old Regime**.
- **Dark Mode**: Fully supported dark and light themes with a smooth toggle switch.
- **Responsive Design**: Mobile-first layout optimized for all screen sizes.
- **CI/CD Integration**: Automated testing and build checks using **GitHub Actions**.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Font**: [Geist Sans & Mono](https://vercel.com/font)
- **Deployment**: [Vercel](https://vercel.com/)

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/income-tax-calculator.git
   cd income-tax-calculator
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) or [https://income-tax-calculator-gx16-ocrn6t261-kishore2217s-projects.vercel.app/] to see the application running.

## 📖 Usage

1. Enter your **Gross Annual Income**.
2. Add any applicable **Exemptions** (e.g., HRA, LTA) and **Deductions** (e.g., 80C, 80D).
3. The calculator will automatically display your taxable income and the tax payable under both regimes (click "Calculate Tax" after entering details).
4. Use the **Reset** button to instantly clear all inputs and start fresh.
5. Toggle the theme button in the top right to switch between **Light** and **Dark** modes.

## ☁️ Deployment

The easiest way to deploy this app is using the [Vercel Platform](https://vercel.com/new).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
