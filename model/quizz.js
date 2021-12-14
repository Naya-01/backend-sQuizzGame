//const { parse, serialize } = require("../utils/json");
var escape = require("escape-html");
const db = require('../db');

const { Questions } = require("../model/questions");
const questionModel = new Questions();

const { Answers } = require("../model/answers");
const answerModel = new Answers();



class Quizz {

    async isLike(id_quizz,id_user){
        if(id_quizz===undefined || id_user===undefined)return;

        const res = await db.query('SELECT * FROM likes WHERE id_quizz=$1 AND id_user=$2',[id_quizz,id_user]);
        let like;
        if(res.rows[0]){
            like={
                isLiked:true
            };
        }else{
            like={
                isLiked:false
            };
        }
        return like;
    }

    async unlike(body){
        const res = await db.query('SELECT * FROM likes WHERE id_quizz=$1 AND id_user=$2',[body.id_quizz,body.id_user]);
        if(!res.rows[0])return;

        const req = 'DELETE FROM likes WHERE id_quizz = $1 AND id_user = $2;';
        const data = [body.id_quizz, body.id_user];
        let {rows} = await db.query(req,data);

        const newLike={
            id_quizz: body.id_quizz,
            id_user: body.id_user
        };

        return newLike;
    }

    async like(body){// id_quizz,id_user
        const res = await db.query('SELECT * FROM likes WHERE id_quizz=$1 AND id_user=$2',[body.id_quizz,body.id_user]);
        if(res.rows[0])return;

        const req = 'INSERT INTO likes (id_user,id_quizz) VALUES ($1,$2);';
        const data = [body.id_user, body.id_quizz];
        let {rows} = await db.query(req,data);

        const newLike={
            id_quizz: body.id_quizz,
            id_user: body.id_user
        };

        return newLike;
    }

    async getQuizzById(id) {
        const { rows } = await db.query('SELECT q.*, u.name as "username" FROM quizz q, users u WHERE q.id_creator = u.id_user AND q.id_quizz = $1 AND q.is_deleted=false', [id]);
        if(!rows) return false;
        return rows[0];
    }

    async getQuizzByUser(id){
        const { rows } = await db.query('SELECT q.* FROM quizz q WHERE q.id_creator = $1 AND q.is_deleted=false', [id]);
        if(!rows) return false;
        return rows;
    }

    async getAllQuizz(){
        const { rows } = await db.query('SELECT q.*,u.name as user_name FROM quizz q, users u WHERE is_deleted=false AND q.id_creator = u.id_user');
        if(!rows) return false;
        return rows;
    }
    async getQuizzExplorer(){
        const { rows } = await db.query('SELECT q.*,u.name as user_name, random() FROM quizz q, users u WHERE is_deleted=false AND q.id_creator = u.id_user ORDER BY random() LIMIT 9');
        if(!rows) return false;
        return rows;
    }
    async getQuizzByCritere(critere){
        const { rows } = await db.query(`SELECT DISTINCT q.*,u.name as user_name FROM quizz q, users u WHERE is_deleted=false AND q.id_creator = u.id_user AND ((lower(u.name) LIKE lower('%${critere}%')) OR (lower(q.name) LIKE lower('%${critere}%'))) ORDER BY q.name;`);
        if(!rows) return false;
        return rows;
    }

    async getQuizzAbonnements(id){
        const { rows } = await db.query('SELECT DISTINCT q.*,u.name as user_name FROM quizz q, users u, subscribers s WHERE s.id_follower = $1 AND is_deleted=false AND q.id_creator = s.id_user AND u.id_user = s.id_user ORDER BY q.date DESC LIMIT 6',[id]);
        if(!rows) return false;
        return rows;
    }

    async getQuizzByEmail(email){
        const { rows } = await db.query('SELECT q.* FROM quizz q, users u WHERE u.id_user = q.id_creator AND u.email=$1 AND q.is_deleted=false',[email]);
        if(!rows) return false;
        return rows;
    }

    // TODO : a tester quand la db sera peuplée
    async get6MoreLikedQuizz(){
        const { rows } = await db.query('SELECT q.*, u.name as user_name  FROM quizz q, users u WHERE q.is_deleted=false AND q.id_creator = u.id_user AND q.id_quizz IN (SELECT l.id_quizz FROM likes l GROUP BY l.id_quizz ORDER BY count(l.id_quizz) LIMIT 6)');
        if(!rows) return false;
        return rows;
    }
    async getNbLikes(id_quizz){
        const { rows } = await db.query('SELECT count(l.*) AS nblikes FROM quizz q, likes l WHERE q.id_quizz = $1 AND q.id_quizz = l.id_quizz',[id_quizz]);
        if(!rows) return false;
        return rows;
    }

    async deleteQuizz(id_quizz){
        //TODO : tester que le quizz existe et qu'il est pas déjà deleted
        const { rows } = await db.query('UPDATE quizz SET is_deleted=true WHERE id_quizz = $1',[id_quizz]);
        if(!rows) return false;
        return true;
    }

    async addQuizz(body){
        let name = escape(body.name);
        const { rows } = await db.query('INSERT INTO quizz (name, id_creator, description) VALUES ( $1, $2, $3) RETURNING id_quizz', [name, body.id_creator, body.description]);
        if(!rows) return false;
        let id_quizz = rows[0].id_quizz; // to get id_quizz
        for(let i =0; i < body.questions.length; i++){
            //Add a question
            let newQuestion = { id_quizz: id_quizz,
                                question: body.questions[i].question,
            }
            let questionAdded = await questionModel.addOne(newQuestion);
            for(let j = 0; j < body.questions[i].answers.length; j++){
                //Add an answer
                let newAnswer = {
                    id_question: questionAdded.id_question,
                    answer: body.questions[i].answers[j].answer,
                    correct: body.questions[i].answers[j].correct
                }
                await answerModel.addOne(newAnswer);
            }
        }
        return rows;
    }
    
}
module.exports = { Quizz };