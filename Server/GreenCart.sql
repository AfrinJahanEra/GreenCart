-- drop all existing tablespaces (assuming they exist; ignore errors if not)
BEGIN
  FOR ts IN (
    SELECT tablespace_name 
    FROM dba_tablespaces 
    WHERE tablespace_name IN ('PLANT_DATA', 'USER_DATA', 'ORDER_DATA', 'INDEX_DATA', 'DISCOUNT_DATA')
  ) LOOP
    EXECUTE IMMEDIATE 'DROP TABLESPACE ' || ts.tablespace_name || ' INCLUDING CONTENTS AND DATAFILES CASCADE CONSTRAINTS';
  END LOOP;
END;
/

-- create tablespaces
CREATE TABLESPACE plant_data
DATAFILE 'plant_data01.dbf' SIZE 500M AUTOEXTEND ON;

CREATE TABLESPACE user_data 
DATAFILE 'user_data01.dbf' SIZE 300M AUTOEXTEND ON;

CREATE TABLESPACE order_data 
DATAFILE 'order_data01.dbf' SIZE 500M AUTOEXTEND ON;

CREATE TABLESPACE index_data 
DATAFILE 'index_data01.dbf' SIZE 200M AUTOEXTEND ON;

CREATE TABLESPACE discount_data 
DATAFILE 'discount_data01.dbf' SIZE 200M AUTOEXTEND ON;

-- Sequences for auto ID generation
CREATE SEQUENCE seq_users START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_roles START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_plant_categories START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_plants START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_plant_images START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_plant_sizes START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_discount_types START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_discounts START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_plant_discounts START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_order_statuses START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_delivery_methods START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_orders START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_order_items START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_delivery_agents START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_order_assignments START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_favorites START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE review_id_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_plant_features START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_plant_care_tips START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_carts START WITH 1 INCREMENT BY 1;

-- User and Role Tables
CREATE TABLE roles (
    role_id NUMBER PRIMARY KEY,
    role_name VARCHAR2(50) NOT NULL UNIQUE,
    description VARCHAR2(255)
) TABLESPACE user_data;

CREATE OR REPLACE TRIGGER trg_roles_id
BEFORE INSERT ON roles
FOR EACH ROW
BEGIN
  :NEW.role_id := seq_roles.NEXTVAL;
END;
/

CREATE TABLE users (
    user_id NUMBER PRIMARY KEY,
    username VARCHAR2(50) NOT NULL UNIQUE,
    email VARCHAR2(100) NOT NULL UNIQUE,
    password_hash VARCHAR2(255) NOT NULL,
    first_name VARCHAR2(50) NOT NULL,
    last_name VARCHAR2(50) NOT NULL,
    phone VARCHAR2(20),
    address VARCHAR2(255),
    profile_image VARCHAR2(255),
    created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    last_login TIMESTAMP,
    is_active NUMBER(1) DEFAULT 1 NOT NULL
) TABLESPACE user_data;


CREATE OR REPLACE TRIGGER trg_users_id
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
  :NEW.user_id := seq_users.NEXTVAL;
END;
/

CREATE TABLE user_roles (
    user_id NUMBER NOT NULL,
    role_id NUMBER NOT NULL,
    assigned_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(role_id)
) TABLESPACE user_data;

-- Plant and Category Tables
CREATE TABLE plant_categories (
    category_id NUMBER PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    slug VARCHAR2(100) NOT NULL UNIQUE,
    description VARCHAR2(500),
    image_url VARCHAR2(255)
) TABLESPACE plant_data;

CREATE OR REPLACE TRIGGER trg_plant_categories_id
BEFORE INSERT ON plant_categories
FOR EACH ROW
BEGIN
  :NEW.category_id := seq_plant_categories.NEXTVAL;
END;
/

CREATE TABLE plants (
    plant_id NUMBER PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    description CLOB,
    base_price NUMBER(10,2) NOT NULL,
    stock_quantity NUMBER NOT NULL,
    created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    is_active NUMBER(1) DEFAULT 1 NOT NULL
) TABLESPACE plant_data;

CREATE OR REPLACE TRIGGER trg_plants_id
BEFORE INSERT ON plants
FOR EACH ROW
BEGIN
  :NEW.plant_id := seq_plants.NEXTVAL;
END;
/

CREATE TABLE plant_category_mapping (
    plant_id NUMBER NOT NULL,
    category_id NUMBER NOT NULL,
    PRIMARY KEY (plant_id, category_id),
    CONSTRAINT fk_pcm_plant FOREIGN KEY (plant_id) REFERENCES plants(plant_id),
    CONSTRAINT fk_pcm_category FOREIGN KEY (category_id) REFERENCES plant_categories(category_id)
) TABLESPACE plant_data;

CREATE TABLE plant_images (
    image_id NUMBER PRIMARY KEY,
    plant_id NUMBER NOT NULL,
    image_url VARCHAR2(255) NOT NULL,
    is_primary NUMBER(1) DEFAULT 0 NOT NULL,
    CONSTRAINT fk_plant_images_plant FOREIGN KEY (plant_id) REFERENCES plants(plant_id)
) TABLESPACE plant_data;

CREATE OR REPLACE TRIGGER trg_plant_images_id
BEFORE INSERT ON plant_images
FOR EACH ROW
BEGIN
  :NEW.image_id := seq_plant_images.NEXTVAL;
END;
/

CREATE TABLE plant_sizes (
    size_id NUMBER PRIMARY KEY,
    plant_id NUMBER NOT NULL,
    size_name VARCHAR2(50) NOT NULL,
    price_adjustment NUMBER(10,2) DEFAULT 0 NOT NULL,
    CONSTRAINT fk_plant_sizes_plant FOREIGN KEY (plant_id) REFERENCES plants(plant_id)
) TABLESPACE plant_data;

CREATE OR REPLACE TRIGGER trg_plant_sizes_id
BEFORE INSERT ON plant_sizes
FOR EACH ROW
BEGIN
  :NEW.size_id := seq_plant_sizes.NEXTVAL;
END;
/

-- Discount System
CREATE TABLE discount_types (
    discount_type_id NUMBER PRIMARY KEY,
    name VARCHAR2(50) NOT NULL,
    description VARCHAR2(255)
) TABLESPACE discount_data;

CREATE OR REPLACE TRIGGER trg_discount_types_id
BEFORE INSERT ON discount_types
FOR EACH ROW
BEGIN
  :NEW.discount_type_id := seq_discount_types.NEXTVAL;
END;
/

CREATE TABLE discounts (
    discount_id NUMBER PRIMARY KEY,
    discount_type_id NUMBER NOT NULL,
    name VARCHAR2(100) NOT NULL,
    description VARCHAR2(500),
    discount_value NUMBER(5,2) NOT NULL,
    is_percentage NUMBER(1) DEFAULT 1 NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active NUMBER(1) DEFAULT 1 NOT NULL,
    CONSTRAINT fk_discounts_type FOREIGN KEY (discount_type_id) REFERENCES discount_types(discount_type_id)
) TABLESPACE discount_data;

CREATE OR REPLACE TRIGGER trg_discounts_id
BEFORE INSERT ON discounts
FOR EACH ROW
BEGIN
  :NEW.discount_id := seq_discounts.NEXTVAL;
END;
/

CREATE TABLE plant_discounts (
    plant_discount_id NUMBER PRIMARY KEY,
    plant_id NUMBER,
    category_id NUMBER,
    discount_id NUMBER NOT NULL,
    CONSTRAINT fk_plant_discounts_plant FOREIGN KEY (plant_id) REFERENCES plants(plant_id),
    CONSTRAINT fk_plant_discounts_category FOREIGN KEY (category_id) REFERENCES plant_categories(category_id),
    CONSTRAINT fk_plant_discounts_discount FOREIGN KEY (discount_id) REFERENCES discounts(discount_id),
    CONSTRAINT chk_plant_or_category CHECK (plant_id IS NOT NULL OR category_id IS NOT NULL)
) TABLESPACE discount_data;

CREATE OR REPLACE TRIGGER trg_plant_discounts_id
BEFORE INSERT ON plant_discounts
FOR EACH ROW
BEGIN
  :NEW.plant_discount_id := seq_plant_discounts.NEXTVAL;
END;
/

-- Order and Delivery System
CREATE TABLE order_statuses (
    status_id NUMBER PRIMARY KEY,
    status_name VARCHAR2(50) NOT NULL UNIQUE,
    description VARCHAR2(255)
) TABLESPACE order_data;

CREATE OR REPLACE TRIGGER trg_order_statuses_id
BEFORE INSERT ON order_statuses
FOR EACH ROW
BEGIN
  :NEW.status_id := seq_order_statuses.NEXTVAL;
END;
/

CREATE TABLE delivery_methods (
    method_id NUMBER PRIMARY KEY,
    name VARCHAR2(50) NOT NULL,
    description VARCHAR2(255),
    base_cost NUMBER(10,2) NOT NULL,
    estimated_days VARCHAR2(50) NOT NULL,
    is_active NUMBER(1) DEFAULT 1 NOT NULL
) TABLESPACE order_data;

CREATE OR REPLACE TRIGGER trg_delivery_methods_id
BEFORE INSERT ON delivery_methods
FOR EACH ROW
BEGIN
  :NEW.method_id := seq_delivery_methods.NEXTVAL;
END;
/

CREATE TABLE orders (
    order_id NUMBER PRIMARY KEY,
    user_id NUMBER NOT NULL,
    order_number VARCHAR2(20) NOT NULL UNIQUE,
    order_date TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    status_id NUMBER NOT NULL,
    delivery_method_id NUMBER NOT NULL,
    delivery_address VARCHAR2(500) NOT NULL,
    delivery_notes VARCHAR2(500),
    tracking_number VARCHAR2(50),
    estimated_delivery_date TIMESTAMP,
    actual_delivery_date TIMESTAMP,
    total_amount NUMBER(10,2) NOT NULL,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_orders_status FOREIGN KEY (status_id) REFERENCES order_statuses(status_id),
    CONSTRAINT fk_orders_delivery_method FOREIGN KEY (delivery_method_id) REFERENCES delivery_methods(method_id)
) TABLESPACE order_data;

select order_id from orders
where user_id = 5;

CREATE OR REPLACE TRIGGER trg_orders_id
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
  :NEW.order_id := seq_orders.NEXTVAL;
END;
/

CREATE TABLE order_items (
    order_item_id NUMBER PRIMARY KEY,
    order_id NUMBER NOT NULL,
    plant_id NUMBER NOT NULL,
    size_id NUMBER,
    quantity NUMBER NOT NULL,
    unit_price NUMBER(10,2) NOT NULL,
    discount_applied NUMBER(5,2) DEFAULT 0 NOT NULL,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(order_id),
    CONSTRAINT fk_order_items_plant FOREIGN KEY (plant_id) REFERENCES plants(plant_id),
    CONSTRAINT fk_order_items_size FOREIGN KEY (size_id) REFERENCES plant_sizes(size_id)
) TABLESPACE order_data;

CREATE OR REPLACE TRIGGER trg_order_items_id
BEFORE INSERT ON order_items
FOR EACH ROW
BEGIN
  :NEW.order_item_id := seq_order_items.NEXTVAL;
END;
/

CREATE TABLE plant_features (
    feature_id NUMBER PRIMARY KEY,
    plant_id NUMBER NOT NULL,
    feature_text VARCHAR2(255) NOT NULL,
    CONSTRAINT fk_feature_plant FOREIGN KEY (plant_id) REFERENCES plants(plant_id)
) TABLESPACE plant_data;


CREATE OR REPLACE TRIGGER trg_plant_features_id
BEFORE INSERT ON plant_features
FOR EACH ROW
BEGIN
  :NEW.feature_id := seq_plant_features.NEXTVAL;
END;
/

CREATE TABLE plant_care_tips (
    tip_id NUMBER PRIMARY KEY,
    plant_id NUMBER NOT NULL,
    tip_text VARCHAR2(255) NOT NULL,
    CONSTRAINT fk_tip_plant FOREIGN KEY (plant_id) REFERENCES plants(plant_id)
) TABLESPACE plant_data;

CREATE OR REPLACE TRIGGER trg_plant_care_tips_id
BEFORE INSERT ON plant_care_tips
FOR EACH ROW
BEGIN
  :NEW.tip_id := seq_plant_care_tips.NEXTVAL;
END;
/

CREATE TABLE delivery_agents (
    agent_id NUMBER PRIMARY KEY,
    user_id NUMBER NOT NULL UNIQUE,
    vehicle_type VARCHAR2(50) NOT NULL,
    license_number VARCHAR2(50),
    is_active NUMBER(1) DEFAULT 1 NOT NULL,
    CONSTRAINT fk_delivery_agents_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) TABLESPACE user_data;

CREATE OR REPLACE TRIGGER trg_delivery_agents_id
BEFORE INSERT ON delivery_agents
FOR EACH ROW
BEGIN
  :NEW.agent_id := seq_delivery_agents.NEXTVAL;
END;
/

CREATE TABLE order_assignments (
    assignment_id NUMBER PRIMARY KEY,
    order_id NUMBER NOT NULL UNIQUE,
    agent_id NUMBER NOT NULL,
    assigned_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    notes VARCHAR2(500),
    CONSTRAINT fk_order_assignments_order FOREIGN KEY (order_id) REFERENCES orders(order_id),
    CONSTRAINT fk_order_assignments_agent FOREIGN KEY (agent_id) REFERENCES delivery_agents(agent_id)
) TABLESPACE order_data;

CREATE OR REPLACE TRIGGER trg_order_assignments_id
BEFORE INSERT ON order_assignments
FOR EACH ROW
BEGIN
  :NEW.assignment_id := seq_order_assignments.NEXTVAL;
END;
/

---- User Interaction Tables
--CREATE TABLE favorites (
--    favorite_id NUMBER PRIMARY KEY,
--    user_id NUMBER NOT NULL,
--    plant_id NUMBER NOT NULL,
--    added_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
--    CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users(user_id),
--    CONSTRAINT fk_favorites_plant FOREIGN KEY (plant_id) REFERENCES plants(plant_id),
--    CONSTRAINT uk_favorites_user_plant UNIQUE (user_id, plant_id)
--) TABLESPACE user_data;
--
--CREATE OR REPLACE TRIGGER trg_favorites_id
--BEFORE INSERT ON favorites
--FOR EACH ROW
--BEGIN
--  :NEW.favorite_id := seq_favorites.NEXTVAL;
--END;
--/

CREATE TABLE reviews (
    review_id NUMBER PRIMARY KEY,
    user_id NUMBER NOT NULL,
    plant_id NUMBER NOT NULL,
    order_id NUMBER,
    rating NUMBER(1) NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text CLOB,
    review_date TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    is_approved NUMBER(1) DEFAULT 1 NOT NULL,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_reviews_plant FOREIGN KEY (plant_id) REFERENCES plants(plant_id),
    CONSTRAINT fk_reviews_order FOREIGN KEY (order_id) REFERENCES orders(order_id)
) TABLESPACE user_data;


CREATE OR REPLACE TRIGGER trg_reviews_id
BEFORE INSERT ON reviews
FOR EACH ROW
BEGIN
  :NEW.review_id := review_id_seq.NEXTVAL;
END;
/

CREATE TABLE carts (
    cart_id NUMBER PRIMARY KEY,
    user_id NUMBER NOT NULL,
    plant_id NUMBER NOT NULL,
    size_id NUMBER NOT NULL,
    quantity NUMBER NOT NULL CHECK (quantity >= 1),
    selected NUMBER(1) DEFAULT 1 NOT NULL CHECK (selected IN (0, 1)),
    added_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_cart_plant FOREIGN KEY (plant_id) REFERENCES plants(plant_id),
    CONSTRAINT fk_cart_size FOREIGN KEY (size_id) REFERENCES plant_sizes(size_id)
) TABLESPACE plant_data;

CREATE OR REPLACE TRIGGER trg_cart_id
BEFORE INSERT ON carts
FOR EACH ROW
BEGIN
  :NEW.cart_id := seq_carts.NEXTVAL;
END;
/


CREATE TABLE delivery_confirmations (
    confirmation_id NUMBER PRIMARY KEY,
    order_id NUMBER NOT NULL,
    user_id NUMBER NOT NULL, -- customer ID
    agent_id NUMBER NOT NULL, -- delivery agent ID
    customer_confirmed NUMBER(1) DEFAULT 0,
    agent_confirmed NUMBER(1) DEFAULT 0,
    confirmed_date TIMESTAMP,
    CONSTRAINT fk_delivery_conf_order FOREIGN KEY (order_id) REFERENCES orders(order_id),
    CONSTRAINT fk_delivery_conf_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_delivery_conf_agent FOREIGN KEY (agent_id) REFERENCES delivery_agents(agent_id),
    CONSTRAINT uk_delivery_conf_order UNIQUE (order_id)
) TABLESPACE order_data;

CREATE SEQUENCE seq_delivery_confirmations START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER trg_delivery_confirmations_id
BEFORE INSERT ON delivery_confirmations
FOR EACH ROW
BEGIN
  :NEW.confirmation_id := seq_delivery_confirmations.NEXTVAL;
END;
/

-- Delivery slots table for delivery agents
CREATE TABLE delivery_slots (
    slot_id NUMBER PRIMARY KEY,
    agent_id NUMBER NOT NULL,
    slot_date DATE NOT NULL,
    slot_time VARCHAR2(20) NOT NULL, -- 'morning', 'afternoon', 'evening'
    is_available NUMBER(1) DEFAULT 1 NOT NULL,
    order_id NUMBER,
    CONSTRAINT fk_delivery_slots_agent FOREIGN KEY (agent_id) REFERENCES delivery_agents(agent_id),
    CONSTRAINT fk_delivery_slots_order FOREIGN KEY (order_id) REFERENCES orders(order_id),
    CONSTRAINT uk_delivery_slot UNIQUE (agent_id, slot_date, slot_time)
) TABLESPACE order_data;

CREATE SEQUENCE seq_delivery_slots START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER trg_delivery_slots_id
BEFORE INSERT ON delivery_slots
FOR EACH ROW
BEGIN
  :NEW.slot_id := seq_delivery_slots.NEXTVAL;
END;
/

-- Activity log table
CREATE TABLE activity_log (
    log_id NUMBER PRIMARY KEY,
    user_id NUMBER,
    activity_type VARCHAR2(50) NOT NULL,
    activity_details VARCHAR2(500),
    activity_timestamp TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    ip_address VARCHAR2(45),
    CONSTRAINT fk_activity_log_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) TABLESPACE user_data;

CREATE SEQUENCE seq_activity_log START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER trg_activity_log_id
BEFORE INSERT ON activity_log
FOR EACH ROW
BEGIN
  :NEW.log_id := seq_activity_log.NEXTVAL;
END;
/

-- Low stock alerts table
CREATE TABLE low_stock_alerts (
    alert_id NUMBER PRIMARY KEY,
    plant_id NUMBER NOT NULL,
    current_stock NUMBER NOT NULL,
    threshold NUMBER DEFAULT 10 NOT NULL,
    alert_date TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    is_resolved NUMBER(1) DEFAULT 0 NOT NULL,
    resolved_date TIMESTAMP,
    CONSTRAINT fk_low_stock_plant FOREIGN KEY (plant_id) REFERENCES plants(plant_id)
) TABLESPACE plant_data;

CREATE SEQUENCE seq_low_stock_alerts START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER trg_low_stock_alerts_id
BEFORE INSERT ON low_stock_alerts
FOR EACH ROW
BEGIN
  :NEW.alert_id := seq_low_stock_alerts.NEXTVAL;
END;
/

ALTER TABLE plant_discounts DROP CONSTRAINT chk_plant_or_category;

-- Update discount_types with new types
INSERT INTO discount_types (discount_type_id, name, description) 
SELECT seq_discount_types.NEXTVAL, 'Festive', 'Discount for festivals' FROM dual
WHERE NOT EXISTS (SELECT 1 FROM discount_types WHERE name = 'Festive');


INSERT INTO discount_types (discount_type_id, name, description) 
SELECT seq_discount_types.NEXTVAL, 'Special', 'Special promotional discount' FROM dual
WHERE NOT EXISTS (SELECT 1 FROM discount_types WHERE name = 'Special');

