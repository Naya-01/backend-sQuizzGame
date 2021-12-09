// A faire
// Ajouter une participation (réponse choisie vis à vis d'un id_answers)
// Créer le bail tout ça tout ça bg
// Oublie pas la route aussi et les requires tout ça tout ça
// Et oublie pas les requêtes -> participations.http



var escape = require("escape-html");
const db = require('../db');

class Participations {

    constructor() {

    }


    /**
     * Add an answer in the answers table and returns the added answer
     * @param {object} body - it contains all required data to create the answer
     * @returns {object} the answer that was created (with id)
     */
    async addOne(body) {
        const res = await db.query('SELECT coalesce(max(nb_try),0) as number FROM participations WHERE id_quizz=$1 AND id_user=$2',[body.id_quizz,body.id_user]);

        const req = 'INSERT INTO participations (id_quizz,id_user,nb_try,score) VALUES ($1,$2,$3,$4) RETURNING id_participation as id;';
        const data = [body.id_quizz, body.id_user, res.rows[0].number+1, body.score];

        let {rows} = await db.query(req,data);

        const newParticipation={
            id_participation: rows[0].id,
            id_quizz: body.id_quizz,
            id_user: body.id_user,
            nb_try: res.rows[0].number+1,
            score: body.score
        };

        return newParticipation;
    }

    /**
     * Returns null without answers
     * Returns the answers of a specific question and participation
     * @param {id_question} id of the question
     * @returns {Array} Array of answers
     */
    async getAllParticipations(id_quizz,id_user,nb_try) {
        if(id_quizz===undefined || id_user === undefined || nb_try === undefined){
            return false;
        }
        else{
            const { rows } = await db.query(('SELECT a.* FROM answers a,participations_answers pa, participations p WHERE p.id_participation = pa.id_participation AND p.id_quizz = $1 AND p.id_user = $2 AND p.nb_try = $3 AND a.id_answer = pa.id_answer ORDER BY a.id_question'),[id_quizz,id_user,nb_try]);
            return rows;
        }
    }

    async getScore(id_quizz,id_user,nb_try) {
        if(id_participation===undefined || nb_try === undefined){
            return false;
        }
        else{
            const { rows } = await db.query('SELECT p.score FROM participations p WHERE p.id_participation = $1 AND p.nb_try = $2',[id_participation,nb_try]);
            return rows[0];
        }
    }

    async getBestScores(id_quizz){
        if(id_quizz===undefined){
            return false;
        }
        else{
            const { rows } = await db.query('SELECT p.score,u.name FROM participations p, users u WHERE p.id_quizz=$1 AND p.id_user = u.id_user ORDER BY p.score DESC LIMIT 3',[id_quizz]);
            return rows;
        }
    }

    // A continuer

}
module.exports = { Participations };