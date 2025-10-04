import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Change this to '/<your-repo-name>/' BEFORE building for GitHub Pages.
export default defineConfig({
  plugins: [react()],
  base: '/special-message/', // <-- set to '/<repo>/' for GitHub Pages
})
