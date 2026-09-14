import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="privacy-notice">
          <span className="privacy-icon">🔒</span>
          <span>入力データは外部へ送信されません（すべてブラウザ内で処理）</span>
        </div>
        
        <div className="disclaimer">
          <h4>ご注意</h4>
          <p>
            このシミュレーション結果は入力された条件に基づく概算値であり、
            実際の投資成果・収益・融資・税務結果などを保証するものではない。
          </p>
          <p>
            実際の投資判断については、物件固有の条件を確認し、
            必要に応じて不動産・税務・金融等の専門家へご確認ください。
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
