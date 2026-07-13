'use client'

// Tiny WebAudio sound engine - all effects are synthesized, no audio files needed.

let ctx = null

function ac() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone({ from = 440, to = from, dur = 0.15, type = 'square', vol = 0.12, delay = 0 }) {
  const a = ac()
  if (!a) return
  const t0 = a.currentTime + delay
  const osc = a.createOscillator()
  const gain = a.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(from, t0)
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + dur)
  gain.gain.setValueAtTime(vol, t0)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(gain)
  gain.connect(a.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

export const sfx = {
  jump() {
    tone({ from: 260, to: 520, dur: 0.14, type: 'square', vol: 0.08 })
  },
  land() {
    tone({ from: 180, to: 90, dur: 0.08, type: 'triangle', vol: 0.08 })
  },
  coin() {
    tone({ from: 880, to: 880, dur: 0.07, type: 'square', vol: 0.07 })
    tone({ from: 1320, to: 1320, dur: 0.18, type: 'square', vol: 0.07, delay: 0.07 })
  },
  checkpoint() {
    tone({ from: 523, to: 523, dur: 0.1, type: 'triangle', vol: 0.1 })
    tone({ from: 784, to: 784, dur: 0.22, type: 'triangle', vol: 0.1, delay: 0.1 })
  },
  death() {
    tone({ from: 300, to: 60, dur: 0.4, type: 'sawtooth', vol: 0.09 })
  },
  win() {
    tone({ from: 523, to: 523, dur: 0.14, type: 'square', vol: 0.09 })
    tone({ from: 659, to: 659, dur: 0.14, type: 'square', vol: 0.09, delay: 0.14 })
    tone({ from: 784, to: 784, dur: 0.14, type: 'square', vol: 0.09, delay: 0.28 })
    tone({ from: 1047, to: 1047, dur: 0.4, type: 'square', vol: 0.1, delay: 0.42 })
  },
}
