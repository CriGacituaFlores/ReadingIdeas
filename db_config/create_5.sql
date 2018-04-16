alter table teams add column original_leader integer references users(id);
alter table teams add column iteration integer default 0;