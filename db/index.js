const {Pool ,Client} = require('pg')
require('dotenv').config();
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    ssl:{
        rejectUnauthorized: false
    }
})
const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    ssl:{
        rejectUnauthorized: false
    }
})
client.connect()
    .then( () => console.log("Connected Successfuly on client"))
    .catch(e => console.log)
pool.connect()
    .then( () => console.log("Connected Successfuly on pool"))
    .catch(e => console.log)

module.exports = {
    query: (text, params) => pool.query(text, params),
}