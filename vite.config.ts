import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 3000번 포트는 개발자 전용이므로 5173(기본) 사용
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
