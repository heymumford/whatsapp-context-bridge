import { composeApplication } from './composition-root.js';
import { createConfig, loadHomeEnvironment } from './config/load-home-env.js';

const config = createConfig(loadHomeEnvironment());
const { server } = composeApplication(config);

server.listen(config.port, '127.0.0.1', () => {
  console.info(`WhatsApp Context Bridge listening on http://127.0.0.1:${String(config.port)}`);
});
