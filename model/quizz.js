const { parse, serialize } = require("../utils/json");
var escape = require("escape-html");
const db = require('../db')


class Quizz {
    async getQuizzById(id, res) {
        await db.query('SELECT q.* FROM quizz q WHERE q.id_quizz = '+id, (err, result) => {
            if (err) {
                return err
            }
            res.send(result.rows);
        })
    }

    async getAllQuizz(res){
        await db.query('SELECT * FROM quizz', (err, result) => {
            if (err) {
                return err
            }
            res.send(result.rows);
        })
    }

    // TODO : a tester quand la db sera peuplée
    async get5MoreLikedQuizz(res){
        await db.query('SELECT q.* FROM quizz q WHERE q.id_quizz IN (SELECT l.id_quizz FROM likes l GROUP BY l.id_quizz ORDER BY count(l.id_quizz) LIMIT 5) ', (err, result) => {
            if (err) {
                return err
            }
            res.send(result.rows);
        })
    }
    
}
module.exports = { Quizz };