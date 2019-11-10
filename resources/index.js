
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

app.get('/dashboard_adults/:km/:ip', async (req, res) => {
  CSVToJSON().fromFile(dashboard_adultos).then(async (sources) => {
    const geocode = await service.geocode(req.params.ip);
    const ratios = await service.getRatio({ lat: geocode.latitude, lng: geocode.longitude }, req.params.km * 1000);
    const finalResult = joinDashboardAndDatabase(sources, ratios, true);

    res.send(finalResult);
  });
});

app.get('/dashboard_kids/:km/:ip', async (req, res) => {
  CSVToJSON().fromFile(dashboard_kids).then(async (sources) => {
    const geocode = await service.geocode(req.params.ip);
    const ratios = await service.getRatio({ lat: geocode.latitude, lng: geocode.longitude }, req.params.km * 1000);
    const finalResult = joinDashboardAndDatabase(sources, ratios);

    res.send(finalResult);
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

  if (geocode.name == 'error')
    res.json({ success: false });

  res.json({ success: true, geocode });
});

app.get('/geocode/:ip/user/:id', async (req, res) => {
  const geocode = await service.updateUserGeocode(req.params.ip, req.params.id);

  if (geocode.name == 'error')
    res.json({ success: false });

  res.json({ success: true, geocode });
});

app.post('/ratio/:km', async (req, res) => {
  const ratio = await service.getRatio(req.body, req.params.km * 1000);

  if (ratio.name == 'error')
    res.json({ success: false });

  res.json({ success: true, ratio });
});

function joinDashboardAndDatabase(sources, ratios, adults = false) {
  let finalResult = [];

  for (ratio of ratios) {
    for (source of sources) {
      if (adults) {
        if (source.hospital.includes(ratio.name) || source.hospital.includes(ratio.initials)) {
          finalResult.push({ source, ...ratio });
        }
      } else {
        if (source.hospital_e_upas.includes(ratio.name) || source.hospital_e_upas.includes(ratio.initials)) {
          finalResult.push({ source, ...ratio });
        }
      }
    }
  }

  return finalResult;
}

app.listen(port, () => console.log(`G-SUS is listening on port ${port}!`));