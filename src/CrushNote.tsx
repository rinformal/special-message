import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart } from 'lucide-react'

const ROTATION_MS = 3000
const DEFAULT_SLIDE_MS = ROTATION_MS
const INTRO_MS_DEFAULT = 3000

const DURATIONS_MS_DEFAULT: number[] = [
  3600,4400,4400,4400,4800,4800,3600,3600,4800,4800,4800,4600,4000,4000,4200,4200,4200,4200,4200,5800,4200
]

const DEFAULT_NAME = 'Katalina'
const DEFAULT_AKA = 'Diana'

const ASSET_BASE = `${import.meta.env.BASE_URL}assets`
const ROSE_GIF_URL = `${ASSET_BASE}/img-5.gif`
const HI_GIF_URL = `${ASSET_BASE}/img-1.webp`
const BOY_GIF_URL = ``

const KAWAII_HUGS  = `${ASSET_BASE}/img-2.webp`
const KAWAII_PEEK  = `${ASSET_BASE}/img-3.webp`
const KAWAII_ROSE_RED = `${ASSET_BASE}/img-7.gif`
const KAWAII_ROSE_BLUE = `${ASSET_BASE}/img-red-bunch.gif`
const KAWAII_HEART_BUCKET = `${ASSET_BASE}/img-8.webp`

const STICKER_URLS = [KAWAII_HUGS,KAWAII_PEEK,KAWAII_ROSE_RED,KAWAII_ROSE_BLUE,KAWAII_HEART_BUCKET,ROSE_GIF_URL,HI_GIF_URL]

export function makeMessages(name: string) {
  return [
    `Hi ${name} 🥰`,
    'I am pretty sure I spelled your name wrong! 😅',
    'Sorry for that 🫣',
    'But I promise you...',
    'I remember every single thing about the last time we met!! 🤭',
    'And today, I am on a mission to make you smile!! 🕵️‍♂️💖',
    'So here I am 🤗',
    'You ready?',
    "I know you've been working so hard lately!!",
    'So I wanted to do something special for you! 💫',
    'Let me give you a tiny reminder first...',
    "You're amazing, inside & out 💐💖",
    'So please remember that!',
    'But most importantly...',
    'You are a genuine, warm and a sweet person! 🥰',
    "Trust me, I don't say this to people very often",
    "Cuz it's a rare quality",
    "So here's a flower for you ...",
    "Let me give you a whole bunch ...",
    'BTW, I am literally, counting down to our dinner date 🍲🍗🍷 (already smiling about it 😊)',
    'So see you soon!',
  ]
}

export function totalSlides(msgs: string[]) { return msgs.length + 1 }
export function isFinalIndex(idx: number, msgs: string[]) { return idx === msgs.length }

export function parseDurationsParam(param: string | null, msgsLen: number, fallbackMs: number, defaults?: number[]): number[] {
  const base = (defaults && defaults.length === msgsLen) ? defaults.slice() : Array(msgsLen).fill(fallbackMs)
  if (!param) return base
  const parts = param.split(',').map(s => Number(s.trim()))
  for (let i=0; i<Math.min(parts.length, msgsLen); i++) {
    const sec = parts[i]
    if (!Number.isFinite(sec)) continue
    const ms = Math.max(500, Math.round(sec*1000))
    base[i] = ms
  }
  return base
}

export function stickerForIndex(idx: number): string | null {
  if (idx === 6) return KAWAII_HUGS
  if (idx === 7) return KAWAII_PEEK
  if (idx === 14) return KAWAII_HEART_BUCKET
  if (idx === 17) return KAWAII_ROSE_RED
  if (idx === 18) return KAWAII_ROSE_BLUE
  return null
}

