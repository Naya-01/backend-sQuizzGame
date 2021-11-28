const {/*Pool ,*/Client} = require('pg')
/*const pool = new Pool({
    user: "pocjwlcpheuuan",
    password: "09dea9d47c30cc7904776bb70e94e844c571b2f146f7469e317edc38c99c5185",
    host: "ec2-18-202-67-49.eu-west-1.compute.amazonaws.com",
    port: 5432,
    database: "d8d940sjeafapl",
    ssl:{
        rejectUnauthorized: false
    }
})*/
const client = new Client({
    user: "pocjwlcpheuuan",
    password: "09dea9d47c30cc7904776bb70e94e844c571b2f146f7469e317edc38c99c5185",
    host: "ec2-18-202-67-49.eu-west-1.compute.amazonaws.com",
    port: 5432,
    database: "d8d940sjeafapl",
    ssl:{
        rejectUnauthorized: false
    }
})
client.connect()
    .then( () => console.log("Connected Successfuly"))
    .catch(e => console.log)
/*pool.connect()
    .then( () => console.log("Connected Successfuly on pool"))
    .catch(e => console.log)*/

module.exports = {
    query: (text, params) => client.query(text, params),
}