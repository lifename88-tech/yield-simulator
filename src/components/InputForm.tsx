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
    <div>
      <h2 className="panel-title">入力</h2>
      <p className="panel-lead">物件価格と家賃を入れると、右に結果が出ます。</p>

      {/* 物件情報 */}
      <section className="input-section">
        <h3 className="section-title">物件情報</h3>

        <div className="field-grid">
          <div className="field">
            <label className="field__label" htmlFor="propertyPrice">
              物件価格<span className="required">必須</span>
            </label>
            <div className="field__input-wrap">
              <input
                id="propertyPrice"
                className="field__input"
                type="number"
                inputMode="numeric"
                value={input.propertyPrice || ''}
                onChange={(e) => handleChange('propertyPrice', parseFloat(e.target.value) || 0)}
                placeholder="3,000"
                min="0"
                step="1"
              />
              <span className="field__unit">万円</span>
            </div>
            <p className="field__help">売買価格（諸費用は含まない）</p>
          </div>

          <div className="money-fields">
            <div className="field">
              <label className="field__label" htmlFor="monthlyRent">月額家賃</label>
              <div className="field__input-wrap">
                <input
                  id="monthlyRent"
                  className="field__input"
                  type="number"
                  inputMode="numeric"
                  value={input.monthlyRent || ''}
                  onChange={(e) => handleChange('monthlyRent', parseFloat(e.target.value) || 0)}
                  placeholder="25"
                  min="0"
                  step="0.1"
                />
                <span className="field__unit">万円</span>
              </div>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="annualRent">年間家賃</label>
              <div className="field__input-wrap">
                <input
                  id="annualRent"
                  className="field__input"
                  type="number"
                  inputMode="numeric"
                  value={input.annualRent || ''}
                  onChange={(e) => handleChange('annualRent', parseFloat(e.target.value) || 0)}
                  placeholder="300"
                  min="0"
                  step="1"
                />
                <span className="field__unit">万円</span>
              </div>
            </div>
          </div>
          <p className="hint-inline">※ 片方を入力すると、もう片方は自動計算されます</p>
        </div>
      </section>

      {/* 空室率 */}
      <section className="input-section">
        <h3 className="section-title">空室率</h3>

        <div className="field">
          <label className="field__label" htmlFor="vacancyRate">
            空室率
          </label>
          <div className="vacancy-control">
            <input
              type="range"
              id="vacancyRate"
              value={input.vacancyRate}
              onChange={(e) => handleChange('vacancyRate', parseFloat(e.target.value))}
              min="0"
              max="100"
              step="1"
              className="vacancy-slider"
              aria-valuetext={`${input.vacancyRate}%`}
              style={{ '--vacancy-progress': input.vacancyRate } as React.CSSProperties}
            />
            <div className="vacancy-scale" aria-hidden="true">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
            <div className="vacancy-readout">
              <output htmlFor="vacancyRate">{input.vacancyRate}%</output>
              <input
                type="number"
                aria-label="空室率を数値で入力"
                value={input.vacancyRate}
                onChange={(e) => handleChange('vacancyRate', Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                min="0"
                max="100"
                step="1"
                className="vacancy-number-input"
              />
              <span className="unit">%</span>
            </div>
          </div>
          <p className="field__help">年間家賃のうち、空室によって得られない割合</p>
        </div>
      </section>

      {/* 年間運営経費 */}
      <section className="input-section">
        <h3 className="section-title">
          年間運営経費
          <span className="hint-inline">固定資産税・管理費・修繕費など、年間の物件運営コスト</span>
        </h3>

        <div className="field__toggle" role="group" aria-label="経費の入力方法">
          <button
            type="button"
            aria-pressed={input.expenseMode === 'simple'}
            onClick={() => onChange({ ...input, expenseMode: 'simple' })}
          >
            簡単入力
          </button>
          <button
            type="button"
            aria-pressed={input.expenseMode === 'detail'}
            onClick={() => onChange({ ...input, expenseMode: 'detail' })}
          >
            詳細入力
          </button>
        </div>

        {input.expenseMode === 'simple' ? (
          <div className="field" style={{ marginTop: 'var(--sp-2)' }}>
            <label className="field__label" htmlFor="simpleExpense">年間経費合計</label>
            <div className="field__input-wrap">
              <input
                id="simpleExpense"
                className="field__input"
                type="number"
                inputMode="numeric"
                value={input.simpleExpense || ''}
                onChange={(e) => onChange({ ...input, simpleExpense: parseFloat(e.target.value) || 0 })}
                placeholder="60"
                min="0"
                step="1"
              />
              <span className="field__unit">万円</span>
            </div>
          </div>
        ) : (
          <div className="detail-expenses" style={{ marginTop: 'var(--sp-2)' }}>
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
              <div key={item.key} className="detail-input">
                <label className="field__label" htmlFor={item.key}>{item.label}</label>
                <div className="field__input-wrap">
                  <input
                    id={item.key}
                    className="field__input"
                    type="number"
                    inputMode="numeric"
                    value={(input[item.key as keyof PropertyInput] as number) || ''}
                    onChange={(e) => updateExpenseField(item.key as keyof PropertyInput, parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    step="1"
                  />
                  <span className="field__unit">万円</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 購入時諸費用 */}
      <section className="input-section">
        <h3 className="section-title">購入時諸費用</h3>

        <div className="field__toggle" role="group" aria-label="購入時諸費用の考慮">
          <button
            type="button"
            aria-pressed={!input.includePurchaseCost}
            onClick={() => onChange({ ...input, includePurchaseCost: false })}
          >
            考慮しない
          </button>
          <button
            type="button"
            aria-pressed={input.includePurchaseCost}
            onClick={() => onChange({ ...input, includePurchaseCost: true })}
          >
            考慮する
          </button>
        </div>

        {input.includePurchaseCost && (
          <div className="field" style={{ marginTop: 'var(--sp-2)' }}>
            <label className="field__label" htmlFor="purchaseCost">諸費用合計</label>
            <div className="field__input-wrap">
              <input
                id="purchaseCost"
                className="field__input"
                type="number"
                inputMode="numeric"
                value={input.purchaseCost || ''}
                onChange={(e) => onChange({ ...input, purchaseCost: parseFloat(e.target.value) || 0 })}
                placeholder="200"
                min="0"
                step="1"
              />
              <span className="field__unit">万円</span>
            </div>
          </div>
        )}
      </section>

      {/* アクションボタン */}
      <div className="action-buttons">
        <button type="button" className="btn btn--brand" onClick={onSample}>
          サンプルを入力
        </button>
        <button type="button" className="btn btn--ghost" onClick={onReset}>
          入力をリセット
        </button>
      </div>
    </div>
  );
};

export default InputForm;
