var escape = require("escape-html");
const db = require('../db');

class Participations {

    constructor() {

    }

    async addOneAnswer(body){// id_participation, id_answer
        const res = await db.query('SELECT * FROM participation_answers WHERE id_answer=$1 AND id_participation=$2',[body.id_answer,body.id_participation]);
        if(res.rows[0])return;

        const req = 'INSERT INTO participation_answers (id_answer,id_participation) VALUES ($1,$2) RETURNING id_participation_answer as id;';
        const data = [body.id_answer, body.id_participation];
        let {rows} = await db.query(req,data);

        const newAnswerParticipation={
            id_participation_answer: rows[0].id,
            id_answer: body.id_answer,
            id_participation: body.id_participation,
        };

        return newAnswerParticipation;
    }


    /**
     * Add an answer in the answers table and returns the added answer
     * @param {object} body - it contains all required data to create the answer
     * @returns {object} the answer that was created (with id)
     */
    async addOne(body) {
        const res = await db.query('SELECT coalesce(max(nb_try),0) as number FROM participations WHERE id_quizz=$1 AND id_user=$2',[body.id_quizz,body.id_user]);

        const req = 'INSERT INTO participations (id_quizz,id_user,nb_try,score,difficulty) VALUES ($1,$2,$3,$4,$5) RETURNING id_participation as id;';
        const data = [body.id_quizz, body.id_user, res.rows[0].number+1, body.score,body.difficulty];

        let {rows} = await db.query(req,data);

        const newParticipation={
            id_participation: rows[0].id,
            id_quizz: body.id_quizz,
            id_user: body.id_user,
            difficulty: body.difficulty,
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

    async getBestPersonalsScores(id_quizz,id_user){
        if(id_quizz===undefined,id_user===undefined){
            return false;
        }
        else{
            const { rows } = await db.query('SELECT p.score,p.difficulty FROM participations p WHERE p.id_quizz=$1 AND p.id_user = $2 ORDER BY p.id_participation DESC LIMIT 3',[id_quizz,id_user]);
            return rows;
        }
    }

    async getBestScores(id_quizz){
        if(id_quizz===undefined){
            return false;
        }
        else{
            const { rows } = await db.query('SELECT p.score,u.name,p.difficulty FROM participations p, users u WHERE p.id_quizz=$1 AND p.id_user = u.id_user ORDER BY p.score DESC LIMIT 3',[id_quizz]);
            return rows;
        }
    }

    // A continuer

}
module.exports = { Participations };