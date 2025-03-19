// vite.config.js
import basicSsl from '@vitejs/plugin-basic-ssl'

export default {
  plugins: [
    basicSsl({
      /** name of certification */
      name: 'test',
      /** custom trust domains */
      domains: ['*.custom.com'],
      /** custom certification directory */
      certDir: '/Users/Angelika/.devServer/cert',
    }),
  ],

  server:{
    https: true,
    host: '0.0.0.0',
    port: 5174,
  }
}
