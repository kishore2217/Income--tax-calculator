"use client";

import { useState, useEffect } from "react";

interface TaxResult {
  standardDeduction: number;
  ifhpDeduction: number;
  taxableIfhp: number;
  netSalary: number;
  normalIncome: number;
  taxNormal: number;
  taxLtcg: number;
  totalIncome: number;
  taxBeforeSurcharge: number;
  surchargeRate: number;
  surchargeAmount: number;
  cessAmount: number;
  totalTax: number;
}

export default function TaxCalculator() {
  const [salary, setSalary] = useState<string>("");
  const [ifhp, setIfhp] = useState<string>("");
  const [pgbp, setPgbp] = useState<string>("");
  const [ifos, setIfos] = useState<string>("");
  const [ltcg, setLtcg] = useState<string>("");
  const [regime, setRegime] = useState<"old" | "new">("new");
  const [result, setResult] = useState<TaxResult | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!salary) newErrors.salary = "Salary is required";
    else if (Number(salary) < 0) newErrors.salary = "Salary cannot be negative";

    if (Number(ifhp) < 0) newErrors.ifhp = "Value cannot be negative";
    if (Number(pgbp) < 0) newErrors.pgbp = "Value cannot be negative";
    if (Number(ifos) < 0) newErrors.ifos = "Value cannot be negative";
    if (Number(ltcg) < 0) newErrors.ltcg = "Value cannot be negative";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTax = () => {
    if (!validate()) return;

    const valSalary = Number(salary) || 0;
    const rawIfhp = Number(ifhp) || 0;
    const valPgbp = Number(pgbp) || 0;
    const valIfos = Number(ifos) || 0;
    const valLtcg = Number(ltcg) || 0;

    // Standard Deduction
    // New Regime (FY 24-25): 75,000
    // Old Regime: 50,000
    const standardDeduction = regime === "new" ? 75000 : 50000;

    // 1. Net Salary
    const netSalary = Math.max(valSalary - standardDeduction, 0);

    // 1b. Net House Property Income (30% Standard Deduction)
    const ifhpHasDeduction = rawIfhp > 0;
    const ifhpDeduction = ifhpHasDeduction ? rawIfhp * 0.3 : 0;
    const taxableIfhp = rawIfhp - ifhpDeduction;

    // 2. Normal Income
    const normalIncome = netSalary + taxableIfhp + valPgbp + valIfos;

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
      ifhpDeduction,
      taxableIfhp,
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

  const resetFields = () => {
    setSalary("");
    setIfhp("");
    setPgbp("");
    setIfos("");
    setLtcg("");
    setErrors({});
    setResult(null);
  };

  const formatCurrency = (amount: number | string) => {
    if (typeof amount === "string") return amount;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg transition-colors duration-200" id="calculator">
      <div className="flex justify-between items-center mb-6 pl-1 pr-1 md:px-0 relative">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 flex-1 text-center leading-tight">
          Income Tax Calculator
        </h2>
        <div className="flex shrink-0 items-center justify-end absolute right-0 top-1/2 -translate-y-1/2 md:relative md:top-auto md:translate-y-0 md:transform-none">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`relative h-6 w-11 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm ${darkMode ? "bg-blue-600 ring-1 ring-blue-400" : "bg-gray-300 ring-1 ring-gray-200"
              }`}
            aria-label="Toggle Dark Mode"
          >
            <span
              className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 flex items-center justify-center text-[10px] ${darkMode ? "translate-x-5" : "translate-x-0"
                }`}
            >
              {darkMode ? "🌙" : "☀️"}
            </span>
          </button>
        </div>
      </div>

      {/* Regime Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg inline-flex w-full md:w-auto">
          <button
            onClick={() => setRegime("new")}
            className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-md text-sm font-semibold transition-all ${regime === "new"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              }`}
          >
            New Regime
          </button>
          <button
            onClick={() => setRegime("old")}
            className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-md text-sm font-semibold transition-all ${regime === "old"
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
            error={errors.salary}
            required
          />
          <InputGroup
            label="Income from House Property (Net Annual Value)"
            value={ifhp}
            onChange={setIfhp}
            error={errors.ifhp}
          />
          <InputGroup
            label="PGBP (Business Income)"
            value={pgbp}
            onChange={setPgbp}
            error={errors.pgbp}
          />
          <InputGroup
            label="Income from Other Sources"
            value={ifos}
            onChange={setIfos}
            error={errors.ifos}
          />
          <InputGroup
            label="Long-Term Capital Gains (LTCG)"
            value={ltcg}
            onChange={setLtcg}
            error={errors.ltcg}
          />

          <div className="flex gap-4 mt-6">
            <button
              onClick={resetFields}
              className="flex-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 font-semibold py-3 px-4 rounded-lg transition duration-200 cursor-pointer text-sm md:text-base"
            >
              Reset
            </button>
            <button
              onClick={calculateTax}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 cursor-pointer text-sm md:text-base"
            >
              Calculate Tax
            </button>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 md:p-6 rounded-lg border border-gray-200 dark:border-gray-600">
          <h3 className="text-lg md:text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200 border-b dark:border-gray-600 pb-2 flex justify-between items-center">
            <span>Tax Breakdown</span>
            <span className="text-xs md:text-sm font-normal text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded">
              {regime === "new" ? "New Regime" : "Old Regime"}
            </span>
          </h3>
          {result ? (
            <div className="space-y-3 text-sm md:text-base">
              <SummaryRow
                label="Standard Deduction"
                value={result.netSalary > 0 ? result.standardDeduction : "₹" + 0}
                formatter={result.netSalary > 0 ? formatCurrency : (v: string | number) => v}
                highlight
              />
              <SummaryRow
                label="Taxable Salary (Net)"
                value={result.netSalary}
                formatter={formatCurrency}
              />
              {result.ifhpDeduction > 0 && (
                <SummaryRow
                  label="House Property Standard Deduction (30%)"
                  value={result.ifhpDeduction > 0 ? result.ifhpDeduction : "₹" + 0}
                  formatter={result.ifhpDeduction > 0 ? formatCurrency : (v: string | number) => v}
                  highlight
                />
              )}
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
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-2">
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100 shrink-0">
                    Net Tax Payable
                  </span>
                  <span className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 text-center md:text-right break-all leading-tight">
                    {formatCurrency(result.totalTax)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400 text-center py-10">
              Click &quot;Calculate Tax&quot; to see the breakdown.
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

interface InputGroupProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

const InputGroup = ({ label, value, onChange, error, required }: InputGroupProps) => (
  <div className="flex flex-col">
    <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400">₹</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pl-8 pr-4 py-2 border rounded-md outline-none transition text-black dark:text-white dark:bg-gray-700 ${error
          ? "border-red-500 focus:ring-2 focus:ring-red-500"
          : "border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          }`}
        placeholder="0"
      />
    </div>
    {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
  </div>
);

interface SummaryRowProps {
  label: string;
  value: number | string;
  formatter: (value: number | string) => string | number;
  bold?: boolean;
  isTotal?: boolean;
  highlight?: boolean;
}

const SummaryRow = ({
  label,
  value,
  formatter,
  bold = false,
  isTotal = false,
  highlight = false,
}: SummaryRowProps) => (
  <div
    className={`flex justify-between items-start gap-2 ${bold ? "font-semibold text-gray-800 dark:text-gray-100" : "text-gray-600 dark:text-gray-300"
      } ${isTotal ? "text-lg py-1" : ""} ${highlight ? "text-orange-600 dark:text-orange-400" : ""}`}
  >
    <span className="flex-1 break-words">{label}</span>
    <span className="text-right text-sm md:text-base break-words max-w-[60%] leading-tight">{formatter(value)}</span>
  </div>
);
