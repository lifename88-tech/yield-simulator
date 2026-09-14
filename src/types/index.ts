// Input form data
export interface PropertyInput {
  propertyPrice: number;        // 物件価格 (万円)
  monthlyRent: number;         // 月額家賃 (万円)
  annualRent: number;          // 年間家賃 (万円)
  vacancyRate: number;         // 空室率 (%)
  expenseMode: 'simple' | 'detail';  // 簡単入力 / 詳細入力
  simpleExpense: number;       // 簡単入力: 年間経費合計 (万円)
  // 詳細入力項目
  managementFee: number;       // 管理委託費
  propertyTax: number;         // 固定資産税・都市計画税
  repairCost: number;          // 修繕費
  reserveFund: number;         // 修繕積立
  insurance: number;           // 火災・地震保険
  commonAreaCost: number;     // 共用部費用
  turnoverCost: number;        // 原状回復・入退去関連費
  otherExpense: number;        // その他経費
  includePurchaseCost: boolean;  // 購入時諸費用を考慮する
  purchaseCost: number;       // 購入時諸費用 (万円)
}

// Calculation results
export interface CalculationResult {
  // 基本指標
  grossRent: number;                    // 年間満室家賃収入
  effectiveRent: number;                 // 実効年間家賃収入
  vacancyLoss: number;                   // 空室損
  annualExpense: number;                 // 年間運営経費
  noi: number;                          // NOI相当額
  monthlyNoi: number;                   // 月平均NOI相当額
  
  // 利回り
  grossYield: number;                   // 表面利回り
  effectiveYield: number;                // 空室考慮後利回り
  netYield: number;                     // 実質利回り
  totalInvestmentYield: number;          // 総投資額ベース実質利回り
  
  // 比率
  expenseRatio: number;                  // 経費率
  totalInvestment: number;              // 総投資額
  
  // 状態
  isValid: boolean;                     // 計算可能か
  errors: string[];                      // エラーメッセージ
}

// 初期値
export const DEFAULT_INPUT: PropertyInput = {
  propertyPrice: 0,
  monthlyRent: 0,
  annualRent: 0,
  vacancyRate: 5,
  expenseMode: 'simple',
  simpleExpense: 0,
  managementFee: 0,
  propertyTax: 0,
  repairCost: 0,
  reserveFund: 0,
  insurance: 0,
  commonAreaCost: 0,
  turnoverCost: 0,
  otherExpense: 0,
  includePurchaseCost: false,
  purchaseCost: 0,
};

// サンプルデータ
export const SAMPLE_INPUT: PropertyInput = {
  propertyPrice: 3000,
  monthlyRent: 25,
  annualRent: 300,
  vacancyRate: 5,
  expenseMode: 'simple',
  simpleExpense: 60,
  managementFee: 0,
  propertyTax: 0,
  repairCost: 0,
  reserveFund: 0,
  insurance: 0,
  commonAreaCost: 0,
  turnoverCost: 0,
  otherExpense: 0,
  includePurchaseCost: true,
  purchaseCost: 200,
};
