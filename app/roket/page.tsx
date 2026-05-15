'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

type GameState = 'waiting' | 'running' | 'crashed'

export default function RoketPage() {
  const [balance, setBalance] = useState(100)
  const [betAmount, setBetAmount] = useState('10')
  const [autoCashout, setAutoCashout] = useState('2.00')
  const [currentBet, setCurrentBet] = useState(0)
  const [cashedOut, setCashedOut] = useState(false)
  const [multiplier, setMultiplier] = useState(1.0)
  const [crashPoint, setCrashPoint] = useState(0)
  const [gameState, setGameState] = useState<GameState>('waiting')
  const [history, setHistory] = useState<number[]>([])
  const [status, setStatus] = useState('Hazırlanıyor...')
  const [countdown, setCountdown] = useState(5)
  const [showAd, setShowAd] = useState(false)
  const [adSecs, setAdSecs] = useState(5)
  const [adCooldown, setAdCooldown] = useState(false)

  const animFrameRef = useRef<number | null>(null)
  const startTimeRef = useRef(0)
  const waitTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const gameStateRef = useRef<GameState>('waiting')
  const currentBetRef = useRef(0)
  const cashedOutRef = useRef(false)
  const crashPointRef = useRef(0)
  const autoCashoutRef = useRef(2.0)

  // refs için sync
  useEffect(() => { gameStateRef.current = gameState }, [gameState])
  useEffect(() => { currentBetRef.current = currentBet }, [currentBet])
  useEffect(() => { cashedOutRef.current = cashedOut }, [cashedOut])
  useEffect(() => { crashPointRef.current = crashPoint }, [crashPoint])
  useEffect(() => { autoCashoutRef.current = parseFloat(autoCashout) || 0 }, [autoCashout])

  const fmtMoney = (n: number) =>
    n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺'

  const calcCrash = () => {
    const r = Math.random()
    if (r < 0.04) return 1.0
    return Math.max(1.0, Math.floor((97 / (1 - r))) / 100)
  }

  const doCashout = useCallback(() => {
    if (gameStateRef.current !== 'running' || !currentBetRef.current || cashedOutRef.current) return
    cashedOutRef.current = true
    setCashedOut(true)
    const m = multiplier
    setBalance((b) => {
      const won = currentBetRef.current * m
      setStatus(`✅ ${m.toFixed(2)}x'te çekildin! +${fmtMoney(won)}`)
      return b + won
    })
  }, [multiplier])

  // Use refs for the three main loop functions to avoid circular hook deps
  const startWaitingRef = useRef<() => void>(() => {})
  const startRoundRef = useRef<() => void>(() => {})
  const endRoundRef = useRef<() => void>(() => {})

  const startWaiting = useCallback(() => startWaitingRef.current(), [])
  const startRound = useCallback(() => startRoundRef.current(), [])
  const endRound = useCallback(() => endRoundRef.current(), [])

  useEffect(() => {
    endRoundRef.current = () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      setGameState('crashed')
      gameStateRef.current = 'crashed'
      const cp = crashPointRef.current
      setMultiplier(cp)

      if (currentBetRef.current > 0 && !cashedOutRef.current) {
        setStatus(`💥 Patladı! ${fmtMoney(currentBetRef.current)} kayıp`)
      } else if (cashedOutRef.current) {
        setStatus(`Patladı ${cp.toFixed(2)}x'te — sen zamanında çıktın!`)
      } else {
        setStatus(`Patladı ${cp.toFixed(2)}x'te`)
      }

      setHistory((h) => [cp, ...h].slice(0, 6))
      setTimeout(() => startWaiting(), 3000)
    }

    startRoundRef.current = () => {
      const cp = calcCrash()
      setCrashPoint(cp)
      crashPointRef.current = cp
      setMultiplier(1.0)
      startTimeRef.current = performance.now()
      setGameState('running')
      gameStateRef.current = 'running'
      setStatus(currentBetRef.current > 0 ? 'Uçuyor! Zamanında çekil!' : 'İzliyorsun')

      const tick = (now: number) => {
        const elapsed = (now - startTimeRef.current) / 1000
        const m = Math.pow(1.08, elapsed * 2)

        if (
          currentBetRef.current > 0 &&
          !cashedOutRef.current &&
          autoCashoutRef.current >= 1.01 &&
          m >= autoCashoutRef.current &&
          autoCashoutRef.current < crashPointRef.current
        ) {
          cashedOutRef.current = true
          setCashedOut(true)
          setBalance((b) => {
            const won = currentBetRef.current * autoCashoutRef.current
            setStatus(`✅ Otomatik çekildi ${autoCashoutRef.current.toFixed(2)}x! +${fmtMoney(won)}`)
            return b + won
          })
        }

        if (m >= crashPointRef.current) {
          endRound()
          return
        }

        setMultiplier(m)
        animFrameRef.current = requestAnimationFrame(tick)
      }
      animFrameRef.current = requestAnimationFrame(tick)
    }

    startWaitingRef.current = () => {
      setGameState('waiting')
      gameStateRef.current = 'waiting'
      setCurrentBet(0)
      currentBetRef.current = 0
      setCashedOut(false)
      cashedOutRef.current = false
      setMultiplier(1.0)
      let cd = 5
      setCountdown(cd)

      const tick = () => {
        if (gameStateRef.current !== 'waiting') return
        setStatus(`Bahis için ${cd} saniye...`)
        setCountdown(cd)
        if (cd <= 0) {
          startRound()
          return
        }
        cd--
        waitTimeoutRef.current = setTimeout(tick, 1000)
      }
      tick()
    }
  // run once
  }, [endRound, startRound, startWaiting])

  useEffect(() => {
    startWaiting()
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (waitTimeoutRef.current) clearTimeout(waitTimeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const placeBet = () => {
    const amt = parseFloat(betAmount) || 0
    if (amt <= 0 || amt > balance) {
      setStatus('Geçersiz bahis miktarı!')
      return
    }
    setCurrentBet(amt)
    currentBetRef.current = amt
    setBalance((b) => b - amt)
    setStatus(`Bahis: ${fmtMoney(amt)}`)
  }

  const handleAdWatch = () => {
    if (adCooldown) return
    setShowAd(true)
    setAdCooldown(true)
    let s = 5
    setAdSecs(s)
    const iv = setInterval(() => {
      s--
      setAdSecs(s)
      if (s <= 0) {
        clearInterval(iv)
        setShowAd(false)
        setBalance((b) => b + 50)
        setStatus('+50 ₺ kazandın!')
        setTimeout(() => setAdCooldown(false), 3000)
      }
    }, 1000)
  }

  const rocketProgress = Math.min((multiplier - 1) / 5, 1)
  const rocketLeft = 20 + rocketProgress * 320
  const rocketBottom = 10 + rocketProgress * 190

  const pillColor = (h: number) =>
    h < 1.5 ? '#dc2626' : h < 3 ? '#3b82f6' : '#16a34a'

  return (
    <div style={{ minHeight: '100vh', background: '#0d1f12', color: 'white', padding: '24px 16px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: '#f0a500', marginBottom: 8, textAlign: 'center' }}>
          🚀 Roket
        </h1>
        <div style={{
          background: 'rgba(240, 165, 0, 0.1)',
          border: '1px solid rgba(240, 165, 0, 0.3)',
          color: '#f0a500',
          padding: '10px 14px',
          borderRadius: 8,
          fontSize: 13,
          marginBottom: 16,
          textAlign: 'center',
        }}>
          ⚠️ Bu oyun tamamen eğlence amaçlıdır. Sanal paralar değersizdir ve gerçek paraya çevrilemez.
        </div>

        {/* Top bar: balance + history */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#1a2e1d',
          border: '1px solid #2d4a32',
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 12,
        }}>
          <div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>Bakiye</div>
            <div style={{ fontSize: 24, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: '#f0a500' }}>
              {fmtMoney(balance)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '60%' }}>
            {history.map((h, i) => (
              <span
                key={i}
                style={{
                  fontSize: 12,
                  padding: '4px 8px',
                  borderRadius: 12,
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 500,
                  background: pillColor(h) + '33',
                  color: pillColor(h),
                }}
              >
                {h.toFixed(2)}x
              </span>
            ))}
          </div>
        </div>

        {/* Rocket area */}
        <div style={{
          position: 'relative',
          height: 280,
          background: '#1a2e1d',
          border: '1px solid #2d4a32',
          borderRadius: 8,
          overflow: 'hidden',
          marginBottom: 12,
        }}>
          {/* Trail */}
          <div style={{
            position: 'absolute',
            bottom: 24,
            left: 0,
            height: 2,
            background: '#f0a500',
            opacity: 0.4,
            width: rocketLeft,
            transition: gameState === 'crashed' ? 'none' : 'width 0.05s linear',
          }} />
          {/* Multiplier */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 64,
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
            color: gameState === 'crashed' ? '#dc2626' : gameState === 'running' ? '#f0a500' : '#6b7280',
          }}>
            {gameState === 'waiting' ? `${countdown}s` : multiplier.toFixed(2) + 'x'}
          </div>
          {/* Rocket */}
          <div style={{
            position: 'absolute',
            bottom: rocketBottom,
            left: rocketLeft,
            fontSize: 36,
            transition: gameState === 'crashed' ? 'none' : 'all 0.05s linear',
          }}>
            {gameState === 'crashed' ? '💥' : '🚀'}
          </div>
          {/* Status */}
          <div style={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 13,
            color: '#9ca3af',
            whiteSpace: 'nowrap',
          }}>
            {status}
          </div>

          {/* Ad modal overlay */}
          {showAd && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.9)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              zIndex: 10,
            }}>
              <div style={{ fontSize: 14, color: '#9ca3af' }}>Reklam oynatılıyor...</div>
              <div style={{ fontSize: 56, fontWeight: 600, color: '#f0a500' }}>{adSecs}</div>
              {/*
                === GERÇEK ADSENSE REKLAM BURAYA GELECEK ===
                <ins className="adsbygoogle" ... />
                Detaylar için aşağıdaki yoruma bak.
              */}
              <div style={{ fontSize: 11, color: '#6b7280' }}>+50 ₺ kazanıyorsun</div>
            </div>
          )}
        </div>

        {/* Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <div>
            <label style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 4 }}>Bahis (₺)</label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              disabled={gameState !== 'waiting' || currentBet > 0}
              style={{
                width: '100%',
                padding: 10,
                background: '#1a2e1d',
                border: '1px solid #2d4a32',
                color: 'white',
                borderRadius: 6,
                fontSize: 15,
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 4 }}>Otomatik çekil (x)</label>
            <input
              type="number"
              step="0.1"
              min="1.01"
              value={autoCashout}
              onChange={(e) => setAutoCashout(e.target.value)}
              style={{
                width: '100%',
                padding: 10,
                background: '#1a2e1d',
                border: '1px solid #2d4a32',
                color: 'white',
                borderRadius: 6,
                fontSize: 15,
              }}
            />
          </div>
        </div>

        {/* Action button */}
        {gameState === 'running' && currentBet > 0 && !cashedOut ? (
          <button
            onClick={doCashout}
            style={{
              width: '100%',
              padding: 14,
              background: '#16a34a',
              border: 'none',
              color: 'white',
              fontSize: 17,
              fontWeight: 600,
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            ÇEKİL ({multiplier.toFixed(2)}x)
          </button>
        ) : (
          <button
            onClick={placeBet}
            disabled={gameState !== 'waiting' || currentBet > 0 || balance <= 0}
            style={{
              width: '100%',
              padding: 14,
              background: gameState !== 'waiting' || currentBet > 0 || balance <= 0 ? '#374151' : '#f0a500',
              border: 'none',
              color: gameState !== 'waiting' || currentBet > 0 || balance <= 0 ? '#9ca3af' : '#0d1f12',
              fontSize: 17,
              fontWeight: 600,
              borderRadius: 8,
              cursor: gameState !== 'waiting' || currentBet > 0 || balance <= 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {currentBet > 0 ? 'Bahis kondu' : 'Bahis koy'}
          </button>
        )}

        {/* Ad button */}
        <button
          onClick={handleAdWatch}
          disabled={adCooldown}
          style={{
            width: '100%',
            padding: 12,
            background: adCooldown ? '#374151' : '#2d4a32',
            border: '1px solid #f0a500',
            color: adCooldown ? '#9ca3af' : '#f0a500',
            fontSize: 14,
            fontWeight: 500,
            borderRadius: 8,
            cursor: adCooldown ? 'not-allowed' : 'pointer',
            marginTop: 8,
          }}
        >
          📺 Para al — reklam izle (+50 ₺)
        </button>

        <p style={{ fontSize: 11, color: '#6b7280', textAlign: 'center', marginTop: 16 }}>
          Karabük Kamu Kurumları Bahar Futbol Turnuvası · Roket eğlence oyunu
        </p>
      </div>
    </div>
  )
}