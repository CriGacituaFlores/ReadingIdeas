alter table teams add column original_leader integer references users(id);
alter table teams add column iteration integer default 0;
alter table teams add column waiting_partners boolean default false;
alter table teams add column final_response boolean default false;