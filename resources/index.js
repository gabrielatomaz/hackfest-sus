
const express = require('express');
const service = require('../services/index.service');
const app = express();
const port = 3000;
const dashboard_adultos = 'dashboard_adultos.csv';
const dashboard_kids = 'dashboard_criancas.csv';
const CSVToJSON = require("csvtojson");
const cors = require('cors');

app.use(cors())
app.use(express.json());

app.get('/dashboard_adults', (req, res) => {
  CSVToJSON().fromFile(dashboard_adultos).then(source => {
    res.send(source);
  });
});

app.get('/dashboard_kids', (req, res) => {
  CSVToJSON().fromFile(dashboard_kids).then(source => {
    res.send(source);
  });
});

app.post('/register', async (req, res) => {
  const user = await service.store(req.body);

  if (user.name == 'error')
    res.json({ success: false });

  res.json({ success: true, user });
});

app.post('/login', async (req, res) => {
  const user = await service.login(req.body);

  if (Object.keys(user).length === 0)
    res.json({ success: false });

  res.json({ success: true, user });
});

app.get('/hospitals', async (req, res) => {
  const hospitals = await service.hospitals();

  if (hospitals.name == 'error')
    res.json({ success: false });

  res.json({ success: true, hospitals });
});

app.post('/rating', async (req, res) => {
  const rating = await service.rating(req.body);

  if (rating.name == 'error')
    res.json({ success: false });

  res.json({ success: true, rating });
});

app.get('/rating/:hospital_id', async (req, res) => {
  const ratings = await service.getRatings(req.params.hospital_id);

  if (ratings.name == 'error')
    res.json({ success: false });

  res.json({ success: true, ratings });
});

app.get('/geocode/:ip', async (req, res) => {
  const geocode = await service.geocode(req.params.ip);
  res.json({ success: true, geocode });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));