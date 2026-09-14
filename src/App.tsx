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
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">不動産投資 利回り診断</h1>
        <p className="app-subtitle">物件価格・家賃・運営経費から収益性を診断</p>
      </header>
      
      <main className="app-main">
        <div className="main-grid">
          {/* 入力フォーム */}
          <aside className="input-panel">
            <InputForm
              input={input}
              onChange={setInput}
              onSample={handleSample}
              onReset={handleReset}
            />
          </aside>
          
          {/* 結果表示 */}
          <section className="results-panel">
            <Results result={result} />
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
