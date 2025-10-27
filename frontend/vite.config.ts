import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    base: 'https://palfos23.github.io/tens10n/',   // <- bruk ditt repo-navn her
    plugins: [react()]
})
