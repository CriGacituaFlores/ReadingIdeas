create table question_text(
    id serial,
    sesid integer references sessions(id),
    title text,
    content text
);

alter table questions add column textid integer default null;
alter table ideas add column orden integer default null;