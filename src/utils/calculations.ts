import type { PropertyInput, CalculationResult } from '../types';
import { DEFAULT_INPUT } from '../types';

/**
 * 不動産利回り計算ロジック
 * 計算処理とUIを分離
 */

// 入力値のバリデーション
export function validateInput(input: PropertyInput): string[] {
  const errors: string[] = [];
  
  if (input.propertyPrice < 0) {
    errors.push('物件価格は0以上の値を入力してください');
  }
  
  if (input.vacancyRate < 0 || input.vacancyRate > 100) {
    errors.push('空室率は0〜100の範囲で入力してください');
  }
  
  if (input.purchaseCost < 0) {
    errors.push('購入時諸費用は0以上の値を入力してください');
  }
  
  if (input.expenseMode === 'simple') {
    if (input.simpleExpense < 0) {
      errors.push('年間経費は0以上の値を入力してください');
    }
  } else {
    const detailExpenses = [
      input.managementFee,
      input.propertyTax,
      input.repairCost,
      input.reserveFund,
      input.insurance,
      input.commonAreaCost,
      input.turnoverCost,
      input.otherExpense,
    ];
    if (detailExpenses.some(e => e < 0)) {
      errors.push('経費項目は全て0以上の値を入力してください');
    }
  }
  
  return errors;
}

// 計算実行
export function calculate(input: PropertyInput): CalculationResult {
  // 初期結果
  const result: CalculationResult = {
    grossRent: 0,
    effectiveRent: 0,
    vacancyLoss: 0,
    annualExpense: 0,
    noi: 0,
    monthlyNoi: 0,
    grossYield: 0,
    effectiveYield: 0,
    netYield: 0,
    totalInvestmentYield: 0,
    expenseRatio: 0,
    totalInvestment: 0,
    isValid: false,
    errors: [],
  };
  
  // バリデーション
  const errors = validateInput(input);
  if (errors.length > 0) {
    result.errors = errors;
    return result;
  }
  
  // 年間家賃の計算（月額家賃または年間家賃を使用）
  const annualRent = input.annualRent > 0 ? input.annualRent : input.monthlyRent * 12;
  result.grossRent = annualRent;
  
  // 実効年間家賃収入 = 年間満室家賃 × (1 - 空室率 / 100)
  result.effectiveRent = annualRent * (1 - input.vacancyRate / 100);
  
  // 空室損
  result.vacancyLoss = annualRent - result.effectiveRent;
  
  // 年間運営経費
  if (input.expenseMode === 'simple') {
    result.annualExpense = input.simpleExpense;
  } else {
    result.annualExpense = 
      input.managementFee +
      input.propertyTax +
      input.repairCost +
      input.reserveFund +
      input.insurance +
      input.commonAreaCost +
      input.turnoverCost +
      input.otherExpense;
  }
  
  // NOI相当額
  result.noi = result.effectiveRent - result.annualExpense;
  
  // 月平均NOI
  result.monthlyNoi = result.noi / 12;
  
  // 総投資額
  result.totalInvestment = input.propertyPrice + (input.includePurchaseCost ? input.purchaseCost : 0);
  
  // 利回り計算（0除算防止）
  // 表面利回り = 年間満室家賃 ÷ 物件価格 × 100
  if (input.propertyPrice > 0) {
    result.grossYield = (result.grossRent / input.propertyPrice) * 100;
  }
  
  // 空室考慮後利回り = 実効年間家賃 ÷ 物件価格 × 100
  if (input.propertyPrice > 0) {
    result.effectiveYield = (result.effectiveRent / input.propertyPrice) * 100;
  }
  
  // 実質利回り = NOI ÷ 物件価格 × 100
  if (input.propertyPrice > 0) {
    result.netYield = (result.noi / input.propertyPrice) * 100;
  }
  
  // 総投資額ベース実質利回り
  if (result.totalInvestment > 0) {
    result.totalInvestmentYield = (result.noi / result.totalInvestment) * 100;
  }
  
  // 経費率 = 年間運営経費 ÷ 実効年間家賃 × 100
  if (result.effectiveRent > 0) {
    result.expenseRatio = (result.annualExpense / result.effectiveRent) * 100;
  }
  
  result.isValid = true;
  return result;
}

