//const { parse, serialize } = require("../utils/json");
var escape = require("escape-html");
const db = require('../db')


class Quizz {
    async getQuizzById(id) {
        const { rows } = await db.query('SELECT q.* FROM quizz q WHERE q.id_quizz = $1', [id]);
        if(!rows) return false;
        return rows[0];
    }

    async getQuizzByUser(id){
        const { rows } = await db.query('SELECT q.* FROM quizz q WHERE q.id_creator = $1', [id]);
        if(!rows) return false;
        return rows;
    }

    async getAllQuizz(){
        const { rows } = await db.query('SELECT * FROM quizz');
        if(!rows) return false;
        return rows;
    }

    // TODO : a tester quand la db sera peuplée
    async get6MoreLikedQuizz(){
        const { rows } = await db.query('SELECT q.* FROM quizz q WHERE q.id_quizz IN (SELECT l.id_quizz FROM likes l GROUP BY l.id_quizz ORDER BY count(l.id_quizz) LIMIT 6)');
        if(!rows) return false;
        return rows;
    }

    //TODO : ajouter des questions
    async addQuizz(body){
        const { rows } = await db.query('INSERT INTO quizz (name, id_creator) VALUES ( $1, $2)', [escape(body.name), body.id_creator]);
        if(!rows) return false;
        return rows;
    }
    
}
module.exports = { Quizz };