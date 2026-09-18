import React from 'react';
import type { CalculationResult } from '../types';
import { formatCurrency, formatYield } from '../utils/calculations';
import { useCountUp } from './motion';

interface ResultsProps {
  result: CalculationResult;
}

function HeroNumber({
  label,
  value,
  unit,
  note,
}: {
  label: string;
  value: string;
  unit?: string;
  note?: string;
}) {
  const shown = useCountUp(value);
  return (
    <div className="hero-number">
      <div className="ambient ambient--result" aria-hidden="true" />
      <div className="hero-number__label">{label}</div>
      <div className="hero-number__value">
        {shown}
        {unit ? <span className="hero-number__unit">{unit}</span> : null}
      </div>
      {note ? <div className="hero-number__note">{note}</div> : null}
    </div>
  );
}

function SubMetrics({
  items,
}: {
  items: { label: string; value: string; help?: string }[];
}) {
  return (
    <div className="sub-metrics">
      {items.map((m) => (
        <div className="sub-metric" key={m.label}>
          <div className="sub-metric__label">{m.label}</div>
          <div className="sub-metric__value">{m.value}</div>
          {m.help ? <div className="sub-metric__help">{m.help}</div> : null}
        </div>
      ))}
    </div>
  );
}

function Figure({
  title,
  desc,
  label,
  children,
}: {
  title: string;
  desc?: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="figure" aria-label={label}>
      <div className="figure__title">{title}</div>
      {desc ? <div className="figure__desc">{desc}</div> : null}
      {children}
    </figure>
  );
}

function Points({
  title,
  lines,
}: {
  title: string;
  lines: string[];
}) {
  return (
    <div className="points">
      <div className="points__title">{title}</div>
      {lines.map((l) => (
        <p key={l}>{l}</p>
      ))}
    </div>
  );
}

export const Results: React.FC<ResultsProps> = ({ result }) => {
  if (!result.isValid) {
    return (
      <section className="result-section" aria-label="結果">
        <div className="state-empty">
          <div className="state-empty__title">数字を入れると結果が出ます</div>
          <p className="state-empty__body">物件価格と家賃を入力してください</p>
        </div>
      </section>
    );
  }

  // 可視化データ
  const totalRent = result.grossRent;
  const vacancyLossPct = totalRent > 0 ? (result.vacancyLoss / totalRent) * 100 : 0;
  const noiPct = totalRent > 0 ? (result.noi / totalRent) * 100 : 0;
  const expensePct = totalRent > 0 ? (result.annualExpense / totalRent) * 100 : 0;

  // 補助の数字
  const subMetrics: { label: string; value: string; help?: string }[] = [
    { label: '満室想定の利回り', value: `${formatYield(result.grossYield)}%`, help: '年間家賃収入をもとにした目安' },
    { label: '空室考慮後利回り', value: `${formatYield(result.effectiveYield)}%` },
    { label: 'NOI相当額', value: `${formatCurrency(result.noi)}万円`, help: '実効家賃 − 運営経費' },
    { label: '月平均NOI相当額', value: `${formatCurrency(result.monthlyNoi)}万円` },
    { label: '経費率', value: `${formatYield(result.expenseRatio)}%` },
  ];
  if (result.totalInvestment > 0 && result.totalInvestmentYield > 0) {
    subMetrics.push({
      label: '総投資額ベース実質利回り',
      value: `${formatYield(result.totalInvestmentYield)}%`,
    });
  }

  // 収益構造（SVG）
  const W = 640;
  const H = 36;
  const noiW = (noiPct / 100) * W;
  const expW = (expensePct / 100) * W;
  const vacW = (vacancyLossPct / 100) * W;

  return (
    <section className="result-section" aria-label="結果">
      {/* 1: HeroNumber */}
      <HeroNumber
        label="実質利回り"
        value={formatYield(result.netYield)}
        unit="%"
        note="空室・経費を反映"
      />

      {/* 2: SubMetrics */}
      <SubMetrics items={subMetrics} />

      {/* 3: 収益構造 */}
      <Figure title="収益構造" desc="年間家賃収入の配分" label="年間家賃収入の配分">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="年間家賃収入の配分">
          <rect className="figure-bar" x={0} y={0} width={noiW} height={H} rx={6} fill="var(--company-accent)" />
          <rect className="figure-bar" x={noiW} y={0} width={expW} height={H} fill="var(--series-2)" />
          <rect className="figure-bar" x={noiW + expW} y={0} width={vacW} height={H} rx={6} fill="var(--chart-muted)" />
          {noiPct > 10 && (
            <text x={noiW / 2} y={H / 2 + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">
              {formatYield(noiPct)}%
            </text>
          )}
          {expensePct > 10 && noiPct <= 10 && (
            <text x={noiW + expW / 2} y={H / 2 + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">
              {formatYield(expensePct)}%
            </text>
          )}
          {vacancyLossPct > 10 && expensePct <= 10 && noiPct <= 10 && (
            <text x={noiW + expW + vacW / 2} y={H / 2 + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">
              {formatYield(vacancyLossPct)}%
            </text>
          )}
        </svg>
        <div className="bar-legend">
          <div className="legend-item">
            <span className="legend-color noi" />
            <span>NOI相当額</span>
          </div>
          <div className="legend-item">
            <span className="legend-color expense" />
            <span>運営経費</span>
          </div>
          <div className="legend-item">
            <span className="legend-color vacancy" />
            <span>空室損</span>
          </div>
        </div>
      </Figure>

      {/* 4: 利回り比較 */}
      <Figure title="利回り比較" desc="表面利回りから実質利回りまでの変化" label="利回り比較">
        <div className="comparison-chart">
          <div className="comparison-item">
            <span className="comparison-label">表面利回り</span>
            <div className="comparison-bar-bg">
              <div
                className="comparison-bar gross"
                style={{ width: `${Math.min(100, result.grossYield * 5)}%` }}
              />
            </div>
            <span className="comparison-value">{formatYield(result.grossYield)}%</span>
          </div>

          <div className="comparison-item">
            <span className="comparison-label">空室考慮後</span>
            <div className="comparison-bar-bg">
              <div
                className="comparison-bar effective"
                style={{ width: `${Math.min(100, result.effectiveYield * 5)}%` }}
              />
            </div>
            <span className="comparison-value">{formatYield(result.effectiveYield)}%</span>
          </div>

          <div className="comparison-item">
            <span className="comparison-label">実質利回り</span>
            <div className="comparison-bar-bg">
              <div
                className="comparison-bar net"
                style={{ width: `${Math.min(100, result.netYield * 5)}%` }}
              />
            </div>
            <span className="comparison-value">{formatYield(result.netYield)}%</span>
          </div>
        </div>
      </Figure>

      {/* 5: 判断のポイント */}
      <Points
        title="判断のポイント"
        lines={[
          '表面利回りは満室・経費ゼロの前提です。空室と経費を引いた実質利回りで比べてください。',
          '経費率は物件の種類や築年で大きく変わります。詳細入力で内訳を入れると精度が上がります。',
          '購入時諸費用を含めた総投資額ベースの利回りが、実際の投資効率に近い数字です。',
        ]}
      />

      {/* 6: 詳細データ */}
      <Figure title="詳細データ" label="詳細データ">
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
      </Figure>
    </section>
  );
};

export default Results;
