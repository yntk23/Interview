-- Add priority column to tasks table
alter table tasks
  add column if not exists priority text not null default 'MEDIUM';

alter table tasks
  drop constraint if exists tasks_priority_check;

alter table tasks
  add constraint tasks_priority_check
  check (priority in ('LOW', 'MEDIUM', 'HIGH'));
