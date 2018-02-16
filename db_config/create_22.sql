create table if not exists session_final_response (
    id serial,
    user_id integer,
    session_id integer,
    team_id integer,
    response text,
    primary key(id),
    foreign key(session_id) references sessions(id),
    foreign key(user_id) references users(id),
    foreign key(team_id) references teams(id)
);