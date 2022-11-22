import { getApp } from './app';
import { environment } from './utils/environment';
import { logger } from './utils/logger';

process.on('uncaughtException', (e: any) => logger.error(e, { msg: 'uncaughtException' }));

getApp().then((app) => {
  app.listen(environment.port(), () => {
    logger.info(`App is listening on port ${environment.port()}`);
  });
}).catch(e => logger.error(e, { msg: 'getApp promise error' }));
