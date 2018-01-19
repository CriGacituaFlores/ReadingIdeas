create table if not exists semantic_differential (
    id serial,
    min_name text not null,
    max_name text not null,
    order_sort text,
    sesid integer,
    value integer,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    primary key(id),
    foreign key(sesid) references sessions(id)
);