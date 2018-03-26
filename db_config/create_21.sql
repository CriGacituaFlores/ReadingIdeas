create table if not exists first_iteration_group (
  id serial,
  min_name text not null,
  max_name text not null,
  description text,
  order_sort text,
  sesid integer,
  value integer,
  user_id integer,
  team_id integer,
  semantic_differential_id integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  primary key(id),
  foreign key(sesid) references sessions(id),
  foreign key(user_id) references users(id),
  foreign key(semantic_differential_id) references semantic_differential(id),
  foreign key(team_id) references teams(id)
);

create table if not exists second_iteration_group (
    id serial,
    min_name text not null,
    max_name text not null,
    description text,
    order_sort text,
    sesid integer,
    value integer,
    user_id integer,
    team_id integer,
    semantic_differential_id integer,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    primary key(id),
    foreign key(sesid) references sessions(id),
    foreign key(user_id) references users(id),
    foreign key(semantic_differential_id) references semantic_differential(id),
    foreign key(team_id) references teams(id)
);

create table if not exists third_iteration_group (
    id serial,
    min_name text not null,
    max_name text not null,
    description text,
    order_sort text,
    sesid integer,
    value integer,
    user_id integer,
    team_id integer,
    semantic_differential_id integer,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    primary key(id),
    foreign key(sesid) references sessions(id),
    foreign key(user_id) references users(id),
    foreign key(semantic_differential_id) references semantic_differential(id),
    foreign key(team_id) references teams(id)
);

create table if not exists first_iteration_personal_evaluation (
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

create table if not exists second_iteration_personal_evaluation (
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

create table if not exists third_iteration_personal_evaluation (
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

create table if not exists first_iteration_comments (
  id serial,
  team_id integer,
  user_id integer,
  comment text,
  session_id integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  primary key(id),
  foreign key(session_id) references sessions(id),
  foreign key(user_id) references users(id),
  foreign key(team_id) references teams(id)
);

create table if not exists second_iteration_comments (
  id serial,
  team_id integer,
  user_id integer,
  comment text,
  session_id integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  primary key(id),
  foreign key(session_id) references sessions(id),
  foreign key(user_id) references users(id),
  foreign key(team_id) references teams(id)
);

create table if not exists final_response_user (
  id serial,
  user_id integer,
  team_id integer,
  session_id integer,
  option_value text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  primary key(id),
  foreign key(session_id) references sessions(id),
  foreign key(user_id) references users(id),
  foreign key(team_id) references teams(id)
);

create table if not exists session_iteration (
    id serial
    first_time boolean default false,
    second_time boolean default false,
    user_id integer,
    session_id integer,
    team_id integer,
    primary key(id),
    foreign key(session_id) references sessions(id),
    foreign key(user_id) references users(id),
    foreign key(team_id) references teams(id)
);