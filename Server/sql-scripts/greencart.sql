select * from "USER";

select * from login_log;
select * from signup_log;

create or replace procedure delete_user_by_admin(uid in number)
is
begin
update "USER"
set is_deleted = True
where id = uid;
end;
/

CREATE OR REPLACE VIEW view_active_users AS
SELECT id, username, last_login, email, role
FROM "USER"
WHERE is_deleted = false;