// 数値フォーマット
export function formatCurrency(value: number): string {
  if (!isFinite(value)) return '0';
  return Math.round(value).toLocaleString('ja-JP');
}

export function formatYield(value: number): string {
  if (!isFinite(value)) return '0.00';
  return value.toFixed(2);
}

// テストケースの検証
export function runTests(): { name: string; passed: boolean; expected: string; actual: string }[] {
  const tests: { name: string; input: PropertyInput; expected: Partial<Record<keyof CalculationResult, number>> }[] = [
    {
      name: 'ケースA: 基本表面利回り',
      input: {
        ...DEFAULT_INPUT,
        propertyPrice: 3000,
        annualRent: 300,
      },
      expected: { grossYield: 10.0 },
    },
    {
      name: 'ケースB: 実質利回り（空室率0%）',
      input: {
        ...DEFAULT_INPUT,
        propertyPrice: 3000,
        annualRent: 300,
        vacancyRate: 0,
        simpleExpense: 60,
      },
      expected: { 
        netYield: 8.0,
        noi: 240,
      },
    },
    {
      name: 'ケースC: 空室考慮の実効家賃とNOI',
      input: {
        ...DEFAULT_INPUT,
        propertyPrice: 3000,
        annualRent: 300,
        vacancyRate: 10,
        simpleExpense: 60,
      },
      expected: { 
        effectiveRent: 270,
        noi: 210,
        netYield: 7.0,
      },
    },
    {
      name: 'ケースD: 月額家賃からの計算',
      input: {
        ...DEFAULT_INPUT,
        propertyPrice: 3000,
        monthlyRent: 25,
        annualRent: 0,
        vacancyRate: 0,
        simpleExpense: 60,
      },
      expected: { 
        grossYield: 10.0,
        netYield: 8.0,
      },
    },
    {
      name: 'ケースE: 購入時諸費用含む（空室率0%）',
      input: {
        ...DEFAULT_INPUT,
        propertyPrice: 3000,
        annualRent: 300,
        vacancyRate: 0,
        includePurchaseCost: true,
        purchaseCost: 200,
        simpleExpense: 60,
      },
      expected: { 
        totalInvestment: 3200,
        totalInvestmentYield: 7.5,
        noi: 240,
      },
    },
    {
      name: 'ケースF: 詳細経費入力（空室率5%）',
      input: {
        ...DEFAULT_INPUT,
        propertyPrice: 3000,
        annualRent: 300,
        vacancyRate: 5,
        expenseMode: 'detail',
        managementFee: 20,
        propertyTax: 15,
        repairCost: 10,
        reserveFund: 10,
        insurance: 3,
        commonAreaCost: 2,
        turnoverCost: 0,
        otherExpense: 0,
      },
      expected: { 
        annualExpense: 60,
        effectiveRent: 285,
        noi: 225,
        netYield: 7.5,
      },
    },
  ];
  
  return tests.map(test => {
    const result = calculate(test.input);
    const actualValues: Record<string, string> = {};
    let allPassed = true;
    
    for (const [key, expectedValue] of Object.entries(test.expected)) {
      const k = key as keyof CalculationResult;
      const actual = result[k] as number;
      const tolerance = 0.01;
      const passed = Math.abs(actual - expectedValue) < tolerance;
      if (!passed) allPassed = false;
      actualValues[k] = `${actual.toFixed(2)} (expected: ${expectedValue.toFixed(2)})`;
    }
    
    return {
      name: test.name,
      passed: allPassed,
      expected: JSON.stringify(test.expected),
      actual: JSON.stringify(actualValues),
    };
  });
}
