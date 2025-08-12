-- tablespace creation

create tablespace userspace datafile 'userspace01.dbf' size 100m autoextend on;
create tablespace indexspace datafile 'indexspace01.dbf' size 100m autoextend on;

-- table creations

-- user

create table "USER" (
user_id varchar2(30) primary key,
username varchar2(50) unique not null,
email varchar2(100) unique not null,
password varchar2(255) not null,
user_role varchar2(20) check(user_role in ('admin', 'seller', 'deliveryman', 'buyer')) not null
)
tablespace userspace;

create unique index idx_user_username_lower on "USER"(lower(username)) tablespace indexspace ;
create unique index idx_user_email_lower on "USER"(lower(email)) tablespace indexspace ;


-- deleted user's datas

create table deleted_users as 
select user_id, username, email, user_role
from "USER" 
where 1 = 0;

alter table deleted_users move tablespace userspace;


-- category

create table "CATEGORY"(
category_id varchar2(30) primary key,
category_name varchar2(50) unique not null
)
tablespace userspace;

-- plant 

create table plant(
plant_id varchar2(30) primary key,
plant_name varchar2(50) not null,
seller_id varchar2(30) not null,
constraint fk_plant_seller_id foreign key(seller_id) references "USER"(user_id),
stock int not null,
price number(8,2) not null,
plant_description varchar2(200) not null,
plant_size varchar2(10) check(plant_size in ('small', 'medium', 'large')) not null
)
tablespace userspace;

-- plant_category junction table

create table plant_category (
plant_id varchar2(30) not null,
category_id varchar2(30) not null,
constraint pk_plant_category primary key (plant_id, category_id),
constraint fk_pc_plant foreign key (plant_id) references plant(plant_id),
constraint fk_pc_category foreign key (category_id) references category(category_id)
)
tablespace userspace;

-- rating

create table rating(
rating_id varchar2(30) primary key,
rating int check (rating between 1 and 5) not null,
rating_comment varchar2(200),
plant_id varchar2(30) not null,
constraint fk_review_plant_id foreign key(plant_id) references plant(plant_id),
user_id varchar2(30) not null,
constraint fk_user_review_id foreign key(user_id) references "USER"(user_id),
constraint uq_rating_user_plant unique(user_id, plant_id)
)
tablespace userspace;

-- discount

create table discount(
discount_id varchar2(30) primary key,
plant_id varchar2(30) not null,
constraint fk_category_plant_id foreign key(plant_id) references plant(plant_id),
discount_session timestamp not null,
discount_type varchar2(30) check(discount_type in ('seasonal', 'special')) not null,
amount number(4,2) not null
)
tablespace userspace;

-- cart

create table cart(
cart_id varchar2(30) primary key,
buyer_id varchar2(30) unique not null,
constraint fk_cart_buyer_id foreign key(buyer_id) references "USER"(user_id)
)
tablespace userspace;

-- cart items

create table cart_items(
cart_item_id varchar2(30) primary key not null,
cart_id varchar2(30) not null,
constraint fk_cart_items_cart foreign key(cart_id) references cart(cart_id),
plant_id varchar2(30) not null,
constraint fk_cart_items_plant_id foreign key(plant_id) references plant(plant_id)
)
tablespace userspace;

-- order

create table "ORDER"(
order_id varchar2(30) primary key,
cart_id varchar2(30) not null,
constraint fk_order_cart foreign key(cart_id) references cart(cart_id),
total_amount number(10,2) not null,
buyer_name varchar2(30) not null,
city_name varchar2(30) not null,
ordered_at timestamp,
address varchar2(500) not null,
district_name varchar2(30) not null,
buyer_phone varchar2(11) check(regexp_like (buyer_phone, '^01[3-9][0-9]{8}$')) not null,
buyer_email varchar2(320) check(regexp_like (buyer_email, '^[A-Za-z0-9._+%-]+@(gmail\.com|yahoo\.com|hotmail\.com)$'))
)
tablespace userspace;

-- delivery