-- Indexes
--CREATE INDEX idx_users_email ON users(email) TABLESPACE index_data;
CREATE INDEX idx_users_phone ON users(phone) TABLESPACE index_data;
CREATE INDEX idx_plants_name ON plants(name) TABLESPACE index_data;
CREATE INDEX idx_plant_categories_slug ON plant_categories(slug) TABLESPACE index_data;
CREATE INDEX idx_orders_user ON orders(user_id) TABLESPACE index_data;
CREATE INDEX idx_orders_status ON orders(status_id) TABLESPACE index_data;
CREATE INDEX idx_orders_number ON orders(order_number) TABLESPACE index_data;
CREATE INDEX idx_order_items_order ON order_items(order_id) TABLESPACE index_data;
CREATE INDEX idx_order_items_plant ON order_items(plant_id) TABLESPACE index_data;
--CREATE INDEX idx_favorites_user ON favorites(user_id) TABLESPACE index_data;
--CREATE INDEX idx_favorites_plant ON favorites(plant_id) TABLESPACE index_data;
CREATE INDEX idx_reviews_plant ON reviews(plant_id) TABLESPACE index_data;
CREATE INDEX idx_reviews_user ON reviews(user_id) TABLESPACE index_data;

-- Views
CREATE OR REPLACE VIEW vw_plant_catalog_enhanced AS
SELECT 
    p.plant_id,
    p.name AS plant_name,
    DBMS_LOB.SUBSTR(p.description, 4000, 1) AS description,
    p.base_price,
    p.stock_quantity,
    LISTAGG(pc.name, ', ') WITHIN GROUP (ORDER BY pc.name) AS categories,
    pi.image_url AS primary_image,
    NVL(AVG(r.rating), 0) AS avg_rating,
    COUNT(r.review_id) AS review_count,
    (SELECT LISTAGG(image_url, ',') WITHIN GROUP (ORDER BY image_id)
     FROM plant_images pi2 
     WHERE pi2.plant_id = p.plant_id) AS all_images
FROM 
    plants p
LEFT JOIN 
    plant_category_mapping pcm ON p.plant_id = pcm.plant_id
LEFT JOIN 
    plant_categories pc ON pcm.category_id = pc.category_id
LEFT JOIN 
    plant_images pi ON p.plant_id = pi.plant_id AND pi.is_primary = 1
LEFT JOIN
    reviews r ON p.plant_id = r.plant_id
WHERE 
    p.is_active = 1
GROUP BY 
    p.plant_id, p.name, DBMS_LOB.SUBSTR(p.description, 4000, 1), 
    p.base_price, p.stock_quantity, pi.image_url;



CREATE OR REPLACE VIEW vw_order_details AS
SELECT 
    o.order_id,
    o.order_number,
    o.order_date,
    os.status_name AS order_status,
    u.user_id,
    u.first_name || ' ' || u.last_name AS customer_name,
    u.email AS customer_email,
    u.phone AS customer_phone,
    o.delivery_address,
    dm.name AS delivery_method,
    dm.base_cost AS delivery_cost,
    o.total_amount,
    o.estimated_delivery_date,
    o.actual_delivery_date,
    da.user_id AS agent_user_id,
    (SELECT first_name || ' ' || last_name FROM users WHERE user_id = da.user_id) AS delivery_agent,
    da.vehicle_type
FROM 
    orders o
JOIN 
    users u ON o.user_id = u.user_id
JOIN 
    order_statuses os ON o.status_id = os.status_id
JOIN 
    delivery_methods dm ON o.delivery_method_id = dm.method_id
LEFT JOIN 
    order_assignments oa ON o.order_id = oa.order_id
LEFT JOIN 
    delivery_agents da ON oa.agent_id = da.agent_id;



CREATE OR REPLACE VIEW vw_plant_discounts AS
SELECT 
    p.plant_id,
    p.name AS plant_name,
    d.discount_id,
    d.name AS discount_name,
    dt.name AS discount_type,
    d.discount_value,
    d.is_percentage,
    d.start_date,
    d.end_date
FROM 
    plants p
LEFT JOIN plant_category_mapping pcm ON p.plant_id = pcm.plant_id
JOIN plant_discounts pd ON (p.plant_id = pd.plant_id 
                            OR pcm.category_id = pd.category_id 
                            OR (pd.plant_id IS NULL AND pd.category_id IS NULL))
JOIN discounts d ON pd.discount_id = d.discount_id
JOIN discount_types dt ON d.discount_type_id = dt.discount_type_id
WHERE 
    d.is_active = 1 
    AND SYSTIMESTAMP BETWEEN d.start_date AND d.end_date
    AND p.is_active = 1
GROUP BY 
    p.plant_id, 
    p.name, 
    d.discount_id, 
    d.name, 
    dt.name, 
    d.discount_value, 
    d.is_percentage, 
    d.start_date, 
    d.end_date;




-- Home page

-- Corrected PL/SQL block to add seller_id to plants table
BEGIN
  BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE plants ADD seller_id NUMBER';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLCODE != -1430 THEN  -- Ignore if column already exists
        RAISE;
      END IF;
  END;
  
  BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE plants ADD CONSTRAINT fk_plant_seller FOREIGN KEY (seller_id) REFERENCES users(user_id)';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLCODE != -2275 THEN  -- Ignore if constraint already exists
        RAISE;
      END IF;
  END;
END;
/

-- PL/SQL Procedure for Top 4 Categories (by plant count, using cursor)
CREATE OR REPLACE PROCEDURE get_top_4_categories (p_cursor OUT SYS_REFCURSOR) AS
BEGIN
  OPEN p_cursor FOR
  SELECT pc.category_id, pc.name, pc.slug, COUNT(pcm.plant_id) AS plant_count
  FROM plant_categories pc
  LEFT JOIN plant_category_mapping pcm ON pc.category_id = pcm.category_id
  GROUP BY pc.category_id, pc.name, pc.slug
  ORDER BY plant_count DESC
  FETCH FIRST 4 ROWS ONLY;
END;
/


-- PL/SQL Function for Top 4 Plants by Reviews (average rating, using aggregate and join)
CREATE OR REPLACE FUNCTION get_top_4_plants RETURN SYS_REFCURSOR IS
  v_cursor SYS_REFCURSOR;
BEGIN
  OPEN v_cursor FOR
  SELECT p.plant_id, p.name, AVG(r.rating) AS avg_rating, COUNT(r.review_id) AS review_count
  FROM plants p
  LEFT JOIN reviews r ON p.plant_id = r.plant_id
  GROUP BY p.plant_id, p.name
  ORDER BY avg_rating DESC, review_count DESC
  FETCH FIRST 4 ROWS ONLY;
  RETURN v_cursor;
END;
/

SET SERVEROUTPUT ON;

DECLARE
  c SYS_REFCURSOR;
  v_plant_id plants.plant_id%TYPE;
  v_name     plants.name%TYPE;
  v_avg      NUMBER;
  v_count    NUMBER;
BEGIN
  -- Call the function and get the cursor
  c := get_top_4_plants();

  -- Loop through the cursor
  LOOP
    FETCH c INTO v_plant_id, v_name, v_avg, v_count;
    EXIT WHEN c%NOTFOUND;
    DBMS_OUTPUT.PUT_LINE(v_plant_id || ' | ' || v_name || ' | ' || v_avg || ' | ' || v_count);
  END LOOP;

  CLOSE c;
END;
/

-- PL/SQL Procedure for Top 3 Sellers by Total Plants Sold (using join, aggregate, cursor)
CREATE OR REPLACE PROCEDURE get_top_3_sellers (p_cursor OUT SYS_REFCURSOR) AS
BEGIN
  OPEN p_cursor FOR
  SELECT u.user_id, u.first_name || ' ' || u.last_name AS seller_name, 
         SUM(oi.quantity) AS total_sold
  FROM users u
  JOIN plants p ON u.user_id = p.seller_id
  JOIN order_items oi ON p.plant_id = oi.plant_id
  WHERE EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.role_id 
                WHERE ur.user_id = u.user_id AND r.role_name = 'seller')
  GROUP BY u.user_id, u.first_name, u.last_name
  ORDER BY total_sold DESC
  FETCH FIRST 3 ROWS ONLY;
END;
/

-- Trigger to Update Plant Stock after Order Item Insert

CREATE OR REPLACE TRIGGER trg_update_plant_stock
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
  UPDATE plants
  SET stock_quantity = stock_quantity - :NEW.quantity
  WHERE plant_id = :NEW.plant_id;
END;
/



-- plant collection page 

-- Procedure for Category-wise Filter (fetch plants by category slug, using join)
CREATE OR REPLACE PROCEDURE get_plants_by_category_with_rating (
    p_slug IN VARCHAR2,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
  OPEN p_cursor FOR
  SELECT 
      p.plant_id, 
      p.name, 
      DBMS_LOB.SUBSTR(p.description, 4000, 1) AS description, 
      p.base_price, 
      p.stock_quantity, 
      pi.image_url AS primary_image,
      NVL(AVG(r.rating), 0) AS avg_rating,
      COUNT(r.review_id) AS review_count,
      (SELECT LISTAGG(image_url, ',') WITHIN GROUP (ORDER BY image_id)
       FROM plant_images pi2 
       WHERE pi2.plant_id = p.plant_id) AS all_images
  FROM plants p
  JOIN plant_category_mapping pcm ON p.plant_id = pcm.plant_id
  JOIN plant_categories pc ON pcm.category_id = pc.category_id
  LEFT JOIN plant_images pi ON p.plant_id = pi.plant_id AND pi.is_primary = 1
  LEFT JOIN reviews r ON p.plant_id = r.plant_id
  WHERE pc.slug = p_slug AND p.is_active = 1
  GROUP BY p.plant_id, p.name, DBMS_LOB.SUBSTR(p.description, 4000, 1), 
           p.base_price, p.stock_quantity, pi.image_url;
END;
/

-- Procedure for Plant Search (search by name or description, using LIKE for search bar)
CREATE OR REPLACE PROCEDURE search_plants_with_rating (
    p_search_term IN VARCHAR2,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
  OPEN p_cursor FOR
  SELECT 
      p.plant_id, 
      p.name, 
      DBMS_LOB.SUBSTR(p.description, 4000, 1) AS description, 
      p.base_price, 
      p.stock_quantity, 
      pi.image_url AS primary_image,
      NVL(AVG(r.rating), 0) AS avg_rating,
      COUNT(r.review_id) AS review_count,
      (SELECT LISTAGG(image_url, ',') WITHIN GROUP (ORDER BY image_id)
       FROM plant_images pi2 
       WHERE pi2.plant_id = p.plant_id) AS all_images
  FROM plants p
  LEFT JOIN plant_images pi ON p.plant_id = pi.plant_id AND pi.is_primary = 1
  LEFT JOIN reviews r ON p.plant_id = r.plant_id
  WHERE (LOWER(p.name) LIKE '%' || LOWER(p_search_term) || '%' 
         OR LOWER(DBMS_LOB.SUBSTR(p.description, 4000, 1)) LIKE '%' || LOWER(p_search_term) || '%')
    AND p.is_active = 1
  GROUP BY p.plant_id, p.name, DBMS_LOB.SUBSTR(p.description, 4000, 1), 
           p.base_price, p.stock_quantity, pi.image_url
  ORDER BY avg_rating DESC, p.name;
END;
/


CREATE OR REPLACE PROCEDURE get_all_categories (
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
    SELECT category_id, name, slug
    FROM plant_categories
    ORDER BY name;
END;
/



-- plant details page 

-- Procedure to fetch all plant details for the plant details page

CREATE OR REPLACE PROCEDURE get_plant_details (
    p_plant_id IN NUMBER,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
  OPEN p_cursor FOR
  SELECT 
      p.plant_id,
      p.name,
      DBMS_LOB.SUBSTR(p.description, 4000, 1) AS description,
      p.base_price,
      p.stock_quantity,
      pi.image_url AS primary_image,
      (SELECT LISTAGG(pi2.image_url, ',') WITHIN GROUP (ORDER BY pi2.image_id)
       FROM plant_images pi2 WHERE pi2.plant_id = p.plant_id) AS image_urls,
      (SELECT LISTAGG(ps.size_name || ':' || ps.price_adjustment, ',') WITHIN GROUP (ORDER BY ps.size_id)
       FROM plant_sizes ps WHERE ps.plant_id = p.plant_id) AS sizes,
      (SELECT LISTAGG(pf.feature_text, ',') WITHIN GROUP (ORDER BY pf.feature_id)
       FROM plant_features pf WHERE pf.plant_id = p.plant_id) AS features,
      (SELECT LISTAGG(pct.tip_text, ',') WITHIN GROUP (ORDER BY pct.tip_id)
       FROM plant_care_tips pct WHERE pct.plant_id = p.plant_id) AS care_tips,
      AVG(r.rating) AS avg_rating,
      COUNT(r.review_id) AS review_count,
      JSON_ARRAYAGG(
          JSON_OBJECT(
              'review_id' VALUE r.review_id,
              'text' VALUE DBMS_LOB.SUBSTR(r.review_text, 4000, 1),
              'author' VALUE u.first_name || ' ' || u.last_name,
              'rating' VALUE r.rating,
              'date' VALUE TO_CHAR(r.review_date, 'YYYY-MM-DD')
          ) RETURNING CLOB
      ) AS reviews
  FROM plants p
  LEFT JOIN plant_images pi ON p.plant_id = pi.plant_id AND pi.is_primary = 1
  LEFT JOIN reviews r ON p.plant_id = r.plant_id
  LEFT JOIN users u ON r.user_id = u.user_id
  WHERE p.plant_id = p_plant_id AND p.is_active = 1
  GROUP BY p.plant_id, p.name, DBMS_LOB.SUBSTR(p.description, 4000, 1), p.base_price, p.stock_quantity, pi.image_url;
END;
/



-- Procedure to add to cart
CREATE OR REPLACE PROCEDURE add_to_cart (
    p_user_id IN NUMBER,
    p_plant_id IN NUMBER,
    p_size_id IN NUMBER,
    p_quantity IN NUMBER DEFAULT 1
) AS
    v_seller_id NUMBER;
    v_stock_quantity NUMBER;
    v_size_exists NUMBER;
BEGIN
    -- Validate input parameters
    IF p_user_id IS NULL OR p_plant_id IS NULL OR p_size_id IS NULL THEN
        RAISE_APPLICATION_ERROR(-20015, 'User ID, Plant ID, and Size ID cannot be null');
    END IF;

    IF p_quantity <= 0 THEN
        RAISE_APPLICATION_ERROR(-20015, 'Quantity must be positive');
    END IF;

    -- Check if plant and seller exist, and get stock quantity
    BEGIN
        SELECT p.seller_id, p.stock_quantity
        INTO v_seller_id, v_stock_quantity
        FROM plants p
        WHERE p.plant_id = p_plant_id
        AND p.is_active = 1; -- Only active plants can be added
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20016, 'Plant not found or inactive');
    END;

    IF v_seller_id IS NULL THEN
        RAISE_APPLICATION_ERROR(-20016, 'Plant has no seller assigned');
    END IF;

    -- Check if size_id exists
    BEGIN
        SELECT 1
        INTO v_size_exists
        FROM plant_sizes
        WHERE size_id = p_size_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20017, 'Invalid size ID');
    END;

    -- Check stock availability
    IF v_stock_quantity < p_quantity THEN
        RAISE_APPLICATION_ERROR(-20018, 'Insufficient stock for plant');
    END IF;

    -- Check if item already exists in cart: update else insert
    UPDATE carts
    SET quantity = quantity + p_quantity,
        added_at = SYSTIMESTAMP
    WHERE user_id = p_user_id
      AND plant_id = p_plant_id
      AND size_id = p_size_id;

    IF SQL%ROWCOUNT = 0 THEN
        INSERT INTO carts (user_id, plant_id, size_id, quantity, added_at)
        VALUES (p_user_id, p_plant_id, p_size_id, p_quantity, SYSTIMESTAMP);
    END IF;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- Procedure to fetch reviews for a plant with reviewer info


CREATE OR REPLACE PROCEDURE add_review (
    p_user_id IN NUMBER,
    p_plant_id IN NUMBER,
    p_order_id IN NUMBER,
    p_rating IN NUMBER,
    p_review_text IN CLOB
) AS
    v_order_status VARCHAR2(50);
    v_customer_id NUMBER;
    v_plant_in_order NUMBER;
    v_both_confirmed NUMBER;
    v_review_id NUMBER;
BEGIN
    -- Validate inputs
    IF p_user_id IS NULL OR p_plant_id IS NULL OR p_order_id IS NULL OR p_rating IS NULL THEN
        RAISE_APPLICATION_ERROR(-20020, 'User ID, Plant ID, Order ID, and Rating cannot be null');
    END IF;

    IF p_rating NOT BETWEEN 1 AND 5 THEN
        RAISE_APPLICATION_ERROR(-20021, 'Rating must be between 1 and 5');
    END IF;

    -- Check if order is delivered
    BEGIN
        SELECT os.status_name, o.user_id
        INTO v_order_status, v_customer_id
        FROM orders o
        JOIN order_statuses os ON o.status_id = os.status_id
        WHERE o.order_id = p_order_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20022, 'Order not found');
    END;

    IF v_order_status != 'Delivered' THEN
        RAISE_APPLICATION_ERROR(-20023, 'Order is not delivered');
    END IF;

    -- Verify both customer and agent confirmed delivery
    BEGIN
        SELECT CASE 
                 WHEN customer_confirmed = 1 AND agent_confirmed = 1 THEN 1 
                 ELSE 0 
               END
        INTO v_both_confirmed
        FROM delivery_confirmations
        WHERE order_id = p_order_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20024, 'Delivery confirmation not found for order');
    END;

    IF v_both_confirmed = 0 THEN
        RAISE_APPLICATION_ERROR(-20025, 'Order delivery not fully confirmed by customer and agent');
    END IF;

    -- Verify user is the customer who placed the order
    IF p_user_id != v_customer_id THEN
        RAISE_APPLICATION_ERROR(-20026, 'User is not authorized to review this order');
    END IF;

    -- Check if plant_id is part of the order
    BEGIN
        SELECT COUNT(*)
        INTO v_plant_in_order
        FROM order_items
        WHERE order_id = p_order_id
        AND plant_id = p_plant_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            v_plant_in_order := 0;
    END;

    IF v_plant_in_order = 0 THEN
        RAISE_APPLICATION_ERROR(-20027, 'Plant not found in this order');
    END IF;

    -- Check for existing review (to prevent duplicates)
    SELECT COUNT(*)
    INTO v_plant_in_order
    FROM reviews
    WHERE user_id = p_user_id
    AND plant_id = p_plant_id
    AND order_id = p_order_id;

    IF v_plant_in_order > 0 THEN
        RAISE_APPLICATION_ERROR(-20028, 'Review already exists for this plant, user, and order');
    END IF;

    -- Generate review_id
    SELECT review_id_seq.NEXTVAL INTO v_review_id FROM dual;

    -- Insert the review
    INSERT INTO reviews (review_id, user_id, plant_id, order_id, rating, review_text, review_date, is_approved)
    VALUES (v_review_id, p_user_id, p_plant_id, p_order_id, p_rating, p_review_text, SYSTIMESTAMP, 1);

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/


CREATE OR REPLACE PROCEDURE get_reviews_for_plant (
    p_plant_id            IN NUMBER,
    p_include_unapproved  IN NUMBER DEFAULT 0, -- 0 = only approved, 1 = include all
    p_limit               IN NUMBER DEFAULT 50,
    p_offset              IN NUMBER DEFAULT 0,
    p_cursor              OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
    SELECT
        r.review_id,
        r.user_id,
        u.first_name || ' ' || u.last_name AS reviewer_name,
        r.rating,
        DBMS_LOB.SUBSTR(r.review_text, 4000, 1) AS review_text,
        TO_CHAR(r.review_date, 'YYYY-MM-DD HH24:MI:SS') AS review_date,
        r.is_approved
    FROM reviews r
    LEFT JOIN users u ON r.user_id = u.user_id
    WHERE r.plant_id = p_plant_id
      AND (p_include_unapproved = 1 OR r.is_approved = 1)
    ORDER BY r.review_date DESC
    OFFSET p_offset ROWS FETCH NEXT p_limit ROWS ONLY;
END;
/



--  Deletes a review only if requestor is the review owner or admin.

CREATE OR REPLACE PROCEDURE delete_review (
    p_requestor_id IN NUMBER,
    p_review_id    IN NUMBER
) AS
    v_owner_id NUMBER;
    v_is_admin NUMBER := 0;
BEGIN
    -- fetch owner
    BEGIN
        SELECT user_id INTO v_owner_id FROM reviews WHERE review_id = p_review_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20033, 'Review not found');
    END;

    -- check admin
    SELECT COUNT(*) INTO v_is_admin
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.role_id
    WHERE ur.user_id = p_requestor_id
      AND r.role_name = 'admin';

    IF v_is_admin = 0 AND p_requestor_id != v_owner_id THEN
        RAISE_APPLICATION_ERROR(-20034, 'Not authorized: only admin or the review author can delete this review');
    END IF;

    DELETE FROM reviews WHERE review_id = p_review_id;

    IF SQL%ROWCOUNT = 0 THEN
        RAISE_APPLICATION_ERROR(-20035, 'Failed to delete review');
    END IF;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/





