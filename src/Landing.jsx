import { useEffect, useRef, useState } from 'react'
import './Landing.css'

const STAGES = [
  { status: 'AUTHENTICATING...',        pct: 0   },
  { status: 'SCANNING BIOMETRICS...',   pct: 18  },
  { status: 'VERIFYING HUNTER CLASS...', pct: 42 },
  { status: 'CONNECTING TO SYSTEM...',  pct: 67  },
  { status: 'ACCESS GRANTED',           pct: 100 },
]

const STAGE_DELAYS = [1200, 700, 800, 700, 600]

export default function Landing({ onEnter }) {
  const canvasRef = useRef(null)
  const [status, setStatus] = useState('AUTHENTICATING...')
  const [pct, setPct] = useState(0)
  const [msgLine1, setMsgLine1] = useState('')
  const [msgLine2, setMsgLine2] = useState('')
  const [showBtn, setShowBtn] = useState(false)
  const [exiting, setExiting] = useState(false)

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.4 - 0.1,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
      color: Math.random() > 0.7 ? '#5ab4ff' : '#1a4488',
    }))

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.fill()
        ctx.globalAlpha = 1
        p.x += p.vx
        p.y += p.vy
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width }
        if (p.x < -10) p.x = canvas.width + 10
        if (p.x > canvas.width + 10) p.x = -10
      })
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(q => {
          const d = Math.hypot(p.x - q.x, p.y - q.y)
          if (d < 100) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgba(40,130,255,${0.06 * (1 - d / 100)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  // Boot sequence
  useEffect(() => {
    let timeout

    function runStage(index) {
      if (index >= STAGES.length) {
        typeMessage()
        return
      }
      const s = STAGES[index]
      setStatus(s.status)
      setPct(s.pct)
      timeout = setTimeout(() => runStage(index + 1), STAGE_DELAYS[index])
    }

    function typeMessage() {
      const line1 = 'WELCOME TO THE SYSTEM,'
      const line2 = 'PLAYER.'
      let i = 0
      function tick() {
        if (i <= line1.length) {
          setMsgLine1(line1.slice(0, i))
          i++
          timeout = setTimeout(tick, 38)
        } else if (i <= line1.length + line2.length) {
          setMsgLine2(line2.slice(0, i - line1.length))
          i++
          timeout = setTimeout(tick, 38)
        } else {
          setTimeout(() => setShowBtn(true), 400)
        }
      }
      tick()
    }

    timeout = setTimeout(() => runStage(0), 1300)
    return () => clearTimeout(timeout)
  }, [])

  function handleEnter() {
    setExiting(true)
    setTimeout(onEnter, 420)
  }

  return (
    <div className={`landing ${exiting ? 'landing-exit' : ''}`}>
      <canvas ref={canvasRef} className="landing-canvas" />

      <div className="landing-bg-layer">
        <div className="depth-panel depth-2" />
        <div className="depth-panel depth-1" />
      </div>

      {/* Vector rail top */}
      <div className="vector-rail vector-top">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="48" x2="1440" y2="48" stroke="rgba(40,130,255,0.2)" strokeWidth="0.5" />
          <line x1="0" y1="54" x2="1440" y2="54" stroke="rgba(40,130,255,0.08)" strokeWidth="0.5" />
          <line x1="0" y1="58" x2="1440" y2="58" stroke="rgba(40,130,255,0.04)" strokeWidth="0.5" />
          <polyline points="0,48 120,30 280,42 440,20 600,38 760,14 920,36 1080,22 1240,40 1440,26" fill="none" stroke="rgba(40,130,255,0.15)" strokeWidth="0.5" />
          <polyline points="0,54 200,44 400,50 600,40 800,46 1000,38 1200,44 1440,42" fill="none" stroke="rgba(40,130,255,0.08)" strokeWidth="0.5" />
          <circle cx="440" cy="20" r="2" fill="rgba(80,160,255,0.5)" />
          <circle cx="760" cy="14" r="2" fill="rgba(80,160,255,0.4)" />
          <circle cx="1080" cy="22" r="1.5" fill="rgba(80,160,255,0.3)" />
          <line x1="440" y1="0" x2="440" y2="20" stroke="rgba(40,130,255,0.2)" strokeWidth="0.5" />
          <line x1="760" y1="0" x2="760" y2="14" stroke="rgba(40,130,255,0.15)" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Vector rail bottom */}
      <div className="vector-rail vector-bottom">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="12" x2="1440" y2="12" stroke="rgba(40,130,255,0.2)" strokeWidth="0.5" />
          <line x1="0" y1="6" x2="1440" y2="6" stroke="rgba(40,130,255,0.08)" strokeWidth="0.5" />
          <polyline points="0,12 180,30 360,18 540,40 700,22 860,44 1020,24 1200,38 1440,26" fill="none" stroke="rgba(40,130,255,0.15)" strokeWidth="0.5" />
          <circle cx="540" cy="40" r="2" fill="rgba(80,160,255,0.4)" />
          <circle cx="860" cy="44" r="2" fill="rgba(80,160,255,0.35)" />
        </svg>
      </div>

      {/* Side accents */}
      <div className="side-accent side-left">
        <div className="accent-line" />
        <div className="accent-dot" />
        <div className="accent-line" style={{ marginTop: '8px' }} />
      </div>
      <div className="side-accent side-right">
        <div className="accent-line" />
        <div className="accent-dot" />
        <div className="accent-line" style={{ marginTop: '8px' }} />
      </div>

      {/* Main panel */}
      <div className="landing-panel">
        <div className="panel-glow" />
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />

        <div className="l-notif-icon">!</div>
        <div className="l-notif-label">NOTIFICATION</div>

        <div className="l-status">{status}</div>

        <div className="l-message">
          <span>{msgLine1}</span>
          {msgLine2 && <><br /><span className="l-highlight">{msgLine2}</span></>}
        </div>

        <div className="l-divider" />

        <div className="l-progress-wrap">
          <div className="l-progress-label">
            <span>SYSTEM BOOT</span>
            <span>{pct}%</span>
          </div>
          <div className="l-progress-track">
            <div className="l-progress-fill" style={{ width: `${pct}%`, transition: 'width 0.5s ease' }} />
          </div>
        </div>

        <button
          className={`l-enter-btn ${showBtn ? 'l-btn-show' : ''}`}
          onClick={handleEnter}
          disabled={!showBtn}
        >
          ENTER THE SYSTEM
        </button>
      </div>
    </div>
  )
}