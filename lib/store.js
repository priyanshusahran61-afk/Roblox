'use client'

import { create } from 'zustand'
import { sfx } from './sfx'

// Mutable input object for mobile joystick / jump button.
// Written by the HUD, read by the player every frame (no re-renders).
export const mobileInput = { x: 0, y: 0, jump: false }

export const DEFAULT_SPAWN = [0, 4, 0]

export const useGame = create((set, get) => ({
  stage: 'menu', // 'menu' | 'playing' | 'won'
  coins: 0,
  totalCoins: 0,
  collected: {},
  deaths: 0,
  checkpoint: DEFAULT_SPAWN,
  activeCheckpoint: -1,
  respawnTick: 0,
  startTime: 0,
  endTime: 0,

  start: () =>
    set((s) => ({
      stage: 'playing',
      coins: 0,
      collected: {},
      deaths: 0,
      checkpoint: DEFAULT_SPAWN,
      activeCheckpoint: -1,
      startTime: Date.now(),
      endTime: 0,
      respawnTick: s.respawnTick + 1,
    })),

  win: () => {
    if (get().stage !== 'playing') return
    sfx.win()
    set({ stage: 'won', endTime: Date.now() })
  },

  die: () => {
    if (get().stage !== 'playing') return
    sfx.death()
    set((s) => ({ deaths: s.deaths + 1, respawnTick: s.respawnTick + 1 }))
  },

  setCheckpoint: (id, pos) => {
    if (get().activeCheckpoint >= id) return
    sfx.checkpoint()
    set({ activeCheckpoint: id, checkpoint: pos })
  },

  collect: (id) => {
    const s = get()
    if (s.collected[id] || s.stage !== 'playing') return
    sfx.coin()
    set({ coins: s.coins + 1, collected: { ...s.collected, [id]: true } })
  },

  registerCoins: (n) => set({ totalCoins: n }),
}))