create table delivery(
delivery_id varchar2(30) primary key,
order_id varchar2(30) not null,
deliveryman_id varchar2(30) not null,
constraint fk_delivery_deliveryman_id foreign key(deliveryman_id) references "USER"(user_id),
constraint fk_delivery_order foreign key(order_id) references "ORDER"(order_id),
delivery_type varchar2(30) check(delivery_type in ('express', 'normal')) not null,
status varchar2(30) check(status in ('pending', 'delivered', 'cancelled')) not null,
fee number(10,2) not null
)
tablespace userspace;

-- favourites

create table favourite(
favourite_id varchar2(30) primary key,
buyer_id varchar2(30) unique not null,
constraint fk_favourite_buyer_id foreign key(buyer_id) references "USER"(user_id)
)
tablespace userspace;

-- favourite item

create table favourite_items(
favourite_item_id varchar2(30) primary key not null,
favourite_id varchar2(30) not null,
constraint fk_fav_items_favourite foreign key(favourite_id) references favourite(favourite_id),
plant_id varchar2(30) not null,
constraint fk_fav_items_plant_id foreign key(plant_id) references plant(plant_id)
)
tablespace userspace;

-- indexes

create index idx_plant_seller_id on plant(seller_id) tablespace indexspace ;
create index idx_plant_category_id on plant_category(category_id)tablespace indexspace ;
create index idx_plant_category_plant_id on plant_category(plant_id) tablespace indexspace;
create index idx_rating_plant_id on rating(plant_id) tablespace indexspace;
create index idx_rating_user_id on rating(user_id) tablespace indexspace;
create index idx_discount_plant_id on discount(plant_id) tablespace indexspace;
create index idx_cart_buyer_id on cart(buyer_id) tablespace indexspace;
create index idx_cart_items_cart_id on cart_items(cart_id) tablespace indexspace;
create index idx_cart_items_plant_id on cart_items(plant_id) tablespace indexspace;
create index idx_order_cart_id on "order"(cart_id) tablespace indexspace;
create index idx_delivery_order_id on delivery(order_id) tablespace indexspace;
create index idx_delivery_deliveryman_id on delivery(deliveryman_id) tablespace indexspace;
create index idx_favourite_buyer_id on favourite(buyer_id) tablespace indexspace;
create index idx_favourite_items_favourite_id on favourite_items(favourite_id) tablespace indexspace;
create index idx_favourite_items_plant_id on favourite_items(plant_id) tablespace indexspace;

-- bitmap index

create bitmap index idx_discount_type on discount(discount_type) tablespace userspace;



-- needed codes

create or replace trigger delete_user
before delete on "USER"
for each row
begin
insert into deleted_users (user_id, username, email, user_role)
values (:old.user_id, :old.username, :old.email, :old.user_role);
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
    :new.user_role := lower(:new.user_role);

    if :new.user_role = 'admin' then
        v_role_code := 1;
    elsif :new.user_role = 'seller' then
        v_role_code := 2;
    elsif :new.user_role = 'deliveryman' then
        v_role_code := 3;
    elsif :new.user_role = 'buyer' then
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
    if :old.user_role != lower(:new.user_role) or :old.user_id != lower(:new.user_id) then
        raise_application_error(-20002, 'Role and ID cannot be updated');
    end if;
end;
/

select * from "USER";
truncate table "USER";

drop sequence user_id_seq;
drop trigger update_user;
drop trigger insert_user;
drop trigger delete_user;
drop table deleted_users;
drop table "USER";


-- top 3 category
-- 3 most popular plants
-- best sellers top 3

-- plant review time wise
-- show table filter last month, last year
-- both customer and delivery man need to ensure delivery status
-- user favourite will have add to cart option


-- features for user
  -- signup/ sign in
  -- edit profile - username/ profile avatar
  -- view all plants/ descriptions
  -- add plants to cart
  -- add plants to favourite
  -- make order
  -- confirm or cancel delivery
-- features for seller
  -- signup/sign in
  -- edit profile - username/profile avatar
  -- add plants
  -- view all plants/ descriptions
-- features for delivery man
  -- view pending ordered deliveries
  -- confirm delivery
-- features for admin
  -- assign/ unassign delivery man to a pending order
  -- view all pending/confirmed/canceled orders
  -- add seasonal discount
  -- view all buyers/ delivery mans/ sellers/ admins
  -- view all plant details
















