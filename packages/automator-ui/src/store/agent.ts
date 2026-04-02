import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AgentStore {
  /** Base URL of the local agent API, e.g. http://localhost:3000 */
  agentUrl: string
  /** Polling interval in milliseconds (0 = disabled) */
  pollInterval: number
  setAgentUrl: (url: string) => void
  setPollInterval: (ms: number) => void
}

export const useAgentStore = create<AgentStore>()(
  persist(
    (set) => ({
      agentUrl: '',
      pollInterval: 5000,
      setAgentUrl: (url) => set({ agentUrl: url.trim().replace(/\/$/, '') }),
      setPollInterval: (ms) => set({ pollInterval: ms }),
    }),
    { name: 'automator-agent-config' },
  ),
)
