// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    base: '/tens10n/',   // riktig: bare pathen (med trailing slash)
    plugins: [react()]
})
