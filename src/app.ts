import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('home route');
});

export default app;
