create table users
(
    id_user  serial                not null
        constraint users_pk
            primary key,
    name     varchar(150)          not null,
    email    varchar(150)          not null,
    password char(60)              not null,
    banned   boolean default false not null,
    is_admin boolean default false not null
);

create table quizz
(
    id_quizz    serial                              not null
        constraint quizz_pk
            primary key,
    name        varchar(150)                        not null,
    id_creator  integer                             not null
        constraint quizz_id_creator_fkey
            references users,
    date        timestamp default CURRENT_TIMESTAMP not null,
    is_deleted  boolean   default false             not null,
    description text                                not null
);

create table likes
(
    id_user  integer not null
        constraint likes_id_user_fkey
            references users,
    id_quizz integer not null
        constraint likes_id_quizz_fkey
            references quizz,
    constraint likes_pkey
        primary key (id_user, id_quizz)
);

create table participations
(
    id_participation serial            not null
        constraint participations_pkey
            primary key,
    id_quizz         integer           not null
        constraint participations_id_quizz_fkey
            references quizz,
    id_user          integer           not null
        constraint participations_id_user_fkey
            references users,
    nb_try           integer default 0 not null,
    score            integer default 0 not null,
    difficulty       integer           not null,
    constraint u_constrainte
        unique (id_quizz, id_user, nb_try)
);

create table questions
(
    id_question serial       not null
        constraint questions_pkey
            primary key,
    id_quizz    integer      not null
        constraint questions_id_quizz_fkey
            references quizz,
    question    varchar(200) not null
);

create table answers
(
    id_answer   serial       not null
        constraint answers_pkey
            primary key,
    id_question integer
        constraint answers_id_question_fkey
            references questions,
    answer      varchar(200) not null,
    correct     boolean      not null
);

create table participation_answers
(
    id_participation_answer serial  not null,
    id_answer               integer not null
        constraint participation_answers_id_answer_fkey
            references answers,
    id_participation        integer not null
        constraint participation_answers_id_participation_fkey
            references participations,
    constraint participation_answers_pk
        primary key (id_answer, id_participation)
);

create table subscribers
(
    id_user     integer not null
        constraint subscribers_id_user_fkey
            references users,
    id_follower integer not null
        constraint subscribers_id_subscriber_fkey
            references users,
    constraint subscribers_pkey
        primary key (id_user, id_follower)
);

create unique index users_email_uindex
    on users (email);