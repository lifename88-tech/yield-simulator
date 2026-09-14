import React from 'react';
import type { PropertyInput } from '../types';

interface InputFormProps {
  input: PropertyInput;
  onChange: (input: PropertyInput) => void;
  onSample: () => void;
  onReset: () => void;
}

export const InputForm: React.FC<InputFormProps> = ({ input, onChange, onSample, onReset }) => {
  const handleChange = (field: keyof PropertyInput, value: number | string | boolean) => {
    const newInput = { ...input, [field]: value };
    
    // 月額家賃と年間家賃の連動
    if (field === 'monthlyRent') {
      newInput.annualRent = (value as number) * 12;
    } else if (field === 'annualRent') {
      newInput.monthlyRent = (value as number) / 12;
    }
    
    onChange(newInput);
  };
  
  const updateExpenseField = (field: keyof PropertyInput, value: number) => {
    onChange({ ...input, [field]: value });
  };
  
  return (
    <div className="input-form">
      {/* 物件情報 */}
      <section className="input-section">
        <h2 className="section-title">
          <span className="section-icon">🏠</span>
          物件情報
        </h2>
        
        <div className="input-group">
          <label htmlFor="propertyPrice">
            物件価格
            <span className="required">必須</span>
          </label>
          <div className="input-with-unit">
            <input
              type="number"
              id="propertyPrice"
              value={input.propertyPrice || ''}
              onChange={(e) => handleChange('propertyPrice', parseFloat(e.target.value) || 0)}
              placeholder="3,000"
              min="0"
              step="1"
            />
            <span className="unit">万円</span>
          </div>
        </div>
        
        <div className="input-row">
          <div className="input-group">
            <label htmlFor="monthlyRent">月額家賃</label>
            <div className="input-with-unit">
              <input
                type="number"
                id="monthlyRent"
                value={input.monthlyRent || ''}
                onChange={(e) => handleChange('monthlyRent', parseFloat(e.target.value) || 0)}
                placeholder="25"
                min="0"
                step="0.1"
              />
              <span className="unit">万円</span>
            </div>
          </div>
          
          <div className="input-group">
            <label htmlFor="annualRent">年間家賃</label>
            <div className="input-with-unit">
              <input
                type="number"
                id="annualRent"
                value={input.annualRent || ''}
                onChange={(e) => handleChange('annualRent', parseFloat(e.target.value) || 0)}
                placeholder="300"
                min="0"
                step="1"
              />
              <span className="unit">万円</span>
            </div>
          </div>
        </div>
        <p className="input-hint">※ 片方を入力すると、もう片方は自動計算されます</p>
      </section>
      
      {/* 空室率 */}
      <section className="input-section">
        <h2 className="section-title">
          <span className="section-icon">📊</span>
          空室率
        </h2>
        
        <div className="input-group">
          <label htmlFor="vacancyRate">
            空室率
            <span className="hint">年間家賃のうち、空室によって得られない割合</span>
          </label>
          <div className="input-with-unit slider-unit">
            <input
              type="range"
              id="vacancyRate"
              value={input.vacancyRate}
              onChange={(e) => handleChange('vacancyRate', parseFloat(e.target.value))}
              min="0"
              max="100"
              step="1"
              className="slider"
            />
            <div className="slider-value">
              <input
                type="number"
                value={input.vacancyRate}
                onChange={(e) => handleChange('vacancyRate', Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                min="0"
                max="100"
                step="1"
                className="number-input"
              />
              <span className="unit">%</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* 年間運営経費 */}
      <section className="input-section">
        <h2 className="section-title">
          <span className="section-icon">💰</span>
          年間運営経費
          <span className="hint-inline">固定資産税・管理費・修繕費など、年間の物件運営コスト</span>
        </h2>
        
        <div className="expense-mode-toggle">
          <button
            type="button"
            className={`mode-btn ${input.expenseMode === 'simple' ? 'active' : ''}`}
            onClick={() => onChange({ ...input, expenseMode: 'simple' })}
          >
            簡単入力
          </button>
          <button
            type="button"
            className={`mode-btn ${input.expenseMode === 'detail' ? 'active' : ''}`}
            onClick={() => onChange({ ...input, expenseMode: 'detail' })}
          >
            詳細入力
          </button>
        </div>
        
        {input.expenseMode === 'simple' ? (
          <div className="input-group">
            <label htmlFor="simpleExpense">年間経費合計</label>
            <div className="input-with-unit">
              <input
                type="number"
                id="simpleExpense"
                value={input.simpleExpense || ''}
                onChange={(e) => onChange({ ...input, simpleExpense: parseFloat(e.target.value) || 0 })}
                placeholder="60"
                min="0"
                step="1"
              />
              <span className="unit">万円</span>
            </div>
          </div>
        ) : (
          <div className="detail-expenses">
            {[
              { key: 'managementFee', label: '管理委託費' },
              { key: 'propertyTax', label: '固定資産税・都市計画税' },
              { key: 'repairCost', label: '修繕費' },
              { key: 'reserveFund', label: '修繕積立' },
              { key: 'insurance', label: '火災・地震保険' },
              { key: 'commonAreaCost', label: '共用部費用' },
              { key: 'turnoverCost', label: '原状回復・入退去関連費' },
              { key: 'otherExpense', label: 'その他経費' },
            ].map((item) => (
              <div key={item.key} className="input-group detail-input">
                <label htmlFor={item.key}>{item.label}</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    id={item.key}
                    value={(input[item.key as keyof PropertyInput] as number) || ''}
                    onChange={(e) => updateExpenseField(item.key as keyof PropertyInput, parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    step="1"
                  />
                  <span className="unit">万円</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* 購入時諸費用 */}
      <section className="input-section">
        <h2 className="section-title">
          <span className="section-icon">📝</span>
          購入時諸費用
        </h2>
        
        <div className="toggle-group">
          <label className="toggle">
            <input
              type="checkbox"
              checked={input.includePurchaseCost}
              onChange={(e) => onChange({ ...input, includePurchaseCost: e.target.checked })}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-label">購入時諸費用を考慮する</span>
          </label>
        </div>
        
        {input.includePurchaseCost && (
          <div className="input-group">
            <label htmlFor="purchaseCost">諸費用合計</label>
            <div className="input-with-unit">
              <input
                type="number"
                id="purchaseCost"
                value={input.purchaseCost || ''}
                onChange={(e) => onChange({ ...input, purchaseCost: parseFloat(e.target.value) || 0 })}
                placeholder="200"
                min="0"
                step="1"
              />
              <span className="unit">万円</span>
            </div>
          </div>
        )}
      </section>
      
      {/* アクションボタン */}
      <div className="action-buttons">
        <button type="button" className="btn btn-sample" onClick={onSample}>
          サンプルを入力
        </button>
        <button type="button" className="btn btn-reset" onClick={onReset}>
          入力をリセット
        </button>
      </div>
    </div>
  );
};

export default InputForm;
