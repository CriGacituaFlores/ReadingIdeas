
alter table teams add column progress integer default 0;

create table idea_association (
    id serial,
    id_source integer references ideas(id),
    id_target integer references ideas(id),
    sesid integer references sessions(id),
    iteration integer default 1,
    uid integer references users(id),
    stime timestamp,
    comment text,
    team integer references teams(id) default null,
    primary key(id)
);

