import { useState, useMemo } from 'react';
import { InputForm } from './components/InputForm';
import { Results } from './components/Results';
import { Footer } from './components/Footer';
import type { PropertyInput } from './types';
import { DEFAULT_INPUT, SAMPLE_INPUT } from './types';
import { calculate } from './utils/calculations';
import './index.css';

function App() {
  const [input, setInput] = useState<PropertyInput>(DEFAULT_INPUT);

  // リアルタイム計算
  const result = useMemo(() => calculate(input), [input]);

  // 入力リセット
  const handleReset = () => {
    setInput(DEFAULT_INPUT);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // サンプルデータ適用
  const handleSample = () => {
    setInput(SAMPLE_INPUT);
  };

  return (
    <>
      {/* [1] ブランドヘッダー */}
      <header className="company-header">
        <div className="container-tool company-header__inner">
          <div className="company-header__brand">
            <span className="company-header__mark" aria-hidden="true">利</span>
            <span className="company-header__logo-text">利回り診断</span>
            <span className="company-header__sub">収益物件の収益性をその場で</span>
          </div>
        </div>
      </header>

      {/* [2] 帯（tool-header） */}
      <header className="band tool-header">
        <div className="ambient" aria-hidden="true" />
        <div className="container-tool">
          <div className="eyebrow reveal-up" style={{ '--i': 0 } as React.CSSProperties}>Tool</div>
          <h1 className="tool-name reveal-line" style={{ '--i': 1 } as React.CSSProperties}>不動産投資 利回り診断</h1>
          <p className="tool-tagline reveal-up" style={{ '--i': 2 } as React.CSSProperties}>物件価格・家賃・運営経費から収益性を診断</p>
        </div>
      </header>

      {/* [3] 本文 */}
      <main className="tool-main container-tool">
        <section className="panel input-panel">
          <InputForm
            input={input}
            onChange={setInput}
            onSample={handleSample}
            onReset={handleReset}
          />
        </section>

        <Results result={result} />

        <section className="disclaimer" aria-label="注記">
          <ul>
            <li>入力データは外部へ送信されません（すべてブラウザ内で処理）。</li>
            <li>このシミュレーション結果は入力された条件に基づく概算値であり、実際の投資成果・収益・融資・税務結果などを保証するものではない。</li>
            <li>実際の投資判断については、物件固有の条件を確認し、必要に応じて不動産・税務・金融等の専門家へご確認ください。</li>
          </ul>
        </section>
      </main>

      {/* [5] フッター */}
      <Footer />
    </>
  );
}

export default App;