-- User Profile sidebar

select * from users;

-- Procedure to fetch user profile details
CREATE OR REPLACE PROCEDURE get_user_profile (
    p_user_id IN NUMBER,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
  IF p_user_id IS NULL THEN
    RAISE_APPLICATION_ERROR(-20001, 'User ID cannot be null');
  END IF;
  
  OPEN p_cursor FOR
  SELECT 
      u.user_id,
      NVL(u.first_name, '') || ' ' || NVL(u.last_name, '') AS name,
      u.email,
      u.phone,
      u.address,
      u.profile_image AS image
  FROM users u
  WHERE u.user_id = p_user_id AND u.is_active = 1;
END;
/

-- Procedure to update user profile details

CREATE OR REPLACE PROCEDURE update_user_profile (
    p_requestor_id   IN NUMBER,
    p_user_id        IN NUMBER,
    p_username       IN VARCHAR2 DEFAULT NULL,
    p_email          IN VARCHAR2 DEFAULT NULL,
    p_first_name     IN VARCHAR2 DEFAULT NULL,
    p_last_name      IN VARCHAR2 DEFAULT NULL,
    p_phone          IN VARCHAR2 DEFAULT NULL,
    p_address        IN VARCHAR2 DEFAULT NULL,
    p_profile_image  IN VARCHAR2 DEFAULT NULL
) AS
    v_is_admin NUMBER := 0;
    v_count    NUMBER := 0;
BEGIN
    IF p_requestor_id IS NULL OR p_user_id IS NULL THEN
        RAISE_APPLICATION_ERROR(-20001, 'Requestor ID and User ID cannot be null');
    END IF;

    -- Authorization: only admin or the user themself can update
    SELECT COUNT(*) INTO v_is_admin
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.role_id
    WHERE ur.user_id = p_requestor_id
      AND r.role_name = 'admin';

    IF v_is_admin = 0 AND p_requestor_id != p_user_id THEN
        RAISE_APPLICATION_ERROR(-20036, 'Not authorized: only admin or the user themselves can update this profile');
    END IF;

    -- Validate uniqueness for email if changing
    IF p_email IS NOT NULL THEN
        SELECT COUNT(*) INTO v_count FROM users WHERE LOWER(email) = LOWER(p_email) AND user_id != p_user_id;
        IF v_count > 0 THEN
            RAISE_APPLICATION_ERROR(-20037, 'Email already in use by another account');
        END IF;
    END IF;

    -- Validate uniqueness for username if changing
    IF p_username IS NOT NULL THEN
        SELECT COUNT(*) INTO v_count FROM users WHERE LOWER(username) = LOWER(p_username) AND user_id != p_user_id;
        IF v_count > 0 THEN
            RAISE_APPLICATION_ERROR(-20038, 'Username already in use by another account');
        END IF;
    END IF;

    -- Update only provided fields (NULL = leave unchanged)
    UPDATE users
    SET username      = NVL(p_username, username),
        email         = NVL(p_email, email),
        first_name    = NVL(p_first_name, first_name),
        last_name     = NVL(p_last_name, last_name),
        phone         = NVL(p_phone, phone),
        address       = NVL(p_address, address),
        profile_image = NVL(p_profile_image, profile_image)
    WHERE user_id = p_user_id;

    IF SQL%ROWCOUNT = 0 THEN
        RAISE_APPLICATION_ERROR(-20039, 'User not found or no changes applied');
    END IF;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- delete user account if its admin or the user themself

CREATE OR REPLACE PROCEDURE delete_user_account (
    p_requestor_id       IN NUMBER,
    p_user_id_to_delete  IN NUMBER
) AS
    v_is_admin           NUMBER := 0;
    v_target_is_admin    NUMBER := 0;
    v_admin_count        NUMBER := 0;
BEGIN
    IF p_requestor_id IS NULL OR p_user_id_to_delete IS NULL THEN
        RAISE_APPLICATION_ERROR(-20041, 'Requestor ID and target User ID cannot be null');
    END IF;

    -- Check if requestor is admin
    SELECT COUNT(*) INTO v_is_admin
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.role_id
    WHERE ur.user_id = p_requestor_id
      AND r.role_name = 'admin';

    -- Only admin or the user themself can delete
    IF v_is_admin = 0 AND p_requestor_id != p_user_id_to_delete THEN
        RAISE_APPLICATION_ERROR(-20042, 'Not authorized: only admin or the user themself can delete this account');
    END IF;

    -- If target is an admin, ensure we are not removing the last admin
    SELECT COUNT(*) INTO v_target_is_admin
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.role_id
    WHERE ur.user_id = p_user_id_to_delete
      AND r.role_name = 'admin';

    IF v_target_is_admin > 0 THEN
        SELECT COUNT(*) INTO v_admin_count
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.role_id
        WHERE r.role_name = 'admin';
        IF v_admin_count <= 1 THEN
            RAISE_APPLICATION_ERROR(-20043, 'Cannot delete the last admin account');
        END IF;
    END IF;

    -- Soft-delete user: deactivate and anonymize username/email to avoid uniqueness conflicts
    UPDATE users
    SET is_active = 0,
        username = 'deleted_user_' || p_user_id_to_delete,
        email = 'deleted+' || p_user_id_to_delete || '@example.invalid'
    WHERE user_id = p_user_id_to_delete;

    IF SQL%ROWCOUNT = 0 THEN
        RAISE_APPLICATION_ERROR(-20044, 'User not found');
    END IF;

    -- Remove role assignments
    DELETE FROM user_roles WHERE user_id = p_user_id_to_delete;

    -- Deactivate delivery agent record if exists
    UPDATE delivery_agents SET is_active = 0 WHERE user_id = p_user_id_to_delete;

    -- Clean up user interaction data
    DELETE FROM carts WHERE user_id = p_user_id_to_delete;

    -- Note: reviews.user_id is defined NOT NULL in schema — nulling it will fail.
    -- If you want to keep reviews, consider setting reviews.user_id = NULL only if column allows NULL,
    -- or set to a sentinel account id (e.g. system user) instead of NULL.
    UPDATE activity_log SET user_id = NULL WHERE user_id = p_user_id_to_delete;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/


-- cart sidebar page

-- Procedure to fetch all cart items for a user

CREATE OR REPLACE PROCEDURE get_user_cart (
    p_user_id IN NUMBER,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    IF p_user_id IS NULL THEN
        RAISE_APPLICATION_ERROR(-20001, 'User ID cannot be null');
    END IF;
    
    OPEN p_cursor FOR
    SELECT 
        c.cart_id,
        c.user_id,
        p.plant_id,
        p.name AS plant_name,
        ps.size_name,
        c.quantity,
        (p.base_price + ps.price_adjustment) AS unit_price,
        pi.image_url AS primary_image,
        u.email AS seller_email,
        c.selected
    FROM carts c
    JOIN plants p ON c.plant_id = p.plant_id
    JOIN plant_sizes ps ON c.size_id = ps.size_id
    LEFT JOIN plant_images pi ON p.plant_id = pi.plant_id AND pi.is_primary = 1
    JOIN users u ON p.seller_id = u.user_id
    WHERE c.user_id = p_user_id
        AND p.is_active = 1
    ORDER BY c.added_at DESC;
END;
/

-- Procedure to toggle selection status of a cart item
CREATE OR REPLACE PROCEDURE toggle_cart_item_selection (
    p_cart_id IN NUMBER,
    p_user_id IN NUMBER
) AS
BEGIN
    IF p_cart_id IS NULL OR p_user_id IS NULL THEN
        RAISE_APPLICATION_ERROR(-20002, 'Cart ID and User ID cannot be null');
    END IF;
    
    UPDATE carts
    SET selected = CASE selected WHEN 1 THEN 0 ELSE 1 END
    WHERE cart_id = p_cart_id
    AND user_id = p_user_id;
    
    IF SQL%ROWCOUNT = 0 THEN
        RAISE_APPLICATION_ERROR(-20003, 'Cart item not found or user not authorized');
    END IF;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- Procedure to delete a cart item
CREATE OR REPLACE PROCEDURE delete_cart_item (
    p_cart_id IN NUMBER,
    p_user_id IN NUMBER
) AS
BEGIN
    IF p_cart_id IS NULL OR p_user_id IS NULL THEN
        RAISE_APPLICATION_ERROR(-20004, 'Cart ID and User ID cannot be null');
    END IF;
    
    DELETE FROM carts
    WHERE cart_id = p_cart_id
    AND user_id = p_user_id;
    
    IF SQL%ROWCOUNT = 0 THEN
        RAISE_APPLICATION_ERROR(-20005, 'Cart item not found or user not authorized');
    END IF;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- Procedure to update cart item quantity

CREATE OR REPLACE PROCEDURE update_cart_item_quantity (
    p_cart_id IN NUMBER,
    p_user_id IN NUMBER,
    p_quantity IN NUMBER
) AS
BEGIN
    IF p_cart_id IS NULL OR p_user_id IS NULL OR p_quantity IS NULL THEN
        RAISE_APPLICATION_ERROR(-20006, 'Cart ID, User ID, and Quantity cannot be null');
    END IF;
    
    IF p_quantity < 1 THEN
        RAISE_APPLICATION_ERROR(-20007, 'Quantity must be at least 1');
    END IF;
    
    UPDATE carts
    SET quantity = p_quantity
    WHERE cart_id = p_cart_id
    AND user_id = p_user_id;
    
    IF SQL%ROWCOUNT = 0 THEN
        RAISE_APPLICATION_ERROR(-20008, 'Cart item not found or user not authorized');
    END IF;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/


-- order page

-- Procedure to fetch available delivery methods

CREATE OR REPLACE PROCEDURE get_delivery_methods (
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
    SELECT 
        method_id AS id,
        name,
        base_cost AS price,
        estimated_days AS time
    FROM delivery_methods
    WHERE is_active = 1
    ORDER BY method_id;
END;
/

-- Procedure to create a new order and its items

CREATE OR REPLACE PROCEDURE create_order (
    p_user_id IN NUMBER,
    p_order_number IN VARCHAR2,
    p_delivery_method_id IN NUMBER,
    p_delivery_address IN VARCHAR2,
    p_delivery_notes IN VARCHAR2,
    p_cart_ids IN VARCHAR2, -- Comma-separated cart IDs
    p_total_amount OUT NUMBER,
    p_order_id OUT NUMBER
) AS
    l_status_id NUMBER;
    l_total_amount NUMBER := 0;
    l_order_id NUMBER;
    l_estimated_delivery_date DATE;
    l_delivery_days NUMBER;
    l_delivery_cost NUMBER;
    l_cart_count NUMBER;
BEGIN
    -- Validate inputs
    IF p_user_id IS NULL OR p_order_number IS NULL OR p_delivery_method_id IS NULL OR p_delivery_address IS NULL THEN
        RAISE_APPLICATION_ERROR(-20009, 'Required input parameters cannot be null');
    END IF;

    -- Check if cart IDs are provided
    IF p_cart_ids IS NULL OR TRIM(p_cart_ids) = '' THEN
        RAISE_APPLICATION_ERROR(-20015, 'Cart IDs cannot be empty');
    END IF;

    -- Count selected cart items
    SELECT COUNT(*)
    INTO l_cart_count
    FROM carts c
    WHERE c.user_id = p_user_id
    AND c.selected = 1
    AND c.cart_id IN (
        SELECT TO_NUMBER(REGEXP_SUBSTR(p_cart_ids, '[^,]+', 1, LEVEL)) 
        FROM dual 
        CONNECT BY REGEXP_SUBSTR(p_cart_ids, '[^,]+', 1, LEVEL) IS NOT NULL
    );

    IF l_cart_count = 0 THEN
        RAISE_APPLICATION_ERROR(-20016, 'No valid selected cart items found');
    END IF;

    -- Debug: Log cart count
    DBMS_OUTPUT.PUT_LINE('Cart items count: ' || l_cart_count);

    -- Get Processing status ID
    SELECT status_id INTO l_status_id
    FROM order_statuses
    WHERE status_name = 'Processing';

    -- Calculate estimated delivery date and get delivery cost
    SELECT CASE 
             WHEN estimated_days LIKE '3-5%' THEN 5
             WHEN estimated_days LIKE '1-2%' THEN 2
             ELSE 0
           END,
           base_cost
    INTO l_delivery_days, l_delivery_cost
    FROM delivery_methods
    WHERE method_id = p_delivery_method_id;

    l_estimated_delivery_date := SYSDATE + l_delivery_days;

    -- Debug: Log delivery details
    DBMS_OUTPUT.PUT_LINE('Delivery Method ID: ' || p_delivery_method_id || ', Cost: ' || l_delivery_cost || ', Days: ' || l_delivery_days);

    -- Calculate total amount for cart items
    SELECT NVL(SUM((p.base_price + NVL(ps.price_adjustment, 0)) * c.quantity), 0)
    INTO l_total_amount
    FROM carts c
    JOIN plants p ON c.plant_id = p.plant_id
    JOIN plant_sizes ps ON c.size_id = ps.size_id
    WHERE c.user_id = p_user_id
    AND c.selected = 1
    AND c.cart_id IN (
        SELECT TO_NUMBER(REGEXP_SUBSTR(p_cart_ids, '[^,]+', 1, LEVEL)) 
        FROM dual 
        CONNECT BY REGEXP_SUBSTR(p_cart_ids, '[^,]+', 1, LEVEL) IS NOT NULL
    );

    l_total_amount := l_total_amount + l_delivery_cost;

    -- Debug: Log total amount
    DBMS_OUTPUT.PUT_LINE('Calculated Total Amount: ' || l_total_amount);

    -- Insert into orders table
    INSERT INTO orders (
        user_id,
        order_number,
        order_date,
        status_id,
        delivery_method_id,
        delivery_address,
        delivery_notes,
        estimated_delivery_date,
        total_amount
    ) VALUES (
        p_user_id,
        p_order_number,
        SYSTIMESTAMP,
        l_status_id,
        p_delivery_method_id,
        p_delivery_address,
        p_delivery_notes,
        l_estimated_delivery_date,
        l_total_amount
    ) RETURNING order_id INTO l_order_id;

    -- Debug: Log order ID
    DBMS_OUTPUT.PUT_LINE('Order Inserted, ID: ' || l_order_id);

    -- Insert order items from selected cart items
    INSERT INTO order_items (
        order_id,
        plant_id,
        size_id,
        quantity,
        unit_price,
        discount_applied
    )
    SELECT 
        l_order_id,
        c.plant_id,
        c.size_id,
        c.quantity,
        (p.base_price + NVL(ps.price_adjustment, 0)) AS unit_price,
        NVL((
            SELECT CASE 
                   WHEN d.is_percentage = 1 THEN (p.base_price + NVL(ps.price_adjustment, 0)) * (d.discount_value / 100)
                   ELSE d.discount_value
                   END
            FROM plant_discounts pd
            JOIN discounts d ON pd.discount_id = d.discount_id
            WHERE pd.plant_id = c.plant_id
            AND d.is_active = 1
            AND SYSTIMESTAMP BETWEEN d.start_date AND d.end_date
            AND ROWNUM = 1
        ), 0) AS discount_applied
    FROM carts c
    JOIN plants p ON c.plant_id = p.plant_id
    JOIN plant_sizes ps ON c.size_id = ps.size_id
    WHERE c.user_id = p_user_id
    AND c.selected = 1
    AND c.cart_id IN (
        SELECT TO_NUMBER(REGEXP_SUBSTR(p_cart_ids, '[^,]+', 1, LEVEL)) 
        FROM dual 
        CONNECT BY REGEXP_SUBSTR(p_cart_ids, '[^,]+', 1, LEVEL) IS NOT NULL
    );

    -- Debug: Log number of order items inserted
    DBMS_OUTPUT.PUT_LINE('Order Items Inserted: ' || SQL%ROWCOUNT);

    -- Delete selected cart items
    DELETE FROM carts
    WHERE user_id = p_user_id
    AND selected = 1
    AND cart_id IN (
        SELECT TO_NUMBER(REGEXP_SUBSTR(p_cart_ids, '[^,]+', 1, LEVEL)) 
        FROM dual 
        CONNECT BY REGEXP_SUBSTR(p_cart_ids, '[^,]+', 1, LEVEL) IS NOT NULL
    );

    -- Debug: Log number of cart items deleted
    DBMS_OUTPUT.PUT_LINE('Cart Items Deleted: ' || SQL%ROWCOUNT);

    -- Assign output parameters
    p_total_amount := l_total_amount;
    p_order_id := l_order_id;

    COMMIT;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20010, 'Invalid delivery method, status, or data not found');
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20011, 'Error creating order: ' || SQLERRM);
END;
/

-- admin dashboard page

-- Procedure to apply discount

CREATE OR REPLACE PROCEDURE apply_discount (
    p_discount_type_id IN NUMBER,
    p_discount_value IN NUMBER,
    p_is_percentage IN NUMBER,
    p_start_date IN TIMESTAMP,
    p_end_date IN TIMESTAMP,
    p_category_id IN NUMBER DEFAULT NULL,
    p_plant_id IN NUMBER DEFAULT NULL
) AS
    v_discount_id NUMBER;
    v_discount_type_name VARCHAR2(50);
BEGIN
    -- Validate inputs
    IF p_discount_type_id IS NULL OR p_discount_value IS NULL OR p_start_date IS NULL OR p_end_date IS NULL THEN
        RAISE_APPLICATION_ERROR(-20012, 'Required discount parameters cannot be null');
    END IF;
    
    -- Check if plant-wise discount requires plant_id
    SELECT name INTO v_discount_type_name 
    FROM discount_types 
    WHERE discount_type_id = p_discount_type_id;
    
    IF v_discount_type_name = 'Plant-specific' AND p_plant_id IS NULL THEN
        RAISE_APPLICATION_ERROR(-20013, 'Plant-specific discount requires a plant ID');
    END IF;
    
    IF v_discount_type_name = 'Category' AND p_category_id IS NULL THEN
        RAISE_APPLICATION_ERROR(-20014, 'Category discount requires a category ID');
    END IF;
    
    -- Create discount
    INSERT INTO discounts (discount_type_id, name, description, discount_value, is_percentage, start_date, end_date)
    VALUES (
        p_discount_type_id,
        (SELECT name FROM discount_types WHERE discount_type_id = p_discount_type_id) || ' Discount',
        'Applied discount',
        p_discount_value,
        p_is_percentage,
        p_start_date,
        p_end_date
    ) RETURNING discount_id INTO v_discount_id;
    
    -- Apply discount to plants or categories
    IF v_discount_type_name = 'Plant-specific' THEN
        INSERT INTO plant_discounts (plant_id, discount_id)
        VALUES (p_plant_id, v_discount_id);
    ELSIF v_discount_type_name = 'Category' THEN
        INSERT INTO plant_discounts (category_id, discount_id)
        VALUES (p_category_id, v_discount_id);
    ELSE
        -- For seasonal, festive, special discounts - apply to all plants
        INSERT INTO plant_discounts (discount_id)
        SELECT v_discount_id FROM dual;
    END IF;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/



-- Procedure to get order details with delivery info

CREATE OR REPLACE PROCEDURE get_order_details_with_delivery (
    p_order_id IN NUMBER,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
    SELECT 
        o.order_id,
        o.order_number,
        TO_CHAR(o.order_date, 'YYYY-MM-DD HH24:MI:SS') AS order_date,
        os.status_name AS order_status,
        o.total_amount,
        dm.name AS delivery_method,
        dm.base_cost AS delivery_cost,
        o.delivery_address,
        o.delivery_notes,
        TO_CHAR(o.estimated_delivery_date, 'YYYY-MM-DD') AS estimated_delivery,
        u.user_id AS customer_id,
        u.first_name || ' ' || u.last_name AS customer_name,
        u.email AS customer_email,
        u.phone AS customer_phone,
        da.agent_id,
        du.first_name || ' ' || du.last_name AS delivery_agent_name,
        du.phone AS delivery_agent_phone,
        da.vehicle_type,
        (SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'plant_id' VALUE p.plant_id,
                        'plant_name' VALUE p.name,
                        'image_url' VALUE pi.image_url,
                        'quantity' VALUE oi.quantity,
                        'unit_price' VALUE oi.unit_price,
                        'size_name' VALUE ps.size_name,
                        'subtotal' VALUE (oi.quantity * oi.unit_price)
                    ) RETURNING CLOB
                )
         FROM order_items oi
         JOIN plants p ON oi.plant_id = p.plant_id
         LEFT JOIN plant_images pi ON p.plant_id = pi.plant_id AND pi.is_primary = 1
         LEFT JOIN plant_sizes ps ON oi.size_id = ps.size_id
         WHERE oi.order_id = o.order_id) AS items
    FROM orders o
    JOIN order_statuses os ON o.status_id = os.status_id
    JOIN delivery_methods dm ON o.delivery_method_id = dm.method_id
    JOIN users u ON o.user_id = u.user_id
    LEFT JOIN order_assignments oa ON o.order_id = oa.order_id
    LEFT JOIN delivery_agents da ON oa.agent_id = da.agent_id
    LEFT JOIN users du ON da.user_id = du.user_id
    WHERE o.order_id = p_order_id;
