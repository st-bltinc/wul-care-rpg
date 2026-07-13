import { useState } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { Rarity } from '@/types'

// ============================================================
// 共通UIコンポーネント（高視認性・大きめタップ）
// ============================================================

type BtnVariant = 'primary' | 'secondary' | 'gold' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  block?: boolean
  lg?: boolean
}

export function Button({
  variant = 'primary',
  block,
  lg,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const cls = [
    'btn',
    `btn--${variant}`,
    block ? 'btn--block' : '',
    lg ? 'btn--lg' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  )
}

/**
 * 画像スプライト（キャラ・敵・武器・お守り）。size は正方形の一辺(px)。
 * 画像がまだ生成されていない場合は fallback の絵文字を表示して、画面が壊れないようにする。
 */
export function Sprite({
  src,
  alt,
  size = 64,
  fallback,
  className = '',
  style,
}: {
  src: string
  alt: string
  size?: number
  fallback?: string
  className?: string
  style?: React.CSSProperties
}) {
  const [failed, setFailed] = useState(false)

  if (failed && fallback) {
    return (
      <span
        className={className}
        aria-label={alt}
        style={{
          width: size,
          height: size,
          fontSize: size * 0.78,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style,
        }}
      >
        {fallback}
      </span>
    )
  }

  return (
    <img
      className={`sprite-img ${className}`}
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      draggable={false}
      onError={() => setFailed(true)}
      style={style}
    />
  )
}

export function Panel({
  children,
  className = '',
  flush,
  style,
}: {
  children: ReactNode
  className?: string
  flush?: boolean
  style?: React.CSSProperties
}) {
  return (
    <div className={`panel ${flush ? 'panel--flush' : ''} ${className}`} style={style}>
      {children}
    </div>
  )
}

export function Bar({
  label,
  value,
  max,
  color,
  onDark,
  suffix,
}: {
  label?: string
  value: number
  max: number
  color?: string
  onDark?: boolean
  suffix?: string
}) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100))
  return (
    <div className={`bar ${onDark ? 'bar--onDark' : ''}`}>
      {label !== undefined && (
        <div className="bar__label">
          <span>{label}</span>
          <span>
            {Math.max(0, Math.round(value))}
            {suffix ?? ''} / {max}
            {suffix ?? ''}
          </span>
        </div>
      )}
      <div className="bar__track">
        <div className="bar__fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export function Stars({ rarity }: { rarity: Rarity }) {
  const cls = rarity >= 5 ? 'rarity-5' : rarity >= 4 ? 'rarity-4' : rarity >= 3 ? 'rarity-3' : ''
  return (
    <span className={`stars ${cls}`} aria-label={`レア度${rarity}`}>
      {'★'.repeat(rarity)}
      <span style={{ opacity: 0.25 }}>{'★'.repeat(5 - rarity)}</span>
    </span>
  )
}

export function Pill({
  children,
  light,
  color,
}: {
  children: ReactNode
  light?: boolean
  color?: string
}) {
  return (
    <span className={`pill ${light ? 'pill--light' : ''}`} style={color ? { background: color, color: '#fff' } : undefined}>
      {children}
    </span>
  )
}

export function TopBar({
  title,
  onBack,
  right,
}: {
  title: string
  onBack?: () => void
  right?: ReactNode
}) {
  return (
    <div className="topbar">
      {onBack && (
        <button className="iconbtn" onClick={onBack} aria-label="戻る">
          ‹
        </button>
      )}
      <div className="topbar__title">{title}</div>
      <div className="topbar__spacer" />
      {right}
    </div>
  )
}