export default function CrushNote() {
  const urlName = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    const raw = params.get('name')?.trim()
    return raw && raw.length > 0 ? raw : DEFAULT_NAME
  }, [])

  const messages = useMemo(() => makeMessages(urlName), [urlName])

  const urlAka = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    const raw = params.get('aka')?.trim()
    return raw && raw.length > 0 ? raw : DEFAULT_AKA
  }, [])

  const slides = totalSlides(messages)

  useEffect(() => {
    STICKER_URLS.forEach(url => { const img = new Image(); (img as any).decoding='async'; img.src = url })
  }, [])

  const urlDurations = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('dur') ?? params.get('durations')
  }, [])
  const durations = useMemo(() => parseDurationsParam(urlDurations, messages.length, DEFAULT_SLIDE_MS, DURATIONS_MS_DEFAULT), [urlDurations, messages.length])

  const introMs = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    const s = params.get('intro'); const n = s ? Number(s) : NaN
    if (!Number.isFinite(n)) return INTRO_MS_DEFAULT
    return Math.max(500, Math.round(n*1000))
  }, [])

  const [showIntro, setShowIntro] = useState(true)
  const [index, setIndex] = useState(0)
  const timerRef = useRef<number | null>(null)

  const isFinal = (i: number) => isFinalIndex(i, messages)
  const restart = () => { setIndex(0); setShowIntro(false) }

  useEffect(() => {
    if (showIntro) {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => setShowIntro(false), introMs)
      return () => { if (timerRef.current) window.clearTimeout(timerRef.current) }
    }
    if (isFinal(index)) return () => {}
    if (timerRef.current) window.clearTimeout(timerRef.current)
    const ms = durations[index] ?? DEFAULT_SLIDE_MS
    timerRef.current = window.setTimeout(() => {
      setIndex(i => {
        const next = i + 1
        if (next >= slides) {
          if (timerRef.current) window.clearTimeout(timerRef.current)
          return messages.length
        }
        return next
      })
    }, ms)
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current) }
  }, [showIntro, index, slides, messages.length, durations, introMs])

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-100 flex items-center justify-center p-6">
      <HeartsBackground />
      <main
        className="relative z-10 w-full max-w-3xl flex flex-col items-center gap-6 select-none"
        onClick={() => { if (isFinal(index)) restart() }}
        role={isFinal(index) ? 'button' : undefined}
        aria-label={isFinal(index) ? 'Replay messages' : undefined}
        tabIndex={0}
        onKeyDown={(e) => { if (isFinal(index) && (e.key === 'Enter' || e.key === ' ')) restart() }}
      >
        <AnimatePresence mode="wait">
          {showIntro ? (
            <motion.div key="intro" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.4 }} className="flex flex-col items-center gap-4">
              <motion.img src={HI_GIF_URL} alt="hello" className="w-40 md:w-52 select-none" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }} draggable={false} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
            </motion.div>
          ) : isFinal(index) ? (
            <motion.div key="final" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.45 }} className="flex flex-col items-center gap-4">
              <p className="text-center text-2xl md:text-4xl leading-relaxed md:leading-snug font-semibold text-rose-800 drop-shadow-sm">I promise to keep you smiling ...</p>
              <RoseOffer className="w-40 md:w-56" />
              <p className="text-rose-700 text-sm md:text-base animate-pulse">tap/click to watch again ↺</p>
            </motion.div>
          ) : (
            <motion.div key={`slide-${index}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.7, ease: 'easeOut' }} className="relative flex flex-col items-center">
              <motion.p key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.7, ease: 'easeOut' }} className="text-center text-2xl md:text-4xl leading-relaxed md:leading-snug font-semibold text-rose-800 drop-shadow-sm whitespace-pre-line">{messages[index]}</motion.p>
              {index === 0 && (
                <motion.p key="aka-line" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.35 }} className="mt-1 text-center text-sm md:text-base text-rose-600/90">
                  a.k.a <span className="font-medium">{urlAka}</span>
                </motion.p>
              )}
              <KawaiiSticker idx={index} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <style>{`
        @keyframes floatUp { 0% { transform: translateY(0) scale(1); opacity: 0.9; } 100% { transform: translateY(-120vh) scale(1.2); opacity: 0; } }
        @keyframes sway { 0% { transform: rotate(-2deg) translateY(0); } 50% { transform: rotate(2deg) translateY(-2px); } 100% { transform: rotate(-2deg) translateY(0); } }
        @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  )
}

function RoseOffer({ className = "" }: { className?: string }) {
  if (ROSE_GIF_URL && ROSE_GIF_URL.trim().length > 0) {
    return <img src={ROSE_GIF_URL} alt="A cute rose being offered" className={className} style={{ animation: 'sway 3.2s ease-in-out infinite' }} loading="lazy" draggable={false} onError={(e) => { (e.currentTarget as HTMLImageElement).src = KAWAII_ROSE_RED }} />
  }
  return <div className={className + ' text-4xl'}>🌹</div>
}

function KawaiiSticker({ idx }: { idx: number }) {
  const src = stickerForIndex(idx)
  let alt = ''
  if (src === KAWAII_HUGS) alt = 'cute hugs'
  else if (src === KAWAII_PEEK) alt = 'peeking kitty'
  else if (src === KAWAII_ROSE_RED) alt = 'bouquet of red roses'
  else if (src === KAWAII_ROSE_BLUE) alt = 'bouquet of blue roses'
  else if (src === KAWAII_HEART_BUCKET) alt = 'bucket of hearts'
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { setLoaded(false) }, [src])
  if (!src) return null
  return <motion.img key={src + idx} src={src} alt={alt} className="mt-2 w-40 md:w-52 select-none" initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 10, scale: loaded ? 1 : 0.98 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} transition={{ duration: 0.7, ease: 'easeOut' }} draggable={false} decoding="async" onLoad={() => setLoaded(true)} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
}

function HeartsBackground() {
  const HEARTS = 24
  const nodes = Array.from({ length: HEARTS })
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {nodes.map((_, i) => {
        const left = Math.random() * 100
        const delay = Math.random() * 10
        const duration = 12 + Math.random() * 12
        const size = 14 + Math.random() * 24
        const opacity = 0.18 + Math.random() * 0.35
        return (
          <Heart key={i} className="absolute text-rose-400" style={{ left: `${left}%`, bottom: `-${size}px`, width: size, height: size, opacity, animation: `floatUp ${duration}s linear ${delay}s infinite` }} />
        )
      })}
    </div>
  )
}