END;
/

-- admin
-- Procedure to get all orders for a user


CREATE OR REPLACE PROCEDURE get_user_orders (
    p_user_id IN NUMBER,
    p_status_name IN VARCHAR2 DEFAULT NULL,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
    SELECT 
        o.order_id,
        o.order_number,
        TO_CHAR(o.order_date, 'YYYY-MM-DD HH24:MI:SS') AS order_date,
        os.status_name AS order_status,
        o.total_amount,
        dm.name AS delivery_method,
        o.delivery_address,
        TO_CHAR(o.estimated_delivery_date, 'YYYY-MM-DD') AS estimated_delivery,
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.order_id) AS item_count,
        (SELECT pi.image_url 
         FROM order_items oi 
         JOIN plants p ON oi.plant_id = p.plant_id
         LEFT JOIN plant_images pi ON p.plant_id = pi.plant_id AND pi.is_primary = 1
         WHERE oi.order_id = o.order_id AND ROWNUM = 1) AS primary_image
    FROM orders o
    JOIN order_statuses os ON o.status_id = os.status_id
    JOIN delivery_methods dm ON o.delivery_method_id = dm.method_id
    WHERE o.user_id = p_user_id
    AND (p_status_name IS NULL OR os.status_name = p_status_name)
    ORDER BY o.order_date DESC;
END;
/


-- delivery confirmation page

-- Procedure for delivery confirmation

CREATE OR REPLACE PROCEDURE confirm_delivery (
    p_order_id IN NUMBER,
    p_user_type IN VARCHAR2, -- 'customer' or 'agent'
    p_user_id IN NUMBER
) AS
    v_confirmation_id NUMBER;
    v_customer_confirmed NUMBER(1);
    v_agent_confirmed NUMBER(1);
    v_agent_id NUMBER;
    v_customer_id NUMBER;
BEGIN
    -- Get delivery confirmation record
    SELECT confirmation_id, customer_confirmed, agent_confirmed, agent_id, user_id
    INTO v_confirmation_id, v_customer_confirmed, v_agent_confirmed, v_agent_id, v_customer_id
    FROM delivery_confirmations
    WHERE order_id = p_order_id;
    
    -- Update confirmation based on user type
    IF p_user_type = 'customer' AND p_user_id = v_customer_id THEN
        UPDATE delivery_confirmations
        SET customer_confirmed = 1,
            confirmed_date = CASE WHEN v_agent_confirmed = 1 THEN SYSTIMESTAMP ELSE confirmed_date END
        WHERE order_id = p_order_id;
    ELSIF p_user_type = 'agent' AND p_user_id = v_agent_id THEN
        UPDATE delivery_confirmations
        SET agent_confirmed = 1,
            confirmed_date = CASE WHEN v_customer_confirmed = 1 THEN SYSTIMESTAMP ELSE confirmed_date END
        WHERE order_id = p_order_id;
    ELSE
        RAISE_APPLICATION_ERROR(-20017, 'Invalid user type or user not authorized for this order');
    END IF;
    
    -- If both confirmed, update order status to Delivered
    IF (p_user_type = 'customer' AND v_agent_confirmed = 1) OR 
       (p_user_type = 'agent' AND v_customer_confirmed = 1) THEN
        UPDATE orders
        SET status_id = (SELECT status_id FROM order_statuses WHERE status_name = 'Delivered'),
            actual_delivery_date = SYSTIMESTAMP
        WHERE order_id = p_order_id;
    END IF;
    
    COMMIT;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20018, 'Delivery confirmation record not found for this order');
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- Admin dashboard procedures

CREATE OR REPLACE PROCEDURE get_admin_dashboard_stats (
    p_total_customers OUT NUMBER,
    p_total_delivery_agents OUT NUMBER,
    p_total_sellers OUT NUMBER,
    p_total_revenue OUT NUMBER,
    p_pending_orders OUT NUMBER,
    p_low_stock_alerts OUT NUMBER
) AS
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM users u 
         JOIN user_roles ur ON u.user_id = ur.user_id 
         JOIN roles r ON ur.role_id = r.role_id 
         WHERE r.role_name = 'customer'),
        (SELECT COUNT(*) FROM delivery_agents WHERE is_active = 1),
        (SELECT COUNT(*) FROM users u 
         JOIN user_roles ur ON u.user_id = ur.user_id 
         JOIN roles r ON ur.role_id = r.role_id 
         WHERE r.role_name = 'seller'),
        (SELECT NVL(SUM(total_amount), 0) FROM orders 
         WHERE status_id IN (SELECT status_id FROM order_statuses WHERE status_name IN ('Delivered', 'Shipped'))),
        (SELECT COUNT(*) FROM orders 
         WHERE status_id IN (SELECT status_id FROM order_statuses WHERE status_name = 'Processing')),
        (SELECT COUNT(*) FROM low_stock_alerts WHERE is_resolved = 0)
    INTO p_total_customers, p_total_delivery_agents, p_total_sellers, 
         p_total_revenue, p_pending_orders, p_low_stock_alerts
    FROM dual;
END;
/

CREATE OR REPLACE PROCEDURE get_user_list (
    p_role_name IN VARCHAR2,
    p_total_users OUT NUMBER,
    p_avg_metric OUT NUMBER,
    p_max_metric OUT NUMBER
) AS
BEGIN
    SELECT 
        COUNT(*),
        AVG(CASE 
            WHEN p_role_name = 'customer' THEN
                (SELECT COUNT(*) FROM orders o 
                 WHERE o.user_id = u.user_id 
                 AND o.status_id IN (SELECT status_id FROM order_statuses WHERE status_name = 'Delivered'))
            WHEN p_role_name = 'delivery' THEN
                (SELECT COUNT(*) FROM order_assignments oa 
                 JOIN orders o ON oa.order_id = o.order_id 
                 WHERE oa.agent_id = da.agent_id 
                 AND o.status_id IN (SELECT status_id FROM order_statuses WHERE status_name = 'Delivered'))
            WHEN p_role_name = 'seller' THEN
                (SELECT COUNT(*) FROM plants p WHERE p.seller_id = u.user_id)
        END),
        MAX(CASE 
            WHEN p_role_name = 'customer' THEN
                (SELECT COUNT(*) FROM orders o 
                 WHERE o.user_id = u.user_id 
                 AND o.status_id IN (SELECT status_id FROM order_statuses WHERE status_name = 'Delivered'))
            WHEN p_role_name = 'delivery' THEN
                (SELECT COUNT(*) FROM order_assignments oa 
                 JOIN orders o ON oa.order_id = o.order_id 
                 WHERE oa.agent_id = da.agent_id 
                 AND o.status_id IN (SELECT status_id FROM order_statuses WHERE status_name = 'Delivered'))
            WHEN p_role_name = 'seller' THEN
                (SELECT COUNT(*) FROM plants p WHERE p.seller_id = u.user_id)
        END)
    INTO p_total_users, p_avg_metric, p_max_metric
    FROM users u
    JOIN user_roles ur ON u.user_id = ur.user_id
    JOIN roles r ON ur.role_id = r.role_id
    LEFT JOIN delivery_agents da ON u.user_id = da.user_id AND p_role_name = 'delivery'
    WHERE r.role_name = p_role_name
    AND u.is_active = 1;
END;
/

-- Procedure to assign delivery agent with slot checking

CREATE OR REPLACE PROCEDURE assign_delivery_agent (
    p_order_id IN NUMBER,
    p_agent_id IN NUMBER DEFAULT NULL
) AS
    v_available_agent_id NUMBER;
    v_order_date DATE;
    v_delivery_method_id NUMBER;
    v_estimated_days VARCHAR2(50);
    v_slot_date DATE;
    v_slot_time VARCHAR2(20);
    v_slot_count NUMBER := 0; -- declared to fix compiler error
BEGIN
    -- Get order details
    SELECT o.order_date, o.delivery_method_id, dm.estimated_days
    INTO v_order_date, v_delivery_method_id, v_estimated_days
    FROM orders o
    JOIN delivery_methods dm ON o.delivery_method_id = dm.method_id
    WHERE o.order_id = p_order_id;
    
    -- Calculate delivery date based on estimated days
    IF v_estimated_days LIKE '1-2%' THEN
        v_slot_date := v_order_date + 2;
    ELSIF v_estimated_days LIKE '3-5%' THEN
        v_slot_date := v_order_date + 4;
    ELSE
        v_slot_date := v_order_date + 1;
    END IF;
    
    -- Determine slot time (morning, afternoon, evening)
    v_slot_time := CASE 
        WHEN EXTRACT(HOUR FROM SYSTIMESTAMP) < 12 THEN 'morning'
        WHEN EXTRACT(HOUR FROM SYSTIMESTAMP) < 17 THEN 'afternoon'
        ELSE 'evening'
    END;
    
    -- If no specific agent provided, find one with available slots
    IF p_agent_id IS NULL THEN
        SELECT agent_id INTO v_available_agent_id
        FROM (
            SELECT da.agent_id, COUNT(ds.slot_id) AS slot_count
            FROM delivery_agents da
            LEFT JOIN delivery_slots ds ON da.agent_id = ds.agent_id 
                AND ds.slot_date = v_slot_date 
                AND ds.is_available = 0
            WHERE da.is_active = 1
            GROUP BY da.agent_id
            HAVING COUNT(ds.slot_id) < 3
            ORDER BY slot_count ASC
        ) WHERE ROWNUM = 1;
    ELSE
        v_available_agent_id := p_agent_id;
        
        -- Check if agent has available slots
        SELECT COUNT(*) INTO v_slot_count
        FROM delivery_slots
        WHERE agent_id = v_available_agent_id
        AND slot_date = v_slot_date
        AND is_available = 0;
        
        IF v_slot_count >= 3 THEN
            RAISE_APPLICATION_ERROR(-20019, 'Selected agent has no available slots for the delivery date');
        END IF;
    END IF;

    IF v_available_agent_id IS NULL THEN
        RAISE_APPLICATION_ERROR(-20020, 'No available delivery agents found');
    END IF;
    
    -- Assign agent to order
    INSERT INTO order_assignments (order_id, agent_id)
    VALUES (p_order_id, v_available_agent_id);
    
    -- Create delivery slot
    INSERT INTO delivery_slots (agent_id, slot_date, slot_time, is_available, order_id)
    VALUES (v_available_agent_id, v_slot_date, v_slot_time, 0, p_order_id);
    
    -- Create delivery confirmation record
    INSERT INTO delivery_confirmations (order_id, user_id, agent_id)
    SELECT p_order_id, o.user_id, v_available_agent_id
    FROM orders o
    WHERE o.order_id = p_order_id;
    
    -- Update order status to Shipped
    UPDATE orders
    SET status_id = (SELECT status_id FROM order_statuses WHERE status_name = 'Shipped')
    WHERE order_id = p_order_id;
    
    COMMIT;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20020, 'No available delivery agents found');
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/



-- Procedure to get activity log

CREATE OR REPLACE PROCEDURE get_activity_log (
    p_activity_type IN VARCHAR2 DEFAULT NULL,
    p_start_date IN TIMESTAMP DEFAULT NULL,
    p_end_date IN TIMESTAMP DEFAULT NULL,
    p_total_activities OUT NUMBER,
    p_unique_users OUT NUMBER,
    p_most_common_type OUT VARCHAR2,
    p_recent_activity_count OUT NUMBER
) AS
BEGIN
    -- Get total activities
    SELECT COUNT(*)
    INTO p_total_activities
    FROM activity_log al
    WHERE (p_activity_type IS NULL OR al.activity_type = p_activity_type)
    AND (p_start_date IS NULL OR al.activity_timestamp >= p_start_date)
    AND (p_end_date IS NULL OR al.activity_timestamp <= p_end_date);

    -- Get unique users
    SELECT COUNT(DISTINCT user_id)
    INTO p_unique_users
    FROM activity_log al
    WHERE (p_activity_type IS NULL OR al.activity_type = p_activity_type)
    AND (p_start_date IS NULL OR al.activity_timestamp >= p_start_date)
    AND (p_end_date IS NULL OR al.activity_timestamp <= p_end_date);

    -- Get most common activity type
    BEGIN
        SELECT activity_type
        INTO p_most_common_type
        FROM (
            SELECT activity_type, COUNT(*) as count
            FROM activity_log
            WHERE (p_activity_type IS NULL OR activity_type = p_activity_type)
            AND (p_start_date IS NULL OR activity_timestamp >= p_start_date)
            AND (p_end_date IS NULL OR activity_timestamp <= p_end_date)
            GROUP BY activity_type
            ORDER BY count DESC
        ) WHERE ROWNUM = 1;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_most_common_type := 'N/A';
    END;

    -- Get recent activities (last 24 hours)
    SELECT COUNT(*)
    INTO p_recent_activity_count
    FROM activity_log 
    WHERE (p_activity_type IS NULL OR activity_type = p_activity_type)
    AND (p_start_date IS NULL OR activity_timestamp >= p_start_date)
    AND (p_end_date IS NULL OR activity_timestamp <= p_end_date)
    AND activity_timestamp >= SYSTIMESTAMP - INTERVAL '24' HOUR;
END;
/

-- Procedure to get low stock alerts

CREATE OR REPLACE PROCEDURE get_low_stock_alerts (
    p_resolved IN NUMBER DEFAULT NULL,
    p_total_alerts OUT NUMBER,
    p_unresolved_alerts OUT NUMBER,
    p_avg_stock_level OUT NUMBER,
    p_most_affected_seller OUT VARCHAR2
) AS
BEGIN
    -- Get total alerts
    SELECT COUNT(*)
    INTO p_total_alerts
    FROM low_stock_alerts lsa
    WHERE (p_resolved IS NULL OR lsa.is_resolved = p_resolved);

    -- Get unresolved alerts
    SELECT COUNT(*)
    INTO p_unresolved_alerts
    FROM low_stock_alerts lsa
    WHERE is_resolved = 0
    AND (p_resolved IS NULL OR lsa.is_resolved = p_resolved);

    -- Get average stock level for low stock alerts
    SELECT AVG(lsa.current_stock)
    INTO p_avg_stock_level
    FROM low_stock_alerts lsa
    WHERE (p_resolved IS NULL OR lsa.is_resolved = p_resolved);

    -- Get seller with most low stock alerts
    BEGIN
        SELECT u.first_name || ' ' || u.last_name
        INTO p_most_affected_seller
        FROM (
            SELECT p.seller_id, COUNT(*) as alert_count
            FROM low_stock_alerts lsa
            JOIN plants p ON lsa.plant_id = p.plant_id
            WHERE (p_resolved IS NULL OR lsa.is_resolved = p_resolved)
            GROUP BY p.seller_id
            ORDER BY alert_count DESC
        ) seller_alerts
        JOIN users u ON seller_alerts.seller_id = u.user_id
        WHERE ROWNUM = 1;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_most_affected_seller := 'None';
    END;
END;
/

-- Delivery agent procedures

CREATE OR REPLACE PROCEDURE get_delivery_agent_orders (
    p_agent_id IN NUMBER,
    p_status_name IN VARCHAR2 DEFAULT NULL,
    p_order_count OUT NUMBER,
    p_total_amount OUT NUMBER,
    p_avg_items OUT NUMBER
) AS
BEGIN
    SELECT 
        COUNT(*),
        NVL(SUM(o.total_amount), 0),
        NVL(AVG((SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.order_id)), 0)
    INTO p_order_count, p_total_amount, p_avg_items
    FROM orders o
    JOIN order_statuses os ON o.status_id = os.status_id
    JOIN order_assignments oa ON o.order_id = oa.order_id
    JOIN users u ON o.user_id = u.user_id
    WHERE oa.agent_id = p_agent_id
    AND (p_status_name IS NULL OR os.status_name = p_status_name);
END;
/


CREATE OR REPLACE PROCEDURE get_delivery_agent_stats (
    p_agent_id IN NUMBER,
    p_completed_deliveries OUT NUMBER,
    p_pending_deliveries OUT NUMBER,
    p_total_earnings OUT NUMBER
) AS
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM order_assignments oa 
         JOIN orders o ON oa.order_id = o.order_id 
         WHERE oa.agent_id = p_agent_id 
         AND o.status_id IN (SELECT status_id FROM order_statuses WHERE status_name = 'Delivered')),

        (SELECT COUNT(*) FROM order_assignments oa 
         JOIN orders o ON oa.order_id = o.order_id 
         WHERE oa.agent_id = p_agent_id 
         AND o.status_id IN (SELECT status_id FROM order_statuses WHERE status_name IN ('Processing', 'Shipped'))),

        (SELECT COUNT(*) FROM order_assignments oa 
         JOIN orders o ON oa.order_id = o.order_id 
         WHERE oa.agent_id = p_agent_id 
         AND o.status_id IN (SELECT status_id FROM order_statuses WHERE status_name = 'Delivered')) * 134
    INTO p_completed_deliveries, p_pending_deliveries, p_total_earnings
    FROM dual;
END;
/




-- Seller procedures

