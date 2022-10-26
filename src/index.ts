import { getApp } from './app';
import { environment } from './utils/environment';

try {
  getApp().then((app) => {
    app.listen(environment.port(), () => {
      console.log(`App is listening on port ${environment.port()}`);
    });
  }).catch(e => console.error(e));
} catch (e) {
  console.error(e);
}
