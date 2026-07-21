// ============================================================
// ゲームロゴ。画像生成ではなくSVGで組んでいる理由:
//  - 生成画像は日本語の字形が崩れる
//  - SVGなら拡大しても鮮明で、容量もほぼゼロ
//  - paint-order: stroke で「縁取り→塗り」の順に描け、王道RPGロゴの見た目になる
// ============================================================

export function Logo({ width = 320 }: { width?: number }) {
  return (
    <svg
      className="logo"
      viewBox="0 0 480 190"
      role="img"
      aria-label="WUL ケアクエスト"
      // 幅は「上限」として扱い、狭い画面では 100% に縮む（横はみ出し防止）
      style={{ display: 'block', margin: '0 auto', overflow: 'visible', width: '100%', maxWidth: width }}
    >
      <defs>
        {/* メインの金色グラデーション */}
        <linearGradient id="logoGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff8dc" />
          <stop offset="42%" stopColor="#ffd873" />
          <stop offset="52%" stopColor="#f2b544" />
          <stop offset="100%" stopColor="#c8801a" />
        </linearGradient>
        {/* 上部のハイライト */}
        <linearGradient id="logoShine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="46%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        {/* 「WUL」の帯 */}
        <linearGradient id="logoBand" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2f81f7" />
          <stop offset="100%" stopColor="#1f5fd0" />
        </linearGradient>
        <filter id="logoGlow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#000" floodOpacity="0.55" />
          <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#f2b544" floodOpacity="0.4" />
        </filter>
      </defs>

      <g filter="url(#logoGlow)">
        {/* 上段：WUL の青いプレート */}
        <g transform="translate(240 30)">
          <rect x="-88" y="-22" width="176" height="42" rx="21" fill="url(#logoBand)" stroke="#0d2f66" strokeWidth="3" />
          <text
            x="0"
            y="8"
            textAnchor="middle"
            fontSize="24"
            fontWeight="900"
            letterSpacing="6"
            fill="#ffffff"
          >
            WUL
          </text>
        </g>

        {/* 下段：ケアクエスト */}
        <g transform="translate(240 112)">
          {/* 縁取り（外側の太い黒）→ 内側の白 → 金の塗り、の3層で立体感を出す */}
          <text
            className="logo__main"
            x="0"
            y="0"
            textAnchor="middle"
            fontSize="66"
            fontWeight="900"
            letterSpacing="2"
            fill="url(#logoGold)"
            stroke="#3a2200"
            strokeWidth="14"
            strokeLinejoin="round"
            paintOrder="stroke"
          >
            ケアクエスト
          </text>
          <text
            x="0"
            y="0"
            textAnchor="middle"
            fontSize="66"
            fontWeight="900"
            letterSpacing="2"
            fill="url(#logoGold)"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinejoin="round"
            paintOrder="stroke"
          >
            ケアクエスト
          </text>
          {/* 上半分のツヤ */}
          <text
            x="0"
            y="0"
            textAnchor="middle"
            fontSize="66"
            fontWeight="900"
            letterSpacing="2"
            fill="url(#logoShine)"
            aria-hidden="true"
          >
            ケアクエスト
          </text>
        </g>

        {/* キャッチコピーの帯 */}
        <g transform="translate(240 158)">
          <rect x="-160" y="-15" width="320" height="30" rx="15" fill="#0e1526" opacity="0.72" />
          <text
            x="0"
            y="6"
            textAnchor="middle"
            fontSize="16"
            fontWeight="800"
            letterSpacing="1"
            fill="#ffe9b8"
          >
            デジタルスキルで介護現場を救うRPG
          </text>
        </g>
      </g>
    </svg>
  )
}