CREATE OR REPLACE PROCEDURE get_seller_stats (
    p_seller_id IN NUMBER,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
    SELECT 
        (SELECT COUNT(*) FROM plants WHERE seller_id = p_seller_id) AS total_plants,
        (SELECT NVL(SUM(oi.quantity), 0) FROM order_items oi 
         JOIN plants p ON oi.plant_id = p.plant_id 
         JOIN orders o ON oi.order_id = o.order_id 
         WHERE p.seller_id = p_seller_id 
         AND o.status_id IN (SELECT status_id FROM order_statuses WHERE status_name = 'Delivered')) AS total_sold,
        (SELECT NVL(SUM(oi.quantity * oi.unit_price * 0.9), 0) FROM order_items oi 
         JOIN plants p ON oi.plant_id = p.plant_id 
         JOIN orders o ON oi.order_id = o.order_id 
         WHERE p.seller_id = p_seller_id 
         AND o.status_id IN (SELECT status_id FROM order_statuses WHERE status_name = 'Delivered')) AS total_earnings
    FROM dual;
END;
/

CREATE OR REPLACE PROCEDURE get_seller_plants (
    p_seller_id IN NUMBER,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
        SELECT 
            p.plant_id,
            p.name,
            p.base_price,
            p.stock_quantity,
            COUNT(pcm.category_id) AS category_count
        FROM plants p
        LEFT JOIN plant_category_mapping pcm ON p.plant_id = pcm.plant_id
        WHERE p.seller_id = p_seller_id
        AND p.is_active = 1
        GROUP BY p.plant_id, p.name, p.base_price, p.stock_quantity;
END;
/


CREATE OR REPLACE PROCEDURE get_seller_sales (
    p_seller_id IN NUMBER,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
    SELECT 
        o.order_id,
        o.order_number,
        TO_CHAR(o.order_date, 'YYYY-MM-DD') AS order_date,
        p.name AS plant_name,
        oi.quantity,
        oi.unit_price,
        (oi.quantity * oi.unit_price) AS total_amount,
        (oi.quantity * oi.unit_price * 0.9) AS seller_earnings,
        os.status_name AS order_status
    FROM order_items oi
    JOIN plants p ON oi.plant_id = p.plant_id
    JOIN orders o ON oi.order_id = o.order_id
    JOIN order_statuses os ON o.status_id = os.status_id
    WHERE p.seller_id = p_seller_id
    AND o.status_id IN (SELECT status_id FROM order_statuses WHERE status_name = 'Delivered')
    ORDER BY o.order_date DESC;
END;
/

-- Procedure to add plant with all details

CREATE OR REPLACE PROCEDURE add_plant (
    p_name IN VARCHAR2,
    p_description IN CLOB,
    p_base_price IN NUMBER,
    p_stock_quantity IN NUMBER,
    p_seller_id IN NUMBER,
    p_category_ids IN VARCHAR2, -- Comma-separated category IDs
    p_images IN VARCHAR2, -- Comma-separated image URLs
    p_features IN VARCHAR2, -- Comma-separated features
    p_care_tips IN VARCHAR2, -- Comma-separated care tips
    p_sizes IN VARCHAR2 -- Comma-separated size:adjustment pairs (e.g., "Small:-5.00,Medium:0.00,Large:10.00")
) AS
    v_plant_id NUMBER;
    v_category_id NUMBER;
    v_image_url VARCHAR2(255);
    v_feature_text VARCHAR2(255);
    v_care_tip_text VARCHAR2(255);
    v_size_name VARCHAR2(50);
    v_price_adjustment NUMBER(10,2);
    v_idx NUMBER;
    v_seller_count NUMBER := 0; -- added
BEGIN
    -- Validate seller (fixed: use COUNT instead of IF NOT EXISTS)
    SELECT COUNT(*) INTO v_seller_count
    FROM users u
    JOIN user_roles ur ON u.user_id = ur.user_id
    JOIN roles r ON ur.role_id = r.role_id
    WHERE u.user_id = p_seller_id AND r.role_name = 'seller';

    IF v_seller_count = 0 THEN
        RAISE_APPLICATION_ERROR(-20021, 'User is not a seller');
    END IF;
    
    -- Insert plant
    INSERT INTO plants (name, description, base_price, stock_quantity, seller_id)
    VALUES (p_name, p_description, p_base_price, p_stock_quantity, p_seller_id)
    RETURNING plant_id INTO v_plant_id;
    
    -- Add categories
    FOR i IN 1..REGEXP_COUNT(NVL(p_category_ids,''), '[^,]+') LOOP
        v_category_id := TO_NUMBER(TRIM(REGEXP_SUBSTR(p_category_ids, '[^,]+', 1, i)));
        
        INSERT INTO plant_category_mapping (plant_id, category_id)
        VALUES (v_plant_id, v_category_id);
    END LOOP;
    
    -- Add images (first image is primary)
    FOR i IN 1..REGEXP_COUNT(NVL(p_images,''), '[^,]+') LOOP
        v_image_url := TRIM(REGEXP_SUBSTR(p_images, '[^,]+', 1, i));
        
        INSERT INTO plant_images (plant_id, image_url, is_primary)
        VALUES (v_plant_id, v_image_url, CASE WHEN i = 1 THEN 1 ELSE 0 END);
    END LOOP;
    
    -- Add features
    FOR i IN 1..REGEXP_COUNT(NVL(p_features,''), '[^,]+') LOOP
        v_feature_text := TRIM(REGEXP_SUBSTR(p_features, '[^,]+', 1, i));
        
        INSERT INTO plant_features (plant_id, feature_text)
        VALUES (v_plant_id, v_feature_text);
    END LOOP;
    
    -- Add care tips
    FOR i IN 1..REGEXP_COUNT(NVL(p_care_tips,''), '[^,]+') LOOP
        v_care_tip_text := TRIM(REGEXP_SUBSTR(p_care_tips, '[^,]+', 1, i));
        
        INSERT INTO plant_care_tips (plant_id, tip_text)
        VALUES (v_plant_id, v_care_tip_text);
    END LOOP;
    
    -- Add sizes
    FOR i IN 1..REGEXP_COUNT(NVL(p_sizes,''), '[^,]+') LOOP
        v_idx := INSTR(REGEXP_SUBSTR(p_sizes, '[^,]+', 1, i), ':');
        v_size_name := TRIM(SUBSTR(REGEXP_SUBSTR(p_sizes, '[^,]+', 1, i), 1, v_idx - 1));
        v_price_adjustment := TO_NUMBER(TRIM(SUBSTR(REGEXP_SUBSTR(p_sizes, '[^,]+', 1, i), v_idx + 1)));
        
        INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
        VALUES (v_plant_id, v_size_name, v_price_adjustment);
    END LOOP;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/


-- Procedure to update plant details

CREATE OR REPLACE PROCEDURE update_plant_details (
    p_requestor_id    IN NUMBER,
    p_plant_id        IN NUMBER,
    p_name            IN VARCHAR2 DEFAULT NULL,
    p_description     IN CLOB DEFAULT NULL,
    p_base_price      IN NUMBER DEFAULT NULL,
    p_stock_quantity  IN NUMBER DEFAULT NULL,
    p_category_ids    IN VARCHAR2 DEFAULT NULL, -- Comma-separated category IDs
    p_images          IN VARCHAR2 DEFAULT NULL, -- Comma-separated image URLs
    p_features        IN VARCHAR2 DEFAULT NULL, -- Comma-separated features
    p_care_tips       IN VARCHAR2 DEFAULT NULL, -- Comma-separated care tips
    p_sizes           IN VARCHAR2 DEFAULT NULL  -- Comma-separated size:adjustment pairs
) AS
    v_seller_id NUMBER;
    v_is_admin  NUMBER := 0;
    v_idx NUMBER;
    v_category_id NUMBER;
    v_image_url VARCHAR2(255);
    v_feature_text VARCHAR2(255);
    v_care_tip_text VARCHAR2(255);
    v_size_name VARCHAR2(50);
    v_price_adjustment NUMBER(10,2);
BEGIN
    -- verify plant exists and get its seller
    BEGIN
        SELECT seller_id INTO v_seller_id FROM plants WHERE plant_id = p_plant_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20024, 'Plant not found');
    END;

    -- check if requestor is admin
    SELECT COUNT(*) INTO v_is_admin
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.role_id
    WHERE ur.user_id = p_requestor_id
      AND r.role_name = 'admin';

    -- allow only admin or the original seller to update
    IF v_is_admin = 0 AND p_requestor_id != v_seller_id THEN
        RAISE_APPLICATION_ERROR(-20023, 'Not authorized: only admin or the seller who uploaded the plant can update it');
    END IF;

    -- update only provided fields (NULL means leave unchanged)
    UPDATE plants
    SET name          = NVL(p_name, name),
        description   = CASE WHEN p_description IS NOT NULL THEN p_description ELSE description END,
        base_price    = NVL(p_base_price, base_price),
        stock_quantity= NVL(p_stock_quantity, stock_quantity),
        updated_at    = SYSTIMESTAMP
    WHERE plant_id = p_plant_id;

    -- categories: replace only if passed
    IF p_category_ids IS NOT NULL THEN
        DELETE FROM plant_category_mapping WHERE plant_id = p_plant_id;
        FOR i IN 1..REGEXP_COUNT(p_category_ids, '[^,]+') LOOP
            v_category_id := TO_NUMBER(TRIM(REGEXP_SUBSTR(p_category_ids, '[^,]+', 1, i)));
            INSERT INTO plant_category_mapping (plant_id, category_id)
            VALUES (p_plant_id, v_category_id);
        END LOOP;
    END IF;

    -- images: replace only if passed (first image is primary)
    IF p_images IS NOT NULL THEN
        DELETE FROM plant_images WHERE plant_id = p_plant_id;
        FOR i IN 1..REGEXP_COUNT(p_images, '[^,]+') LOOP
            v_image_url := TRIM(REGEXP_SUBSTR(p_images, '[^,]+', 1, i));
            INSERT INTO plant_images (plant_id, image_url, is_primary)
            VALUES (p_plant_id, v_image_url, CASE WHEN i = 1 THEN 1 ELSE 0 END);
        END LOOP;
    END IF;

    -- features: replace only if passed
    IF p_features IS NOT NULL THEN
        DELETE FROM plant_features WHERE plant_id = p_plant_id;
        FOR i IN 1..REGEXP_COUNT(p_features, '[^,]+') LOOP
            v_feature_text := TRIM(REGEXP_SUBSTR(p_features, '[^,]+', 1, i));
            INSERT INTO plant_features (plant_id, feature_text)
            VALUES (p_plant_id, v_feature_text);
        END LOOP;
    END IF;

    -- care tips: replace only if passed
    IF p_care_tips IS NOT NULL THEN
        DELETE FROM plant_care_tips WHERE plant_id = p_plant_id;
        FOR i IN 1..REGEXP_COUNT(p_care_tips, '[^,]+') LOOP
            v_care_tip_text := TRIM(REGEXP_SUBSTR(p_care_tips, '[^,]+', 1, i));
            INSERT INTO plant_care_tips (plant_id, tip_text)
            VALUES (p_plant_id, v_care_tip_text);
        END LOOP;
    END IF;

    -- sizes: replace only if passed (format Size:Adjustment)
    IF p_sizes IS NOT NULL THEN
        DELETE FROM plant_sizes WHERE plant_id = p_plant_id;
        FOR i IN 1..REGEXP_COUNT(p_sizes, '[^,]+') LOOP
            v_idx := INSTR(REGEXP_SUBSTR(p_sizes, '[^,]+', 1, i), ':');
            v_size_name := TRIM(SUBSTR(REGEXP_SUBSTR(p_sizes, '[^,]+', 1, i), 1, v_idx - 1));
            v_price_adjustment := TO_NUMBER(TRIM(SUBSTR(REGEXP_SUBSTR(p_sizes, '[^,]+', 1, i), v_idx + 1)));
            INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
            VALUES (p_plant_id, v_size_name, v_price_adjustment);
        END LOOP;
    END IF;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- Procedure to delete plant (only by admin or original seller)

CREATE OR REPLACE PROCEDURE delete_plant (
    p_requestor_id IN NUMBER,
    p_plant_id     IN NUMBER
) AS
    v_seller_id NUMBER;
    v_is_admin  NUMBER := 0;
BEGIN
    -- verify plant exists and fetch seller
    BEGIN
        SELECT seller_id INTO v_seller_id
        FROM plants
        WHERE plant_id = p_plant_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20024, 'Plant not found');
    END;

    -- check if requestor is admin
    SELECT COUNT(*) INTO v_is_admin
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.role_id
    WHERE ur.user_id = p_requestor_id
      AND r.role_name = 'admin';

    -- allow only admin or the original seller to delete (deactivate)
    IF v_is_admin = 0 AND p_requestor_id != v_seller_id THEN
        RAISE_APPLICATION_ERROR(-20023, 'Not authorized: only admin or the seller who uploaded the plant can delete it');
    END IF;

    -- Soft-delete the plant to preserve referential integrity
    UPDATE plants
    SET is_active = 0,
        updated_at = SYSTIMESTAMP
    WHERE plant_id = p_plant_id;

    -- Clean up promotional / user references so deactivated plant doesn't appear in listings
    DELETE FROM plant_discounts WHERE plant_id = p_plant_id;
    DELETE FROM favorites WHERE plant_id = p_plant_id;
    DELETE FROM carts WHERE plant_id = p_plant_id;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- Trigger to handle stock adjustment on plant deactivation

CREATE OR REPLACE TRIGGER trg_plants_deactivate_zero_stock
BEFORE UPDATE OF is_active ON plants
FOR EACH ROW
WHEN (OLD.is_active = 1 AND NEW.is_active = 0)
BEGIN
  -- When a plant is deactivated (soft-deleted), clear its stock so it won't appear available.
  :NEW.stock_quantity := 0;
  :NEW.updated_at := SYSTIMESTAMP;
END;
/


-- sign up page

CREATE OR REPLACE PROCEDURE signup_user(
    p_username IN users.username%TYPE,
    p_email IN users.email%TYPE,
    p_password IN users.password_hash%TYPE,
    p_firstname IN users.first_name%TYPE,
    p_lastname IN users.last_name%TYPE,
    p_phone IN users.phone%TYPE,
    p_address IN users.address%TYPE,
    p_role_name IN roles.role_name%TYPE
) IS
    v_user_id NUMBER;
    v_role_id NUMBER;
    v_role_count NUMBER;
BEGIN
    -- Validate role exists
    SELECT COUNT(*) INTO v_role_count
    FROM roles
    WHERE role_name = p_role_name;
    
    IF v_role_count = 0 THEN
        RAISE_APPLICATION_ERROR(-20050, 'Invalid role name: ' || p_role_name);
    END IF;
    
    -- Insert user
    INSERT INTO users(username, email, password_hash, first_name, last_name, phone, address)
    VALUES (p_username, p_email, p_password, p_firstname, p_lastname, p_phone, p_address)
    RETURNING user_id INTO v_user_id;
    
    -- Get role_id
    SELECT role_id INTO v_role_id
    FROM roles
    WHERE role_name = p_role_name;
    
    -- Assign role to user
    INSERT INTO user_roles(user_id, role_id, assigned_at)
    VALUES (v_user_id, v_role_id, SYSTIMESTAMP);
    
    -- If role is delivery_agent, create delivery agent record
    IF p_role_name = 'delivery_agent' THEN
        INSERT INTO delivery_agents(user_id, vehicle_type, license_number, is_active)
        VALUES (v_user_id, 'Default', NULL, 1);
    END IF;
    
    DBMS_OUTPUT.PUT_LINE('Signup successful for user: ' || p_username || ' with role: ' || p_role_name);
    
    COMMIT;
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Error: Username or Email already exists.');
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Signup failed: ' || SQLERRM);
END;
/

SET SERVEROUTPUT ON;

BEGIN
    signup_user(
        p_username  => 'newuser1',
        p_email     => 'newuser1@example.com',
        p_password  => 'hash123',
        p_firstname => 'New',
        p_lastname  => 'User',
        p_phone     => '0123456789',
        p_address   => '123 New Street'
    );
END;
/



set serveroutput on;
-- login page
select * from users;
SET SERVEROUTPUT ON;

-- Make sure server output is on to see DBMS_OUTPUT
SET SERVEROUTPUT ON;




select * from users where username = 'newuser1';

ALTER PROCEDURE login_user COMPILE;

CREATE OR REPLACE PROCEDURE test_login_user(
    p_username in users.username%type,
    p_password in users.password_hash%type
) IS
    v_count NUMBER;
BEGIN
    
    SELECT COUNT(*) INTO v_count
    FROM users
    WHERE username = p_username AND password_hash = p_password;
    
    IF v_count > 0 THEN
        DBMS_OUTPUT.PUT_LINE('Login successful for: ' || p_username);
    ELSE
        DBMS_OUTPUT.PUT_LINE('Invalid username/email or password.');
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Login failed: ' || SQLERRM);
END;
/



set serveroutput on;
EXEC test_login_user('newuser1', 'hash123');


SELECT object_name, status FROM user_objects WHERE object_name = 'LOGIN_USER';
commit;





select * from users;


































-- Insertion of data


SET SERVEROUTPUT ON;

-- Insert into roles (fewer than 10 as logical roles)
INSERT INTO roles (role_name, description) VALUES ('admin', 'Administrator');
INSERT INTO roles (role_name, description) VALUES ('customer', 'Customer');
INSERT INTO roles (role_name, description) VALUES ('seller', 'Seller');
INSERT INTO roles (role_name, description) VALUES ('delivery_agent', 'Delivery Agent');

-- Insert into discount_types
INSERT INTO discount_types (name, description) VALUES ('Seasonal', 'Seasonal discount');
INSERT INTO discount_types (name, description) VALUES ('Category', 'Category discount');
INSERT INTO discount_types (name, description) VALUES ('Plant-specific', 'Plant specific discount');
INSERT INTO discount_types (name, description) VALUES ('Festive', 'Festive discount');
INSERT INTO discount_types (name, description) VALUES ('Special', 'Special discount');

-- Insert into order_statuses
INSERT INTO order_statuses (status_name, description) VALUES ('Processing', 'Order is being processed');
INSERT INTO order_statuses (status_name, description) VALUES ('Shipped', 'Order shipped');
INSERT INTO order_statuses (status_name, description) VALUES ('Delivered', 'Order delivered');
INSERT INTO order_statuses (status_name, description) VALUES ('Cancelled', 'Order cancelled');
INSERT INTO order_statuses (status_name, description) VALUES ('Returned', 'Order returned');


-- Insert into delivery_methods
INSERT INTO delivery_methods (name, description, base_cost, estimated_days) VALUES ('Standard', 'Standard delivery', 5.00, '3-5 days');
INSERT INTO delivery_methods (name, description, base_cost, estimated_days) VALUES ('Express', 'Express delivery', 10.00, '1-2 days');
INSERT INTO delivery_methods (name, description, base_cost, estimated_days) VALUES ('Pickup', 'Store pickup', 0.00, 'Same day');

-- Insert into users (10 users: 1 admin, 3 sellers, 3 customers, 3 delivery agents)
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address) VALUES ('admin1', 'admin1@example.com', 'hash1', 'Admin', 'One', '1234567890', 'Admin Addr');
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address) VALUES ('seller1', 'seller1@example.com', 'hash2', 'Seller', 'One', '1234567891', 'Seller Addr1');
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address) VALUES ('seller2', 'seller2@example.com', 'hash3', 'Seller', 'Two', '1234567892', 'Seller Addr2');
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address) VALUES ('seller3', 'seller3@example.com', 'hash4', 'Seller', 'Three', '1234567893', 'Seller Addr3');
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address) VALUES ('cust1', 'cust1@example.com', 'hash5', 'Cust', 'One', '1234567894', 'Cust Addr1');
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address) VALUES ('cust2', 'cust2@example.com', 'hash6', 'Cust', 'Two', '1234567895', 'Cust Addr2');
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address) VALUES ('cust3', 'cust3@example.com', 'hash7', 'Cust', 'Three', '1234567896', 'Cust Addr3');
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address) VALUES ('agent1', 'agent1@example.com', 'hash8', 'Agent', 'One', '1234567897', 'Agent Addr1');
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address) VALUES ('agent2', 'agent2@example.com', 'hash9', 'Agent', 'Two', '1234567898', 'Agent Addr2');
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address) VALUES ('agent3', 'agent3@example.com', 'hash10', 'Agent', 'Three', '1234567899', 'Agent Addr3');

-- Assign roles (user_roles)

INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u
JOIN roles r ON r.role_name = 'admin'
WHERE u.username = 'admin1';

INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u
JOIN roles r ON r.role_name = 'seller'
WHERE u.username IN ('seller1','seller2','seller3');

INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u
JOIN roles r ON r.role_name = 'customer'
WHERE u.username IN ('cust1','cust2','cust3');

INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u
JOIN roles r ON r.role_name = 'delivery_agent'
WHERE u.username IN ('agent1','agent2','agent3');

-- Delivery agents using username lookup
INSERT INTO delivery_agents (user_id, vehicle_type, license_number)
SELECT u.user_id, 'Bike', 'LIC1' FROM users u WHERE u.username = 'agent1';

INSERT INTO delivery_agents (user_id, vehicle_type, license_number)
SELECT u.user_id, 'Car', 'LIC2' FROM users u WHERE u.username = 'agent2';

INSERT INTO delivery_agents (user_id, vehicle_type, license_number)
SELECT u.user_id, 'Van', 'LIC3' FROM users u WHERE u.username = 'agent3';

-- Insert into plant_categories (10)
INSERT INTO plant_categories (name, slug) VALUES ('Indoor', 'indoor');
INSERT INTO plant_categories (name, slug) VALUES ('Outdoor', 'outdoor');
INSERT INTO plant_categories (name, slug) VALUES ('Succulents', 'succulents');
INSERT INTO plant_categories (name, slug) VALUES ('Flowers', 'flowers');
INSERT INTO plant_categories (name, slug) VALUES ('Herbs', 'herbs');
INSERT INTO plant_categories (name, slug) VALUES ('Trees', 'trees');
INSERT INTO plant_categories (name, slug) VALUES ('Shrubs', 'shrubs');
INSERT INTO plant_categories (name, slug) VALUES ('Vegetables', 'vegetables');
INSERT INTO plant_categories (name, slug) VALUES ('Fruits', 'fruits');
INSERT INTO plant_categories (name, slug) VALUES ('Cacti', 'cacti');



