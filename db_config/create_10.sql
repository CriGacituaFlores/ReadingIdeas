-- change PK from a serial to a doble PK
alter table idea_association DROP PRIMARY KEY;
alter table idea_association ADD PRIMARY Key (id_source,id_target);

-- simplify to show a letter no id of de idea
create table idea_simplification (
    original_idea_id integer references ideas(id),
    iteration integer default 1,
    comment text,
    primary key(original_idea_id, iteration)
);
