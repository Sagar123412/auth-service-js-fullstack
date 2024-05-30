import { Config } from './config';
import app from './app';

function startServer() {
  try {
    app.listen(Config.PORT, () => {
      console.log(`server is running on port ${Config.PORT}`);
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

startServer();