SELECT user_id, username FROM users;

select * from plants;


INSERT INTO plants (name, description, base_price, stock_quantity, seller_id)
SELECT 'Plant1','Desc1',10.00,100,u.user_id FROM users u WHERE u.username = 'seller1';

INSERT INTO plants (name, description, base_price, stock_quantity, seller_id)
SELECT 'Plant2','Desc2',15.00,150,u.user_id FROM users u WHERE u.username = 'seller1';

INSERT INTO plants (name, description, base_price, stock_quantity, seller_id)
SELECT 'Plant3','Desc3',20.00,200,u.user_id FROM users u WHERE u.username = 'seller2';

INSERT INTO plants (name, description, base_price, stock_quantity, seller_id)
SELECT 'Plant4','Desc4',25.00,250,u.user_id FROM users u WHERE u.username = 'seller2';

INSERT INTO plants (name, description, base_price, stock_quantity, seller_id)
SELECT 'Plant5','Desc5',30.00,300,u.user_id FROM users u WHERE u.username = 'seller3';

INSERT INTO plants (name, description, base_price, stock_quantity, seller_id)
SELECT 'Plant6','Desc6',35.00,350,u.user_id FROM users u WHERE u.username = 'seller3';

INSERT INTO plants (name, description, base_price, stock_quantity, seller_id)
SELECT 'Plant7','Desc7',40.00,400,u.user_id FROM users u WHERE u.username = 'seller1';

INSERT INTO plants (name, description, base_price, stock_quantity, seller_id)
SELECT 'Plant8','Desc8',45.00,450,u.user_id FROM users u WHERE u.username = 'seller2';

INSERT INTO plants (name, description, base_price, stock_quantity, seller_id)
SELECT 'Plant9','Desc9',50.00,500,u.user_id FROM users u WHERE u.username = 'seller3';

INSERT INTO plants (name, description, base_price, stock_quantity, seller_id)
SELECT 'Plant10','Desc10',55.00,550,u.user_id FROM users u WHERE u.username = 'seller1';

COMMIT;


INSERT INTO plant_category_mapping (plant_id, category_id)
SELECT p.plant_id, c.category_id FROM plants p JOIN plant_categories c ON c.slug = 'indoor' WHERE p.name = 'Plant1';

INSERT INTO plant_category_mapping (plant_id, category_id)
SELECT p.plant_id, c.category_id FROM plants p JOIN plant_categories c ON c.slug = 'outdoor' WHERE p.name = 'Plant2';

INSERT INTO plant_category_mapping (plant_id, category_id)
SELECT p.plant_id, c.category_id FROM plants p JOIN plant_categories c ON c.slug = 'succulents' WHERE p.name = 'Plant3';

INSERT INTO plant_category_mapping (plant_id, category_id)
SELECT p.plant_id, c.category_id FROM plants p JOIN plant_categories c ON c.slug = 'flowers' WHERE p.name = 'Plant4';

INSERT INTO plant_category_mapping (plant_id, category_id)
SELECT p.plant_id, c.category_id FROM plants p JOIN plant_categories c ON c.slug = 'herbs' WHERE p.name = 'Plant5';

INSERT INTO plant_category_mapping (plant_id, category_id)
SELECT p.plant_id, c.category_id FROM plants p JOIN plant_categories c ON c.slug = 'trees' WHERE p.name = 'Plant6';

INSERT INTO plant_category_mapping (plant_id, category_id)
SELECT p.plant_id, c.category_id FROM plants p JOIN plant_categories c ON c.slug = 'shrubs' WHERE p.name = 'Plant7';

INSERT INTO plant_category_mapping (plant_id, category_id)
SELECT p.plant_id, c.category_id FROM plants p JOIN plant_categories c ON c.slug = 'vegetables' WHERE p.name = 'Plant8';

INSERT INTO plant_category_mapping (plant_id, category_id)
SELECT p.plant_id, c.category_id FROM plants p JOIN plant_categories c ON c.slug = 'fruits' WHERE p.name = 'Plant9';

INSERT INTO plant_category_mapping (plant_id, category_id)
SELECT p.plant_id, c.category_id FROM plants p JOIN plant_categories c ON c.slug = 'cacti' WHERE p.name = 'Plant10';

COMMIT;


INSERT INTO plant_images (plant_id, image_url, is_primary)
SELECT p.plant_id, 'img1.jpg', 1 FROM plants p WHERE p.name = 'Plant1';

INSERT INTO plant_images (plant_id, image_url, is_primary)
SELECT p.plant_id, 'img1b.jpg', 0 FROM plants p WHERE p.name = 'Plant1';

INSERT INTO plant_images (plant_id, image_url, is_primary)
SELECT p.plant_id, 'img2.jpg', 1 FROM plants p WHERE p.name = 'Plant2';

INSERT INTO plant_images (plant_id, image_url, is_primary)
SELECT p.plant_id, 'img2b.jpg', 0 FROM plants p WHERE p.name = 'Plant2';


INSERT INTO plant_images (plant_id, image_url, is_primary) SELECT p.plant_id, 'img3.jpg', 1 FROM plants p WHERE p.name = 'Plant3';
INSERT INTO plant_images (plant_id, image_url, is_primary) SELECT p.plant_id, 'img3b.jpg', 0 FROM plants p WHERE p.name = 'Plant3';
INSERT INTO plant_images (plant_id, image_url, is_primary) SELECT p.plant_id, 'img4.jpg', 1 FROM plants p WHERE p.name = 'Plant4';
INSERT INTO plant_images (plant_id, image_url, is_primary) SELECT p.plant_id, 'img4b.jpg', 0 FROM plants p WHERE p.name = 'Plant4';
INSERT INTO plant_images (plant_id, image_url, is_primary) SELECT p.plant_id, 'img5.jpg', 1 FROM plants p WHERE p.name = 'Plant5';
INSERT INTO plant_images (plant_id, image_url, is_primary) SELECT p.plant_id, 'img5b.jpg', 0 FROM plants p WHERE p.name = 'Plant5';
INSERT INTO plant_images (plant_id, image_url, is_primary) SELECT p.plant_id, 'img6.jpg', 1 FROM plants p WHERE p.name = 'Plant6';
INSERT INTO plant_images (plant_id, image_url, is_primary) SELECT p.plant_id, 'img6b.jpg', 0 FROM plants p WHERE p.name = 'Plant6';
INSERT INTO plant_images (plant_id, image_url, is_primary) SELECT p.plant_id, 'img7.jpg', 1 FROM plants p WHERE p.name = 'Plant7';
INSERT INTO plant_images (plant_id, image_url, is_primary) SELECT p.plant_id, 'img7b.jpg', 0 FROM plants p WHERE p.name = 'Plant7';
INSERT INTO plant_images (plant_id, image_url, is_primary) SELECT p.plant_id, 'img8.jpg', 1 FROM plants p WHERE p.name = 'Plant8';
INSERT INTO plant_images (plant_id, image_url, is_primary) SELECT p.plant_id, 'img8b.jpg', 0 FROM plants p WHERE p.name = 'Plant8';
INSERT INTO plant_images (plant_id, image_url, is_primary) SELECT p.plant_id, 'img9.jpg', 1 FROM plants p WHERE p.name = 'Plant9';
INSERT INTO plant_images (plant_id, image_url, is_primary) SELECT p.plant_id, 'img9b.jpg', 0 FROM plants p WHERE p.name = 'Plant9';
INSERT INTO plant_images (plant_id, image_url, is_primary) SELECT p.plant_id, 'img10.jpg', 1 FROM plants p WHERE p.name = 'Plant10';
INSERT INTO plant_images (plant_id, image_url, is_primary) SELECT p.plant_id, 'img10b.jpg', 0 FROM plants p WHERE p.name = 'Plant10';

COMMIT;


INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
SELECT p.plant_id, 'Small', -5.00 FROM plants p WHERE p.name = 'Plant1';

INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
SELECT p.plant_id, 'Medium', 0.00 FROM plants p WHERE p.name = 'Plant1';

INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
SELECT p.plant_id, 'Small', -5.00 FROM plants p WHERE p.name = 'Plant2';

INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
SELECT p.plant_id, 'Medium', 0.00 FROM plants p WHERE p.name = 'Plant2';

INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
SELECT p.plant_id, 'Small', -5.00 FROM plants p WHERE p.name = 'Plant3';

INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
SELECT p.plant_id, 'Medium', 0.00 FROM plants p WHERE p.name = 'Plant3';


INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
SELECT p.plant_id, 'Small', -5.00 FROM plants p WHERE p.name = 'Plant4';
INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
SELECT p.plant_id, 'Medium', 0.00 FROM plants p WHERE p.name = 'Plant4';

INSERT INTO plant_sizes (plant_id, size_name, price_adjustment) SELECT p.plant_id, 'Small', -5.00 FROM plants p WHERE p.name = 'Plant5';
INSERT INTO plant_sizes (plant_id, size_name, price_adjustment) SELECT p.plant_id, 'Medium', 0.00 FROM plants p WHERE p.name = 'Plant5';
INSERT INTO plant_sizes (plant_id, size_name, price_adjustment) SELECT p.plant_id, 'Small', -5.00 FROM plants p WHERE p.name = 'Plant6';
INSERT INTO plant_sizes (plant_id, size_name, price_adjustment) SELECT p.plant_id, 'Medium', 0.00 FROM plants p WHERE p.name = 'Plant6';
INSERT INTO plant_sizes (plant_id, size_name, price_adjustment) SELECT p.plant_id, 'Small', -5.00 FROM plants p WHERE p.name = 'Plant7';
INSERT INTO plant_sizes (plant_id, size_name, price_adjustment) SELECT p.plant_id, 'Medium', 0.00 FROM plants p WHERE p.name = 'Plant7';
INSERT INTO plant_sizes (plant_id, size_name, price_adjustment) SELECT p.plant_id, 'Small', -5.00 FROM plants p WHERE p.name = 'Plant8';
INSERT INTO plant_sizes (plant_id, size_name, price_adjustment) SELECT p.plant_id, 'Medium', 0.00 FROM plants p WHERE p.name = 'Plant8';
INSERT INTO plant_sizes (plant_id, size_name, price_adjustment) SELECT p.plant_id, 'Small', -5.00 FROM plants p WHERE p.name = 'Plant9';
INSERT INTO plant_sizes (plant_id, size_name, price_adjustment) SELECT p.plant_id, 'Medium', 0.00 FROM plants p WHERE p.name = 'Plant9';
INSERT INTO plant_sizes (plant_id, size_name, price_adjustment) SELECT p.plant_id, 'Small', -5.00 FROM plants p WHERE p.name = 'Plant10';
INSERT INTO plant_sizes (plant_id, size_name, price_adjustment) SELECT p.plant_id, 'Medium', 0.00 FROM plants p WHERE p.name = 'Plant10';

COMMIT;


INSERT INTO discounts (discount_type_id, name, discount_value, is_percentage, start_date, end_date)
SELECT dt.discount_type_id, 'Disc1', 10.00, 1, SYSTIMESTAMP - INTERVAL '1' DAY, SYSTIMESTAMP + INTERVAL '10' DAY
FROM discount_types dt WHERE dt.name = 'Seasonal';

INSERT INTO discounts (discount_type_id, name, discount_value, is_percentage, start_date, end_date)
SELECT dt.discount_type_id, 'Disc2', 15.00, 0, SYSTIMESTAMP - INTERVAL '1' DAY, SYSTIMESTAMP + INTERVAL '10' DAY
FROM discount_types dt WHERE dt.name = 'Category';

INSERT INTO discounts (discount_type_id, name, discount_value, is_percentage, start_date, end_date)
SELECT dt.discount_type_id, 'Disc3', 20.00, 1, SYSTIMESTAMP - INTERVAL '1' DAY, SYSTIMESTAMP + INTERVAL '10' DAY
FROM discount_types dt WHERE dt.name = 'Plant-specific';

INSERT INTO discounts (discount_type_id, name, discount_value, is_percentage, start_date, end_date)
SELECT dt.discount_type_id, 'Disc4', 25.00, 0, SYSTIMESTAMP - INTERVAL '1' DAY, SYSTIMESTAMP + INTERVAL '10' DAY
FROM discount_types dt WHERE dt.name = 'Festive';

INSERT INTO discounts (discount_type_id, name, discount_value, is_percentage, start_date, end_date)
SELECT dt.discount_type_id, 'Disc5', 30.00, 1, SYSTIMESTAMP - INTERVAL '1' DAY, SYSTIMESTAMP + INTERVAL '10' DAY
FROM discount_types dt WHERE dt.name = 'Special';


INSERT INTO discounts (discount_type_id, name, discount_value, is_percentage, start_date, end_date)
SELECT dt.discount_type_id, 'Disc6', 35.00, 0, SYSTIMESTAMP - INTERVAL '1' DAY, SYSTIMESTAMP + INTERVAL '10' DAY
FROM discount_types dt WHERE dt.name = 'Seasonal';

INSERT INTO discounts (discount_type_id, name, discount_value, is_percentage, start_date, end_date)
SELECT dt.discount_type_id, 'Disc7', 40.00, 1, SYSTIMESTAMP - INTERVAL '1' DAY, SYSTIMESTAMP + INTERVAL '10' DAY
FROM discount_types dt WHERE dt.name = 'Category';

INSERT INTO discounts (discount_type_id, name, discount_value, is_percentage, start_date, end_date)
SELECT dt.discount_type_id, 'Disc8', 45.00, 0, SYSTIMESTAMP - INTERVAL '1' DAY, SYSTIMESTAMP + INTERVAL '10' DAY
FROM discount_types dt WHERE dt.name = 'Plant-specific';

INSERT INTO discounts (discount_type_id, name, discount_value, is_percentage, start_date, end_date)
SELECT dt.discount_type_id, 'Disc9', 50.00, 1, SYSTIMESTAMP - INTERVAL '1' DAY, SYSTIMESTAMP + INTERVAL '10' DAY
FROM discount_types dt WHERE dt.name = 'Festive';

INSERT INTO discounts (discount_type_id, name, discount_value, is_percentage, start_date, end_date)
SELECT dt.discount_type_id, 'Disc10', 55.00, 0, SYSTIMESTAMP - INTERVAL '1' DAY, SYSTIMESTAMP + INTERVAL '10' DAY
FROM discount_types dt WHERE dt.name = 'Special';

COMMIT;


INSERT INTO plant_discounts (plant_id, discount_id)
SELECT p.plant_id, d.discount_id FROM plants p JOIN discounts d ON d.name = 'Disc1' WHERE p.name = 'Plant1';

INSERT INTO plant_discounts (plant_id, discount_id)
SELECT p.plant_id, d.discount_id FROM plants p JOIN discounts d ON d.name = 'Disc2' WHERE p.name = 'Plant2';

INSERT INTO plant_discounts (plant_id, discount_id)
SELECT p.plant_id, d.discount_id FROM plants p JOIN discounts d ON d.name = 'Disc3' WHERE p.name = 'Plant3';

INSERT INTO plant_discounts (plant_id, discount_id)
SELECT p.plant_id, d.discount_id FROM plants p JOIN discounts d ON d.name = 'Disc4' WHERE p.name = 'Plant4';

INSERT INTO plant_discounts (plant_id, discount_id)
SELECT p.plant_id, d.discount_id FROM plants p JOIN discounts d ON d.name = 'Disc5' WHERE p.name = 'Plant5';

INSERT INTO plant_discounts (plant_id, discount_id)
SELECT p.plant_id, d.discount_id FROM plants p JOIN discounts d ON d.name = 'Disc6' WHERE p.name = 'Plant6';

INSERT INTO plant_discounts (plant_id, discount_id)
SELECT p.plant_id, d.discount_id FROM plants p JOIN discounts d ON d.name = 'Disc7' WHERE p.name = 'Plant7';

INSERT INTO plant_discounts (plant_id, discount_id)
SELECT p.plant_id, d.discount_id FROM plants p JOIN discounts d ON d.name = 'Disc8' WHERE p.name = 'Plant8';

INSERT INTO plant_discounts (plant_id, discount_id)
SELECT p.plant_id, d.discount_id FROM plants p JOIN discounts d ON d.name = 'Disc9' WHERE p.name = 'Plant9';

INSERT INTO plant_discounts (plant_id, discount_id)
SELECT p.plant_id, d.discount_id FROM plants p JOIN discounts d ON d.name = 'Disc10' WHERE p.name = 'Plant10';

COMMIT;


INSERT INTO orders (user_id, order_number, status_id, delivery_method_id, delivery_address, total_amount)
SELECT u.user_id, 'ORD1', s.status_id, m.method_id, 'Addr1', 100.00
FROM users u, order_statuses s, delivery_methods m
WHERE u.username = 'cust1' AND s.status_name = 'Processing' AND m.name = 'Standard';

INSERT INTO orders (user_id, order_number, status_id, delivery_method_id, delivery_address, total_amount)
SELECT u.user_id, 'ORD2', s.status_id, m.method_id, 'Addr2', 150.00
FROM users u, order_statuses s, delivery_methods m
WHERE u.username = 'cust1' AND s.status_name = 'Processing' AND m.name = 'Standard';

INSERT INTO orders (user_id, order_number, status_id, delivery_method_id, delivery_address, total_amount)
SELECT u.user_id, 'ORD3', s.status_id, m.method_id, 'Addr3', 200.00
FROM users u, order_statuses s, delivery_methods m
WHERE u.username = 'cust2' AND s.status_name = 'Processing' AND m.name = 'Express';

INSERT INTO orders (user_id, order_number, status_id, delivery_method_id, delivery_address, total_amount)
SELECT u.user_id, 'ORD4', s.status_id, m.method_id, 'Addr4', 250.00
FROM users u, order_statuses s, delivery_methods m
WHERE u.username = 'cust2' AND s.status_name = 'Processing' AND m.name = 'Express';

INSERT INTO orders (user_id, order_number, status_id, delivery_method_id, delivery_address, total_amount)
SELECT u.user_id, 'ORD5', s.status_id, m.method_id, 'Addr5', 300.00
FROM users u, order_statuses s, delivery_methods m
WHERE u.username = 'cust3' AND s.status_name = 'Processing' AND m.name = 'Pickup';

INSERT INTO orders (user_id, order_number, status_id, delivery_method_id, delivery_address, total_amount)
SELECT u.user_id, 'ORD6', s.status_id, m.method_id, 'Addr6', 350.00
FROM users u, order_statuses s, delivery_methods m
WHERE u.username = 'cust3' AND s.status_name = 'Processing' AND m.name = 'Pickup';

INSERT INTO orders (user_id, order_number, status_id, delivery_method_id, delivery_address, total_amount)
SELECT u.user_id, 'ORD7', s.status_id, m.method_id, 'Addr7', 400.00
FROM users u, order_statuses s, delivery_methods m
WHERE u.username = 'cust1' AND s.status_name = 'Processing' AND m.name = 'Standard';

INSERT INTO orders (user_id, order_number, status_id, delivery_method_id, delivery_address, total_amount)
SELECT u.user_id, 'ORD8', s.status_id, m.method_id, 'Addr8', 450.00
FROM users u, order_statuses s, delivery_methods m
WHERE u.username = 'cust2' AND s.status_name = 'Processing' AND m.name = 'Express';

INSERT INTO orders (user_id, order_number, status_id, delivery_method_id, delivery_address, total_amount)
SELECT u.user_id, 'ORD9', s.status_id, m.method_id, 'Addr9', 500.00
FROM users u, order_statuses s, delivery_methods m
WHERE u.username = 'cust3' AND s.status_name = 'Processing' AND m.name = 'Pickup';

INSERT INTO orders (user_id, order_number, status_id, delivery_method_id, delivery_address, total_amount)
SELECT u.user_id, 'ORD10', s.status_id, m.method_id, 'Addr10', 550.00
FROM users u, order_statuses s, delivery_methods m
WHERE u.username = 'cust1' AND s.status_name = 'Processing' AND m.name = 'Standard';

COMMIT;


INSERT INTO order_items (order_id, plant_id, size_id, quantity, unit_price)
SELECT o.order_id, p.plant_id, ps.size_id, 2,
       (p.base_price + NVL(ps.price_adjustment,0))
