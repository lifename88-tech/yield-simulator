import { calculate } from './calculations';
import { DEFAULT_INPUT } from '../types';

interface ExpectedValues {
  grossYield?: number;
  effectiveRent?: number;
  annualExpense?: number;
  noi?: number;
  netYield?: number;
  totalInvestment?: number;
  totalInvestmentYield?: number;
}

function runTest(name: string, inputProps: Record<string, unknown>, expected: ExpectedValues): boolean {
  const input = { ...DEFAULT_INPUT, ...inputProps };
  const result = calculate(input);
  
  let allPassed = true;
  const failed: string[] = [];
  
  for (const [key, expectedValue] of Object.entries(expected)) {
    const actual = result[key as keyof typeof result] as number;
    const tolerance = 0.01;
    const passed = Math.abs(actual - expectedValue) < tolerance;
    if (!passed) {
      allPassed = false;
      failed.push(`  ${key}: got ${actual.toFixed(2)}, expected ${expectedValue.toFixed(2)}`);
    }
  }
  
  if (allPassed) {
    console.log(`✅ PASS: ${name}`);
    return true;
  } else {
    console.log(`❌ FAIL: ${name}`);
    failed.forEach(f => console.log(f));
    return false;
  }
}

console.log('=== 利回り計算ロジック テスト ===\n');

let passed = 0;
let failed = 0;

// ケースA: 基本表面利回り
if (runTest('ケースA: 基本表面利回り', {
  propertyPrice: 3000,
  annualRent: 300,
}, { grossYield: 10.0 })) passed++; else failed++;

// ケースB: 実質利回り（空室率0%）
if (runTest('ケースB: 実質利回り（空室率0%）', {
  propertyPrice: 3000,
  annualRent: 300,
  vacancyRate: 0,
  simpleExpense: 60,
}, { netYield: 8.0, noi: 240 })) passed++; else failed++;

// ケースC: 空室考慮の実効家賃とNOI
if (runTest('ケースC: 空室考慮の実効家賃とNOI', {
  propertyPrice: 3000,
  annualRent: 300,
  vacancyRate: 10,
  simpleExpense: 60,
}, { effectiveRent: 270, noi: 210, netYield: 7.0 })) passed++; else failed++;

// ケースD: 月額家賃からの計算
if (runTest('ケースD: 月額家賃からの計算', {
  propertyPrice: 3000,
  monthlyRent: 25,
  annualRent: 0,
  vacancyRate: 0,
  simpleExpense: 60,
}, { grossYield: 10.0, netYield: 8.0 })) passed++; else failed++;

// ケースE: 購入時諸費用含む（空室率0%）
if (runTest('ケースE: 購入時諸費用含む（空室率0%）', {
  propertyPrice: 3000,
  annualRent: 300,
  vacancyRate: 0,
  includePurchaseCost: true,
  purchaseCost: 200,
  simpleExpense: 60,
}, { totalInvestment: 3200, totalInvestmentYield: 7.5, noi: 240 })) passed++; else failed++;

// ケースF: 詳細経費入力（空室率5%）
if (runTest('ケースF: 詳細経費入力（空室率5%）', {
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
}, { annualExpense: 60, effectiveRent: 285, noi: 225, netYield: 7.5 })) passed++; else failed++;

console.log(`\n=== 結果: ${passed}/${passed + failed} 合格 ===`);

if (failed > 0) {
  console.error(`\n${failed}件のテストが失敗しました`);
  throw new Error(`${failed} tests failed`);
} else {
  console.log('\nすべてのテストが成功しました！');
}
