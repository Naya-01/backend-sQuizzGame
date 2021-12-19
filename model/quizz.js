//const { parse, serialize } = require("../utils/json");
var escape = require("escape-html");
const db = require('../db');

const { Questions } = require("../model/questions");
const questionModel = new Questions();

const { Answers } = require("../model/answers");
const answerModel = new Answers();



class Quizz {

    /**
     * Savoir si un quizz est liké par un certain user
     * @param {*} id_quizz l'id du quizz
     * @param {*} id_user l'id de l'user
     * @returns un objet like 
     */
    async isLike(id_quizz,id_user){
        if(id_quizz===undefined || id_user===undefined)return;

        const res = await db.query('SELECT l.id_quizz, l.id_user \
                                    FROM likes l WHERE l.id_quizz=$1 AND l.id_user=$2',[id_quizz,id_user]);
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

    /**
     * Supprime un like à un quizz
     * @param {*} body l'id quizz et l'id_user
     * @returns un objet like 
     */
    async unlike(body){
        const res = await db.query('SELECT l.id_quizz, l.id_user \
                                    FROM likes l \
                                    WHERE l.id_quizz=$1 AND l.id_user=$2',[body.id_quizz,body.id_user]);
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

    /**
     * Ajouter un like à un quizz
     * @param {*} body l'id quizz et l'id_user
     * @returns un objet like
     */
    async like(body){
        const res = await db.query('SELECT l.id_quizz, l.id_user \
                                    FROM likes l \
                                    WHERE l.id_quizz=$1 AND l.id_user=$2',[body.id_quizz,body.id_user]);
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

    /**
     * Va chercher le quizz correspondant à l'id en paramètre
     * @param {*} id l'id du quizz
     * @returns le quizz ou false si il n'existe pas
     */
    async getQuizzById(id) {
        const { rows } = await db.query('SELECT q.id_quizz, q.name, q.id_creator, q.date, q.is_deleted, q.description, u.name as "username" \
                                         FROM quizz q, users u \
                                         WHERE q.id_creator = u.id_user AND q.id_quizz = $1 AND q.is_deleted=false AND u.banned = false', [id]);
        if(!rows) return false;
        return rows[0];
    }

    /**
     * Va chercher les quizz du créateur correspondant à l'id en paramètre
     * @param {*} id l'id du créateur
     * @returns les quizz du créateur ou false
     */
    async getQuizzByUser(id){
        const { rows } = await db.query('SELECT q.id_quizz, q.name, q.id_creator, q.date, q.is_deleted, q.description \
                                         FROM quizz q \
                                         WHERE q.id_creator = $1 AND q.is_deleted=false', [id]);
        if(!rows) return false;
        return rows;
    }

    /**
     * Va chercher 9 quizz aléatoire dans la db
     * @returns 9 quizz
     */
    async getQuizzExplorer(){
        const { rows } = await db.query('SELECT q.id_quizz, q.name, q.id_creator, q.date, q.is_deleted, q.description,u.name as user_name, random() \
                                         FROM quizz q, users u \
                                         WHERE is_deleted=false AND q.id_creator = u.id_user AND u.banned=false \
                                         ORDER BY random() LIMIT 9');
        if(!rows) return false;
        return rows;
    }

    /**
     * Va chercher les quizz qui ont le critere qui apparait dans le nom ou l'auteur de celui-ci
     * @param {*} critere ce que l'user veut rechercher
     * @returns les quizz correspondant au critere ou false
     */
    async getQuizzByCritere(critere){
        const { rows } = await db.query(`SELECT DISTINCT q.id_quizz, q.name, q.id_creator, q.date, q.is_deleted, q.description,u.name as user_name \ 
                                         FROM quizz q, users u \
                                         WHERE is_deleted=false AND q.id_creator = u.id_user \
                                         AND ((lower(u.name) LIKE lower('%${critere}%')) OR (lower(q.name) LIKE lower('%${critere}%'))) AND u.banned=false ORDER BY q.name;`);
        if(!rows) return false;
        return rows;
    }

    /**
     * Va chercher les quizz en abonnements de l'user qui a pour id le parametre
     * @param {*} id id de l'user
     * @returns les quizz en abonnements ou false
     */
    async getQuizzAbonnements(id){
        const { rows } = await db.query('SELECT DISTINCT q.id_quizz, q.name, q.id_creator, q.date, q.is_deleted, q.description,u.name as user_name \
                                         FROM quizz q, users u, subscribers s \
                                         WHERE s.id_follower = $1 AND is_deleted=false AND q.id_creator = s.id_user AND u.id_user = s.id_user  AND u.banned=false \
                                         ORDER BY q.date DESC LIMIT 6',[id]);
        if(!rows) return false;
        return rows;
    }

    /**
     * Va chercher les quizz d'un user qui a pour email le parametre
     * @param {*} email email de l'user
     * @returns les quizz de l'user ou false
     */
    async getQuizzByEmail(email){
        const { rows } = await db.query('SELECT q.id_quizz, q.name, q.id_creator, q.date, q.is_deleted, q.description \
                                         FROM quizz q, users u \
                                         WHERE u.id_user = q.id_creator AND u.email=$1 AND q.is_deleted=false',[email]);
        if(!rows) return false;
        return rows;
    }

    /**
     * Va chercher les 6 quizz les plus likés
     * @returns 6 quizz les plus likés ou false
     */
    async get6MoreLikedQuizz(){
        const { rows } = await db.query('SELECT q.id_quizz, q.name, q.id_creator, q.date, q.is_deleted, q.description, u.name as user_name  \
                                         FROM quizz q, users u \
                                         WHERE u.banned=false AND q.is_deleted=false AND q.id_creator = u.id_user \
                                         AND q.id_quizz IN (SELECT l.id_quizz FROM likes l GROUP BY l.id_quizz ORDER BY count(l.id_quizz) LIMIT 6)');
        if(!rows) return false;
        return rows;
    }
    /**
     * Va chercher le nombre de like d'un quizz dont l'id est en paramètre
     * @param {*} id_quizz l'id du quizz
     * @returns les likes du quizz ou false
     */
    async getNbLikes(id_quizz){
        const { rows } = await db.query('SELECT count(l.*) AS nblikes \
                                         FROM quizz q, likes l \
                                         WHERE q.id_quizz = $1 AND q.id_quizz = l.id_quizz',[id_quizz]);
        if(!rows) return false;
        return rows;
    }

    /**
     * Va supprimer le quizz dont l'id est en paramètre
     * @param {*} id_quizz l'id du quizz 
     * @returns true si il a été supprimé ou false
     */
    async deleteQuizz(id_quizz){
        const { rows } = await db.query('UPDATE quizz SET is_deleted=true WHERE id_quizz = $1',[id_quizz]);
        if(!rows) return false;
        
        return true;
    }

    /**
     * Ajoute un quizz à la db
     * @param {*} body tous les composants d'un quizz
     * @returns l'id du nouveau quizz
     */
    async addQuizz(body){
        let name = escape(body.name);
        let description = escape(body.description);
        const { rows } = await db.query('INSERT INTO quizz (name, id_creator, description) VALUES ( $1, $2, $3) RETURNING id_quizz', [name, body.id_creator, description]);
        if(!rows) return false;
        let id_quizz = rows[0].id_quizz; // On récupère id_quizz
        for(let i =0; i < body.questions.length; i++){
            // On ajoute une question
            let newQuestion = { id_quizz: id_quizz,
                                question: body.questions[i].question,
            }
            let questionAdded = await questionModel.addOne(newQuestion);
            for(let j = 0; j < body.questions[i].answers.length; j++){
                // On ajoute une answer
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