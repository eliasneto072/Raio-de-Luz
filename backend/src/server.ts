import { createApp } from './app';
import { env } from './config/env';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`
  🌟 Raio de Luz API
  ✦ Rodando em http://localhost:${env.PORT}
  ✦ Ambiente: ${env.NODE_ENV}
  `);
});