FROM orders o
JOIN plants p ON p.name = 'Plant1'
JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Small'
WHERE o.order_number = 'ORD1';

INSERT INTO order_items (order_id, plant_id, size_id, quantity, unit_price)
SELECT o.order_id, p.plant_id, ps.size_id, 3,
       (p.base_price + NVL(ps.price_adjustment,0))
FROM orders o
JOIN plants p ON p.name = 'Plant2'
JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Medium'
WHERE o.order_number = 'ORD2';

INSERT INTO order_items (order_id, plant_id, size_id, quantity, unit_price)
SELECT o.order_id, p.plant_id, ps.size_id, 4,
       (p.base_price + NVL(ps.price_adjustment,0))
FROM orders o
JOIN plants p ON p.name = 'Plant3'
JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Small'
WHERE o.order_number = 'ORD3';

INSERT INTO order_items (order_id, plant_id, size_id, quantity, unit_price)
SELECT o.order_id, p.plant_id, ps.size_id, 5,
       (p.base_price + NVL(ps.price_adjustment,0))
FROM orders o
JOIN plants p ON p.name = 'Plant4'
JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Medium'
WHERE o.order_number = 'ORD4';

INSERT INTO order_items (order_id, plant_id, size_id, quantity, unit_price)
SELECT o.order_id, p.plant_id, ps.size_id, 6,
       (p.base_price + NVL(ps.price_adjustment,0))
FROM orders o
JOIN plants p ON p.name = 'Plant5'
JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Small'
WHERE o.order_number = 'ORD5';

INSERT INTO order_items (order_id, plant_id, size_id, quantity, unit_price)
SELECT o.order_id, p.plant_id, ps.size_id, 7,
       (p.base_price + NVL(ps.price_adjustment,0))
FROM orders o
JOIN plants p ON p.name = 'Plant6'
JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Medium'
WHERE o.order_number = 'ORD6';

INSERT INTO order_items (order_id, plant_id, size_id, quantity, unit_price)
SELECT o.order_id, p.plant_id, ps.size_id, 8,
       (p.base_price + NVL(ps.price_adjustment,0))
FROM orders o
JOIN plants p ON p.name = 'Plant7'
JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Small'
WHERE o.order_number = 'ORD7';

INSERT INTO order_items (order_id, plant_id, size_id, quantity, unit_price)
SELECT o.order_id, p.plant_id, ps.size_id, 9,
       (p.base_price + NVL(ps.price_adjustment,0))
FROM orders o
JOIN plants p ON p.name = 'Plant8'
JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Medium'
WHERE o.order_number = 'ORD8';

INSERT INTO order_items (order_id, plant_id, size_id, quantity, unit_price)
SELECT o.order_id, p.plant_id, ps.size_id, 10,
       (p.base_price + NVL(ps.price_adjustment,0))
FROM orders o
JOIN plants p ON p.name = 'Plant9'
JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Small'
WHERE o.order_number = 'ORD9';

INSERT INTO order_items (order_id, plant_id, size_id, quantity, unit_price)
SELECT o.order_id, p.plant_id, ps.size_id, 11,
       (p.base_price + NVL(ps.price_adjustment,0))
FROM orders o
JOIN plants p ON p.name = 'Plant10'
JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Medium'
WHERE o.order_number = 'ORD10';

COMMIT;


INSERT INTO plant_features (plant_id, feature_text)
SELECT p.plant_id, 'Feature1' FROM plants p WHERE p.name = 'Plant1';
INSERT INTO plant_features (plant_id, feature_text)
SELECT p.plant_id, 'Feature2' FROM plants p WHERE p.name = 'Plant2';
INSERT INTO plant_features (plant_id, feature_text)
SELECT p.plant_id, 'Feature3' FROM plants p WHERE p.name = 'Plant3';
INSERT INTO plant_features (plant_id, feature_text)
SELECT p.plant_id, 'Feature4' FROM plants p WHERE p.name = 'Plant4';
INSERT INTO plant_features (plant_id, feature_text)
SELECT p.plant_id, 'Feature5' FROM plants p WHERE p.name = 'Plant5';
INSERT INTO plant_features (plant_id, feature_text)
SELECT p.plant_id, 'Feature6' FROM plants p WHERE p.name = 'Plant6';
INSERT INTO plant_features (plant_id, feature_text)
SELECT p.plant_id, 'Feature7' FROM plants p WHERE p.name = 'Plant7';
INSERT INTO plant_features (plant_id, feature_text)
SELECT p.plant_id, 'Feature8' FROM plants p WHERE p.name = 'Plant8';
INSERT INTO plant_features (plant_id, feature_text)
SELECT p.plant_id, 'Feature9' FROM plants p WHERE p.name = 'Plant9';
INSERT INTO plant_features (plant_id, feature_text)
SELECT p.plant_id, 'Feature10' FROM plants p WHERE p.name = 'Plant10';


INSERT INTO plant_care_tips (plant_id, tip_text)
SELECT p.plant_id, 'Tip1' FROM plants p WHERE p.name = 'Plant1';
INSERT INTO plant_care_tips (plant_id, tip_text)
SELECT p.plant_id, 'Tip2' FROM plants p WHERE p.name = 'Plant2';
INSERT INTO plant_care_tips (plant_id, tip_text)
SELECT p.plant_id, 'Tip3' FROM plants p WHERE p.name = 'Plant3';
INSERT INTO plant_care_tips (plant_id, tip_text)
SELECT p.plant_id, 'Tip4' FROM plants p WHERE p.name = 'Plant4';
INSERT INTO plant_care_tips (plant_id, tip_text)
SELECT p.plant_id, 'Tip5' FROM plants p WHERE p.name = 'Plant5';
INSERT INTO plant_care_tips (plant_id, tip_text)
SELECT p.plant_id, 'Tip6' FROM plants p WHERE p.name = 'Plant6';
INSERT INTO plant_care_tips (plant_id, tip_text)
SELECT p.plant_id, 'Tip7' FROM plants p WHERE p.name = 'Plant7';
INSERT INTO plant_care_tips (plant_id, tip_text)
SELECT p.plant_id, 'Tip8' FROM plants p WHERE p.name = 'Plant8';
INSERT INTO plant_care_tips (plant_id, tip_text)
SELECT p.plant_id, 'Tip9' FROM plants p WHERE p.name = 'Plant9';
INSERT INTO plant_care_tips (plant_id, tip_text)
SELECT p.plant_id, 'Tip10' FROM plants p WHERE p.name = 'Plant10';


INSERT INTO order_assignments (order_id, agent_id)
SELECT o.order_id, da.agent_id
FROM orders o
JOIN users au ON au.username = 'agent1'
JOIN delivery_agents da ON da.user_id = au.user_id
WHERE o.order_number = 'ORD1';
INSERT INTO order_assignments (order_id, agent_id)
SELECT o.order_id, da.agent_id
FROM orders o
JOIN users au ON au.username = 'agent1'
JOIN delivery_agents da ON da.user_id = au.user_id
WHERE o.order_number = 'ORD2';
INSERT INTO order_assignments (order_id, agent_id)
SELECT o.order_id, da.agent_id
FROM orders o
JOIN users au ON au.username = 'agent2'
JOIN delivery_agents da ON da.user_id = au.user_id
WHERE o.order_number = 'ORD3';
INSERT INTO order_assignments (order_id, agent_id)
SELECT o.order_id, da.agent_id
FROM orders o
JOIN users au ON au.username = 'agent2'
JOIN delivery_agents da ON da.user_id = au.user_id
WHERE o.order_number = 'ORD4';
INSERT INTO order_assignments (order_id, agent_id)
SELECT o.order_id, da.agent_id
FROM orders o
JOIN users au ON au.username = 'agent3'
JOIN delivery_agents da ON da.user_id = au.user_id
WHERE o.order_number = 'ORD5';
INSERT INTO order_assignments (order_id, agent_id)
SELECT o.order_id, da.agent_id
FROM orders o
JOIN users au ON au.username = 'agent3'
JOIN delivery_agents da ON da.user_id = au.user_id
WHERE o.order_number = 'ORD6';
INSERT INTO order_assignments (order_id, agent_id)
SELECT o.order_id, da.agent_id
FROM orders o
JOIN users au ON au.username = 'agent1'
JOIN delivery_agents da ON da.user_id = au.user_id
WHERE o.order_number = 'ORD7';
INSERT INTO order_assignments (order_id, agent_id)
SELECT o.order_id, da.agent_id
FROM orders o
JOIN users au ON au.username = 'agent2'
JOIN delivery_agents da ON da.user_id = au.user_id
WHERE o.order_number = 'ORD8';
INSERT INTO order_assignments (order_id, agent_id)
SELECT o.order_id, da.agent_id
FROM orders o
JOIN users au ON au.username = 'agent3'
JOIN delivery_agents da ON da.user_id = au.user_id
WHERE o.order_number = 'ORD9';
INSERT INTO order_assignments (order_id, agent_id)
SELECT o.order_id, da.agent_id
FROM orders o
JOIN users au ON au.username = 'agent1'
JOIN delivery_agents da ON da.user_id = au.user_id
WHERE o.order_number = 'ORD10';


--INSERT INTO favorites (user_id, plant_id)
--SELECT u.user_id, p.plant_id FROM users u JOIN plants p ON p.name = 'Plant1' WHERE u.username = 'cust1';
--INSERT INTO favorites (user_id, plant_id)
--SELECT u.user_id, p.plant_id FROM users u JOIN plants p ON p.name = 'Plant2' WHERE u.username = 'cust1';
--INSERT INTO favorites (user_id, plant_id)
--SELECT u.user_id, p.plant_id FROM users u JOIN plants p ON p.name = 'Plant3' WHERE u.username = 'cust2';
--INSERT INTO favorites (user_id, plant_id)
--SELECT u.user_id, p.plant_id FROM users u JOIN plants p ON p.name = 'Plant4' WHERE u.username = 'cust2';
--INSERT INTO favorites (user_id, plant_id)
--SELECT u.user_id, p.plant_id FROM users u JOIN plants p ON p.name = 'Plant5' WHERE u.username = 'cust3';
--INSERT INTO favorites (user_id, plant_id)
--SELECT u.user_id, p.plant_id FROM users u JOIN plants p ON p.name = 'Plant6' WHERE u.username = 'cust3';
--INSERT INTO favorites (user_id, plant_id)
--SELECT u.user_id, p.plant_id FROM users u JOIN plants p ON p.name = 'Plant7' WHERE u.username = 'cust1';
--INSERT INTO favorites (user_id, plant_id)
--SELECT u.user_id, p.plant_id FROM users u JOIN plants p ON p.name = 'Plant8' WHERE u.username = 'cust2';
--INSERT INTO favorites (user_id, plant_id)
--SELECT u.user_id, p.plant_id FROM users u JOIN plants p ON p.name = 'Plant9' WHERE u.username = 'cust3';
--INSERT INTO favorites (user_id, plant_id)
--SELECT u.user_id, p.plant_id FROM users u JOIN plants p ON p.name = 'Plant10' WHERE u.username = 'cust1';
select * from users;

INSERT INTO reviews (user_id, plant_id, rating, review_text)
SELECT u.user_id, p.plant_id, 5, 'Great!' FROM users u JOIN plants p ON p.name='Plant1' WHERE u.username='cust1';
INSERT INTO reviews (user_id, plant_id, rating, review_text)
SELECT u.user_id, p.plant_id, 4, 'Good' FROM users u JOIN plants p ON p.name='Plant2' WHERE u.username='cust1';
INSERT INTO reviews (user_id, plant_id, rating, review_text)
SELECT u.user_id, p.plant_id, 3, 'Ok' FROM users u JOIN plants p ON p.name='Plant3' WHERE u.username='cust2';
INSERT INTO reviews (user_id, plant_id, rating, review_text)
SELECT u.user_id, p.plant_id, 5, 'Excellent' FROM users u JOIN plants p ON p.name='Plant4' WHERE u.username='cust2';
INSERT INTO reviews (user_id, plant_id, rating, review_text)
SELECT u.user_id, p.plant_id, 4, 'Nice' FROM users u JOIN plants p ON p.name='Plant5' WHERE u.username='cust3';
INSERT INTO reviews (user_id, plant_id, rating, review_text)
SELECT u.user_id, p.plant_id, 5, 'Perfect' FROM users u JOIN plants p ON p.name='Plant6' WHERE u.username='cust3';
INSERT INTO reviews (user_id, plant_id, rating, review_text)
SELECT u.user_id, p.plant_id, 2, 'Poor' FROM users u JOIN plants p ON p.name='Plant7' WHERE u.username='cust1';
INSERT INTO reviews (user_id, plant_id, rating, review_text)
SELECT u.user_id, p.plant_id, 5, 'Awesome' FROM users u JOIN plants p ON p.name='Plant8' WHERE u.username='cust2';
INSERT INTO reviews (user_id, plant_id, rating, review_text)
SELECT u.user_id, p.plant_id, 4, 'Fine' FROM users u JOIN plants p ON p.name='Plant9' WHERE u.username='cust3';
INSERT INTO reviews (user_id, plant_id, rating, review_text)
SELECT u.user_id, p.plant_id, 5, 'Super' FROM users u JOIN plants p ON p.name='Plant10' WHERE u.username='cust1';


INSERT INTO carts (user_id, plant_id, size_id, quantity)
SELECT u.user_id, p.plant_id, ps.size_id, 1
FROM users u JOIN plants p ON p.name='Plant1' JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name='Small'
WHERE u.username='cust1';
INSERT INTO carts (user_id, plant_id, size_id, quantity)
SELECT u.user_id, p.plant_id, ps.size_id, 2
FROM users u JOIN plants p ON p.name='Plant2' JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name='Medium'
WHERE u.username='cust1';
INSERT INTO carts (user_id, plant_id, size_id, quantity)
SELECT u.user_id, p.plant_id, ps.size_id, 3
FROM users u JOIN plants p ON p.name='Plant3' JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name='Small'
WHERE u.username='cust2';
INSERT INTO carts (user_id, plant_id, size_id, quantity)
SELECT u.user_id, p.plant_id, ps.size_id, 4
FROM users u JOIN plants p ON p.name='Plant4' JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name='Medium'
WHERE u.username='cust2';
INSERT INTO carts (user_id, plant_id, size_id, quantity)
SELECT u.user_id, p.plant_id, ps.size_id, 5
FROM users u JOIN plants p ON p.name='Plant5' JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name='Small'
WHERE u.username='cust3';
INSERT INTO carts (user_id, plant_id, size_id, quantity)
SELECT u.user_id, p.plant_id, ps.size_id, 6
FROM users u JOIN plants p ON p.name='Plant6' JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name='Medium'
WHERE u.username='cust3';
INSERT INTO carts (user_id, plant_id, size_id, quantity)
SELECT u.user_id, p.plant_id, ps.size_id, 7
FROM users u JOIN plants p ON p.name='Plant7' JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name='Small'
WHERE u.username='cust1';
INSERT INTO carts (user_id, plant_id, size_id, quantity)
SELECT u.user_id, p.plant_id, ps.size_id, 8
FROM users u JOIN plants p ON p.name='Plant8' JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name='Medium'
WHERE u.username='cust2';
INSERT INTO carts (user_id, plant_id, size_id, quantity)
SELECT u.user_id, p.plant_id, ps.size_id, 9
FROM users u JOIN plants p ON p.name='Plant9' JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name='Small'
WHERE u.username='cust3';
INSERT INTO carts (user_id, plant_id, size_id, quantity)
SELECT u.user_id, p.plant_id, ps.size_id, 10
FROM users u JOIN plants p ON p.name='Plant10' JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name='Medium'
WHERE u.username='cust1';


INSERT INTO delivery_confirmations (order_id, user_id, agent_id)
SELECT o.order_id, o.user_id, da.agent_id FROM orders o JOIN users au ON au.username='agent1' JOIN delivery_agents da ON da.user_id=au.user_id WHERE o.order_number='ORD1';
INSERT INTO delivery_confirmations (order_id, user_id, agent_id)
SELECT o.order_id, o.user_id, da.agent_id FROM orders o JOIN users au ON au.username='agent1' JOIN delivery_agents da ON da.user_id=au.user_id WHERE o.order_number='ORD2';
INSERT INTO delivery_confirmations (order_id, user_id, agent_id)
SELECT o.order_id, o.user_id, da.agent_id FROM orders o JOIN users au ON au.username='agent2' JOIN delivery_agents da ON da.user_id=au.user_id WHERE o.order_number='ORD3';
INSERT INTO delivery_confirmations (order_id, user_id, agent_id)
SELECT o.order_id, o.user_id, da.agent_id FROM orders o JOIN users au ON au.username='agent2' JOIN delivery_agents da ON da.user_id=au.user_id WHERE o.order_number='ORD4';
INSERT INTO delivery_confirmations (order_id, user_id, agent_id)
SELECT o.order_id, o.user_id, da.agent_id FROM orders o JOIN users au ON au.username='agent3' JOIN delivery_agents da ON da.user_id=au.user_id WHERE o.order_number='ORD5';
INSERT INTO delivery_confirmations (order_id, user_id, agent_id)
SELECT o.order_id, o.user_id, da.agent_id FROM orders o JOIN users au ON au.username='agent3' JOIN delivery_agents da ON da.user_id=au.user_id WHERE o.order_number='ORD6';
INSERT INTO delivery_confirmations (order_id, user_id, agent_id)
SELECT o.order_id, o.user_id, da.agent_id FROM orders o JOIN users au ON au.username='agent1' JOIN delivery_agents da ON da.user_id=au.user_id WHERE o.order_number='ORD7';
INSERT INTO delivery_confirmations (order_id, user_id, agent_id)
SELECT o.order_id, o.user_id, da.agent_id FROM orders o JOIN users au ON au.username='agent2' JOIN delivery_agents da ON da.user_id=au.user_id WHERE o.order_number='ORD8';
INSERT INTO delivery_confirmations (order_id, user_id, agent_id)
SELECT o.order_id, o.user_id, da.agent_id FROM orders o JOIN users au ON au.username='agent3' JOIN delivery_agents da ON da.user_id=au.user_id WHERE o.order_number='ORD9';
INSERT INTO delivery_confirmations (order_id, user_id, agent_id)
SELECT o.order_id, o.user_id, da.agent_id FROM orders o JOIN users au ON au.username='agent1' JOIN delivery_agents da ON da.user_id=au.user_id WHERE o.order_number='ORD10';


INSERT INTO delivery_slots (agent_id, slot_date, slot_time)
SELECT da.agent_id, SYSDATE, 'morning' FROM users u JOIN delivery_agents da ON da.user_id = u.user_id WHERE u.username='agent1';
INSERT INTO delivery_slots (agent_id, slot_date, slot_time)
SELECT da.agent_id, SYSDATE, 'afternoon' FROM users u JOIN delivery_agents da ON da.user_id = u.user_id WHERE u.username='agent1';
INSERT INTO delivery_slots (agent_id, slot_date, slot_time)
SELECT da.agent_id, SYSDATE, 'morning' FROM users u JOIN delivery_agents da ON da.user_id = u.user_id WHERE u.username='agent2';
INSERT INTO delivery_slots (agent_id, slot_date, slot_time)
SELECT da.agent_id, SYSDATE, 'afternoon' FROM users u JOIN delivery_agents da ON da.user_id = u.user_id WHERE u.username='agent2';
INSERT INTO delivery_slots (agent_id, slot_date, slot_time)
SELECT da.agent_id, SYSDATE, 'morning' FROM users u JOIN delivery_agents da ON da.user_id = u.user_id WHERE u.username='agent3';
INSERT INTO delivery_slots (agent_id, slot_date, slot_time)
SELECT da.agent_id, SYSDATE, 'afternoon' FROM users u JOIN delivery_agents da ON da.user_id = u.user_id WHERE u.username='agent3';
INSERT INTO delivery_slots (agent_id, slot_date, slot_time)
SELECT da.agent_id, SYSDATE + 1, 'morning' FROM users u JOIN delivery_agents da ON da.user_id = u.user_id WHERE u.username='agent1';
INSERT INTO delivery_slots (agent_id, slot_date, slot_time)
SELECT da.agent_id, SYSDATE + 1, 'morning' FROM users u JOIN delivery_agents da ON da.user_id = u.user_id WHERE u.username='agent2';
INSERT INTO delivery_slots (agent_id, slot_date, slot_time)
SELECT da.agent_id, SYSDATE + 1, 'morning' FROM users u JOIN delivery_agents da ON da.user_id = u.user_id WHERE u.username='agent3';
INSERT INTO delivery_slots (agent_id, slot_date, slot_time)
SELECT da.agent_id, SYSDATE + 2, 'morning' FROM users u JOIN delivery_agents da ON da.user_id = u.user_id WHERE u.username='agent1';


