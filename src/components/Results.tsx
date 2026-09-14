import React from 'react';
import type { CalculationResult } from '../types';
import { formatCurrency, formatYield } from '../utils/calculations';

interface ResultsProps {
  result: CalculationResult;
}

export const Results: React.FC<ResultsProps> = ({ result }) => {
  if (!result.isValid) {
    return (
      <div className="results-container">
        <div className="results-card">
          <div className="results-placeholder">
            <p>物件価格と家賃を入力してください</p>
          </div>
        </div>
      </div>
    );
  }
  
  // 可視化データ
  const totalRent = result.grossRent;
  const vacancyLossPct = totalRent > 0 ? (result.vacancyLoss / totalRent) * 100 : 0;
  const noiPct = totalRent > 0 ? (result.noi / totalRent) * 100 : 0;
  const expensePct = totalRent > 0 ? (result.annualExpense / totalRent) * 100 : 0;
  
  return (
    <div className="results-container">
      {/* 主要結果カード */}
      <div className="results-card main-card">
        <h2 className="results-title">この物件の収益性</h2>
        
        <div className="key-metrics">
          <div className="metric primary">
            <span className="metric-label">満室想定の利回り</span>
            <span className="metric-value">{formatYield(result.grossYield)}<span className="unit">%</span></span>
            <span className="metric-desc">年間家賃収入をもとにした目安</span>
          </div>

          <div className="metric primary highlight">
            <span className="metric-label">実質利回り</span>
            <span className="metric-value">{formatYield(result.netYield)}<span className="unit">%</span></span>
            <span className="metric-desc">空室・経費を反映</span>
          </div>
        </div>
        
        {result.totalInvestment > 0 && result.totalInvestmentYield > 0 && (
          <div className="metric secondary">
            <span className="metric-label">総投資額ベース実質利回り</span>
            <span className="metric-value">{formatYield(result.totalInvestmentYield)}<span className="unit">%</span></span>
          </div>
        )}
      </div>
      
      {/* 収益構造可視化 */}
      <div className="results-card chart-card">
        <h3 className="card-title">収益構造</h3>
        <p className="card-desc">年間家賃収入の配分</p>
        
        <div className="rent-bar">
          {/* NOI */}
          <div 
            className="bar-segment noi" 
            style={{ width: `${noiPct}%` }}
            title={`NOI: ${formatCurrency(result.noi)}万円`}
          >
            {noiPct > 10 && <span className="bar-label">{formatYield(noiPct)}%</span>}
          </div>
          {/* 経費 */}
          <div 
            className="bar-segment expense" 
            style={{ width: `${expensePct}%` }}
            title={`経費: ${formatCurrency(result.annualExpense)}万円`}
          >
            {expensePct > 10 && noiPct <= 10 && <span className="bar-label">{formatYield(expensePct)}%</span>}
          </div>
          {/* 空室損 */}
          <div 
            className="bar-segment vacancy" 
            style={{ width: `${vacancyLossPct}%` }}
            title={`空室損: ${formatCurrency(result.vacancyLoss)}万円`}
          >
            {vacancyLossPct > 10 && expensePct <= 10 && noiPct <= 10 && <span className="bar-label">{formatYield(vacancyLossPct)}%</span>}
          </div>
        </div>
        
        <div className="bar-legend">
          <div className="legend-item">
            <span className="legend-color noi"></span>
            <span>NOI相当額</span>
          </div>
          <div className="legend-item">
            <span className="legend-color expense"></span>
            <span>運営経費</span>
          </div>
          <div className="legend-item">
            <span className="legend-color vacancy"></span>
            <span>空室損</span>
          </div>
        </div>
      </div>
      
      {/* 利回り比較 */}
      <div className="results-card comparison-card">
        <h3 className="card-title">利回り比較</h3>
        <p className="card-desc">表面利回りから実質利回りまでの変化</p>
        
        <div className="comparison-chart">
          <div className="comparison-item">
            <span className="comparison-label">表面利回り</span>
            <div className="comparison-bar-bg">
              <div className="comparison-bar gross" style={{ width: `${Math.min(100, result.grossYield * 5)}%` }}></div>
            </div>
            <span className="comparison-value">{formatYield(result.grossYield)}%</span>
          </div>
          
          <div className="comparison-item">
            <span className="comparison-label">空室考慮後</span>
            <div className="comparison-bar-bg">
              <div className="comparison-bar effective" style={{ width: `${Math.min(100, result.effectiveYield * 5)}%` }}></div>
            </div>
            <span className="comparison-value">{formatYield(result.effectiveYield)}%</span>
          </div>
          
          <div className="comparison-item">
            <span className="comparison-label">実質利回り</span>
            <div className="comparison-bar-bg">
              <div className="comparison-bar net" style={{ width: `${Math.min(100, result.netYield * 5)}%` }}></div>
            </div>
            <span className="comparison-value">{formatYield(result.netYield)}%</span>
          </div>
        </div>
      </div>
      
      {/* 詳細データ */}
      <div className="results-card detail-card">
        <h3 className="card-title">詳細データ</h3>
        
        <dl className="detail-list">
          <div className="detail-row">
            <dt>年間満室家賃収入</dt>
            <dd>{formatCurrency(result.grossRent)}<span className="unit">万円</span></dd>
          </div>
          <div className="detail-row">
            <dt>実効年間家賃収入</dt>
            <dd>{formatCurrency(result.effectiveRent)}<span className="unit">万円</span></dd>
          </div>
          <div className="detail-row">
            <dt>年間運営経費</dt>
            <dd>{formatCurrency(result.annualExpense)}<span className="unit">万円</span></dd>
          </div>
          <div className="detail-row highlight">
            <dt>NOI相当額</dt>
            <dd>{formatCurrency(result.noi)}<span className="unit">万円</span></dd>
          </div>
          <div className="detail-row">
            <dt>月平均NOI相当額</dt>
            <dd>{formatCurrency(result.monthlyNoi)}<span className="unit">万円</span></dd>
          </div>
          <div className="detail-row">
            <dt>経費率</dt>
            <dd>{formatYield(result.expenseRatio)}<span className="unit">%</span></dd>
          </div>
          {result.totalInvestment > 0 && (
            <div className="detail-row">
              <dt>総投資額</dt>
              <dd>{formatCurrency(result.totalInvestment)}<span className="unit">万円</span></dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
};

export default Results;
