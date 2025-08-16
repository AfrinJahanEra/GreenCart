create table "USER" (
user_id varchar2(30) primary key,
username varchar2(50) unique,
email varchar2(100) unique,
password varchar2(100),
role varchar2(20) check(role in ('admin', 'seller', 'deliveryman', 'buyer'))
);

select * from "USER";
truncate table "USER";

create table deleted_users as 
select user_id, username, email, role
from "USER" 
where 1 = 0;


create or replace trigger delete_user
before delete on "USER"
for each row
begin
insert into deleted_users (user_id, username, email, role)
values (:old.user_id, :old.username, :old.email, :old.role);
end;
/

CREATE SEQUENCE user_id_seq
  START WITH 1
  INCREMENT BY 1
  NOCACHE;

create or replace trigger insert_user
before insert on "USER"
for each row
declare
    v_role_code number;
    v_year varchar2(4);
    v_next_num number;
begin
    :new.role := lower(:new.role);

    if :new.role = 'admin' then
        v_role_code := 1;
    elsif :new.role = 'seller' then
        v_role_code := 2;
    elsif :new.role = 'deliveryman' then
        v_role_code := 3;
    elsif :new.role = 'buyer' then
        v_role_code := 4;
    else
        raise_application_error(-20001, 'Invalid role');
    end if;

    v_year := to_char(sysdate, 'YYYY');
    v_next_num := user_id_seq.nextval;

    :new.user_id := 'user_' || v_year || '_' || v_role_code || '_' || v_next_num;
end;
/



create or replace trigger update_user
before update on "USER"
for each row
begin
    if :old.role != lower(:new.role) or :old.user_id != lower(:new.user_id) then
        raise_application_error(-20002, 'Role and ID cannot be updated');
    end if;
end;
/


create or replace procedure delete_user(uid in varchar2)
is
begin
delete from "USER" where user_id = uid;
end;
/


create or replace view all_buyers as
select user_id , username, email
from "USER"
where role = 'buyer';


create or replace view all_admins as
select user_id , username, email
from "USER"
where role = 'admin';


create or replace view all_sellers as
select user_id , username, email
from "USER"
where role = 'seller';


create or replace view all_deliverymen as
select user_id , username, email
from "USER"
where role = 'deliveryman';

drop view all_deliverymen;
drop sequence user_id_seq;
drop view all_sellers;
drop view all_admins;
drop view all_buyers;
drop procedure delete_user;
drop trigger update_user;
drop trigger insert_user;
drop trigger delete_user;
drop table deleted_users;
drop table "USER";


-- top 3 category
-- 3 most popular plants
-- best sellers top 3

-- plant review time wise
-- show table last month, last year
-- both customer and delivery man need to ensure delivery
-- user favourite cart + add to cart option
















