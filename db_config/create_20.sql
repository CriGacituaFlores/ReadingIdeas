alter table sessions add column waiting_partners boolean default false;
alter table sessions add column times_waiting integer default 0;
alter table sessions add column final_response boolean default false;