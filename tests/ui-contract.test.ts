import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const inputForm = readFileSync(resolve(projectRoot, 'src/components/InputForm.tsx'), 'utf8');
const styles = readFileSync(resolve(projectRoot, 'src/index.css'), 'utf8');

function expectContract(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
  console.log(`✅ ${message}`);
}

console.log('=== 入力画面の表示ルール ===\n');

expectContract(
  inputForm.includes('className="vacancy-control"'),
  '空室率は専用の操作エリアを使う',
);

expectContract(
  inputForm.includes('className="vacancy-slider"'),
  '空室率スライダーは専用スタイルを使う',
);

expectContract(
  inputForm.includes('<output'),
  '空室率の現在値を明示的に表示する',
);

expectContract(
  styles.includes('.vacancy-control') && styles.includes('.vacancy-slider'),
  '空室率のレールとつまみを専用CSSで描画する',
);

expectContract(
  styles.includes('.vacancy-slider::-webkit-slider-runnable-track')
    && styles.includes('.vacancy-slider::-moz-range-track'),
  'ブラウザごとに空室率のレールを明確に描画する',
);

expectContract(
  styles.includes('.money-fields'),
  '金額入力は整列用の専用グリッドを使う',
);

console.log('\nすべての表示ルールを満たしています。');
