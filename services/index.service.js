const data = require('../data/index.data');
const jwt = require('jsonwebtoken');
var axios = require('axios')
const KEY = 'HACKFEST';
const API_KEY = '29aa31d5f36b4917a7dfd3ea5949f9bf';

module.exports = {
    async store(user) {
        try {
            const token = jwt.sign(user, KEY);
            user = { ...user, token };
            const result = await data.store(user);

            return result;
        } catch (err) {
            return err;
        }
    },
    async login(user) {
        try {
            const result = await data.login(user);
            const verify = jwt.verify(result.token, KEY);

            return verify;
        } catch (err) {
            return err;
        }
    },
    async hospitals() {
        try {
            const result = await data.hospitals();

            return result;
        } catch (err) {
            return err;
        }
    },
    async rating(rating) {
        try {
            const result = await data.rating(rating);

            return result;
        } catch (err) {
            return err;
        }
    },
    async getRatings(hospital_id) {
        try {
            const result = await data.getRatings(hospital_id);

            return result;
        } catch (err) {
            return err;
        }
    },
    async geocode(ip) {
        const request = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${API_KEY}&ip=${ip}`);
        return request.data;
    }
}