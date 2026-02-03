"use client";

import { useState, useEffect } from "react";

export default function TaxCalculator() {
  const [salary, setSalary] = useState<string>("");
  const [ifhp, setIfhp] = useState<string>("");
  const [pgbp, setPgbp] = useState<string>("");
  const [ifos, setIfos] = useState<string>("");
  const [ltcg, setLtcg] = useState<string>("");
  const [regime, setRegime] = useState<"old" | "new">("new");
  const [result, setResult] = useState<any>(null);

  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode, mounted]);

  const calculateTax = () => {
    const valSalary = Number(salary) || 0;
    const valIfhp = Number(ifhp) || 0;
    const valPgbp = Number(pgbp) || 0;
    const valIfos = Number(ifos) || 0;
    const valLtcg = Number(ltcg) || 0;

    // Standard Deduction
    // New Regime (FY 24-25): 75,000
    // Old Regime: 50,000
    const standardDeduction = regime === "new" ? 75000 : 50000;

    // 1. Net Salary
    const netSalary = Math.max(valSalary - standardDeduction, 0);

    // 2. Normal Income
    const normalIncome = netSalary + valIfhp + valPgbp + valIfos;

    // 3. Tax on Normal Income
    let taxNormal = 0;
    const totalIncome = normalIncome + valLtcg;

    if (regime === "new") {
      // New Regime Slabs (FY 2024-25)
      // Up to 3,00,000: Nil
      // 3,00,001 - 7,00,000: 5%
      // 7,00,001 - 10,00,000: 10%
      // 10,00,001 - 12,00,000: 15%
      // 12,00,001 - 15,00,000: 20%
      // Above 15,00,000: 30%
      let remaining = normalIncome;

      if (remaining > 1500000) {
        taxNormal += (remaining - 1500000) * 0.3;
        remaining = 1500000;
      }
      if (remaining > 1200000) {
        taxNormal += (remaining - 1200000) * 0.2;
        remaining = 1200000;
      }
      if (remaining > 1000000) {
        taxNormal += (remaining - 1000000) * 0.15;
        remaining = 1000000;
      }
      if (remaining > 700000) {
        taxNormal += (remaining - 700000) * 0.1;
        remaining = 700000;
      }
      if (remaining > 300000) {
        taxNormal += (remaining - 300000) * 0.05;
      }

      // Rebate u/s 87A (New Regime): Tax free if Taxable Income <= 7 Lakhs
      // (Technically rebate up to 25,000)
      if (normalIncome <= 700000) {
        taxNormal = 0;
      }

    } else {
      // Old Regime Slabs
      // Up to 2.5L: Nil
      // 2.5L - 5L: 5%
      // 5L - 10L: 20%
      // > 10L: 30%
      let remaining = normalIncome;

      if (remaining > 1000000) {
        taxNormal += (remaining - 1000000) * 0.3;
        remaining = 1000000;
      }
      if (remaining > 500000) {
        taxNormal += (remaining - 500000) * 0.2;
        remaining = 500000;
      }
      if (remaining > 250000) {
        taxNormal += (remaining - 250000) * 0.05;
      }

      // Rebate u/s 87A (Old Regime): Tax free if Taxable Income <= 5 Lakhs
      // (Rebate up to 12,500)
      if (normalIncome <= 500000) {
        taxNormal = 0;
      }
    }

    // 4. Tax on LTCG (20% flat assumed for simplicity)
    const taxLtcg = valLtcg * 0.2;

    // 5. Total Tax Before Surcharge
    const taxBeforeSurcharge = taxNormal + taxLtcg;

    // 6. Surcharge
    let surchargeRate = 0;
    if (totalIncome > 5000000) {
      if (totalIncome > 10000000) { // > 1 Cr
        if (totalIncome > 20000000 && regime === "new") {
          // New Regime Surcharge capped at 25% for > 2Cr
          surchargeRate = 0.25;
        } else {
          surchargeRate = 0.15; // > 1Cr - 2Cr (or >1Cr Old Regime for now, keeping simple)
        }
      } else {
        surchargeRate = 0.10; // 50L - 1Cr
      }
    }

    // Marginal Relief logic is complex, skipping for "Simple" calculator request unless asked.

    const surchargeAmount = taxBeforeSurcharge * surchargeRate;

    // 7. Cess (4%)
    const taxWithSurcharge = taxBeforeSurcharge + surchargeAmount;
    const cessAmount = taxWithSurcharge * 0.04;

    // 8. Final
    const totalTax = taxWithSurcharge + cessAmount;

    setResult({
      standardDeduction,
      netSalary,
      normalIncome,
      taxNormal,
      taxLtcg,
      totalIncome,
      taxBeforeSurcharge,
      surchargeRate,
      surchargeAmount,
      cessAmount,
      totalTax,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg transition-colors duration-200" id="calculator">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex-1 text-center pl-8">
          Income Tax Calculator
        </h2>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>

      {/* Regime Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setRegime("new")}
            className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${regime === "new"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              }`}
          >
            New Regime
          </button>
          <button
            onClick={() => setRegime("old")}
            className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${regime === "old"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              }`}
          >
            Old Regime
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <InputGroup
            label="Salary (Gross)"
            value={salary}
            onChange={setSalary}
          />
          <InputGroup
            label="Income from House Property (Net)"
            value={ifhp}
            onChange={setIfhp}
          />
          <InputGroup
            label="PGBP (Business Income)"
            value={pgbp}
            onChange={setPgbp}
          />
          <InputGroup
            label="Income from Other Sources"
            value={ifos}
            onChange={setIfos}
          />
          <InputGroup
            label="Long-Term Capital Gains (LTCG)"
            value={ltcg}
            onChange={setLtcg}
          />

          <button
            onClick={calculateTax}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 mt-4 cursor-pointer"
          >
            Calculate Tax
          </button>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
          <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200 border-b dark:border-gray-600 pb-2 flex justify-between items-center">
            <span>Tax Breakdown</span>
            <span className="text-sm font-normal text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded">
              {regime === "new" ? "New Regime" : "Old Regime"}
            </span>
          </h3>
          {result ? (
            <div className="space-y-3 text-sm md:text-base">
              <SummaryRow
                label="Standard Deduction"
                value={result.netSalary > 0 ? result.standardDeduction : "₹" + 0}
                formatter={result.netSalary > 0 ? formatCurrency : (v: any) => v}
                highlight
              />
              <SummaryRow
                label="Taxable Salary (Net)"
                value={result.netSalary}
                formatter={formatCurrency}
              />
              <SummaryRow
                label="Other Normal Income"
                value={result.normalIncome - result.netSalary}
                formatter={formatCurrency}
              />
              <SummaryRow
                label="Total Normal Income"
                value={result.normalIncome}
                formatter={formatCurrency}
                bold
              />
              <SummaryRow
                label="LTCG Income"
                value={Number(ltcg)}
                formatter={formatCurrency}
              />
              <SummaryRow
                label="Total Income"
                value={result.totalIncome}
                formatter={formatCurrency}
                isTotal
              />

              <hr className="border-gray-300 dark:border-gray-500 my-2" />

              <SummaryRow
                label="Tax on Normal Income"
                value={result.taxNormal}
                formatter={formatCurrency}
              />
              <SummaryRow
                label="Tax on LTCG (20%)"
                value={result.taxLtcg}
                formatter={formatCurrency}
              />
              <SummaryRow
                label="Total Tax Before Surcharge"
                value={result.taxBeforeSurcharge}
                formatter={formatCurrency}
                bold
              />
              {result.surchargeAmount > 0 && (
                <SummaryRow
                  label={`Surcharge (${(result.surchargeRate * 100).toFixed(0)}%)`}
                  value={result.surchargeAmount}
                  formatter={formatCurrency}
                  highlight
                />
              )}
              <SummaryRow
                label="Health & Education Cess (4%)"
                value={result.cessAmount}
                formatter={formatCurrency}
              />

              <div className="mt-4 pt-4 border-t-2 border-blue-500">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Net Tax Payable
                  </span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(result.totalTax)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400 text-center py-10">
              Click "Calculate Tax" to see the breakdown.
            </div>
          )}
        </div>
      </div>
      <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm font-medium">
        Developed by Kishorkumar P
      </div>
    </div>
  );
}

const InputGroup = ({ label, value, onChange }: any) => (
  <div className="flex flex-col">
    <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400">₹</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-black dark:text-white dark:bg-gray-700"
        placeholder="0"
      />
    </div>
  </div>
);

const SummaryRow = ({
  label,
  value,
  formatter,
  bold = false,
  isTotal = false,
  highlight = false,
}: any) => (
  <div
    className={`flex justify-between items-start gap-4 ${bold ? "font-semibold text-gray-800 dark:text-gray-100" : "text-gray-600 dark:text-gray-300"
      } ${isTotal ? "text-lg py-1" : ""} ${highlight ? "text-orange-600 dark:text-orange-400" : ""}`}
  >
    <span className="shrink-0">{label}</span>
    <span className="text-right text-sm md:text-base break-words max-w-[70%] leading-tight">{formatter(value)}</span>
  </div>
);
