
export const taxTestCases = [
  {
    description: "Scenario 1: Below Taxable Limit (New Regime)",
    input: {
      salary: 375000,
      ifhp: 0,
      pgbp: 0,
      ifos: 0,
      ltcg: 0,
      regime: "new" as const,
    },
    expected: {
      netSalary: 300000, // 3,75,000 - 75,000 (Std Ded)
      totalTax: 0,
    },
  },
  {
    description: "Scenario 2: Rebate 87A Limit (New Regime - 7L Net Taxable)",
    input: {
      salary: 775000,
      ifhp: 0,
      pgbp: 0,
      ifos: 0,
      ltcg: 0,
      regime: "new" as const,
    },
    expected: {
      netSalary: 700000, // 7,75,000 - 75,000
      totalTax: 0, // Rebate applies
    },
  },
  {
    description: "Scenario 3: Rebate 87A Limit (Old Regime - 5L Net Taxable)",
    input: {
      salary: 550000,
      ifhp: 0,
      pgbp: 0,
      ifos: 0,
      ltcg: 0,
      regime: "old" as const,
    },
    expected: {
      netSalary: 500000, // 5,50,000 - 50,000 (Std Ded)
      totalTax: 0, // Rebate applies
    },
  },
  {
    description: "Scenario 4: Middle Income (New Regime - 12L Gross)",
    input: {
      salary: 1200000,
      ifhp: 0,
      pgbp: 0,
      ifos: 0,
      ltcg: 0,
      regime: "new" as const,
    },
    // Calculation:
    // Net Salary: 11,25,000
    // Slabs:
    // 0-3L: 0
    // 3-7L: 20,000 (5% of 4L)
    // 7-10L: 30,000 (10% of 3L)
    // 10-11.25L: 18,750 (15% of 1.25L)
    // Total Tax: 68,750
    // Cess (4%): 2,750
    // Final: 71,500
    expected: {
      netSalary: 1125000,
      taxNormal: 68750,
      totalTax: 71500,
    },
  },
  {
    description: "Scenario 5: High Income with LTCG (New Regime)",
    input: {
      salary: 1575000, // Net 15L
      ifhp: 0,
      pgbp: 0,
      ifos: 0,
      ltcg: 100000,
      regime: "new" as const,
    },
    // Calculation:
    // Net Salary: 15,00,000
    // Normal Tax (on 15L):
    // 0-3: 0
    // 3-7: 20k
    // 7-10: 30k
    // 10-12: 30k
    // 12-15: 60k (20% of 3L)
    // Total Normal Tax: 1,40,000
    // LTCG Tax: 20,000 (20% of 1L)
    // Total Base Tax: 1,60,000
    // Cess: 6,400
    // Final: 1,66,400
    expected: {
      netSalary: 1500000,
      taxNormal: 140000,
      taxLtcg: 20000,
      totalTax: 166400,
    },
  },
  {
    description: "Scenario 6: Surcharge Case (New Regime - >50L Income)",
    input: {
      salary: 5075000, // Net 50L
      ifhp: 200000,
      pgbp: 0,
      ifos: 0,
      ltcg: 0,
      regime: "new" as const,
    },
    // Calculation:
    // Total Income: 52,00,000
    // Tax Slabs (on 52L):
    // ...Upto 15L: 1,40,000
    // 15L-52L: 11,10,000 (30% of 37L)
    // Total Normal Tax: 12,50,000
    // Surcharge (10%): 1,25,000
    // Tax + Surcharge: 13,75,000
    // Cess (4%): 55,000
    // Final: 14,30,000
    expected: {
      totalIncome: 5200000,
      surchargeAmount: 125000,
      totalTax: 1430000,
    },
  },
];
