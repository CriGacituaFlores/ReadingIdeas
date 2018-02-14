create table if not exists user_personal_evaluation (
    id serial,
    min_name text not null,
    max_name text not null,
    description text,
    order_sort text,
    sesid integer,
    value integer,
    user_id integer,
    team_id integer,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    primary key(id),
    foreign key(sesid) references sessions(id),
    foreign key(user_id) references users(id),
    foreign key(team_id) references teams(id)
);