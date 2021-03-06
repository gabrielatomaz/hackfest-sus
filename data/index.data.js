
const { pool } = require('../config');

module.exports = {
    async store(user) {
        let addressRest = null;
        if (!(user.address === undefined)) {
            addressRest = await pool.query(`
            INSERT INTO address(lat, lng) VALUES('${user.address.lat}', '${user.address.lng}') RETURNING *
        `);
        }
        const rest = !(user.address === undefined) ? await pool.query(`
            INSERT INTO user_account(email, password, address_id, birth, token) 
                VALUES(
                    '${user.email}',
                    '${user.password}',
                    ${addressRest.rows[0].id}, 
                    '${user.birth}',
                    '${user.token}')
                    RETURNING *`
        ) : await pool.query(`
        INSERT INTO user_account(email, password, birth, token) 
            VALUES(
                '${user.email}',
                '${user.password}', 
                '${user.birth}',
                '${user.token}')
                RETURNING *`
        );

        return rest.rows[0];
    },
    async login(user) {
        const rest = await pool.query(`
        SELECT u.token FROM user_account AS u WHERE email = '${user.email}' AND password = '${user.password}'`
        );

        return rest.rows[0];
    },
    async hospitals() {
        const rest = await pool.query(`
        SELECT h.id AS hospital_id, h.name, h.address_id, a.lng, a.lat FROM hospital h
        JOIN address a ON a.id = h.address_id
        `);

        return rest.rows;
    },
    async rating(rating) {
        const rest = await pool.query(`
        INSERT INTO rating(commentary, rate, hospital_id, user_id, rating_type_id) 
        VALUES('${rating.commentary}', ${rating.rate}, ${rating.hospital_id}, ${rating.user_id}, ${rating.rating_type_id})
                RETURNING *`
        );

        return rest.rows[0];
    },
    async getRatings(hospital_id) {
        const rest = await pool.query(`
        SELECT r.commentary, r.rate, r.created_at, r.hospital_id, h.name, u.email hospital_name, u.document_id, d."number" document_number FROM rating r
        JOIN user_account u ON u.id = r.user_id
        JOIN hospital h ON h.id = r.hospital_id
        JOIN "document" d ON d.id = u.document_id 
        WHERE r.hospital_id = ${hospital_id}`
        );

        return rest.rows[0];
    },
    async updateUserGeocode(address_id, user_id) {
        const rest = await pool.query(` UPDATE user_account SET address_id = ${address_id} WHERE id = ${user_id} RETURNING *`);

        return rest.rows[0];
    },
    async insertGeocode(geocode) {
        const rest = await pool.query(`
        INSERT INTO address(lat, lng, address) VALUES('${geocode.latitude}', '${geocode.longitude}', '${geocode.address}')
                RETURNING *`
        );

        return rest.rows[0];
    },
    async getRatio(user_distance, km) {
        const addresses = await getAllAddress();
        var distances = [];

        for (address of addresses) {
            const calcRatio = await calculateRatio(user_distance, { lat: address.lat, lng: address.lng });
            distances.push({ ...address, distance: calcRatio.calculate_distance });
        }

        return distances.filter(isBigEnough(km)).sort(function (a, b) {
            return a.rate - b.rate;
        }).reverse();
    }
}

function isBigEnough(value) {
    return function (element, index, array) {
        return (element.distance <= value);
    }
}

async function getAllAddress() {
    const rest = await pool.query(`
    SELECT a.lat, a.lng, a.address, h.address_id, 
    h.rate, h.phone, h.name, h.photo, h.initials FROM address a
    JOIN hospital h ON h.address_id = a.id`
    );

    return rest.rows;
}

async function calculateRatio(user_distance, distance) {
    const rest = await pool.query(`
    SELECT calculate_distance(${user_distance.lat}, ${user_distance.lng}, ${distance.lat}, ${distance.lng})`
    );

    return rest.rows[0];
}