INSERT INTO activity_log (user_id, activity_type, activity_details)
SELECT u.user_id, 'login', 'Logged in' FROM users u WHERE u.username='cust1';
INSERT INTO activity_log (user_id, activity_type, activity_details)
SELECT u.user_id, 'order', 'Placed order' FROM users u WHERE u.username='cust1';
INSERT INTO activity_log (user_id, activity_type, activity_details)
SELECT u.user_id, 'login', 'Logged in' FROM users u WHERE u.username='cust2';
INSERT INTO activity_log (user_id, activity_type, activity_details)
SELECT u.user_id, 'order', 'Placed order' FROM users u WHERE u.username='cust2';
INSERT INTO activity_log (user_id, activity_type, activity_details)
SELECT u.user_id, 'login', 'Logged in' FROM users u WHERE u.username='cust3';
INSERT INTO activity_log (user_id, activity_type, activity_details)
SELECT u.user_id, 'order', 'Placed order' FROM users u WHERE u.username='cust3';
INSERT INTO activity_log (user_id, activity_type, activity_details)
SELECT u.user_id, 'add_plant', 'Added plant' FROM users u WHERE u.username='seller1';
INSERT INTO activity_log (user_id, activity_type, activity_details)
SELECT u.user_id, 'add_plant', 'Added plant' FROM users u WHERE u.username='seller2';
INSERT INTO activity_log (user_id, activity_type, activity_details)
SELECT u.user_id, 'add_plant', 'Added plant' FROM users u WHERE u.username='seller3';
INSERT INTO activity_log (user_id, activity_type, activity_details)
SELECT u.user_id, 'admin_action', 'Admin action' FROM users u WHERE u.username='admin1';


INSERT INTO low_stock_alerts (plant_id, current_stock)
SELECT p.plant_id, 5 FROM plants p WHERE p.name='Plant1';
INSERT INTO low_stock_alerts (plant_id, current_stock)
SELECT p.plant_id, 6 FROM plants p WHERE p.name='Plant2';
INSERT INTO low_stock_alerts (plant_id, current_stock)
SELECT p.plant_id, 7 FROM plants p WHERE p.name='Plant3';
INSERT INTO low_stock_alerts (plant_id, current_stock)
SELECT p.plant_id, 8 FROM plants p WHERE p.name='Plant4';
INSERT INTO low_stock_alerts (plant_id, current_stock)
SELECT p.plant_id, 9 FROM plants p WHERE p.name='Plant5';
INSERT INTO low_stock_alerts (plant_id, current_stock)
SELECT p.plant_id, 4 FROM plants p WHERE p.name='Plant6';
INSERT INTO low_stock_alerts (plant_id, current_stock)
SELECT p.plant_id, 3 FROM plants p WHERE p.name='Plant7';
INSERT INTO low_stock_alerts (plant_id, current_stock)
SELECT p.plant_id, 2 FROM plants p WHERE p.name='Plant8';
INSERT INTO low_stock_alerts (plant_id, current_stock)
SELECT p.plant_id, 1 FROM plants p WHERE p.name='Plant9';
INSERT INTO low_stock_alerts (plant_id, current_stock)
SELECT p.plant_id, 0 FROM plants p WHERE p.name='Plant10';

COMMIT;
























-- show all tables insertion and data


SELECT 'roles' AS table_name, COUNT(*) cnt FROM roles;
SELECT * FROM roles FETCH FIRST 200 ROWS ONLY;


SELECT 'users' AS table_name, COUNT(*) cnt FROM users;
SELECT * FROM users FETCH FIRST 200 ROWS ONLY;


SELECT 'user_roles' AS table_name, COUNT(*) cnt FROM user_roles;
SELECT * FROM user_roles FETCH FIRST 200 ROWS ONLY;


SELECT 'plant_categories' AS table_name, COUNT(*) cnt FROM plant_categories;
SELECT * FROM plant_categories FETCH FIRST 200 ROWS ONLY;


SELECT 'plants' AS table_name, COUNT(*) cnt FROM plants;
SELECT * FROM plants FETCH FIRST 200 ROWS ONLY;


SELECT 'plant_category_mapping' AS table_name, COUNT(*) cnt FROM plant_category_mapping;
SELECT * FROM plant_category_mapping FETCH FIRST 200 ROWS ONLY;


SELECT 'plant_images' AS table_name, COUNT(*) cnt FROM plant_images;
SELECT * FROM plant_images FETCH FIRST 200 ROWS ONLY;


SELECT 'plant_sizes' AS table_name, COUNT(*) cnt FROM plant_sizes;
SELECT * FROM plant_sizes FETCH FIRST 200 ROWS ONLY;


SELECT 'discount_types' AS table_name, COUNT(*) cnt FROM discount_types;
SELECT * FROM discount_types FETCH FIRST 200 ROWS ONLY;


SELECT 'discounts' AS table_name, COUNT(*) cnt FROM discounts;
SELECT * FROM discounts FETCH FIRST 200 ROWS ONLY;


SELECT 'plant_discounts' AS table_name, COUNT(*) cnt FROM plant_discounts;
SELECT * FROM plant_discounts FETCH FIRST 200 ROWS ONLY;


SELECT 'order_statuses' AS table_name, COUNT(*) cnt FROM order_statuses;
SELECT * FROM order_statuses FETCH FIRST 200 ROWS ONLY;


SELECT 'delivery_methods' AS table_name, COUNT(*) cnt FROM delivery_methods;
SELECT * FROM delivery_methods FETCH FIRST 200 ROWS ONLY;



SELECT 'orders' AS table_name, COUNT(*) cnt FROM orders;
SELECT * FROM orders FETCH FIRST 200 ROWS ONLY;



SELECT 'order_items' AS table_name, COUNT(*) cnt FROM order_items;
SELECT * FROM order_items FETCH FIRST 200 ROWS ONLY;



SELECT 'plant_features' AS table_name, COUNT(*) cnt FROM plant_features;
SELECT * FROM plant_features FETCH FIRST 200 ROWS ONLY;


SELECT 'plant_care_tips' AS table_name, COUNT(*) cnt FROM plant_care_tips;
SELECT * FROM plant_care_tips FETCH FIRST 200 ROWS ONLY;


SELECT 'delivery_agents' AS table_name, COUNT(*) cnt FROM delivery_agents;
SELECT * FROM delivery_agents FETCH FIRST 200 ROWS ONLY;


SELECT 'order_assignments' AS table_name, COUNT(*) cnt FROM order_assignments;
SELECT * FROM order_assignments FETCH FIRST 200 ROWS ONLY;


SELECT 'favorites' AS table_name, COUNT(*) cnt FROM favorites;
SELECT * FROM favorites FETCH FIRST 200 ROWS ONLY;


SELECT 'reviews' AS table_name, COUNT(*) cnt FROM reviews;
SELECT * FROM reviews FETCH FIRST 200 ROWS ONLY;


SELECT 'carts' AS table_name, COUNT(*) cnt FROM carts;
SELECT * FROM carts FETCH FIRST 200 ROWS ONLY;



SELECT 'delivery_confirmations' AS table_name, COUNT(*) cnt FROM delivery_confirmations;
SELECT * FROM delivery_confirmations FETCH FIRST 200 ROWS ONLY;


SELECT 'delivery_slots' AS table_name, COUNT(*) cnt FROM delivery_slots;
SELECT * FROM delivery_slots FETCH FIRST 200 ROWS ONLY;


SELECT 'activity_log' AS table_name, COUNT(*) cnt FROM activity_log;
SELECT * FROM activity_log FETCH FIRST 200 ROWS ONLY;


SELECT 'low_stock_alerts' AS table_name, COUNT(*) cnt FROM low_stock_alerts;
SELECT * FROM low_stock_alerts FETCH FIRST 200 ROWS ONLY;






































-- All Tests

SET SERVEROUTPUT ON;


SELECT * FROM vw_plant_catalog_enhanced WHERE ROWNUM <= 5;

SELECT * FROM vw_order_details WHERE ROWNUM <= 5;

SELECT * FROM vw_plant_discounts WHERE ROWNUM <= 5;


CREATE OR REPLACE PROCEDURE print_cursor(p_cursor IN OUT SYS_REFCURSOR) AS
  v_cursor_id INTEGER;
  v_colcnt    INTEGER;
  desc_t      DBMS_SQL.DESC_TAB;
  v_fetch_ret INTEGER;
  v_val       VARCHAR2(4000);
BEGIN
  v_cursor_id := DBMS_SQL.TO_CURSOR_NUMBER(p_cursor);
  DBMS_SQL.DESCRIBE_COLUMNS(v_cursor_id, v_colcnt, desc_t);

  FOR i IN 1..v_colcnt LOOP
    DBMS_SQL.DEFINE_COLUMN(v_cursor_id, i, v_val, 4000);
  END LOOP;

  LOOP
    v_fetch_ret := DBMS_SQL.FETCH_ROWS(v_cursor_id);
    EXIT WHEN v_fetch_ret = 0;
    FOR i IN 1..v_colcnt LOOP
      DBMS_SQL.COLUMN_VALUE(v_cursor_id, i, v_val);
      DBMS_OUTPUT.PUT(NVL(v_val,'NULL') || CASE WHEN i < v_colcnt THEN ' | ' ELSE '' END);
    END LOOP;
    DBMS_OUTPUT.NEW_LINE;
  END LOOP;

  IF DBMS_SQL.IS_OPEN(v_cursor_id) THEN
    DBMS_SQL.CLOSE_CURSOR(v_cursor_id);
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    IF DBMS_SQL.IS_OPEN(v_cursor_id) THEN
      DBMS_SQL.CLOSE_CURSOR(v_cursor_id);
    END IF;
    RAISE;
END;
/



-- Test get_top_4_categories

DECLARE
  v_cursor SYS_REFCURSOR;
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing get_top_4_categories');
  get_top_4_categories(v_cursor);
  print_cursor(v_cursor);
END;
/

-- Test get_top_4_plants

DECLARE
  v_cursor SYS_REFCURSOR;
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing get_top_4_plants');
  v_cursor := get_top_4_plants;
  print_cursor(v_cursor);
END;
/

-- Test get_top_3_sellers


DECLARE
  v_cursor SYS_REFCURSOR;
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing get_top_3_sellers');
  get_top_3_sellers(v_cursor);
  print_cursor(v_cursor);
END;
/


SELECT plant_id, stock_quantity FROM plants WHERE plant_id = 1; 

-- Test get_plants_by_category_with_rating
DECLARE
  v_cursor SYS_REFCursor;
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing get_plants_by_category_with_rating for slug indoor');
  get_plants_by_category_with_rating('indoor', v_cursor);
  print_cursor(v_cursor);
END;
/

-- Test search_plants_with_rating
DECLARE
  v_cursor SYS_REFCursor;
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing search_plants_with_rating for term Plant');
  search_plants_with_rating('Plant', v_cursor);
  print_cursor(v_cursor);
END;
/

-- Test get_plant_details
DECLARE
  v_cursor SYS_REFCursor;
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing get_plant_details for plant 1, user 5');
  get_plant_details(329, 325, v_cursor);
  print_cursor(v_cursor);
END;
/

-- Test add_to_cart
BEGIN
    DBMS_OUTPUT.PUT_LINE('Testing add_to_cart: Add 1 unit of plant 332, size 1 for user 325');
    add_to_cart(325, 332, 303, 1);
    DBMS_OUTPUT.PUT_LINE('add_to_cart completed successfully');
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error in add_to_cart: ' || SQLERRM);
END;
/

-- Verify the cart
SELECT user_id, plant_id, size_id, quantity, added_at
FROM carts
WHERE user_id = 325 AND plant_id = 332 AND size_id = 303;




-- select * from carts where user_id=325 and plant_id=331;

-- Test get_reviews_for_plant
DECLARE
  v_cursor SYS_REFCursor;
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing get_reviews_for_plant for plant 1');
  get_reviews_for_plant(1, 0, 10, 0, v_cursor);
  print_cursor(v_cursor);
END;
/

-- Test delete_review (assume review_id 1 by user 5)
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing delete_review by owner user 5 for review 1');
  delete_review(5, 1);
  -- Check if deleted
  SELECT COUNT(*) FROM reviews WHERE review_id = 1; -- Should be 0
END;
/

-- Test get_user_profile
DECLARE
  v_cursor SYS_REFCURSOR;
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing get_user_profile for user 5');
  get_user_profile(325, v_cursor);
  print_cursor(v_cursor);
END;
/

-- Test update_user_profile
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing update_user_profile for user 5 by self');
  update_user_profile(325, 325, 'newusername', NULL, 'NewFirst', NULL, NULL, NULL, NULL);
END;
/

SELECT username, first_name FROM users WHERE user_id = 325;

-- Test delete_user_account (by self, but skip if last admin; here customer)
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing delete_user_account for user 7 by self');
  delete_user_account(7, 7);
  -- Check is_active = 0
  SELECT is_active FROM users WHERE user_id = 7;
END;
/

-- Test get_user_cart
DECLARE
  v_cursor SYS_REFCursor;
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing get_user_cart for user 325');
  get_user_cart(325, v_cursor);
  print_cursor(v_cursor);
END;
/

-- Test toggle_cart_item_selection (assume cart_id 1 for user 5)
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing toggle_cart_item_selection for cart 240, user 325');
  toggle_cart_item_selection(237, 325);
END;
/
  -- Check selected toggled
SELECT selected FROM carts WHERE cart_id = 237;

-- Test delete_cart_item
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing delete_cart_item for cart 240, user 325');
  delete_cart_item(237, 325);
END;
/

-- Test update_cart_item_quantity
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing update_cart_item_quantity for cart 3, user 6 to 10');
  update_cart_item_quantity(237, 325, 10);
END;
/
SELECT quantity FROM carts WHERE cart_id = 237;

-- Test get_delivery_methods
DECLARE
  v_cursor SYS_REFCursor;
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing get_delivery_methods');
  get_delivery_methods(v_cursor);
  print_cursor(v_cursor);
END;
/

-- Test create_order
DECLARE
  v_total NUMBER;
  v_order_id NUMBER;
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing create_order for user 5');
  create_order(325, 'NEWORD2', 322, 'New Addr', 'Notes', '237', v_total, v_order_id);-- 
  DBMS_OUTPUT.PUT_LINE('Total: ' || v_total || ', Order ID: ' || v_order_id);
END;
/





-- Test apply_discount
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing apply_discount');
  apply_discount(362, 10, 1, SYSTIMESTAMP, SYSTIMESTAMP + 10, NULL, 329);
END;
/
SELECT * FROM discounts WHERE ROWNUM = 1 ORDER BY discount_id DESC;


-- Test get_order_details_with_delivery
DECLARE
  v_cursor SYS_REFCursor;
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing get_order_details_with_delivery for order 1');
  get_order_details_with_delivery(1, v_cursor);
  print_cursor(v_cursor);
END;
/

-- Test get_user_orders
DECLARE
  v_cursor SYS_REFCURSOR;
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing get_user_orders for user 325');
  get_user_orders(325, NULL, v_cursor);
  print_cursor(v_cursor);
END;
/

  -- Check status
SELECT * FROM orders WHERE order_id = 331;


-- Test get_admin_dashboard_stats

DECLARE
  v_cursor SYS_REFCursor;
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing get_admin_dashboard_stats');
  get_admin_dashboard_stats(v_cursor);
  print_cursor(v_cursor);
END;
/

-- Test get_user_list (for customers)
DECLARE
  v_cursor SYS_REFCursor;
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing get_user_list for role customer');
  get_user_list('customer', v_cursor);
  print_cursor(v_cursor);
END;
/

-- Test assign_delivery_agent
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing assign_delivery_agent for order 1');
  assign_delivery_agent(343, 201);
END;
/

  -- Check assignment
SELECT agent_id FROM order_assignments WHERE order_id = 343;

-- Test get_activity_log
DECLARE
  v_cursor SYS_REFCURSOR;
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing get_activity_log');
  get_activity_log(NULL, NULL, NULL, v_cursor);
  print_cursor(v_cursor);
END;
/

-- Test get_low_stock_alerts
DECLARE
  v_cursor SYS_REFCURSOR;
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing get_low_stock_alerts');
  get_low_stock_alerts(NULL, v_cursor);
  print_cursor(v_cursor);
END;
/

-- Test get_delivery_agent_orders (agent_id 1)
DECLARE
  v_cursor SYS_REFCURSOR;
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing get_delivery_agent_orders for agent 201');
  get_delivery_agent_orders(201, NULL, v_cursor);
  print_cursor(v_cursor);
END;
/

-- Test get_delivery_agent_stats
DECLARE
  v_cursor SYS_REFCursor;
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing get_delivery_agent_stats for agent 201');
  get_delivery_agent_stats(201, v_cursor);
  print_cursor(v_cursor);
END;
/

-- Test get_seller_stats (seller_id 2)
DECLARE
  v_cursor SYS_REFCURSOR;
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing get_seller_stats for seller 322');
  get_seller_stats(322, v_cursor);
  print_cursor(v_cursor);
END;
/

-- Test get_seller_plants
DECLARE
  v_cursor SYS_REFCURSOR;
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing get_seller_plants for seller 322');
  get_seller_plants(322, v_cursor);
  print_cursor(v_cursor);
END;
/

-- Test get_seller_sales
DECLARE
  v_cursor SYS_REFCURSOR;
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing get_seller_sales for seller 2');
  get_seller_sales(322, v_cursor);
  print_cursor(v_cursor);
END;
/

-- Test add_plant (by seller 2)
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing add_plant');
  add_plant('NewPlant', 'New Desc', 60.00, 600, 322, '301,302', 'newimg.jpg,newimg2.jpg', 'NewFeature1,NewFeature2', 'NewTip1,NewTip2', 'Small:-10.00,Large:10.00');
END;
/
SELECT * FROM plants WHERE name = 'NewPlant';

-- Test update_plant_details (by seller 2 for plant 1)
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing update_plant_details for plant 1 by seller 2');
  update_plant_details(322, 301, 'UpdatedName', NULL, 12.00, NULL, NULL, NULL, NULL, NULL, NULL);
END;
/
SELECT name, base_price FROM plants WHERE plant_id = 1;

-- Test delete_plant (by seller 2 for plant 2)
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing delete_plant for plant 2 by seller 2');
  delete_plant(2, 2);
END;
/
-- Check is_active = 0
SELECT is_active FROM plants WHERE plant_id = 2;

-- Test trg_plants_deactivate_zero_stock (trigger) - check stock after delete_plant
SELECT stock_quantity FROM plants WHERE plant_id = 331; -- Should be 0



-- Test confirm_delivery for reviw
BEGIN
    DBMS_OUTPUT.PUT_LINE('Test 1: Testing confirm_delivery for order 331, agent 500');
    confirm_delivery(332, 'agent', 201); 
    DBMS_OUTPUT.PUT_LINE('Test 1 completed successfully');
END;
/
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing confirm_delivery for order 1, customer 5');
  confirm_delivery(332, 'customer', 325);
END;
/

-- for get plant id for order id of customer , not neccesary if u already know plant id . backend e jabe na .
SELECT oi.order_id, oi.plant_id, p.name AS plant_name, oi.quantity, oi.unit_price
FROM order_items oi
JOIN plants p ON oi.plant_id = p.plant_id
WHERE oi.order_id = 332;


-- Valid review (order delivered, valid inputs)
BEGIN
    DBMS_OUTPUT.PUT_LINE('Test 1: Adding review for plant 332, order 1001, user 325');
    add_review(325, 332, 332, 5, 'Great plant, very healthy and vibrant!');
    DBMS_OUTPUT.PUT_LINE('Test 1 completed successfully');
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Test 1 failed: ' || SQLERRM);
END;
/

-- Verify the review
SELECT review_id, user_id, plant_id, order_id, rating, DBMS_LOB.SUBSTR(review_text, 1000, 1) AS review_text, review_date, is_approved
FROM reviews
WHERE user_id = 325 AND plant_id = 331 AND order_id = 331;

