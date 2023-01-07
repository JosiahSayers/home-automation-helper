import { getApp } from './app';
import { environment } from './utils/environment';

process.on('uncaughtException', (e) =>
  console.error(e, { msg: 'uncaughtException' })
);

getApp()
  .then((app) => {
    app.listen(environment.port(), () => {
      console.info(`App is listening on port ${environment.port()}`);
    });
  })
  .catch((e) => console.error(e, { msg: 'getApp promise error' }));
