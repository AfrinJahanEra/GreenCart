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
CREATE SEQUENCE role_scret_keys START WITH 1 INCREMENT BY 1;

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

drop table delivery_confirmations;

-- Delivery confirmations table
-- Delivery confirmations table
CREATE TABLE delivery_confirmations (
    confirmation_id NUMBER PRIMARY KEY,
    order_id NUMBER NOT NULL,
    user_id NUMBER NOT NULL, -- customer ID
    agent_id NUMBER NOT NULL, -- delivery agent ID
    customer_confirmed NUMBER(1) DEFAULT 0 CHECK (customer_confirmed IN (0, 1)),
    agent_confirmed NUMBER(1) DEFAULT 0 CHECK (agent_confirmed IN (0, 1)),
    confirmed_date TIMESTAMP,
    CONSTRAINT fk_delivery_conf_order FOREIGN KEY (order_id) REFERENCES orders(order_id),
    CONSTRAINT uk_delivery_conf_order UNIQUE (order_id)
);

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

CREATE SEQUENCE seq_activity_log
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

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
CREATE INDEX idx_users_phone ON users(phone) TABLESPACE index_data;
CREATE INDEX idx_plants_name ON plants(name) TABLESPACE index_data;
CREATE INDEX idx_plant_categories_slug ON plant_categories(slug) TABLESPACE index_data;
CREATE INDEX idx_orders_user ON orders(user_id) TABLESPACE index_data;
CREATE INDEX idx_orders_status ON orders(status_id) TABLESPACE index_data;
CREATE INDEX idx_orders_number ON orders(order_number) TABLESPACE index_data;
CREATE INDEX idx_order_items_order ON order_items(order_id) TABLESPACE index_data;
CREATE INDEX idx_order_items_plant ON order_items(plant_id) TABLESPACE index_data;
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
  SELECT 
      pc.category_id, 
      pc.name, 
      pc.slug, 
      pc.image_url,
      COUNT(pcm.plant_id) AS plant_count
  FROM plant_categories pc
  LEFT JOIN plant_category_mapping pcm ON pc.category_id = pcm.category_id
  GROUP BY pc.category_id, pc.name, pc.slug, pc.image_url
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


CREATE OR REPLACE FUNCTION get_top_4_plants RETURN SYS_REFCURSOR IS
  v_cursor SYS_REFCURSOR;
BEGIN
  OPEN v_cursor FOR
  SELECT 
      p.plant_id, 
      p.name, 
      p.base_price,
      pi.image_url AS primary_image,
      NVL(AVG(r.rating), 0) AS avg_rating, 
      COUNT(r.review_id) AS review_count
  FROM plants p
  LEFT JOIN plant_images pi ON p.plant_id = pi.plant_id AND pi.is_primary = 1
  LEFT JOIN reviews r ON p.plant_id = r.plant_id
  WHERE p.is_active = 1
  GROUP BY p.plant_id, p.name, p.base_price, pi.image_url
  ORDER BY avg_rating DESC, review_count DESC
  FETCH FIRST 4 ROWS ONLY;
  RETURN v_cursor;
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


select * from plants;
-- plant details page 

-- Procedure to fetch all plant details for the plant details page

-- Fix get_plant_details procedure (remove JSON_OBJECT which causes issues)
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
      (SELECT LISTAGG(ps.size_id || ':' || ps.size_name || ':' || ps.price_adjustment, '|') WITHIN GROUP (ORDER BY ps.size_id)
       FROM plant_sizes ps WHERE ps.plant_id = p.plant_id) AS sizes,
      (SELECT LISTAGG(pf.feature_text, '|') WITHIN GROUP (ORDER BY pf.feature_id)
       FROM plant_features pf WHERE pf.plant_id = p.plant_id) AS features,
      (SELECT LISTAGG(pct.tip_text, '|') WITHIN GROUP (ORDER BY pct.tip_id)
       FROM plant_care_tips pct WHERE pct.plant_id = p.plant_id) AS care_tips,
      NVL(AVG(r.rating), 0) AS avg_rating,
      COUNT(r.review_id) AS review_count
  FROM plants p
  LEFT JOIN plant_images pi ON p.plant_id = pi.plant_id AND pi.is_primary = 1
  LEFT JOIN reviews r ON p.plant_id = r.plant_id
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



-- Create a separate procedure for reviews
CREATE OR REPLACE PROCEDURE get_plant_reviews (
    p_plant_id IN NUMBER,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
  OPEN p_cursor FOR
  SELECT 
      r.review_id,
      u.first_name || ' ' || u.last_name AS author,
      r.rating,
      DBMS_LOB.SUBSTR(r.review_text, 1000, 1) AS review_text,
      TO_CHAR(r.review_date, 'YYYY-MM-DD') AS review_date
  FROM reviews r
  JOIN users u ON r.user_id = u.user_id
  WHERE r.plant_id = p_plant_id AND r.is_approved = 1
  ORDER BY r.review_date DESC;
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




-- order page 



-- 1. Procedure to get all orders for a customer with detailed information
CREATE OR REPLACE PROCEDURE get_customer_orders (
    p_user_id IN NUMBER,
    p_status_name IN VARCHAR2 DEFAULT NULL,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
    SELECT 
        o.order_id,
        o.order_number,
        o.order_date,
        os.status_name AS order_status,
        o.total_amount,
        dm.name AS delivery_method,
        o.delivery_address,
        o.estimated_delivery_date,
        o.actual_delivery_date,
        o.tracking_number,
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.order_id) AS item_count,
        (SELECT LISTAGG(p.name || ' (x' || oi.quantity || ')', ', ') 
         WITHIN GROUP (ORDER BY oi.order_item_id)
         FROM order_items oi 
         JOIN plants p ON oi.plant_id = p.plant_id
         WHERE oi.order_id = o.order_id) AS items_summary,
        NVL(dc.customer_confirmed, 0) AS customer_confirmed,
        NVL(dc.agent_confirmed, 0) AS agent_confirmed,
        dc.confirmed_date,
        (SELECT pi.image_url 
         FROM order_items oi 
         JOIN plants p ON oi.plant_id = p.plant_id
         LEFT JOIN plant_images pi ON p.plant_id = pi.plant_id AND pi.is_primary = 1
         WHERE oi.order_id = o.order_id AND ROWNUM = 1) AS primary_image
    FROM orders o
    JOIN order_statuses os ON o.status_id = os.status_id
    JOIN delivery_methods dm ON o.delivery_method_id = dm.method_id
    LEFT JOIN delivery_confirmations dc ON o.order_id = dc.order_id
    WHERE o.user_id = p_user_id
    AND (p_status_name IS NULL OR os.status_name = p_status_name)
    ORDER BY o.order_date DESC;
END;
/

-- 2. Procedure to get pending orders (waiting for customer confirmation)
CREATE OR REPLACE PROCEDURE get_pending_confirmation_orders (
    p_user_id IN NUMBER,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
    SELECT 
        o.order_id,
        o.order_number,
        o.order_date,
        o.total_amount,
        dm.name AS delivery_method,
        o.delivery_address,
        o.estimated_delivery_date,
        o.actual_delivery_date,
        da.agent_id,
        ua.first_name || ' ' || ua.last_name AS delivery_agent_name,
        ua.phone AS delivery_agent_phone,
        da.vehicle_type,
        dc.agent_confirmed,
        dc.customer_confirmed,
        dc.confirmed_date,
        (SELECT LISTAGG(p.name || ' (x' || oi.quantity || ')', ', ') 
         WITHIN GROUP (ORDER BY oi.order_item_id)
         FROM order_items oi 
         JOIN plants p ON oi.plant_id = p.plant_id
         WHERE oi.order_id = o.order_id) AS items_summary
    FROM orders o
    JOIN order_statuses os ON o.status_id = os.status_id
    JOIN delivery_methods dm ON o.delivery_method_id = dm.method_id
    LEFT JOIN order_assignments oa ON o.order_id = oa.order_id
    LEFT JOIN delivery_agents da ON oa.agent_id = da.agent_id
    LEFT JOIN users ua ON da.user_id = ua.user_id
    LEFT JOIN delivery_confirmations dc ON o.order_id = dc.order_id
    WHERE o.user_id = p_user_id
    AND os.status_name = 'Out for Delivery'
    AND dc.agent_confirmed = 1
    AND dc.customer_confirmed = 0
    ORDER BY o.order_date DESC;
END;
/

-- 3. Procedure to get completed orders (ready for review)
CREATE OR REPLACE PROCEDURE get_completed_orders_for_review (
    p_user_id IN NUMBER,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
    SELECT 
        o.order_id,
        o.order_number,
        o.order_date,
        o.total_amount,
        o.actual_delivery_date,
        (SELECT LISTAGG(
            p.plant_id || ':' || p.name || ':' || oi.quantity || ':' || 
            NVL(ps.size_name, 'Standard') || ':' || 
            CASE WHEN r.review_id IS NOT NULL THEN '1' ELSE '0' END, 
            '|'
        ) WITHIN GROUP (ORDER BY oi.order_item_id)
         FROM order_items oi 
         JOIN plants p ON oi.plant_id = p.plant_id
         LEFT JOIN plant_sizes ps ON oi.size_id = ps.size_id
         LEFT JOIN reviews r ON oi.plant_id = r.plant_id AND oi.order_id = r.order_id AND r.user_id = p_user_id
         WHERE oi.order_id = o.order_id) AS items_with_review_status
    FROM orders o
    JOIN order_statuses os ON o.status_id = os.status_id
    LEFT JOIN delivery_confirmations dc ON o.order_id = dc.order_id
    WHERE o.user_id = p_user_id
    AND os.status_name = 'Delivered'
    AND dc.customer_confirmed = 1
    AND dc.agent_confirmed = 1
    ORDER BY o.actual_delivery_date DESC;
END;
/


drop procedure add_review;

-- 5. Enhanced add_review procedure with better validation
CREATE OR REPLACE PROCEDURE add_review (
    p_user_id IN NUMBER,
    p_plant_id IN NUMBER,
    p_order_id IN NUMBER,
    p_rating IN NUMBER,
    p_review_text IN CLOB DEFAULT NULL,
    p_success OUT NUMBER,
    p_message OUT VARCHAR2
) AS
    v_order_status VARCHAR2(50);
    v_customer_id NUMBER;
    v_plant_in_order NUMBER;
    v_both_confirmed NUMBER;
    v_review_id NUMBER;
    v_existing_review NUMBER;
BEGIN
    -- Validate inputs
    IF p_user_id IS NULL OR p_plant_id IS NULL OR p_order_id IS NULL OR p_rating IS NULL THEN
        p_success := 0;
        p_message := 'User ID, Plant ID, Order ID, and Rating cannot be null';
        RETURN;
    END IF;

    IF p_rating NOT BETWEEN 1 AND 5 THEN
        p_success := 0;
        p_message := 'Rating must be between 1 and 5';
        RETURN;
    END IF;

    -- Check if order exists and get status
    BEGIN
        SELECT os.status_name, o.user_id
        INTO v_order_status, v_customer_id
        FROM orders o
        JOIN order_statuses os ON o.status_id = os.status_id
        WHERE o.order_id = p_order_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_success := 0;
            p_message := 'Order not found';
            RETURN;
    END;

    -- Verify order is delivered
    IF v_order_status != 'Delivered' THEN
        p_success := 0;
        p_message := 'Order is not delivered yet';
        RETURN;
    END IF;

    -- Verify user is the customer
    IF p_user_id != v_customer_id THEN
        p_success := 0;
        p_message := 'Not authorized to review this order';
        RETURN;
    END IF;

    -- Check delivery confirmation
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
            p_success := 0;
            p_message := 'Delivery not confirmed for this order';
            RETURN;
    END;

    IF v_both_confirmed = 0 THEN
        p_success := 0;
        p_message := 'Delivery not fully confirmed by both parties';
        RETURN;
    END IF;

    -- Check if plant is in the order
    SELECT COUNT(*)
    INTO v_plant_in_order
    FROM order_items
    WHERE order_id = p_order_id
    AND plant_id = p_plant_id;

    IF v_plant_in_order = 0 THEN
        p_success := 0;
        p_message := 'Plant not found in this order';
        RETURN;
    END IF;

    -- Check for existing review
    SELECT COUNT(*)
    INTO v_existing_review
    FROM reviews
    WHERE user_id = p_user_id
    AND plant_id = p_plant_id
    AND order_id = p_order_id;

    IF v_existing_review > 0 THEN
        p_success := 0;
        p_message := 'You have already reviewed this plant from this order';
        RETURN;
    END IF;

    -- Generate review_id and insert
    SELECT review_id_seq.NEXTVAL INTO v_review_id FROM dual;

    INSERT INTO reviews (review_id, user_id, plant_id, order_id, rating, review_text, review_date, is_approved)
    VALUES (v_review_id, p_user_id, p_plant_id, p_order_id, p_rating, p_review_text, SYSTIMESTAMP, 1);

    COMMIT;
    p_success := 1;
    p_message := 'Review added successfully';

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_success := 0;
        p_message := 'Error adding review: ' || SQLERRM;
END;
/

-- 6. Function to get order details with items
-- Function to get order items with review status
CREATE OR REPLACE FUNCTION get_order_items(p_order_id IN NUMBER, p_user_id IN NUMBER) RETURN SYS_REFCURSOR AS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
    SELECT 
        oi.order_item_id,
        oi.plant_id,
        p.name AS plant_name,
        pi.image_url,
        oi.quantity,
        oi.unit_price,
        ps.size_id,
        ps.size_name,
        ps.price_adjustment,
        (oi.quantity * oi.unit_price) AS subtotal,
        CASE WHEN r.review_id IS NOT NULL THEN 1 ELSE 0 END AS has_review
    FROM order_items oi
    JOIN plants p ON oi.plant_id = p.plant_id
    LEFT JOIN plant_images pi ON p.plant_id = pi.plant_id AND pi.is_primary = 1
    LEFT JOIN plant_sizes ps ON oi.size_id = ps.size_id
    LEFT JOIN reviews r ON oi.plant_id = r.plant_id AND oi.order_id = r.order_id AND r.user_id = p_user_id
    WHERE oi.order_id = p_order_id
    ORDER BY oi.order_item_id;
    
    RETURN v_cursor;
END;
/

-- 7. Procedure to get customer order statistics
CREATE OR REPLACE PROCEDURE get_customer_order_stats (
    p_user_id IN NUMBER,
    p_total_orders OUT NUMBER,
    p_pending_orders OUT NUMBER,
    p_delivered_orders OUT NUMBER,
    p_total_spent OUT NUMBER
) AS
BEGIN
    -- Total orders
    SELECT COUNT(*)
    INTO p_total_orders
    FROM orders
    WHERE user_id = p_user_id;

    -- Pending orders (Processing, Shipped, Out for Delivery)
    SELECT COUNT(*)
    INTO p_pending_orders
    FROM orders o
    JOIN order_statuses os ON o.status_id = os.status_id
    WHERE o.user_id = p_user_id
    AND os.status_name IN ('Processing', 'Shipped', 'Out for Delivery');

    -- Delivered orders
    SELECT COUNT(*)
    INTO p_delivered_orders
    FROM orders o
    JOIN order_statuses os ON o.status_id = os.status_id
    WHERE o.user_id = p_user_id
    AND os.status_name = 'Delivered';

    -- Total spent
    SELECT NVL(SUM(total_amount), 0)
    INTO p_total_spent
    FROM orders
    WHERE user_id = p_user_id
    AND order_id IN (
        SELECT o.order_id
        FROM orders o
        JOIN order_statuses os ON o.status_id = os.status_id
        WHERE os.status_name = 'Delivered'
    );
END;
/



-- Admin dashboard procedures

-- 1. Procedure to show total users by role
CREATE OR REPLACE PROCEDURE get_admin_dashboard_stats (
    p_total_customers OUT NUMBER,
    p_total_delivery_agents OUT NUMBER,
    p_total_sellers OUT NUMBER,
    p_total_revenue OUT NUMBER,
    p_pending_orders OUT NUMBER,
    p_low_stock_alerts OUT NUMBER
) AS
BEGIN
    -- Get total customers
    SELECT COUNT(DISTINCT u.user_id)
    INTO p_total_customers
    FROM users u
    JOIN user_roles ur ON u.user_id = ur.user_id
    JOIN roles r ON ur.role_id = r.role_id
    WHERE r.role_name = 'customer' AND u.is_active = 1;

    -- Get total delivery agents
    SELECT COUNT(*)
    INTO p_total_delivery_agents
    FROM delivery_agents
    WHERE is_active = 1;

    -- Get total sellers
    SELECT COUNT(DISTINCT u.user_id)
    INTO p_total_sellers
    FROM users u
    JOIN user_roles ur ON u.user_id = ur.user_id
    JOIN roles r ON ur.role_id = r.role_id
    WHERE r.role_name = 'seller' AND u.is_active = 1;

    -- Get total revenue from delivered orders
    SELECT NVL(SUM(total_amount), 0)
    INTO p_total_revenue
    FROM orders 
    WHERE status_id IN (
        SELECT status_id FROM order_statuses 
        WHERE status_name IN ('Delivered', 'Completed')
    );

    -- Get pending orders
    SELECT COUNT(*)
    INTO p_pending_orders
    FROM orders 
    WHERE status_id IN (
        SELECT status_id FROM order_statuses 
        WHERE status_name IN ('Processing', 'Pending', 'Confirmed')
    );

    -- Get unresolved low stock alerts
    SELECT COUNT(*)
    INTO p_low_stock_alerts
    FROM low_stock_alerts 
    WHERE is_resolved = 0;
END;
/

-- 2. Procedure to show recent activity
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
    AND activity_timestamp >= SYSTIMESTAMP - INTERVAL '24' HOUR
    AND (p_start_date IS NULL OR activity_timestamp >= p_start_date)
    AND (p_end_date IS NULL OR activity_timestamp <= p_end_date);
END;
/

-- 3. Procedure to show users role-wise information

CREATE OR REPLACE PROCEDURE get_user_list (
    p_role_name IN VARCHAR2,
    p_user_details OUT SYS_REFCURSOR,
    p_total_users OUT NUMBER,
    p_avg_metric OUT NUMBER,
    p_max_metric OUT NUMBER
) AS
BEGIN
    -- Get total users for the role
    SELECT COUNT(DISTINCT u.user_id)
    INTO p_total_users
    FROM users u
    JOIN user_roles ur ON u.user_id = ur.user_id
    JOIN roles r ON ur.role_id = r.role_id
    WHERE r.role_name = p_role_name AND u.is_active = 1;

    -- Open cursor with user details
    OPEN p_user_details FOR
    SELECT 
        u.user_id,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.address,
        u.profile_image,
        u.created_at,
        u.last_login,
        CASE 
            WHEN p_role_name = 'customer' THEN 
                (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.user_id)
            WHEN p_role_name = 'delivery_agent' THEN 
                (SELECT COUNT(*) FROM order_assignments oa 
                 JOIN delivery_agents da ON oa.agent_id = da.agent_id 
                 WHERE da.user_id = u.user_id)
            WHEN p_role_name = 'seller' THEN 
                (SELECT COUNT(*) FROM plants p WHERE p.seller_id = u.user_id)
            ELSE 0
        END AS activity_count
    FROM 
        users u
    JOIN 
        user_roles ur ON u.user_id = ur.user_id
    JOIN 
        roles r ON ur.role_id = r.role_id
    WHERE 
        r.role_name = p_role_name 
        AND u.is_active = 1
    ORDER BY 
        u.created_at DESC;

    -- Calculate metrics based on role
    IF p_role_name = 'customer' THEN
        -- For customers: average and max orders placed
        SELECT 
            AVG(order_count),
            MAX(order_count)
        INTO p_avg_metric, p_max_metric
        FROM (
            SELECT u.user_id, COUNT(o.order_id) as order_count
            FROM users u
            JOIN user_roles ur ON u.user_id = ur.user_id
            JOIN roles r ON ur.role_id = r.role_id
            LEFT JOIN orders o ON u.user_id = o.user_id
            WHERE r.role_name = 'customer' AND u.is_active = 1
            GROUP BY u.user_id
        );
        
    ELSIF p_role_name = 'delivery' THEN
        -- For delivery agents: average and max deliveries completed
        SELECT 
            AVG(delivery_count),
            MAX(delivery_count)
        INTO p_avg_metric, p_max_metric
        FROM (
            SELECT da.agent_id, COUNT(oa.assignment_id) as delivery_count
            FROM delivery_agents da
            JOIN users u ON da.user_id = u.user_id
            JOIN user_roles ur ON u.user_id = ur.user_id
            JOIN roles r ON ur.role_id = r.role_id
            LEFT JOIN order_assignments oa ON da.agent_id = oa.agent_id
            LEFT JOIN orders o ON oa.order_id = o.order_id
            LEFT JOIN order_statuses os ON o.status_id = os.status_id
            WHERE r.role_name = 'delivery_agent' AND u.is_active = 1
            AND os.status_name = 'Delivered'
            GROUP BY da.agent_id
        );
        
    ELSIF p_role_name = 'seller' THEN
        -- For sellers: average and max plants listed
        SELECT 
            AVG(plant_count),
            MAX(plant_count)
        INTO p_avg_metric, p_max_metric
        FROM (
            SELECT u.user_id, COUNT(p.plant_id) as plant_count
            FROM users u
            JOIN user_roles ur ON u.user_id = ur.user_id
            JOIN roles r ON ur.role_id = r.role_id
            LEFT JOIN plants p ON u.user_id = p.seller_id
            WHERE r.role_name = 'seller' AND u.is_active = 1
            GROUP BY u.user_id
        );
    ELSE
        p_avg_metric := 0;
        p_max_metric := 0;
    END IF;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_avg_metric := 0;
        p_max_metric := 0;
END;
/

-- 4. Procedure to assign delivery agent
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
    v_slot_count NUMBER;
    v_user_id NUMBER;
    v_status_id NUMBER;
    v_valid_status_count NUMBER;
BEGIN
    -- Check if order exists and get details
    BEGIN
        SELECT o.user_id, o.order_date, o.delivery_method_id, 
               dm.estimated_days, o.status_id
        INTO v_user_id, v_order_date, v_delivery_method_id, 
             v_estimated_days, v_status_id
        FROM orders o
        JOIN delivery_methods dm ON o.delivery_method_id = dm.method_id
        WHERE o.order_id = p_order_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20005, 'Order does not exist');
    END;
    
    -- Check if order is in a state that can be assigned
    SELECT COUNT(*) 
    INTO v_valid_status_count
    FROM order_statuses 
    WHERE status_id = v_status_id 
    AND status_name IN ('Processing', 'Confirmed');
    
    IF v_valid_status_count = 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Order is not in a state that can be assigned for delivery');
    END IF;
    
    -- Calculate delivery date based on estimated days
    IF v_estimated_days LIKE '1-2%' THEN
        v_slot_date := TRUNC(v_order_date) + 2;
    ELSIF v_estimated_days LIKE '3-5%' THEN
        v_slot_date := TRUNC(v_order_date) + 4;
    ELSE
        v_slot_date := TRUNC(v_order_date) + 1;
    END IF;
    
    -- Determine slot time
    v_slot_time := CASE 
        WHEN EXTRACT(HOUR FROM SYSTIMESTAMP) < 12 THEN 'morning'
        WHEN EXTRACT(HOUR FROM SYSTIMESTAMP) < 17 THEN 'afternoon'
        ELSE 'evening'
    END;
    
    -- If no specific agent provided, find one with available slots
    IF p_agent_id IS NULL THEN
        BEGIN
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
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                RAISE_APPLICATION_ERROR(-20002, 'No available delivery agents found');
        END;
    ELSE
        v_available_agent_id := p_agent_id;
        
        -- Verify agent exists and is active
        BEGIN
            SELECT 1 INTO v_slot_count
            FROM delivery_agents
            WHERE agent_id = v_available_agent_id AND is_active = 1;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                RAISE_APPLICATION_ERROR(-20003, 'Specified delivery agent does not exist or is not active');
        END;
        
        -- Check if agent has available slots
        SELECT COUNT(*) INTO v_slot_count
        FROM delivery_slots
        WHERE agent_id = v_available_agent_id
        AND slot_date = v_slot_date
        AND is_available = 0;
        
        IF v_slot_count >= 3 THEN
            RAISE_APPLICATION_ERROR(-20004, 'Selected agent has no available slots for the delivery date');
        END IF;
    END IF;

    -- Assign agent to order
    INSERT INTO order_assignments (order_id, agent_id)
    VALUES (p_order_id, v_available_agent_id);
    
    -- Create delivery slot
    INSERT INTO delivery_slots (agent_id, slot_date, slot_time, is_available, order_id)
    VALUES (v_available_agent_id, v_slot_date, v_slot_time, 0, p_order_id);
    
    -- Create delivery confirmation record
    INSERT INTO delivery_confirmations (order_id, user_id, agent_id)
    VALUES (p_order_id, v_user_id, v_available_agent_id);
    
    -- Update order status to Shipped
    UPDATE orders
    SET status_id = (SELECT status_id FROM order_statuses WHERE status_name = 'Shipped')
    WHERE order_id = p_order_id;
    
    -- Log the activity
    INSERT INTO activity_log (user_id, activity_type, activity_details, ip_address)
    VALUES (v_user_id, 'DELIVERY_ASSIGNED', 
            'Delivery agent ' || v_available_agent_id || ' assigned to order ' || p_order_id, 
            NULL);
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20006, 'Error in assign_delivery_agent: ' || SQLERRM);
END;
/

-- 5. Procedure to show low stock alerts
CREATE OR REPLACE PROCEDURE get_low_stock_alerts (
    p_resolved IN NUMBER DEFAULT NULL,
    p_total_alerts OUT NUMBER,
    p_unresolved_alerts OUT NUMBER,
    p_avg_stock_level OUT NUMBER,
    p_most_affected_category OUT VARCHAR2
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

    -- Get category with most low stock alerts
    BEGIN
        SELECT pc.name
        INTO p_most_affected_category
        FROM (
            SELECT pcm.category_id, COUNT(*) as alert_count
            FROM low_stock_alerts lsa
            JOIN plants p ON lsa.plant_id = p.plant_id
            JOIN plant_category_mapping pcm ON p.plant_id = pcm.plant_id
            WHERE (p_resolved IS NULL OR lsa.is_resolved = p_resolved)
            GROUP BY pcm.category_id
            ORDER BY alert_count DESC
        ) category_alerts
        JOIN plant_categories pc ON category_alerts.category_id = pc.category_id
        WHERE ROWNUM = 1;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_most_affected_category := 'None';
    END;
END;
/

-- 6. Function to get all orders with delivery information
CREATE OR REPLACE FUNCTION get_all_orders_with_delivery
RETURN SYS_REFCURSOR
AS
    orders_cursor SYS_REFCURSOR;
BEGIN
    OPEN orders_cursor FOR
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
        da.agent_id,
        (SELECT first_name || ' ' || last_name FROM users WHERE user_id = da.user_id) AS delivery_agent_name,
        da.vehicle_type,
        oa.assigned_at,
        oa.completed_at,
        ds.slot_date,
        ds.slot_time,
        dc.customer_confirmed,
        dc.agent_confirmed,
        dc.confirmed_date
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
        delivery_agents da ON oa.agent_id = da.agent_id
    LEFT JOIN 
        delivery_slots ds ON o.order_id = ds.order_id
    LEFT JOIN 
        delivery_confirmations dc ON o.order_id = dc.order_id
    ORDER BY 
        o.order_date DESC;
        
    RETURN orders_cursor;
END;
/

-- 7. Procedure to get order details by ID
CREATE OR REPLACE PROCEDURE get_order_details (
    p_order_id IN NUMBER,
    p_order_details OUT SYS_REFCURSOR,
    p_order_items OUT SYS_REFCURSOR
) AS
BEGIN
    -- Get order details
    OPEN p_order_details FOR
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
        o.delivery_notes,
        dm.name AS delivery_method,
        dm.base_cost AS delivery_cost,
        o.total_amount,
        o.tracking_number,
        o.estimated_delivery_date,
        o.actual_delivery_date,
        da.agent_id,
        (SELECT first_name || ' ' || last_name FROM users WHERE user_id = da.user_id) AS delivery_agent_name,
        da.vehicle_type,
        da.license_number,
        oa.assigned_at,
        oa.completed_at,
        oa.notes AS assignment_notes,
        ds.slot_date,
        ds.slot_time,
        dc.customer_confirmed,
        dc.agent_confirmed,
        dc.confirmed_date
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
        delivery_agents da ON oa.agent_id = da.agent_id
    LEFT JOIN 
        delivery_slots ds ON o.order_id = ds.order_id
    LEFT JOIN 
        delivery_confirmations dc ON o.order_id = dc.order_id
    WHERE 
        o.order_id = p_order_id;
    
    -- Get order items
    OPEN p_order_items FOR
    SELECT 
        oi.order_item_id,
        oi.plant_id,
        p.name AS plant_name,
        oi.size_id,
        ps.size_name,
        oi.quantity,
        oi.unit_price,
        oi.discount_applied,
        (oi.quantity * oi.unit_price * (1 - oi.discount_applied/100)) AS item_total,
        pi.image_url AS plant_image
    FROM 
        order_items oi
    JOIN 
        plants p ON oi.plant_id = p.plant_id
    LEFT JOIN 
        plant_sizes ps ON oi.size_id = ps.size_id
    LEFT JOIN 
        plant_images pi ON p.plant_id = pi.plant_id AND pi.is_primary = 1
    WHERE 
        oi.order_id = p_order_id
    ORDER BY 
        oi.order_item_id;
END;
/


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

-- 8. Trigger to log user activities
CREATE OR REPLACE TRIGGER trg_log_user_activity
AFTER LOGON ON DATABASE
BEGIN
    INSERT INTO activity_log (user_id, activity_type, activity_details, ip_address)
    VALUES (SYS_CONTEXT('USERENV', 'SESSION_USERID'), 
            'LOGIN', 
            'User logged in to the system',
            SYS_CONTEXT('USERENV', 'IP_ADDRESS'));
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Prevent login failures due to logging issues
END;
/

-- 9. Trigger to detect low stock and create alerts
CREATE OR REPLACE TRIGGER trg_check_low_stock
AFTER UPDATE OF stock_quantity ON plants
FOR EACH ROW
WHEN (NEW.stock_quantity < 10 AND OLD.stock_quantity >= 10)
DECLARE
    v_alert_exists NUMBER;
BEGIN
    -- Check if an unresolved alert already exists for this plant
    SELECT COUNT(*) INTO v_alert_exists
    FROM low_stock_alerts
    WHERE plant_id = :NEW.plant_id AND is_resolved = 0;
    
    -- Create a new alert if none exists
    IF v_alert_exists = 0 THEN
        INSERT INTO low_stock_alerts (plant_id, current_stock, threshold)
        VALUES (:NEW.plant_id, :NEW.stock_quantity, 10);
    END IF;
END;
/

-- 10. Trigger to resolve low stock alerts when stock is replenished
CREATE OR REPLACE TRIGGER trg_resolve_low_stock
AFTER UPDATE OF stock_quantity ON plants
FOR EACH ROW
WHEN (NEW.stock_quantity >= 10 AND OLD.stock_quantity < 10)
BEGIN
    -- Resolve any unresolved alerts for this plant
    UPDATE low_stock_alerts
    SET is_resolved = 1, resolved_date = SYSTIMESTAMP
    WHERE plant_id = :NEW.plant_id AND is_resolved = 0;
END;
/

-- 11. View for admin dashboard with comprehensive order information
CREATE OR REPLACE VIEW vw_admin_order_overview AS
SELECT 
    o.order_id,
    o.order_number,
    o.order_date,
    os.status_name AS order_status,
    u.user_id,
    u.first_name || ' ' || u.last_name AS customer_name,
    u.email AS customer_email,
    o.total_amount,
    dm.name AS delivery_method,
    o.estimated_delivery_date,
    o.actual_delivery_date,
    da.agent_id,
    (SELECT first_name || ' ' || last_name FROM users WHERE user_id = da.user_id) AS delivery_agent,
    da.vehicle_type,
    oa.assigned_at,
    oa.completed_at,
    (SELECT COUNT(*) FROM order_items WHERE order_id = o.order_id) AS item_count,
    (SELECT SUM(quantity) FROM order_items WHERE order_id = o.order_id) AS total_quantity
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
    delivery_agents da ON oa.agent_id = da.agent_id
ORDER BY 
    o.order_date DESC;
/

-- 12. View for low stock alerts with plant details
CREATE OR REPLACE VIEW vw_low_stock_alerts_details AS
SELECT 
    lsa.alert_id,
    lsa.plant_id,
    p.name AS plant_name,
    lsa.current_stock,
    lsa.threshold,
    lsa.alert_date,
    lsa.is_resolved,
    lsa.resolved_date,
    (SELECT LISTAGG(pc.name, ', ') WITHIN GROUP (ORDER BY pc.name)
     FROM plant_category_mapping pcm
     JOIN plant_categories pc ON pcm.category_id = pc.category_id
     WHERE pcm.plant_id = p.plant_id) AS categories
FROM 
    low_stock_alerts lsa
JOIN 
    plants p ON lsa.plant_id = p.plant_id
ORDER BY 
    lsa.is_resolved, lsa.alert_date DESC;
/

-- 13. View for delivery agent performance
CREATE OR REPLACE VIEW vw_delivery_agent_performance AS
SELECT 
    da.agent_id,
    u.first_name || ' ' || u.last_name AS agent_name,
    da.vehicle_type,
    da.license_number,
    COUNT(oa.assignment_id) AS total_assignments,
    SUM(CASE WHEN os.status_name = 'Delivered' THEN 1 ELSE 0 END) AS successful_deliveries,
    SUM(CASE WHEN os.status_name = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled_deliveries,
    AVG(CASE WHEN os.status_name = 'Delivered' THEN o.total_amount ELSE NULL END) AS avg_order_value,
    MIN(oa.assigned_at) AS first_assignment,
    MAX(oa.assigned_at) AS last_assignment
FROM 
    delivery_agents da
JOIN 
    users u ON da.user_id = u.user_id
LEFT JOIN 
    order_assignments oa ON da.agent_id = oa.agent_id
LEFT JOIN 
    orders o ON oa.order_id = o.order_id
LEFT JOIN 
    order_statuses os ON o.status_id = os.status_id
WHERE 
    da.is_active = 1
GROUP BY 
    da.agent_id, u.first_name, u.last_name, da.vehicle_type, da.license_number
ORDER BY 
    successful_deliveries DESC;
/

-- Example usage of the procedures:
/*
DECLARE
    v_total_customers NUMBER;
    v_total_agents NUMBER;
    v_total_sellers NUMBER;
    v_total_revenue NUMBER;
    v_pending_orders NUMBER;
    v_low_stock_alerts NUMBER;
BEGIN
    get_admin_dashboard_stats(
        v_total_customers, v_total_agents, v_total_sellers,
        v_total_revenue, v_pending_orders, v_low_stock_alerts
    );
    
    DBMS_OUTPUT.PUT_LINE('Total Customers: ' || v_total_customers);
    DBMS_OUTPUT.PUT_LINE('Total Delivery Agents: ' || v_total_agents);
    DBMS_OUTPUT.PUT_LINE('Total Sellers: ' || v_total_sellers);
    DBMS_OUTPUT.PUT_LINE('Total Revenue: ' || v_total_revenue);
    DBMS_OUTPUT.PUT_LINE('Pending Orders: ' || v_pending_orders);
    DBMS_OUTPUT.PUT_LINE('Low Stock Alerts: ' || v_low_stock_alerts);
END;
/
*/





-- Seller procedures

-- 1. Get Seller Statistics (Total Plants, Total Sales, Total Earnings)

CREATE OR REPLACE PROCEDURE get_seller_plants(
    p_seller_id IN NUMBER,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
    SELECT 
        p.plant_id,
        p.name AS plant_name,
        -- Handle CLOB by converting to VARCHAR2 with substr
        DBMS_LOB.SUBSTR(p.description, 4000, 1) AS description,
        p.base_price,
        p.stock_quantity,
        p.created_at,
        p.updated_at,
        p.is_active,
        -- Get primary image
        (SELECT image_url FROM plant_images WHERE plant_id = p.plant_id AND is_primary = 1 AND ROWNUM = 1) AS primary_image,
        -- Get all categories as comma-separated list
        LISTAGG(pc.name, ', ') WITHIN GROUP (ORDER BY pc.name) AS categories,
        -- Get all sizes
        (SELECT LISTAGG(size_name || ' (+₹' || price_adjustment || ')', ', ') 
         FROM plant_sizes WHERE plant_id = p.plant_id) AS available_sizes,
        -- Get review statistics
        NVL(AVG(r.rating), 0) AS avg_rating,
        COUNT(r.review_id) AS total_reviews,
        -- Get total sales
        (SELECT NVL(SUM(oi.quantity), 0) 
         FROM order_items oi 
         JOIN orders o ON oi.order_id = o.order_id 
         WHERE oi.plant_id = p.plant_id 
         AND o.status_id IN (SELECT status_id FROM order_statuses WHERE status_name = 'Delivered')) AS total_sold
    FROM plants p
    LEFT JOIN plant_category_mapping pcm ON p.plant_id = pcm.plant_id
    LEFT JOIN plant_categories pc ON pcm.category_id = pc.category_id
    LEFT JOIN reviews r ON p.plant_id = r.plant_id
    WHERE p.seller_id = p_seller_id
    GROUP BY 
        p.plant_id, p.name, DBMS_LOB.SUBSTR(p.description, 4000, 1), p.base_price, p.stock_quantity,
        p.created_at, p.updated_at, p.is_active
    ORDER BY p.created_at DESC;
END;
/

-- 2. Get Recent Sales (Last 5 orders)
CREATE OR REPLACE PROCEDURE get_recent_sales (
    p_seller_id IN NUMBER,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
    SELECT 
        o.order_id,
        TO_CHAR(o.order_date, 'YYYY-MM-DD') AS order_date,
        p.name AS plant_name,
        oi.quantity,
        (oi.quantity * oi.unit_price) AS total_amount
    FROM order_items oi
    JOIN plants p ON oi.plant_id = p.plant_id
    JOIN orders o ON oi.order_id = o.order_id
    WHERE p.seller_id = p_seller_id
    AND o.status_id IN (SELECT status_id FROM order_statuses WHERE status_name = 'Delivered')
    ORDER BY o.order_date DESC
    FETCH FIRST 5 ROWS ONLY;
END;
/

-- 3. Get Low Stock Plants (Stock less than 10)
CREATE OR REPLACE PROCEDURE get_low_stock_plants (
    p_seller_id IN NUMBER,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
    SELECT 
        plant_id,
        name,
        stock_quantity,
        base_price
    FROM plants
    WHERE seller_id = p_seller_id
    AND stock_quantity < 10
    AND is_active = 1
    ORDER BY stock_quantity ASC;
END;
/

-- 4. Get All Plants with Details
CREATE OR REPLACE PROCEDURE get_seller_plants (
    p_seller_id IN NUMBER,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
    SELECT 
        p.plant_id,
        p.name,
        p.description,
        p.base_price,
        p.stock_quantity,
        (SELECT image_url FROM plant_images WHERE plant_id = p.plant_id AND is_primary = 1 AND ROWNUM = 1) AS primary_image,
        LISTAGG(pc.name, ', ') WITHIN GROUP (ORDER BY pc.name) AS categories
    FROM plants p
    LEFT JOIN plant_category_mapping pcm ON p.plant_id = pcm.plant_id
    LEFT JOIN plant_categories pc ON pcm.category_id = pc.category_id
    WHERE p.seller_id = p_seller_id
    AND p.is_active = 1
    GROUP BY p.plant_id, p.name, p.description, p.base_price, p.stock_quantity
    ORDER BY p.created_at DESC;
END;
/

-- 5. Get Sales Records
-- Comprehensive seller dashboard procedure
CREATE OR REPLACE PROCEDURE get_seller_dashboard(
    p_seller_id IN NUMBER,
    p_plants_cursor OUT SYS_REFCURSOR,
    p_stats_cursor OUT SYS_REFCURSOR,
    p_categories_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    -- Get seller's plants
    OPEN p_plants_cursor FOR
    SELECT 
        p.plant_id,
        p.name AS plant_name,
        p.base_price,
        p.stock_quantity,
        (SELECT image_url FROM plant_images WHERE plant_id = p.plant_id AND is_primary = 1 AND ROWNUM = 1) AS image,
        LISTAGG(pc.name, ', ') WITHIN GROUP (ORDER BY pc.name) AS categories,
        NVL(AVG(r.rating), 0) AS avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE plant_id = p.plant_id) AS review_count,
        (SELECT NVL(SUM(oi.quantity), 0) 
         FROM order_items oi 
         JOIN orders o ON oi.order_id = o.order_id 
         WHERE oi.plant_id = p.plant_id 
         AND o.status_id IN (SELECT status_id FROM order_statuses WHERE status_name = 'Delivered')) AS total_sold
    FROM plants p
    LEFT JOIN plant_category_mapping pcm ON p.plant_id = pcm.plant_id
    LEFT JOIN plant_categories pc ON pcm.category_id = pc.category_id
    LEFT JOIN reviews r ON p.plant_id = r.plant_id
    WHERE p.seller_id = p_seller_id
    GROUP BY p.plant_id, p.name, p.base_price, p.stock_quantity
    ORDER BY p.created_at DESC;

    -- Get seller statistics
    OPEN p_stats_cursor FOR
    SELECT 
        (SELECT COUNT(*) FROM plants WHERE seller_id = p_seller_id AND is_active = 1) AS total_plants,
        (SELECT NVL(SUM(oi.quantity), 0) FROM order_items oi 
         JOIN plants p ON oi.plant_id = p.plant_id 
         JOIN orders o ON oi.order_id = o.order_id 
         WHERE p.seller_id = p_seller_id 
         AND o.status_id IN (SELECT status_id FROM order_statuses WHERE status_name = 'Delivered')) AS total_sales,
        (SELECT NVL(SUM(oi.quantity * oi.unit_price * 0.9), 0) FROM order_items oi 
         JOIN plants p ON oi.plant_id = p.plant_id 
         JOIN orders o ON oi.order_id = o.order_id 
         WHERE p.seller_id = p_seller_id 
         AND o.status_id IN (SELECT status_id FROM order_statuses WHERE status_name = 'Delivered')) AS total_earnings,
        (SELECT COUNT(*) FROM plants WHERE seller_id = p_seller_id AND stock_quantity < 10) AS low_stock_count
    FROM dual;

    -- Get all categories for dropdown
    OPEN p_categories_cursor FOR
    SELECT category_id, name, description
    FROM plant_categories
    ORDER BY name;
END;
/

-- 6. Add New Plant
-- Drop the existing procedure
DROP PROCEDURE add_plant;

-- Create a function instead
-- Drop the existing function
DROP FUNCTION add_plant_func;

-- Create a new function without COMMIT
CREATE OR REPLACE FUNCTION add_plant_func (
    p_name IN VARCHAR2,
    p_description IN CLOB,
    p_base_price IN NUMBER,
    p_stock_quantity IN NUMBER,
    p_seller_id IN NUMBER,
    p_category_ids IN VARCHAR2,
    p_images IN VARCHAR2,
    p_features IN VARCHAR2,
    p_care_tips IN VARCHAR2,
    p_sizes IN VARCHAR2
) RETURN NUMBER
AS
    PRAGMA AUTONOMOUS_TRANSACTION; -- Add this to allow DML operations
    v_plant_id NUMBER;
    v_category_id NUMBER;
    v_image_url VARCHAR2(255);
    v_feature_text VARCHAR2(255);
    v_care_tip_text VARCHAR2(255);
    v_size_name VARCHAR2(50);
    v_price_adjustment NUMBER(10,2);
    v_idx NUMBER;
    v_seller_count NUMBER := 0;
BEGIN
    -- Validate seller
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
    
    COMMIT; -- This is now allowed with AUTONOMOUS_TRANSACTION
    RETURN v_plant_id;
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/
DROP PROCEDURE add_plant;
-- 7. Update Plant Details
CREATE OR REPLACE PROCEDURE update_plant_details (
    p_requestor_id    IN NUMBER,
    p_plant_id        IN NUMBER,
    p_name            IN VARCHAR2 DEFAULT NULL,
    p_description     IN CLOB DEFAULT NULL,
    p_base_price      IN NUMBER DEFAULT NULL,
    p_stock_quantity  IN NUMBER DEFAULT NULL,
    p_category_ids    IN VARCHAR2 DEFAULT NULL,
    p_images          IN VARCHAR2 DEFAULT NULL,
    p_features        IN VARCHAR2 DEFAULT NULL,
    p_care_tips       IN VARCHAR2 DEFAULT NULL,
    p_sizes           IN VARCHAR2 DEFAULT NULL
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
    -- Verify plant exists and get its seller
    BEGIN
        SELECT seller_id INTO v_seller_id FROM plants WHERE plant_id = p_plant_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20024, 'Plant not found');
    END;

    -- Check if requestor is admin
    SELECT COUNT(*) INTO v_is_admin
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.role_id
    WHERE ur.user_id = p_requestor_id
      AND r.role_name = 'admin';

    -- Allow only admin or the original seller to update
    IF v_is_admin = 0 AND p_requestor_id != v_seller_id THEN
        RAISE_APPLICATION_ERROR(-20023, 'Not authorized: only admin or the seller who uploaded the plant can update it');
    END IF;

    -- Update only provided fields
    UPDATE plants
    SET name          = NVL(p_name, name),
        description   = CASE WHEN p_description IS NOT NULL THEN p_description ELSE description END,
        base_price    = NVL(p_base_price, base_price),
        stock_quantity= NVL(p_stock_quantity, stock_quantity),
        updated_at    = SYSTIMESTAMP
    WHERE plant_id = p_plant_id;

    -- Categories: replace only if passed
    IF p_category_ids IS NOT NULL THEN
        DELETE FROM plant_category_mapping WHERE plant_id = p_plant_id;
        FOR i IN 1..REGEXP_COUNT(p_category_ids, '[^,]+') LOOP
            v_category_id := TO_NUMBER(TRIM(REGEXP_SUBSTR(p_category_ids, '[^,]+', 1, i)));
            INSERT INTO plant_category_mapping (plant_id, category_id)
            VALUES (p_plant_id, v_category_id);
        END LOOP;
    END IF;

    -- Images: replace only if passed
    IF p_images IS NOT NULL THEN
        DELETE FROM plant_images WHERE plant_id = p_plant_id;
        FOR i IN 1..REGEXP_COUNT(p_images, '[^,]+') LOOP
            v_image_url := TRIM(REGEXP_SUBSTR(p_images, '[^,]+', 1, i));
            INSERT INTO plant_images (plant_id, image_url, is_primary)
            VALUES (p_plant_id, v_image_url, CASE WHEN i = 1 THEN 1 ELSE 0 END);
        END LOOP;
    END IF;

    -- Features: replace only if passed
    IF p_features IS NOT NULL THEN
        DELETE FROM plant_features WHERE plant_id = p_plant_id;
        FOR i IN 1..REGEXP_COUNT(p_features, '[^,]+') LOOP
            v_feature_text := TRIM(REGEXP_SUBSTR(p_features, '[^,]+', 1, i));
            INSERT INTO plant_features (plant_id, feature_text)
            VALUES (p_plant_id, v_feature_text);
        END LOOP;
    END IF;

    -- Care tips: replace only if passed
    IF p_care_tips IS NOT NULL THEN
        DELETE FROM plant_care_tips WHERE plant_id = p_plant_id;
        FOR i IN 1..REGEXP_COUNT(p_care_tips, '[^,]+') LOOP
            v_care_tip_text := TRIM(REGEXP_SUBSTR(p_care_tips, '[^,]+', 1, i));
            INSERT INTO plant_care_tips (plant_id, tip_text)
            VALUES (p_plant_id, v_care_tip_text);
        END LOOP;
    END IF;

    -- Sizes: replace only if passed
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

-- 8. Get Plant Details for Editing
CREATE OR REPLACE PROCEDURE get_plant_details (
    p_plant_id IN NUMBER,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
    SELECT 
        p.plant_id,
        p.name,
        p.description,
        p.base_price,
        p.stock_quantity,
        p.seller_id,
        (SELECT LISTAGG(category_id, ',') WITHIN GROUP (ORDER BY category_id) 
         FROM plant_category_mapping WHERE plant_id = p.plant_id) AS category_ids,
        (SELECT LISTAGG(image_url, ',') WITHIN GROUP (ORDER BY image_id) 
         FROM plant_images WHERE plant_id = p.plant_id) AS image_urls,
        (SELECT LISTAGG(feature_text, ',') WITHIN GROUP (ORDER BY feature_id) 
         FROM plant_features WHERE plant_id = p.plant_id) AS features,
        (SELECT LISTAGG(tip_text, ',') WITHIN GROUP (ORDER BY tip_id) 
         FROM plant_care_tips WHERE plant_id = p.plant_id) AS care_tips,
        (SELECT LISTAGG(size_name || ':' || price_adjustment, ',') WITHIN GROUP (ORDER BY size_id) 
         FROM plant_sizes WHERE plant_id = p.plant_id) AS sizes
    FROM plants p
    WHERE p.plant_id = p_plant_id;
END;
/

-- 9. Function to get all plant categories
CREATE OR REPLACE FUNCTION get_plant_categories
RETURN SYS_REFCURSOR
AS
    p_cursor SYS_REFCURSOR;
BEGIN
    OPEN p_cursor FOR
    SELECT category_id, name, slug, description
    FROM plant_categories
    ORDER BY name;
    
    RETURN p_cursor;
END;
/


-- delivery man page

-- 1. Procedure to get delivery agent's assigned orders
CREATE OR REPLACE PROCEDURE get_delivery_agent_orders(
    p_agent_id IN NUMBER,
    p_status IN VARCHAR2 DEFAULT NULL,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
    SELECT 
        o.order_id,
        o.order_number,
        o.order_date,
        os.status_name AS order_status,
        u.user_id AS customer_id,
        u.first_name || ' ' || u.last_name AS customer_name,
        u.phone AS customer_phone,
        u.email AS customer_email,
        o.delivery_address,
        o.delivery_notes,
        dm.name AS delivery_method,
        dm.base_cost AS delivery_cost,
        dm.estimated_days,
        o.total_amount,
        o.tracking_number,
        o.estimated_delivery_date,
        o.actual_delivery_date,
        oa.assigned_at,
        oa.completed_at,
        oa.notes AS assignment_notes,
        dc.customer_confirmed,
        dc.agent_confirmed,
        dc.confirmed_date,
        -- Order items summary
        (SELECT LISTAGG(p.name || ' (x' || oi.quantity || ')', ', ') 
         WITHIN GROUP (ORDER BY oi.order_item_id)
         FROM order_items oi 
         JOIN plants p ON oi.plant_id = p.plant_id
         WHERE oi.order_id = o.order_id) AS items_summary,
        -- Primary image for display
        (SELECT pi.image_url 
         FROM order_items oi 
         JOIN plants p ON oi.plant_id = p.plant_id
         LEFT JOIN plant_images pi ON p.plant_id = pi.plant_id AND pi.is_primary = 1
         WHERE oi.order_id = o.order_id AND ROWNUM = 1) AS primary_image
    FROM orders o
    JOIN order_assignments oa ON o.order_id = oa.order_id
    JOIN order_statuses os ON o.status_id = os.status_id
    JOIN users u ON o.user_id = u.user_id
    JOIN delivery_methods dm ON o.delivery_method_id = dm.method_id
    LEFT JOIN delivery_confirmations dc ON o.order_id = dc.order_id
    WHERE oa.agent_id = p_agent_id
    AND (p_status IS NULL OR os.status_name = p_status)
    ORDER BY 
        CASE 
            WHEN os.status_name = 'Out for Delivery' THEN 1
            WHEN os.status_name = 'Shipped' THEN 2
            WHEN os.status_name = 'Processing' THEN 3
            ELSE 4
        END,
        o.order_date DESC;
END;
/

-- 2. Procedure to get delivery agent's pending orders
CREATE OR REPLACE PROCEDURE get_delivery_agent_pending_orders(
    p_agent_id IN NUMBER,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
    SELECT 
        o.order_id,
        o.order_number,
        o.order_date,
        os.status_name AS order_status,
        u.first_name || ' ' || u.last_name AS customer_name,
        u.phone AS customer_phone,
        o.delivery_address,
        o.delivery_notes,
        dm.name AS delivery_method,
        o.total_amount,
        o.estimated_delivery_date,
        oa.assigned_at,
        -- Order items details
        (SELECT LISTAGG(p.name || ' (Qty: ' || oi.quantity || ')', ', ') 
         WITHIN GROUP (ORDER BY oi.order_item_id)
         FROM order_items oi 
         JOIN plants p ON oi.plant_id = p.plant_id
         WHERE oi.order_id = o.order_id) AS order_items,
        -- Customer delivery instructions if any
        (SELECT LISTAGG(feature_text, '; ') 
         FROM plant_features pf 
         JOIN order_items oi ON pf.plant_id = oi.plant_id 
         WHERE oi.order_id = o.order_id AND ROWNUM = 1) AS delivery_instructions
    FROM orders o
    JOIN order_assignments oa ON o.order_id = oa.order_id
    JOIN order_statuses os ON o.status_id = os.status_id
    JOIN users u ON o.user_id = u.user_id
    JOIN delivery_methods dm ON o.delivery_method_id = dm.method_id
    WHERE oa.agent_id = p_agent_id
    AND os.status_name IN ('Processing', 'Shipped', 'Out for Delivery')
    AND oa.completed_at IS NULL
    ORDER BY o.estimated_delivery_date ASC, o.order_date DESC;
END;
/

-- 3. Procedure to get delivery agent's completed orders
CREATE OR REPLACE PROCEDURE get_delivery_agent_completed_orders(
    p_agent_id IN NUMBER,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
    SELECT 
        o.order_id,
        o.order_number,
        o.order_date,
        os.status_name AS order_status,
        u.first_name || ' ' || u.last_name AS customer_name,
        u.phone AS customer_phone,
        o.delivery_address,
        dm.name AS delivery_method,
        o.total_amount,
        o.actual_delivery_date,
        oa.assigned_at,
        oa.completed_at,
        oa.notes AS delivery_notes,
        dc.customer_confirmed,
        dc.agent_confirmed,
        dc.confirmed_date,
        -- Fixed: Use EXTRACT to calculate hours instead of direct arithmetic
        ROUND(EXTRACT(DAY FROM (NVL(oa.completed_at, o.actual_delivery_date) - oa.assigned_at)) * 24 +
              EXTRACT(HOUR FROM (NVL(oa.completed_at, o.actual_delivery_date) - oa.assigned_at)) +
              EXTRACT(MINUTE FROM (NVL(oa.completed_at, o.actual_delivery_date) - oa.assigned_at)) / 60, 2) AS hours_to_complete,
        CASE 
            WHEN o.actual_delivery_date <= o.estimated_delivery_date THEN 'On Time'
            ELSE 'Delayed'
        END AS delivery_performance,
        -- Order items summary
        (SELECT LISTAGG(p.name || ' (x' || oi.quantity || ')', ', ') 
         WITHIN GROUP (ORDER BY oi.order_item_id)
         FROM order_items oi 
         JOIN plants p ON oi.plant_id = p.plant_id
         WHERE oi.order_id = o.order_id) AS items_summary
    FROM orders o
    JOIN order_assignments oa ON o.order_id = oa.order_id
    JOIN order_statuses os ON o.status_id = os.status_id
    JOIN users u ON o.user_id = u.user_id
    JOIN delivery_methods dm ON o.delivery_method_id = dm.method_id
    LEFT JOIN delivery_confirmations dc ON o.order_id = dc.order_id
    WHERE oa.agent_id = p_agent_id
    AND os.status_name = 'Delivered'
    ORDER BY o.actual_delivery_date DESC;
END;
/


select * from orders;

-- 2. Fixed Procedure to get delivery agent statistics
CREATE OR REPLACE PROCEDURE get_delivery_agent_stats(
    p_agent_id IN NUMBER,
    p_total_assignments OUT NUMBER,
    p_pending_assignments OUT NUMBER,
    p_completed_assignments OUT NUMBER,
    p_total_earnings OUT NUMBER,
    p_avg_delivery_time OUT NUMBER
) AS
BEGIN
    -- Total assignments
    SELECT COUNT(*) INTO p_total_assignments
    FROM order_assignments
    WHERE agent_id = p_agent_id;

    -- Pending assignments
    SELECT COUNT(*) INTO p_pending_assignments
    FROM order_assignments oa
    JOIN orders o ON oa.order_id = o.order_id
    JOIN order_statuses os ON o.status_id = os.status_id
    WHERE oa.agent_id = p_agent_id
    AND os.status_name IN ('Processing', 'Shipped', 'Out for Delivery')
    AND oa.completed_at IS NULL;

    -- Completed assignments
    SELECT COUNT(*) INTO p_completed_assignments
    FROM order_assignments oa
    JOIN orders o ON oa.order_id = o.order_id
    JOIN order_statuses os ON o.status_id = os.status_id
    WHERE oa.agent_id = p_agent_id
    AND os.status_name = 'Delivered';

    -- Total earnings (5% of order total)
    SELECT NVL(SUM(o.total_amount * 0.05), 0) INTO p_total_earnings
    FROM orders o
    JOIN order_assignments oa ON o.order_id = oa.order_id
    JOIN order_statuses os ON o.status_id = os.status_id
    WHERE oa.agent_id = p_agent_id
    AND os.status_name = 'Delivered';

    -- Fixed: Average delivery time in hours using EXTRACT
    SELECT NVL(AVG(EXTRACT(DAY FROM (NVL(oa.completed_at, o.actual_delivery_date) - oa.assigned_at)) * 24 +
                   EXTRACT(HOUR FROM (NVL(oa.completed_at, o.actual_delivery_date) - oa.assigned_at)) +
                   EXTRACT(MINUTE FROM (NVL(oa.completed_at, o.actual_delivery_date) - oa.assigned_at)) / 60), 0) 
    INTO p_avg_delivery_time
    FROM order_assignments oa
    JOIN orders o ON oa.order_id = o.order_id
    JOIN order_statuses os ON o.status_id = os.status_id
    WHERE oa.agent_id = p_agent_id
    AND os.status_name = 'Delivered'
    AND (oa.completed_at IS NOT NULL OR o.actual_delivery_date IS NOT NULL);
END;
/

-- 4. Procedure to update delivery status
CREATE OR REPLACE PROCEDURE update_delivery_status(
    p_order_id IN NUMBER,
    p_agent_id IN NUMBER,
    p_status IN VARCHAR2,
    p_notes IN VARCHAR2 DEFAULT NULL,
    p_success OUT NUMBER,
    p_message OUT VARCHAR2
) AS
    v_current_status VARCHAR2(50);
    v_valid_agent NUMBER;
    v_customer_id NUMBER;
    v_status_id NUMBER;
BEGIN
    -- Check if agent is assigned to this order
    SELECT COUNT(*) INTO v_valid_agent
    FROM order_assignments
    WHERE order_id = p_order_id AND agent_id = p_agent_id;

    IF v_valid_agent = 0 THEN
        p_success := 0;
        p_message := 'Order not assigned to this delivery agent';
        RETURN;
    END IF;

    -- Get current status and customer ID
    SELECT os.status_name, o.user_id 
    INTO v_current_status, v_customer_id
    FROM orders o
    JOIN order_statuses os ON o.status_id = os.status_id
    WHERE o.order_id = p_order_id;

    -- Update status based on the requested action
    IF p_status = 'PICKED_UP' AND v_current_status = 'Processing' THEN
        -- Get status_id for 'Shipped'
        SELECT status_id INTO v_status_id FROM order_statuses WHERE status_name = 'Shipped';
        
        UPDATE orders
        SET status_id = v_status_id
        WHERE order_id = p_order_id;
        
        p_success := 1;
        p_message := 'Order picked up successfully';

    ELSIF p_status = 'OUT_FOR_DELIVERY' AND v_current_status = 'Shipped' THEN
        -- Get status_id for 'Out for Delivery'
        SELECT status_id INTO v_status_id FROM order_statuses WHERE status_name = 'Out for Delivery';
        
        UPDATE orders
        SET status_id = v_status_id
        WHERE order_id = p_order_id;
        
        p_success := 1;
        p_message := 'Order out for delivery';

    ELSIF p_status = 'DELIVERED' AND v_current_status = 'Out for Delivery' THEN
        -- Get status_id for 'Delivered'
        SELECT status_id INTO v_status_id FROM order_statuses WHERE status_name = 'Delivered';
        
        -- Mark assignment as completed
        UPDATE order_assignments
        SET completed_at = SYSTIMESTAMP,
            notes = NVL(p_notes, notes)
        WHERE order_id = p_order_id;

        -- Update order status to delivered
        UPDATE orders
        SET status_id = v_status_id,
            actual_delivery_date = SYSTIMESTAMP
        WHERE order_id = p_order_id;

        -- Fixed MERGE statement syntax
        MERGE INTO delivery_confirmations dc
        USING (SELECT p_order_id AS order_id, v_customer_id AS user_id, p_agent_id AS agent_id FROM dual) src
        ON (dc.order_id = src.order_id)
        WHEN MATCHED THEN
            UPDATE SET 
                agent_confirmed = 1,
                confirmed_date = CASE WHEN customer_confirmed = 1 THEN SYSTIMESTAMP ELSE confirmed_date END
        WHEN NOT MATCHED THEN
            INSERT (order_id, user_id, agent_id, agent_confirmed)
            VALUES (src.order_id, src.user_id, src.agent_id, 1);
        
        p_success := 1;
        p_message := 'Order delivered successfully';

    ELSE
        p_success := 0;
        p_message := 'Invalid status transition from ' || v_current_status || ' to ' || p_status;
    END IF;

    COMMIT;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        ROLLBACK;
        p_success := 0;
        p_message := 'Status not found or invalid data';
    WHEN OTHERS THEN
        ROLLBACK;
        p_success := 0;
        p_message := 'Error updating delivery status: ' || SQLERRM;
END;
/

-- Enhanced procedure for agent to confirm with duplicate check
CREATE OR REPLACE PROCEDURE confirm_agent_delivery (
    p_order_id IN NUMBER,
    p_agent_id IN NUMBER,
    p_success OUT NUMBER,
    p_message OUT VARCHAR2
) AS
    v_current_agent_confirmed NUMBER;
    v_current_customer_confirmed NUMBER;
BEGIN
    -- Check current confirmation status
    SELECT agent_confirmed, customer_confirmed 
    INTO v_current_agent_confirmed, v_current_customer_confirmed
    FROM delivery_confirmations 
    WHERE order_id = p_order_id;
    
    -- Check if agent has already confirmed
    IF v_current_agent_confirmed = 1 THEN
        p_success := 0;
        p_message := 'Agent has already confirmed this delivery.';
        RETURN;
    END IF;
    
    -- Update agent confirmation only
    UPDATE delivery_confirmations 
    SET agent_confirmed = 1
    WHERE order_id = p_order_id;
    
    p_success := 1;
    p_message := 'Agent confirmation recorded.';
    
    COMMIT;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        ROLLBACK;
        p_success := 0;
        p_message := 'Error: Delivery confirmation record not found.';
    WHEN OTHERS THEN
        ROLLBACK;
        p_success := 0;
        p_message := 'Error: ' || SQLERRM;
END;
/

-- Enhanced procedure for customer to confirm with duplicate check
CREATE OR REPLACE PROCEDURE confirm_customer_delivery (
    p_order_id IN NUMBER,
    p_user_id IN NUMBER,
    p_success OUT NUMBER,
    p_message OUT VARCHAR2
) AS
    v_current_agent_confirmed NUMBER;
    v_current_customer_confirmed NUMBER;
BEGIN
    -- Check current confirmation status
    SELECT agent_confirmed, customer_confirmed 
    INTO v_current_agent_confirmed, v_current_customer_confirmed
    FROM delivery_confirmations 
    WHERE order_id = p_order_id;
    
    -- Check if customer has already confirmed
    IF v_current_customer_confirmed = 1 THEN
        p_success := 0;
        p_message := 'Customer has already confirmed this delivery.';
        RETURN;
    END IF;
    
    -- Update customer confirmation only
    UPDATE delivery_confirmations 
    SET customer_confirmed = 1
    WHERE order_id = p_order_id;
    
    p_success := 1;
    p_message := 'Customer confirmation recorded.';
    
    COMMIT;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        ROLLBACK;
        p_success := 0;
        p_message := 'Error: Delivery confirmation record not found.';
    WHEN OTHERS THEN
        ROLLBACK;
        p_success := 0;
        p_message := 'Error: ' || SQLERRM;
END;
/



CREATE OR REPLACE TRIGGER trg_delivery_confirmation_complete
AFTER UPDATE ON delivery_confirmations
FOR EACH ROW
WHEN (NEW.agent_confirmed = 1 AND NEW.customer_confirmed = 1 AND NEW.confirmed_date IS NULL)
BEGIN
    -- Update order status to Delivered when both confirm
    UPDATE orders
    SET status_id = (SELECT status_id FROM order_statuses WHERE status_name = 'Delivered'),
        actual_delivery_date = SYSTIMESTAMP
    WHERE order_id = :NEW.order_id;
    
    -- Update confirmation timestamp
    UPDATE delivery_confirmations
    SET confirmed_date = SYSTIMESTAMP
    WHERE order_id = :NEW.order_id;
END;
/



CREATE OR REPLACE VIEW vw_delivery_confirmation_status AS
SELECT 
    dc.order_id,
    dc.agent_confirmed,
    dc.customer_confirmed,
    dc.confirmed_date,
    os.status_name,
    CASE 
        WHEN dc.agent_confirmed = 1 AND dc.customer_confirmed = 1 THEN 'COMPLETED'
        WHEN dc.agent_confirmed = 1 THEN 'WAITING_CUSTOMER'
        WHEN dc.customer_confirmed = 1 THEN 'WAITING_AGENT'
        ELSE 'PENDING_BOTH'
    END AS confirmation_status
FROM delivery_confirmations dc
JOIN orders o ON dc.order_id = o.order_id
JOIN order_statuses os ON o.status_id = os.status_id;

select * from order_statuses;

SELECT * FROM vw_delivery_confirmation_status WHERE order_id = 594;


-- Check trigger status
SELECT trigger_name, status FROM user_triggers WHERE trigger_name = 'TRG_DELIVERY_CONFIRMATION_COMPLETE';

-- Enable trigger if disabled
ALTER TRIGGER trg_delivery_confirmation_complete ENABLE;


-- Procedure for delivery agent to mark delivery as delivered
CREATE OR REPLACE PROCEDURE mark_delivery_delivered (
    p_order_id IN NUMBER,
    p_agent_id IN NUMBER,
    p_notes IN VARCHAR2 DEFAULT NULL,
    p_success OUT NUMBER,
    p_message OUT VARCHAR2
) AS
    v_assignment_exists NUMBER;
    v_current_status VARCHAR2(50);
    v_confirmation_exists NUMBER;
    v_customer_id NUMBER;
    v_agent_already_confirmed NUMBER;
BEGIN
    -- Check if assignment exists and belongs to this agent
    SELECT COUNT(*)
    INTO v_assignment_exists
    FROM order_assignments oa
    WHERE oa.order_id = p_order_id AND oa.agent_id = p_agent_id;

    IF v_assignment_exists = 0 THEN
        p_success := 0;
        p_message := 'Order not assigned to this delivery agent';
        RETURN;
    END IF;

    -- Get current status and customer ID
    SELECT os.status_name, o.user_id
    INTO v_current_status, v_customer_id
    FROM orders o
    JOIN order_statuses os ON o.status_id = os.status_id
    WHERE o.order_id = p_order_id;

    -- Check if agent has already confirmed
    SELECT COUNT(*)
    INTO v_agent_already_confirmed
    FROM delivery_confirmations
    WHERE order_id = p_order_id AND agent_confirmed = 1;

    IF v_agent_already_confirmed > 0 THEN
        p_success := 0;
        p_message := 'Agent has already confirmed this delivery';
        RETURN;
    END IF;

    -- Update assignment completion time
    UPDATE order_assignments
    SET completed_at = SYSTIMESTAMP,
        notes = NVL(p_notes, notes)
    WHERE order_id = p_order_id;

    -- Update order status to "Out for Delivery" if not already delivered
    IF v_current_status != 'Delivered' THEN
        UPDATE orders
        SET status_id = (SELECT status_id FROM order_statuses WHERE status_name = 'Out for Delivery')
        WHERE order_id = p_order_id;
    END IF;

    -- Check if delivery confirmation record exists
    SELECT COUNT(*)
    INTO v_confirmation_exists
    FROM delivery_confirmations
    WHERE order_id = p_order_id;

    -- Create delivery confirmation record if it doesn't exist
    IF v_confirmation_exists = 0 THEN
        INSERT INTO delivery_confirmations (
            order_id, 
            user_id, 
            agent_id, 
            agent_confirmed
        )
        VALUES (p_order_id, v_customer_id, p_agent_id, 1);
    ELSE
        -- Update existing confirmation
        UPDATE delivery_confirmations
        SET agent_confirmed = 1,
            confirmed_date = CASE WHEN customer_confirmed = 1 THEN SYSTIMESTAMP ELSE confirmed_date END
        WHERE order_id = p_order_id;
    END IF;

    -- If customer already confirmed, mark as delivered
    DECLARE
        v_customer_confirmed NUMBER;
    BEGIN
        SELECT customer_confirmed
        INTO v_customer_confirmed
        FROM delivery_confirmations
        WHERE order_id = p_order_id;

        IF v_customer_confirmed = 1 THEN
            UPDATE orders
            SET status_id = (SELECT status_id FROM order_statuses WHERE status_name = 'Delivered'),
                actual_delivery_date = SYSTIMESTAMP
            WHERE order_id = p_order_id;
            
            p_success := 1;
            p_message := 'Order delivered successfully';

        ELSE
            p_success := 1;
            p_message := 'Order marked as delivered. Waiting for customer confirmation.';
        END IF;

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_success := 1;
            p_message := 'Order marked as delivered. Waiting for customer confirmation.';
    END;

    COMMIT;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_success := 0;
        p_message := 'Error marking delivery as delivered: ' || SQLERRM;
END;
/



-- Function to get delivery agent's current assignments count
CREATE OR REPLACE FUNCTION get_delivery_agent_assignment_count (
    p_agent_id IN NUMBER,
    p_status IN VARCHAR2 DEFAULT NULL
) RETURN NUMBER AS
    v_count NUMBER;
BEGIN
    IF p_status IS NULL THEN
        SELECT COUNT(*)
        INTO v_count
        FROM order_assignments oa
        JOIN orders o ON oa.order_id = o.order_id
        WHERE oa.agent_id = p_agent_id
        AND oa.completed_at IS NULL;
    ELSE
        SELECT COUNT(*)
        INTO v_count
        FROM order_assignments oa
        JOIN orders o ON oa.order_id = o.order_id
        JOIN order_statuses os ON o.status_id = os.status_id
        WHERE oa.agent_id = p_agent_id
        AND os.status_name = p_status
        AND oa.completed_at IS NULL;
    END IF;

    RETURN v_count;
END get_delivery_agent_assignment_count;
/

-- Procedure to get delivery agent's monthly earnings
CREATE OR REPLACE PROCEDURE get_delivery_agent_monthly_earnings (
    p_agent_id IN NUMBER,
    p_year IN NUMBER DEFAULT EXTRACT(YEAR FROM SYSDATE),
    p_earnings_out OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_earnings_out FOR
    SELECT 
        EXTRACT(MONTH FROM o.actual_delivery_date) AS month,
        TO_CHAR(o.actual_delivery_date, 'Month') AS month_name,
        COUNT(*) AS deliveries_completed,
        SUM(o.total_amount * 0.05) AS monthly_earnings,
        AVG(o.total_amount * 0.05) AS avg_earnings_per_delivery
    FROM orders o
    JOIN order_assignments oa ON o.order_id = oa.order_id
    JOIN order_statuses os ON o.status_id = os.status_id
    WHERE oa.agent_id = p_agent_id
    AND os.status_name = 'Delivered'
    AND EXTRACT(YEAR FROM o.actual_delivery_date) = p_year
    GROUP BY EXTRACT(MONTH FROM o.actual_delivery_date), TO_CHAR(o.actual_delivery_date, 'Month')
    ORDER BY EXTRACT(MONTH FROM o.actual_delivery_date);
END get_delivery_agent_monthly_earnings;
/

select * from user_roles;
select * from roles;
select * from users;

-- Example usage of the procedures:

-- DECLARE
--     v_agent_id NUMBER := 1; -- Example agent ID
--     v_all_assignments SYS_REFCURSOR;
--     v_pending_assignments SYS_REFCURSOR;
--     v_completed_assignments SYS_REFCURSOR;
--     v_stats SYS_REFCURSOR;
--     v_history SYS_REFCURSOR;
--     v_success NUMBER;
--     v_message VARCHAR2(4000);
    
--     -- Variables to fetch cursor data
--     TYPE t_assignment IS RECORD (
--         order_id NUMBER,
--         order_number VARCHAR2(20),
--         order_date TIMESTAMP,
--         order_status VARCHAR2(50),
--         customer_name VARCHAR2(101),
--         customer_phone VARCHAR2(20),
--         delivery_address VARCHAR2(500),
--         total_amount NUMBER,
--         estimated_delivery_date TIMESTAMP,
--         assigned_at TIMESTAMP,
--         completed_at TIMESTAMP,
--         notes VARCHAR2(500),
--         delivery_method VARCHAR2(50),
--         delivery_cost NUMBER,
--         customer_confirmed NUMBER,
--         agent_confirmed NUMBER,
--         confirmed_date TIMESTAMP
--     );
--     v_assignment t_assignment;
-- BEGIN
--     -- Get dashboard information
--     get_delivery_agent_dashboard(
--         p_agent_id => v_agent_id,
--         p_all_assignments => v_all_assignments,
--         p_pending_assignments => v_pending_assignments,
--         p_completed_assignments => v_completed_assignments,
--         p_stats => v_stats,
--         p_history => v_history
--     );

--     -- Process the results (example for all assignments)
--     DBMS_OUTPUT.PUT_LINE('=== ALL ASSIGNMENTS ===');
--     LOOP
--         FETCH v_all_assignments INTO v_assignment;
--         EXIT WHEN v_all_assignments%NOTFOUND;
--         DBMS_OUTPUT.PUT_LINE('Order: ' || v_assignment.order_number || 
--                            ', Status: ' || v_assignment.order_status ||
--                            ', Customer: ' || v_assignment.customer_name);
--     END LOOP;
--     CLOSE v_all_assignments;

--     -- Mark a delivery as delivered
--     mark_delivery_delivered(
--         p_order_id => 321, -- Example order ID
--         p_agent_id => v_agent_id,
--         p_notes => 'Delivered successfully',
--         p_success => v_success,
--         p_message => v_message
--     );

--     DBMS_OUTPUT.PUT_LINE('Mark Delivery Result: ' || v_message);

--     -- Get assignment count
--     DBMS_OUTPUT.PUT_LINE('Pending Assignments: ' || 
--         get_delivery_agent_assignment_count(v_agent_id, 'Processing'));
-- END;
-- /


-- sign up page


select * from roles;

-- Step 3: Recreate signup_user (as provided)
CREATE OR REPLACE PROCEDURE signup_user(
    p_username IN users.username%TYPE,
    p_email IN users.email%TYPE,
    p_password IN users.password_hash%TYPE,
    p_firstname IN users.first_name%TYPE,
    p_lastname IN users.last_name%TYPE,
    p_phone IN users.phone%TYPE,
    p_address IN users.address%TYPE,
    p_role_name IN roles.role_name%TYPE,
    p_secret_key IN VARCHAR2 DEFAULT NULL
) IS
    v_user_id NUMBER;
    v_role_id NUMBER;
    v_role_count NUMBER;
    v_expected_key VARCHAR2(100);
BEGIN
    -- Validate role exists
    SELECT COUNT(*) INTO v_role_count
    FROM roles
    WHERE role_name = p_role_name;
    
    IF v_role_count = 0 THEN
        RAISE_APPLICATION_ERROR(-20050, 'Invalid role name: ' || p_role_name);
    END IF;
    
    -- Get role_id
    SELECT role_id INTO v_role_id
    FROM roles
    WHERE role_name = p_role_name;
    
    -- Check if secret key is required for this role (admin, seller, delivery_agent)
    IF p_role_name IN ('admin', 'seller', 'delivery_agent') THEN
        IF p_secret_key IS NULL THEN
            RAISE_APPLICATION_ERROR(-20051, 'Secret key is required for ' || p_role_name || ' role');
        END IF;
        
        -- Validate secret key (hardcoded for security)
        CASE p_role_name
            WHEN 'admin' THEN v_expected_key := 'ADMIN_SECRET_123';
            WHEN 'seller' THEN v_expected_key := 'SELLER_SECRET_456';
            WHEN 'delivery_agent' THEN v_expected_key := 'DELIVERY_SECRET_789';
            ELSE v_expected_key := NULL;
        END CASE;
        
        IF p_secret_key != v_expected_key THEN
            RAISE_APPLICATION_ERROR(-20052, 'Invalid secret key for ' || p_role_name || ' role');
        END IF;
    END IF;
    
    -- Insert user
    INSERT INTO users(username, email, password_hash, first_name, last_name, phone, address)
    VALUES (p_username, p_email, p_password, p_firstname, p_lastname, p_phone, p_address)
    RETURNING user_id INTO v_user_id;
    
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
        RAISE_APPLICATION_ERROR(-20054, 'Username or Email already exists.');
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/
select * from users;
-- Step 4: Insert Users via signup_user
BEGIN
    DBMS_OUTPUT.PUT_LINE('Inserting Users via signup_user...');
    
    -- Insert Customer
    BEGIN
        signup_user(
            p_username => 'haha',
            p_email => 'haha@example.com',
            p_password => '1234',
            p_firstname => 'John',
            p_lastname => 'Doe',
            p_phone => '1234567890',
            p_address => '123 Main St',
            p_role_name => 'customer',
            p_secret_key => NULL
        );
    EXCEPTION
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('Customer Signup Failed: ' || SQLERRM);
    END;

    -- Insert Admin
    BEGIN
        signup_user(
            p_username => 'huhu',
            p_email => 'huhu@example.com',
            p_password => '1234',
            p_firstname => 'Jane',
            p_lastname => 'Admin',
            p_phone => '9876543210',
            p_address => '456 Admin Ave',
            p_role_name => 'admin',
            p_secret_key => 'ADMIN_SECRET_123'
        );
    EXCEPTION
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('Admin Signup Failed: ' || SQLERRM);
    END;

    -- Insert Seller
    BEGIN
        signup_user(
            p_username => 'lala',
            p_email => 'lala@example.com',
            p_password => '1234',
            p_firstname => 'Sam',
            p_lastname => 'Seller',
            p_phone => '5551234567',
            p_address => '789 Seller Rd',
            p_role_name => 'seller',
            p_secret_key => 'SELLER_SECRET_456'
        );
    EXCEPTION
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('Seller Signup Failed: ' || SQLERRM);
    END;

    -- Insert Delivery Agent
    BEGIN
        signup_user(
            p_username => 'lulu',
            p_email => 'lulu@example.com',
            p_password => '1234',
            p_firstname => 'Mike',
            p_lastname => 'Delivery',
            p_phone => '5559876543',
            p_address => '321 Delivery Ln',
            p_role_name => 'delivery_agent',
            p_secret_key => 'DELIVERY_SECRET_789'
        );
    EXCEPTION
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('Delivery Agent Signup Failed: ' || SQLERRM);
    END;

    -- Verify Insertions
    DBMS_OUTPUT.PUT_LINE('Verifying Inserted Users:');
    FOR rec IN (SELECT u.username, u.email, r.role_name
                FROM users u
                JOIN user_roles ur ON u.user_id = ur.user_id
                JOIN roles r ON ur.role_id = r.role_id
                WHERE u.username IN ('customer1', 'admin1', 'seller1', 'delivery1'))
    LOOP
        DBMS_OUTPUT.PUT_LINE('User: ' || rec.username || ', Email: ' || rec.email || ', Role: ' || rec.role_name);
    END LOOP;
END;
/

-- Add this to your SQL script to create the required function
CREATE OR REPLACE FUNCTION user_login_func(
    p_email IN VARCHAR2,
    p_password_hash IN VARCHAR2,
    p_ip_address IN VARCHAR2
) RETURN VARCHAR2
IS
    v_user_id NUMBER;
    v_is_active NUMBER;
    v_stored_hash VARCHAR2(255);
BEGIN
    -- Check if user exists and get their details
    SELECT user_id, password_hash, is_active
    INTO v_user_id, v_stored_hash, v_is_active
    FROM users
    WHERE email = p_email;
    
    -- Check if user is active
    IF v_is_active = 0 THEN
        RETURN 'ACCOUNT INACTIVE';
    END IF;
    
    -- Check password
    IF v_stored_hash = p_password_hash THEN
        -- Update last login timestamp
        UPDATE users 
        SET last_login = SYSTIMESTAMP 
        WHERE user_id = v_user_id;
        
        -- Log the login activity
        INSERT INTO activity_log (user_id, activity_type, activity_details, ip_address)
        VALUES (v_user_id, 'LOGIN', 'User logged in successfully', p_ip_address);
        
        RETURN 'LOGIN SUCCESSFUL';
    ELSE
        -- Log failed login attempt
        INSERT INTO activity_log (user_id, activity_type, activity_details, ip_address)
        VALUES (v_user_id, 'LOGIN_FAILED', 'Invalid password attempt', p_ip_address);
        
        RETURN 'INVALID CREDENTIALS';
    END IF;
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN 'USER NOT FOUND';
    WHEN OTHERS THEN
        RETURN 'LOGIN ERROR: ' || SQLERRM;
END;
/

-- Modified test_auth_procedures
DECLARE
    v_status VARCHAR2(200);
BEGIN
    -- test with correct email and password
    user_login(
        p_email => 'haha@example.com',
        p_password => '1234',
        p_ip_address => '192.168.0.1',
        p_status => v_status
    );
    DBMS_OUTPUT.PUT_LINE('Test 1: ' || v_status);

    -- test with wrong password
    user_login(
        p_email => 'huhu@example.com',
        p_password => '1234',
        p_ip_address => '192.168.0.2',
        p_status => v_status
    );
    DBMS_OUTPUT.PUT_LINE('Test 2: ' || v_status);

    -- test with non-existing user
    user_login(
        p_email => 'unknown@example.com',
        p_password => 'abc',
        p_ip_address => '192.168.0.3',
        p_status => v_status
    );
    DBMS_OUTPUT.PUT_LINE('Test 3: ' || v_status);
END;
/
























-- Insertion of data


SET SERVEROUTPUT ON;

-- Insert into roles (fewer than 10 as logical roles)
-- Insert into roles (fewer than 10 as logical roles)
INSERT INTO roles (role_name, description) VALUES ('admin', 'System Administrator with comprehensive access to manage user accounts, oversee plant inventory, process orders, and ensure the platform operates smoothly and securely across all functionalities.');
INSERT INTO roles (role_name, description) VALUES ('customer', 'Registered customer who explores a wide range of plants, places orders, tracks deliveries, manages their profile, and provides feedback through reviews to enhance the shopping experience.');
INSERT INTO roles (role_name, description) VALUES ('seller', 'Plant vendor responsible for listing and updating plant inventory, managing stock levels, processing customer orders, and collaborating with delivery agents to ensure timely fulfillment.');
INSERT INTO roles (role_name, description) VALUES ('delivery_agent', 'Delivery personnel tasked with collecting orders from sellers, ensuring safe and timely delivery to customers’ addresses, and confirming delivery status within the specified schedule.');

-- Insert into discount_types
INSERT INTO discount_types (name, description) VALUES ('Seasonal', 'Promotional discounts offered during specific seasons, such as monsoon or winter, to encourage the purchase of plants suited to Bangladesh’s climatic conditions.');
INSERT INTO discount_types (name, description) VALUES ('Category', 'Targeted discounts applied to specific plant categories like indoor plants, outdoor trees, or flowering plants to drive sales in popular or overstocked segments.');
INSERT INTO discount_types (name, description) VALUES ('Plant-specific', 'Special discounts on individual plant varieties to promote new stock, clear excess inventory, or highlight unique plants popular in Bangladeshi households.');
INSERT INTO discount_types (name, description) VALUES ('Festive', 'Exclusive offers during major Bangladeshi festivals like Eid-ul-Fitr, Durga Puja, or Pohela Boishakh to attract customers celebrating these occasions with plants.');
INSERT INTO discount_types (name, description) VALUES ('Special', 'Unique discounts for limited-time promotions, loyalty rewards, or milestone events like the platform’s anniversary, encouraging repeat purchases.');

-- Insert into order_statuses
INSERT INTO order_statuses (status_name, description) VALUES ('Processing', 'The order is being reviewed, verified, and prepared by the seller, ensuring all items are in stock and ready for dispatch to the customer.');
INSERT INTO order_statuses (status_name, description) VALUES ('Shipped', 'The order has been packed and handed over to the delivery agent, who is now transporting it to the customer’s specified address.');
INSERT INTO order_statuses (status_name, description) VALUES ('Delivered', 'The order has been successfully delivered to the customer’s address, with confirmation from the delivery agent and recipient.');
INSERT INTO order_statuses (status_name, description) VALUES ('Cancelled', 'The order has been cancelled by either the customer or seller due to reasons such as unavailability of stock, payment issues, or customer request.');
INSERT INTO order_statuses (status_name, description) VALUES ('Returned', 'The order has been returned by the customer due to issues like damaged plants, incorrect delivery, or dissatisfaction with the product.');

-- Insert into delivery_methods
INSERT INTO delivery_methods (name, description, base_cost, estimated_days) 
VALUES ('Standard', 'Cost-effective delivery option for customers across Bangladesh, ideal for non-urgent orders with reliable service.', 5.00, '3-5 days');
INSERT INTO delivery_methods (name, description, base_cost, estimated_days) 
VALUES ('Express', 'Premium fast-track delivery for urgent orders, ensuring plants reach customers quickly, especially in urban areas like Dhaka.', 10.00, '1-2 days');
INSERT INTO delivery_methods (name, description, base_cost, estimated_days) 
VALUES ('Pickup', 'Convenient option allowing customers to collect their orders directly from the seller’s store or warehouse, saving on delivery costs.', 0.00, 'Same day');

-- Insert into users (10 users: 1 admin, 3 sellers, 3 customers, 3 delivery agents with Bangladeshi names and detailed addresses)
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address) 
VALUES ('admin_raihan', 'raihan@example.com', 'hash1', 'Raihan', 'Chowdhury', '01712345678', 'House #12, Road #5, Block B, Banani Model Town, Dhaka-1213, Bangladesh, near Banani Lake and opposite to Chairman Bari');
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address) 
VALUES ('seller_tanvir', 'tanvir@example.com', 'hash2', 'Tanvir', 'Hossain', '01987654321', 'Flat 3A, House #45, Road #2, Sector 3, Uttara Model Town, Dhaka-1230, Bangladesh, near Uttara Community Center');
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address) 
VALUES ('seller_nusrat', 'nusrat@example.com', 'hash3', 'Nusrat', 'Jahan', '01678901234', 'House #8, Road #15, Nikunja 2, Khilkhet, Dhaka-1229, Bangladesh, adjacent to Khilkhet Water Tank');
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address) 
VALUES ('seller_arif', 'arif@example.com', 'hash4', 'Arif', 'Rahman', '01834567890', 'Plot #22, Avenue 1, Mirpur DOHS, Dhaka-1216, Bangladesh, near Mirpur Cantonment Gate');
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address) 
VALUES ('cust_fatima', 'fatima@example.com', 'hash5', 'Fatima', 'Begum', '01745678901', 'House #19, Road #7, Dhanmondi Residential Area, Dhaka-1205, Bangladesh, opposite Dhanmondi Lake Park');
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address) 
VALUES ('cust_mahmud', 'mahmud@example.com', 'hash6', 'Mahmud', 'Hasan', '01912345678', 'Flat 5B, House #33, Road #4, Gulshan 1, Dhaka-1212, Bangladesh, near Gulshan Pink City Mall');
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address) 
VALUES ('cust_sadia', 'sadia@example.com', 'hash7', 'Sadia', 'Akter', '01623456789', 'House #25, Road #12, Baridhara Diplomatic Zone, Dhaka-1212, Bangladesh, near Baridhara Park');
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address) 
VALUES ('agent_kamrul', 'kamrul@example.com', 'hash8', 'Kamrul', 'Islam', '01856789012', 'House #10, Road #3, Mohammadpur Housing Estate, Dhaka-1207, Bangladesh, near Mohammadpur Central Mosque');
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address) 
VALUES ('agent_sumon', 'sumon@example.com', 'hash9', 'Sumon', 'Ahmed', '01767890123', 'Flat 2C, House #17, Road #8, Bashundhara Residential Area, Dhaka-1229, Bangladesh, near Apollo Hospital');
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address) 
VALUES ('agent_ayesha', 'ayesha@example.com', 'hash10', 'Ayesha', 'Siddiqua', '01978901234', 'House #30, Road #6, Khilgaon Chowdhury Para, Dhaka-1219, Bangladesh, near Khilgaon Taltola Market');


-- Assign roles (user_roles)
INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u
JOIN roles r ON r.role_name = 'admin'
WHERE u.username = 'admin_raihan';

INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u
JOIN roles r ON r.role_name = 'seller'
WHERE u.username IN ('seller_tanvir', 'seller_nusrat', 'seller_arif');

INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u
JOIN roles r ON r.role_name = 'customer'
WHERE u.username IN ('cust_fatima', 'cust_mahmud', 'cust_sadia');

INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u
JOIN roles r ON r.role_name = 'delivery_agent'
WHERE u.username IN ('agent_kamrul', 'agent_sumon', 'agent_ayesha');

-- Delivery agents using username lookup
INSERT INTO delivery_agents (user_id, vehicle_type, license_number)
SELECT u.user_id, 'Bike', 'LIC-BD-001' FROM users u WHERE u.username = 'agent_kamrul';

INSERT INTO delivery_agents (user_id, vehicle_type, license_number)
SELECT u.user_id, 'Car', 'LIC-BD-002' FROM users u WHERE u.username = 'agent_sumon';

INSERT INTO delivery_agents (user_id, vehicle_type, license_number)
SELECT u.user_id, 'Van', 'LIC-BD-003' FROM users u WHERE u.username = 'agent_ayesha';

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

-- Insert into plants (10 plants with Bangladeshi context and highly detailed descriptions)
INSERT INTO plants (name, description, base_price, stock_quantity, seller_id)
SELECT 'Neem Tree', 'The Neem Tree (Azadirachta indica) is a fast-growing, evergreen tree revered in Bangladesh for its medicinal and insect-repellent properties. Its leaves are used in traditional remedies for skin ailments and as a natural pesticide in gardens. Perfect for large backyards or rural orchards, it provides ample shade and thrives in Bangladesh’s warm climate.', 10.00, 100, u.user_id 
FROM users u WHERE u.username = 'seller_tanvir';

INSERT INTO plants (name, description, base_price, stock_quantity, seller_id)
SELECT 'Money Plant', 'The Money Plant (Epipremnum aureum), also known as Devil’s Ivy, is a popular indoor plant in Bangladeshi homes, believed to bring prosperity and good fortune. Its heart-shaped, glossy green leaves with yellow variegation thrive in low to moderate light, making it ideal for apartments in Dhaka or Chittagong. Requires minimal care and adds a touch of greenery to any space.', 15.00, 150, u.user_id 
FROM users u WHERE u.username = 'seller_tanvir';

INSERT INTO plants (name, description, base_price, stock_quantity, seller_id)
SELECT 'Aloe Vera', 'Aloe Vera (Aloe barbadensis) is a succulent with thick, fleshy leaves containing a cooling gel widely used for skincare and minor burns in Bangladesh. Its drought-tolerant nature makes it perfect for sunny balconies or rooftops in urban areas like Dhaka. This low-maintenance plant is a must-have for natural remedy enthusiasts.', 20.00, 200, u.user_id 
FROM users u WHERE u.username = 'seller_nusrat';

INSERT INTO plants (name, description, base_price, stock_quantity, seller_id)
SELECT 'Marigold', 'Marigolds (Tagetes spp.) are vibrant flowering plants cherished in Bangladesh for their bright yellow and orange blooms, often used in festivals like Pohela Boishakh and Durga Puja. Easy to grow in pots or garden beds, they attract pollinators and add a festive charm to any outdoor space in rural or urban settings.', 25.00, 250, u.user_id 
FROM users u WHERE u.username = 'seller_nusrat';

INSERT INTO plants (name, description, base_price, stock_quantity, seller_id)
SELECT 'Tulsi', 'Tulsi (Ocimum tenuiflorum), or Holy Basil, is a sacred herb in Bangladesh, valued for its medicinal properties and spiritual significance in Hindu and Muslim households. Its aromatic leaves are used in teas and remedies for colds and stress. Grows well in pots or small gardens with moderate sunlight, perfect for home cultivation.', 30.00, 300, u.user_id 
FROM users u WHERE u.username = 'seller_arif';

INSERT INTO plants (name, description, base_price, stock_quantity, seller_id)
SELECT 'Mango Tree', 'The Mango Tree (Mangifera indica) is a beloved fruit tree in Bangladesh, known for producing juicy, sweet mangoes during the summer season. Ideal for large gardens or rural orchards, this tree requires ample space and sunlight to thrive, making it a favorite for homeowners seeking fresh, homegrown fruit.', 35.00, 350, u.user_id 
FROM users u WHERE u.username = 'seller_arif';

INSERT INTO plants (name, description, base_price, stock_quantity, seller_id)
SELECT 'Bottle Gourd', 'The Bottle Gourd (Lagenaria siceraria) is a climbing vegetable plant commonly grown in Bangladeshi households for its edible gourds, used in curries and stir-fries. Its vigorous vines require trellis support, making it ideal for rooftop or backyard gardens. A productive plant for home vegetable enthusiasts.', 40.00, 400, u.user_id 
FROM users u WHERE u.username = 'seller_tanvir';

INSERT INTO plants (name, description, base_price, stock_quantity, seller_id)
SELECT 'Rose', 'Roses (Rosa spp.) are classic flowering plants with fragrant, colorful blooms, widely used in Bangladeshi gardens and for gifting during special occasions like weddings or Eid. Available in various colors, they thrive in well-drained soil and add elegance to any home or event space.', 45.00, 450, u.user_id 
FROM users u WHERE u.username = 'seller_nusrat';

INSERT INTO plants (name, description, base_price, stock_quantity, seller_id)
SELECT 'Cactus', 'Cacti (various species) are low-maintenance desert plants perfect for busy urban dwellers in Bangladesh. Their unique shapes and minimal water needs make them ideal for small apartments or offices in cities like Dhaka. A great choice for those seeking stylish, drought-resistant greenery.', 50.00, 500, u.user_id 
FROM users u WHERE u.username = 'seller_arif';

INSERT INTO plants (name, description, base_price, stock_quantity, seller_id)
SELECT 'Bamboo', 'Bamboo (Bambusa spp.) is a fast-growing, versatile plant used in Bangladesh for privacy screens, decorative borders, or even construction. Its lush green stalks thrive in moist soil and add a tropical aesthetic to gardens or courtyards, making it a popular choice for landscaping.', 55.00, 550, u.user_id 
FROM users u WHERE u.username = 'seller_tanvir';

COMMIT;

-- Insert into plant_category_mapping
INSERT INTO plant_category_mapping (plant_id, category_id)
SELECT p.plant_id, c.category_id FROM plants p JOIN plant_categories c ON c.slug = 'trees' WHERE p.name = 'Neem Tree';

INSERT INTO plant_category_mapping (plant_id, category_id)
SELECT p.plant_id, c.category_id FROM plants p JOIN plant_categories c ON c.slug = 'indoor' WHERE p.name = 'Money Plant';

INSERT INTO plant_category_mapping (plant_id, category_id)
SELECT p.plant_id, c.category_id FROM plants p JOIN plant_categories c ON c.slug = 'succulents' WHERE p.name = 'Aloe Vera';

INSERT INTO plant_category_mapping (plant_id, category_id)
SELECT p.plant_id, c.category_id FROM plants p JOIN plant_categories c ON c.slug = 'flowers' WHERE p.name = 'Marigold';

INSERT INTO plant_category_mapping (plant_id, category_id)
SELECT p.plant_id, c.category_id FROM plants p JOIN plant_categories c ON c.slug = 'herbs' WHERE p.name = 'Tulsi';

INSERT INTO plant_category_mapping (plant_id, category_id)
SELECT p.plant_id, c.category_id FROM plants p JOIN plant_categories c ON c.slug = 'trees' WHERE p.name = 'Mango Tree';

INSERT INTO plant_category_mapping (plant_id, category_id)
SELECT p.plant_id, c.category_id FROM plants p JOIN plant_categories c ON c.slug = 'vegetables' WHERE p.name = 'Bottle Gourd';

INSERT INTO plant_category_mapping (plant_id, category_id)
SELECT p.plant_id, c.category_id FROM plants p JOIN plant_categories c ON c.slug = 'flowers' WHERE p.name = 'Rose';

INSERT INTO plant_category_mapping (plant_id, category_id)
SELECT p.plant_id, c.category_id FROM plants p JOIN plant_categories c ON c.slug = 'cacti' WHERE p.name = 'Cactus';

INSERT INTO plant_category_mapping (plant_id, category_id)
SELECT p.plant_id, c.category_id FROM plants p JOIN plant_categories c ON c.slug = 'shrubs' WHERE p.name = 'Bamboo';

COMMIT;

select * from plant_images;

-- Insert into plant_images
INSERT INTO plant_images (plant_id, image_url, is_primary)
SELECT p.plant_id, 'Screenshot 2025-08-31 233535.png', 1 FROM plants p WHERE p.name = 'Neem Tree';

INSERT INTO plant_images (plant_id, image_url, is_primary)
SELECT p.plant_id, 'https://images.unsplash.com/photo-1701266501377-27f4d58c15cd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDEwNXx8fGVufDB8fHx8fA%3D%3D', 0 FROM plants p WHERE p.name = 'Neem Tree';

INSERT INTO plant_images (plant_id, image_url, is_primary)
SELECT p.plant_id, 'https://images.unsplash.com/photo-1686050136769-b6001f8e2605?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDExM3x8fGVufDB8fHx8fA%3D%3D', 1 FROM plants p WHERE p.name = 'Money Plant';

INSERT INTO plant_images (plant_id, image_url, is_primary)
SELECT p.plant_id, 'https://images.unsplash.com/photo-1747640483395-cc94a4f5b510?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDEyMHx8fGVufDB8fHx8fA%3D%3D', 0 FROM plants p WHERE p.name = 'Money Plant';

INSERT INTO plant_images (plant_id, image_url, is_primary)
SELECT p.plant_id, 'https://images.unsplash.com/photo-1682414270171-a43b78bced2d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDEzM3x8fGVufDB8fHx8fA%3D%3D', 1 FROM plants p WHERE p.name = 'Aloe Vera';

INSERT INTO plant_images (plant_id, image_url, is_primary)
SELECT p.plant_id, 'https://images.unsplash.com/photo-1646623160481-e452a925ac7d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDcwfHx8ZW58MHx8fHx8', 0 FROM plants p WHERE p.name = 'Aloe Vera';

INSERT INTO plant_images (plant_id, image_url, is_primary)
SELECT p.plant_id, 'https://images.unsplash.com/photo-1601211230355-571557d96d3b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDQxfHx8ZW58MHx8fHx8', 1 FROM plants p WHERE p.name = 'Marigold';

INSERT INTO plant_images (plant_id, image_url, is_primary)
SELECT p.plant_id, 'https://images.unsplash.com/photo-1723472769589-ce166d5af5cb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDg1fHx8ZW58MHx8fHx8', 0 FROM plants p WHERE p.name = 'Marigold';

INSERT INTO plant_images (plant_id, image_url, is_primary)
SELECT p.plant_id, 'https://plus.unsplash.com/premium_photo-1661328192450-73b77d474918?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE0OHx8fGVufDB8fHx8fA%3D%3D', 1 FROM plants p WHERE p.name = 'Tulsi';

INSERT INTO plant_images (plant_id, image_url, is_primary)
SELECT p.plant_id, 'https://images.unsplash.com/photo-1560508892-cc2f310911fb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE1M3x8fGVufDB8fHx8fA%3D%3D', 0 FROM plants p WHERE p.name = 'Tulsi';

INSERT INTO plant_images (plant_id, image_url, is_primary)
SELECT p.plant_id, 'https://images.unsplash.com/photo-1713885135839-cec2eae9044b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE2NHx8fGVufDB8fHx8fA%3D%3D', 1 FROM plants p WHERE p.name = 'Mango Tree';

INSERT INTO plant_images (plant_id, image_url, is_primary)
SELECT p.plant_id, 'https://images.unsplash.com/photo-1693236084754-d3750e2eb097?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE1NXx8fGVufDB8fHx8fA%3D%3D', 0 FROM plants p WHERE p.name = 'Mango Tree';

INSERT INTO plant_images (plant_id, image_url, is_primary)
SELECT p.plant_id, 'https://images.unsplash.com/photo-1564060958001-a665e6fb6d3d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE3fHx8ZW58MHx8fHx8', 1 FROM plants p WHERE p.name = 'Bottle Gourd';

INSERT INTO plant_images (plant_id, image_url, is_primary)
SELECT p.plant_id, 'https://images.unsplash.com/photo-1659633411299-c5c6ce8094e5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDIwM3x8fGVufDB8fHx8fA%3D%3D', 0 FROM plants p WHERE p.name = 'Bottle Gourd';

INSERT INTO plant_images (plant_id, image_url, is_primary)
SELECT p.plant_id, 'https://images.unsplash.com/photo-1612456916096-16e98919e101?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE5OXx8fGVufDB8fHx8fA%3D%3D', 1 FROM plants p WHERE p.name = 'Rose';

INSERT INTO plant_images (plant_id, image_url, is_primary)
SELECT p.plant_id, 'https://images.unsplash.com/photo-1612456916096-16e98919e101?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE5OXx8fGVufDB8fHx8fA%3D%3D', 0 FROM plants p WHERE p.name = 'Rose';

INSERT INTO plant_images (plant_id, image_url, is_primary)
SELECT p.plant_id, 'https://images.unsplash.com/photo-1713892194384-de89fa60ddc2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDIwNXx8fGVufDB8fHx8fA%3D%3D', 1 FROM plants p WHERE p.name = 'Cactus';

INSERT INTO plant_images (plant_id, image_url, is_primary)
SELECT p.plant_id, 'https://images.unsplash.com/photo-1607369799260-959137a24656?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE5NXx8fGVufDB8fHx8fA%3D%3D', 0 FROM plants p WHERE p.name = 'Cactus';

INSERT INTO plant_images (plant_id, image_url, is_primary)
SELECT p.plant_id, 'https://images.unsplash.com/photo-1713885135839-cec2eae9044b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE2NHx8fGVufDB8fHx8fA%3D%3D', 1 FROM plants p WHERE p.name = 'Bamboo';

INSERT INTO plant_images (plant_id, image_url, is_primary)
SELECT p.plant_id, 'https://images.unsplash.com/photo-1693236084754-d3750e2eb097?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE1NXx8fGVufDB8fHx8fA%3D%3D', 0 FROM plants p WHERE p.name = 'Bamboo';

COMMIT;

-- Insert into plant_sizes
INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
SELECT p.plant_id, 'Small', -5.00 FROM plants p WHERE p.name = 'Neem Tree';

INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
SELECT p.plant_id, 'Medium', 0.00 FROM plants p WHERE p.name = 'Neem Tree';

INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
SELECT p.plant_id, 'Small', -5.00 FROM plants p WHERE p.name = 'Money Plant';

INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
SELECT p.plant_id, 'Medium', 0.00 FROM plants p WHERE p.name = 'Money Plant';

INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
SELECT p.plant_id, 'Small', -5.00 FROM plants p WHERE p.name = 'Aloe Vera';

INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
SELECT p.plant_id, 'Medium', 0.00 FROM plants p WHERE p.name = 'Aloe Vera';

INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
SELECT p.plant_id, 'Small', -5.00 FROM plants p WHERE p.name = 'Marigold';

INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
SELECT p.plant_id, 'Medium', 0.00 FROM plants p WHERE p.name = 'Marigold';

INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
SELECT p.plant_id, 'Small', -5.00 FROM plants p WHERE p.name = 'Tulsi';

INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
SELECT p.plant_id, 'Medium', 0.00 FROM plants p WHERE p.name = 'Tulsi';

INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
SELECT p.plant_id, 'Small', -5.00 FROM plants p WHERE p.name = 'Mango Tree';

INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
SELECT p.plant_id, 'Medium', 0.00 FROM plants p WHERE p.name = 'Mango Tree';

INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
SELECT p.plant_id, 'Small', -5.00 FROM plants p WHERE p.name = 'Bottle Gourd';

INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
SELECT p.plant_id, 'Medium', 0.00 FROM plants p WHERE p.name = 'Bottle Gourd';

INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
SELECT p.plant_id, 'Small', -5.00 FROM plants p WHERE p.name = 'Rose';

INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
SELECT p.plant_id, 'Medium', 0.00 FROM plants p WHERE p.name = 'Rose';

INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
SELECT p.plant_id, 'Small', -5.00 FROM plants p WHERE p.name = 'Cactus';

INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
SELECT p.plant_id, 'Medium', 0.00 FROM plants p WHERE p.name = 'Cactus';

INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
SELECT p.plant_id, 'Small', -5.00 FROM plants p WHERE p.name = 'Bamboo';

INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
SELECT p.plant_id, 'Medium', 0.00 FROM plants p WHERE p.name = 'Bamboo';

COMMIT;

-- Insert into discounts
INSERT INTO discounts (discount_type_id, name, discount_value, is_percentage, start_date, end_date)
SELECT dt.discount_type_id, 'Eid-ul-Fitr Offer', 10.00, 1, SYSTIMESTAMP - INTERVAL '1' DAY, SYSTIMESTAMP + INTERVAL '10' DAY
FROM discount_types dt WHERE dt.name = 'Festive';

INSERT INTO discounts (discount_type_id, name, discount_value, is_percentage, start_date, end_date)
SELECT dt.discount_type_id, 'Indoor Plant Bonanza', 15.00, 0, SYSTIMESTAMP - INTERVAL '1' DAY, SYSTIMESTAMP + INTERVAL '10' DAY
FROM discount_types dt WHERE dt.name = 'Category';

INSERT INTO discounts (discount_type_id, name, discount_value, is_percentage, start_date, end_date)
SELECT dt.discount_type_id, 'Aloe Vera Special', 20.00, 1, SYSTIMESTAMP - INTERVAL '1' DAY, SYSTIMESTAMP + INTERVAL '10' DAY
FROM discount_types dt WHERE dt.name = 'Plant-specific';

INSERT INTO discounts (discount_type_id, name, discount_value, is_percentage, start_date, end_date)
SELECT dt.discount_type_id, 'Monsoon Green Deal', 25.00, 0, SYSTIMESTAMP - INTERVAL '1' DAY, SYSTIMESTAMP + INTERVAL '10' DAY
FROM discount_types dt WHERE dt.name = 'Seasonal';

INSERT INTO discounts (discount_type_id, name, discount_value, is_percentage, start_date, end_date)
SELECT dt.discount_type_id, 'Loyal Customer Reward', 30.00, 1, SYSTIMESTAMP - INTERVAL '1' DAY, SYSTIMESTAMP + INTERVAL '10' DAY
FROM discount_types dt WHERE dt.name = 'Special';

INSERT INTO discounts (discount_type_id, name, discount_value, is_percentage, start_date, end_date)
SELECT dt.discount_type_id, 'Pohela Boishakh Promo', 35.00, 0, SYSTIMESTAMP - INTERVAL '1' DAY, SYSTIMESTAMP + INTERVAL '10' DAY
FROM discount_types dt WHERE dt.name = 'Festive';

INSERT INTO discounts (discount_type_id, name, discount_value, is_percentage, start_date, end_date)
SELECT dt.discount_type_id, 'Outdoor Garden Sale', 40.00, 1, SYSTIMESTAMP - INTERVAL '1' DAY, SYSTIMESTAMP + INTERVAL '10' DAY
FROM discount_types dt WHERE dt.name = 'Category';

INSERT INTO discounts (discount_type_id, name, discount_value, is_percentage, start_date, end_date)
SELECT dt.discount_type_id, 'Tulsi Health Deal', 45.00, 0, SYSTIMESTAMP - INTERVAL '1' DAY, SYSTIMESTAMP + INTERVAL '10' DAY
FROM discount_types dt WHERE dt.name = 'Plant-specific';

INSERT INTO discounts (discount_type_id, name, discount_value, is_percentage, start_date, end_date)
SELECT dt.discount_type_id, 'Winter Bloom Offer', 50.00, 1, SYSTIMESTAMP - INTERVAL '1' DAY, SYSTIMESTAMP + INTERVAL '10' DAY
FROM discount_types dt WHERE dt.name = 'Seasonal';

INSERT INTO discounts (discount_type_id, name, discount_value, is_percentage, start_date, end_date)
SELECT dt.discount_type_id, 'Store Anniversary Sale', 55.00, 0, SYSTIMESTAMP - INTERVAL '1' DAY, SYSTIMESTAMP + INTERVAL '10' DAY
FROM discount_types dt WHERE dt.name = 'Special';

COMMIT;

-- Insert into plant_discounts
INSERT INTO plant_discounts (plant_id, discount_id)
SELECT p.plant_id, d.discount_id FROM plants p JOIN discounts d ON d.name = 'Eid-ul-Fitr Offer' WHERE p.name = 'Neem Tree';

INSERT INTO plant_discounts (plant_id, discount_id)
SELECT p.plant_id, d.discount_id FROM plants p JOIN discounts d ON d.name = 'Indoor Plant Bonanza' WHERE p.name = 'Money Plant';

INSERT INTO plant_discounts (plant_id, discount_id)
SELECT p.plant_id, d.discount_id FROM plants p JOIN discounts d ON d.name = 'Aloe Vera Special' WHERE p.name = 'Aloe Vera';

INSERT INTO plant_discounts (plant_id, discount_id)
SELECT p.plant_id, d.discount_id FROM plants p JOIN discounts d ON d.name = 'Monsoon Green Deal' WHERE p.name = 'Marigold';

INSERT INTO plant_discounts (plant_id, discount_id)
SELECT p.plant_id, d.discount_id FROM plants p JOIN discounts d ON d.name = 'Loyal Customer Reward' WHERE p.name = 'Tulsi';

INSERT INTO plant_discounts (plant_id, discount_id)
SELECT p.plant_id, d.discount_id FROM plants p JOIN discounts d ON d.name = 'Pohela Boishakh Promo' WHERE p.name = 'Mango Tree';

INSERT INTO plant_discounts (plant_id, discount_id)
SELECT p.plant_id, d.discount_id FROM plants p JOIN discounts d ON d.name = 'Outdoor Garden Sale' WHERE p.name = 'Bottle Gourd';

INSERT INTO plant_discounts (plant_id, discount_id)
SELECT p.plant_id, d.discount_id FROM plants p JOIN discounts d ON d.name = 'Tulsi Health Deal' WHERE p.name = 'Rose';

INSERT INTO plant_discounts (plant_id, discount_id)
SELECT p.plant_id, d.discount_id FROM plants p JOIN discounts d ON d.name = 'Winter Bloom Offer' WHERE p.name = 'Cactus';

INSERT INTO plant_discounts (plant_id, discount_id)
SELECT p.plant_id, d.discount_id FROM plants p JOIN discounts d ON d.name = 'Store Anniversary Sale' WHERE p.name = 'Bamboo';

COMMIT;

-- Insert into orders
INSERT INTO orders (user_id, order_number, status_id, delivery_method_id, delivery_address, total_amount)
SELECT u.user_id, 'ORD1', s.status_id, m.method_id, 'House #19, Road #7, Dhanmondi Residential Area, Dhaka-1205, Bangladesh, opposite Dhanmondi Lake Park', 100.00
FROM users u, order_statuses s, delivery_methods m
WHERE u.username = 'cust_fatima' AND s.status_name = 'Processing' AND m.name = 'Standard';

INSERT INTO orders (user_id, order_number, status_id, delivery_method_id, delivery_address, total_amount)
SELECT u.user_id, 'ORD2', s.status_id, m.method_id, 'House #19, Road #7, Dhanmondi Residential Area, Dhaka-1205, Bangladesh, opposite Dhanmondi Lake Park', 150.00
FROM users u, order_statuses s, delivery_methods m
WHERE u.username = 'cust_fatima' AND s.status_name = 'Processing' AND m.name = 'Standard';

INSERT INTO orders (user_id, order_number, status_id, delivery_method_id, delivery_address, total_amount)
SELECT u.user_id, 'ORD3', s.status_id, m.method_id, 'Flat 5B, House #33, Road #4, Gulshan 1, Dhaka-1212, Bangladesh, near Gulshan Pink City Mall', 200.00
FROM users u, order_statuses s, delivery_methods m
WHERE u.username = 'cust_mahmud' AND s.status_name = 'Processing' AND m.name = 'Express';

INSERT INTO orders (user_id, order_number, status_id, delivery_method_id, delivery_address, total_amount)
SELECT u.user_id, 'ORD4', s.status_id, m.method_id, 'Flat 5B, House #33, Road #4, Gulshan 1, Dhaka-1212, Bangladesh, near Gulshan Pink City Mall', 250.00
FROM users u, order_statuses s, delivery_methods m
WHERE u.username = 'cust_mahmud' AND s.status_name = 'Processing' AND m.name = 'Express';

INSERT INTO orders (user_id, order_number, status_id, delivery_method_id, delivery_address, total_amount)
SELECT u.user_id, 'ORD5', s.status_id, m.method_id, 'House #25, Road #12, Baridhara Diplomatic Zone, Dhaka-1212, Bangladesh, near Baridhara Park', 300.00
FROM users u, order_statuses s, delivery_methods m
WHERE u.username = 'cust_sadia' AND s.status_name = 'Processing' AND m.name = 'Pickup';

INSERT INTO orders (user_id, order_number, status_id, delivery_method_id, delivery_address, total_amount)
SELECT u.user_id, 'ORD6', s.status_id, m.method_id, 'House #25, Road #12, Baridhara Diplomatic Zone, Dhaka-1212, Bangladesh, near Baridhara Park', 350.00
FROM users u, order_statuses s, delivery_methods m
WHERE u.username = 'cust_sadia' AND s.status_name = 'Processing' AND m.name = 'Pickup';

INSERT INTO orders (user_id, order_number, status_id, delivery_method_id, delivery_address, total_amount)
SELECT u.user_id, 'ORD7', s.status_id, m.method_id, 'House #19, Road #7, Dhanmondi Residential Area, Dhaka-1205, Bangladesh, opposite Dhanmondi Lake Park', 400.00
FROM users u, order_statuses s, delivery_methods m
WHERE u.username = 'cust_fatima' AND s.status_name = 'Processing' AND m.name = 'Standard';

INSERT INTO orders (user_id, order_number, status_id, delivery_method_id, delivery_address, total_amount)
SELECT u.user_id, 'ORD8', s.status_id, m.method_id, 'Flat 5B, House #33, Road #4, Gulshan 1, Dhaka-1212, Bangladesh, near Gulshan Pink City Mall', 450.00
FROM users u, order_statuses s, delivery_methods m
WHERE u.username = 'cust_mahmud' AND s.status_name = 'Processing' AND m.name = 'Express';

INSERT INTO orders (user_id, order_number, status_id, delivery_method_id, delivery_address, total_amount)
SELECT u.user_id, 'ORD9', s.status_id, m.method_id, 'House #25, Road #12, Baridhara Diplomatic Zone, Dhaka-1212, Bangladesh, near Baridhara Park', 500.00
FROM users u, order_statuses s, delivery_methods m
WHERE u.username = 'cust_sadia' AND s.status_name = 'Processing' AND m.name = 'Pickup';

INSERT INTO orders (user_id, order_number, status_id, delivery_method_id, delivery_address, total_amount)
SELECT u.user_id, 'ORD10', s.status_id, m.method_id, 'House #19, Road #7, Dhanmondi Residential Area, Dhaka-1205, Bangladesh, opposite Dhanmondi Lake Park', 550.00
FROM users u, order_statuses s, delivery_methods m
WHERE u.username = 'cust_fatima' AND s.status_name = 'Processing' AND m.name = 'Standard';

COMMIT;

-- Insert into order_items
INSERT INTO order_items (order_id, plant_id, size_id, quantity, unit_price)
SELECT o.order_id, p.plant_id, ps.size_id, 2, (p.base_price + NVL(ps.price_adjustment, 0))
FROM orders o
JOIN plants p ON p.name = 'Neem Tree'
JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Small'
WHERE o.order_number = 'ORD1';

INSERT INTO order_items (order_id, plant_id, size_id, quantity, unit_price)
SELECT o.order_id, p.plant_id, ps.size_id, 3, (p.base_price + NVL(ps.price_adjustment, 0))
FROM orders o
JOIN plants p ON p.name = 'Money Plant'
JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Medium'
WHERE o.order_number = 'ORD2';

INSERT INTO order_items (order_id, plant_id, size_id, quantity, unit_price)
SELECT o.order_id, p.plant_id, ps.size_id, 4, (p.base_price + NVL(ps.price_adjustment, 0))
FROM orders o
JOIN plants p ON p.name = 'Aloe Vera'
JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Small'
WHERE o.order_number = 'ORD3';

INSERT INTO order_items (order_id, plant_id, size_id, quantity, unit_price)
SELECT o.order_id, p.plant_id, ps.size_id, 5, (p.base_price + NVL(ps.price_adjustment, 0))
FROM orders o
JOIN plants p ON p.name = 'Marigold'
JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Medium'
WHERE o.order_number = 'ORD4';

INSERT INTO order_items (order_id, plant_id, size_id, quantity, unit_price)
SELECT o.order_id, p.plant_id, ps.size_id, 6, (p.base_price + NVL(ps.price_adjustment, 0))
FROM orders o
JOIN plants p ON p.name = 'Tulsi'
JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Small'
WHERE o.order_number = 'ORD5';

INSERT INTO order_items (order_id, plant_id, size_id, quantity, unit_price)
SELECT o.order_id, p.plant_id, ps.size_id, 7, (p.base_price + NVL(ps.price_adjustment, 0))
FROM orders o
JOIN plants p ON p.name = 'Mango Tree'
JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Medium'
WHERE o.order_number = 'ORD6';

INSERT INTO order_items (order_id, plant_id, size_id, quantity, unit_price)
SELECT o.order_id, p.plant_id, ps.size_id, 8, (p.base_price + NVL(ps.price_adjustment, 0))
FROM orders o
JOIN plants p ON p.name = 'Bottle Gourd'
JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Small'
WHERE o.order_number = 'ORD7';

INSERT INTO order_items (order_id, plant_id, size_id, quantity, unit_price)
SELECT o.order_id, p.plant_id, ps.size_id, 9, (p.base_price + NVL(ps.price_adjustment, 0))
FROM orders o
JOIN plants p ON p.name = 'Rose'
JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Medium'
WHERE o.order_number = 'ORD8';

INSERT INTO order_items (order_id, plant_id, size_id, quantity, unit_price)
SELECT o.order_id, p.plant_id, ps.size_id, 10, (p.base_price + NVL(ps.price_adjustment, 0))
FROM orders o
JOIN plants p ON p.name = 'Cactus'
JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Small'
WHERE o.order_number = 'ORD9';

INSERT INTO order_items (order_id, plant_id, size_id, quantity, unit_price)
SELECT o.order_id, p.plant_id, ps.size_id, 11, (p.base_price + NVL(ps.price_adjustment, 0))
FROM orders o
JOIN plants p ON p.name = 'Bamboo'
JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Medium'
WHERE o.order_number = 'ORD10';

COMMIT;

-- Insert into plant_features (more detailed)
INSERT INTO plant_features (plant_id, feature_text)
SELECT p.plant_id, 'Leaves with potent insect-repellent properties, used in traditional Bangladeshi medicine for skin ailments and as a natural pesticide in organic gardening.' FROM plants p WHERE p.name = 'Neem Tree';

INSERT INTO plant_features (plant_id, feature_text)
SELECT p.plant_id, 'Air-purifying plant with heart-shaped, variegated leaves, believed to attract prosperity and enhance indoor aesthetics in Bangladeshi homes.' FROM plants p WHERE p.name = 'Money Plant';

INSERT INTO plant_features (plant_id, feature_text)
SELECT p.plant_id, 'Thick, fleshy leaves containing soothing gel, widely used in Bangladesh for treating burns, skin irritations, and as a natural moisturizer.' FROM plants p WHERE p.name = 'Aloe Vera';

INSERT INTO plant_features (plant_id, feature_text)
SELECT p.plant_id, 'Bright yellow and orange blooms that attract pollinators, commonly used in Bangladeshi festivals like Pohela Boishakh for decorations and garlands.' FROM plants p WHERE p.name = 'Marigold';

INSERT INTO plant_features (plant_id, feature_text)
SELECT p.plant_id, 'Aromatic herb with medicinal properties, revered in Bangladesh for its use in herbal teas, stress relief, and spiritual rituals in households.' FROM plants p WHERE p.name = 'Tulsi';

INSERT INTO plant_features (plant_id, feature_text)
SELECT p.plant_id, 'Produces sweet, juicy mangoes during summer, a staple fruit in Bangladesh, ideal for home orchards and adding tropical charm to gardens.' FROM plants p WHERE p.name = 'Mango Tree';

INSERT INTO plant_features (plant_id, feature_text)
SELECT p.plant_id, 'Climbing vine yielding nutritious gourds, a popular vegetable in Bangladeshi cuisine, perfect for rooftop or backyard vegetable gardens.' FROM plants p WHERE p.name = 'Bottle Gourd';

INSERT INTO plant_features (plant_id, feature_text)
SELECT p.plant_id, 'Fragrant, colorful blooms in various shades, ideal for gifting, garden aesthetics, or special occasions like weddings and Eid in Bangladesh.' FROM plants p WHERE p.name = 'Rose';

INSERT INTO plant_features (plant_id, feature_text)
SELECT p.plant_id, 'Drought-resistant with unique, sculptural shapes, perfect for low-maintenance decor in urban Bangladeshi apartments or offices.' FROM plants p WHERE p.name = 'Cactus';

INSERT INTO plant_features (plant_id, feature_text)
SELECT p.plant_id, 'Fast-growing, lush green stalks used for privacy screens, landscaping, or traditional crafts in Bangladesh, adding a tropical vibe to gardens.' FROM plants p WHERE p.name = 'Bamboo';

-- Insert into plant_care_tips (more detailed)
INSERT INTO plant_care_tips (plant_id, tip_text)
SELECT p.plant_id, 'Water weekly during dry seasons, ensuring deep soil penetration. Plant in full sunlight and prune annually to maintain shape and encourage healthy growth in Bangladesh’s warm climate.' FROM plants p WHERE p.name = 'Neem Tree';

INSERT INTO plant_care_tips (plant_id, tip_text)
SELECT p.plant_id, 'Place in indirect sunlight to prevent leaf burn, water sparingly every 7-10 days, and use well-drained soil to avoid root rot, ideal for indoor settings in Dhaka apartments.' FROM plants p WHERE p.name = 'Money Plant';

INSERT INTO plant_care_tips (plant_id, tip_text)
SELECT p.plant_id, 'Position in bright, direct sunlight on balconies or rooftops, water every 10-14 days, and ensure sandy, well-drained soil to promote healthy growth in urban Bangladesh.' FROM plants p WHERE p.name = 'Aloe Vera';

INSERT INTO plant_care_tips (plant_id, tip_text)
SELECT p.plant_id, 'Water regularly every 3-4 days, deadhead spent blooms to encourage continuous flowering, and plant in fertile soil with full sun exposure for vibrant marigolds in Bangladeshi gardens.' FROM plants p WHERE p.name = 'Marigold';

INSERT INTO plant_care_tips (plant_id, tip_text)
SELECT p.plant_id, 'Water daily in the morning, place in partial shade to avoid scorching, and use organic compost to enhance leaf growth, perfect for Bangladeshi home herbal gardens.' FROM plants p WHERE p.name = 'Tulsi';

INSERT INTO plant_care_tips (plant_id, tip_text)
SELECT p.plant_id, 'Water deeply every 5-7 days during dry seasons, prune annually to remove dead branches, and plant in sunny, spacious areas to support fruit production in Bangladeshi orchards.' FROM plants p WHERE p.name = 'Mango Tree';

INSERT INTO plant_care_tips (plant_id, tip_text)
SELECT p.plant_id, 'Provide trellis or support for climbing vines, water consistently every 3-4 days, and use nutrient-rich soil to maximize gourd yield in Bangladeshi rooftop gardens.' FROM plants p WHERE p.name = 'Bottle Gourd';

INSERT INTO plant_care_tips (plant_id, tip_text)
SELECT p.plant_id, 'Water moderately every 4-5 days, prune regularly to remove dead blooms, and plant in well-drained, fertile soil with partial sun for continuous flowering in Bangladesh.' FROM plants p WHERE p.name = 'Rose';

INSERT INTO plant_care_tips (plant_id, tip_text)
SELECT p.plant_id, 'Water sparingly every 2-3 weeks, ensure well-drained, sandy soil, and place in bright sunlight to maintain health, ideal for low-maintenance urban decor in Bangladesh.' FROM plants p WHERE p.name = 'Cactus';

INSERT INTO plant_care_tips (plant_id, tip_text)
SELECT p.plant_id, 'Water weekly, plant in moist, well-drained soil, and provide partial shade to prevent drying. Regularly check for pests to maintain healthy bamboo in Bangladeshi gardens.' FROM plants p WHERE p.name = 'Bamboo';

-- Insert into order_assignments
INSERT INTO order_assignments (order_id, agent_id)
SELECT o.order_id, da.agent_id
FROM orders o
JOIN users au ON au.username = 'agent_kamrul'
JOIN delivery_agents da ON da.user_id = au.user_id
WHERE o.order_number = 'ORD1';

INSERT INTO order_assignments (order_id, agent_id)
SELECT o.order_id, da.agent_id
FROM orders o
JOIN users au ON au.username = 'agent_kamrul'
JOIN delivery_agents da ON da.user_id = au.user_id
WHERE o.order_number = 'ORD2';

INSERT INTO order_assignments (order_id, agent_id)
SELECT o.order_id, da.agent_id
FROM orders o
JOIN users au ON au.username = 'agent_sumon'
JOIN delivery_agents da ON da.user_id = au.user_id
WHERE o.order_number = 'ORD3';

INSERT INTO order_assignments (order_id, agent_id)
SELECT o.order_id, da.agent_id
FROM orders o
JOIN users au ON au.username = 'agent_sumon'
JOIN delivery_agents da ON da.user_id = au.user_id
WHERE o.order_number = 'ORD4';

INSERT INTO order_assignments (order_id, agent_id)
SELECT o.order_id, da.agent_id
FROM orders o
JOIN users au ON au.username = 'agent_ayesha'
JOIN delivery_agents da ON da.user_id = au.user_id
WHERE o.order_number = 'ORD5';

INSERT INTO order_assignments (order_id, agent_id)
SELECT o.order_id, da.agent_id
FROM orders o
JOIN users au ON au.username = 'agent_ayesha'
JOIN delivery_agents da ON da.user_id = au.user_id
WHERE o.order_number = 'ORD6';

INSERT INTO order_assignments (order_id, agent_id)
SELECT o.order_id, da.agent_id
FROM orders o
JOIN users au ON au.username = 'agent_kamrul'
JOIN delivery_agents da ON da.user_id = au.user_id
WHERE o.order_number = 'ORD7';

INSERT INTO order_assignments (order_id, agent_id)
SELECT o.order_id, da.agent_id
FROM orders o
JOIN users au ON au.username = 'agent_sumon'
JOIN delivery_agents da ON da.user_id = au.user_id
WHERE o.order_number = 'ORD8';

INSERT INTO order_assignments (order_id, agent_id)
SELECT o.order_id, da.agent_id
FROM orders o
JOIN users au ON au.username = 'agent_ayesha'
JOIN delivery_agents da ON da.user_id = au.user_id
WHERE o.order_number = 'ORD9';

INSERT INTO order_assignments (order_id, agent_id)
SELECT o.order_id, da.agent_id
FROM orders o
JOIN users au ON au.username = 'agent_kamrul'
JOIN delivery_agents da ON da.user_id = au.user_id
WHERE o.order_number = 'ORD10';

-- Insert into reviews (more detailed)
INSERT INTO reviews (user_id, plant_id, rating, review_text)
SELECT u.user_id, p.plant_id, 5, 'This neem tree arrived in excellent condition and has already started thriving in my backyard in Dhanmondi. The leaves are lush, and it’s perfect for keeping insects at bay during the monsoon season. Highly recommend for anyone with a spacious garden!' FROM users u JOIN plants p ON p.name = 'Neem Tree' WHERE u.username = 'cust_fatima';

INSERT INTO reviews (user_id, plant_id, rating, review_text)
SELECT u.user_id, p.plant_id, 4, 'The money plant looks stunning in my living room in Dhaka. Its variegated leaves add a refreshing vibe to my apartment. It was slightly droopy on arrival, but after a week of care, it’s flourishing. Great for indoor decor!' FROM users u JOIN plants p ON p.name = 'Money Plant' WHERE u.username = 'cust_fatima';

INSERT INTO reviews (user_id, plant_id, rating, review_text)
SELECT u.user_id, p.plant_id, 3, 'The aloe vera plant is decent, but it arrived with a few wilted leaves, likely due to transport. I’ve placed it on my Gulshan balcony, and it’s recovering slowly. The gel is useful for skincare, but I expected better packaging.' FROM users u JOIN plants p ON p.name = 'Aloe Vera' WHERE u.username = 'cust_mahmud';

INSERT INTO reviews (user_id, plant_id, rating, review_text)
SELECT u.user_id, p.plant_id, 5, 'These marigolds are absolutely vibrant! I used them to decorate my home for Pohela Boishakh, and they’ve been blooming non-stop. Perfect for my Baridhara garden, and they attract bees, which is great for pollination!' FROM users u JOIN plants p ON p.name = 'Marigold' WHERE u.username = 'cust_mahmud';

INSERT INTO reviews (user_id, plant_id, rating, review_text)
SELECT u.user_id, p.plant_id, 4, 'The tulsi plant is healthy and smells amazing. I keep it on my balcony in Baridhara for daily use in tea and puja. It’s growing well, though I wish it came with more detailed care instructions for beginners.' FROM users u JOIN plants p ON p.name = 'Tulsi' WHERE u.username = 'cust_sadia';

INSERT INTO reviews (user_id, plant_id, rating, review_text)
SELECT u.user_id, p.plant_id, 5, 'The mango tree sapling is a fantastic addition to my garden. It arrived in great shape and is already showing new leaves. I’m excited to see it bear fruit in a few years. Perfect for anyone in Bangladesh dreaming of homegrown mangoes!' FROM users u JOIN plants p ON p.name = 'Mango Tree' WHERE u.username = 'cust_sadia';

INSERT INTO reviews (user_id, plant_id, rating, review_text)
SELECT u.user_id, p.plant_id, 2, 'The bottle gourd plant arrived with some damaged vines, which was disappointing. I’ve set it up on my Dhanmondi rooftop with a trellis, but growth has been slow. The seller was responsive, but I hope for better quality control in the future.' FROM users u JOIN plants p ON p.name = 'Bottle Gourd' WHERE u.username = 'cust_fatima';

INSERT INTO reviews (user_id, plant_id, rating, review_text)
SELECT u.user_id, p.plant_id, 5, 'These roses are simply stunning! The red blooms are vibrant and fragrant, perfect for my Gulshan garden. They’ve been blooming consistently, and I’ve received compliments from guests. A must-have for flower lovers in Bangladesh!' FROM users u JOIN plants p ON p.name = 'Rose' WHERE u.username = 'cust_mahmud';

INSERT INTO reviews (user_id, plant_id, rating, review_text)
SELECT u.user_id, p.plant_id, 4, 'The cactus is perfect for my busy lifestyle in Dhaka. It requires almost no care and looks great on my office desk. One small spine was broken on arrival, but it’s still a great addition to my collection.' FROM users u JOIN plants p ON p.name = 'Cactus' WHERE u.username = 'cust_sadia';

INSERT INTO reviews (user_id, plant_id, rating, review_text)
SELECT u.user_id, p.plant_id, 5, 'The bamboo plant has transformed my backyard in Dhanmondi into a serene oasis. It’s growing fast and provides excellent privacy. The delivery was prompt, and the plant was in perfect condition. Highly recommend for landscaping!' FROM users u JOIN plants p ON p.name = 'Bamboo' WHERE u.username = 'cust_fatima';

-- Insert into carts
INSERT INTO carts (user_id, plant_id, size_id, quantity)
SELECT u.user_id, p.plant_id, ps.size_id, 1
FROM users u JOIN plants p ON p.name = 'Neem Tree' JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Small'
WHERE u.username = 'cust_fatima';

INSERT INTO carts (user_id, plant_id, size_id, quantity)
SELECT u.user_id, p.plant_id, ps.size_id, 2
FROM users u JOIN plants p ON p.name = 'Money Plant' JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Medium'
WHERE u.username = 'cust_fatima';

INSERT INTO carts (user_id, plant_id, size_id, quantity)
SELECT u.user_id, p.plant_id, ps.size_id, 3
FROM users u JOIN plants p ON p.name = 'Aloe Vera' JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Small'
WHERE u.username = 'cust_mahmud';

INSERT INTO carts (user_id, plant_id, size_id, quantity)
SELECT u.user_id, p.plant_id, ps.size_id, 4
FROM users u JOIN plants p ON p.name = 'Marigold' JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Medium'
WHERE u.username = 'cust_mahmud';

INSERT INTO carts (user_id, plant_id, size_id, quantity)
SELECT u.user_id, p.plant_id, ps.size_id, 5
FROM users u JOIN plants p ON p.name = 'Tulsi' JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Small'
WHERE u.username = 'cust_sadia';

INSERT INTO carts (user_id, plant_id, size_id, quantity)
SELECT u.user_id, p.plant_id, ps.size_id, 6
FROM users u JOIN plants p ON p.name = 'Mango Tree' JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Medium'
WHERE u.username = 'cust_sadia';

INSERT INTO carts (user_id, plant_id, size_id, quantity)
SELECT u.user_id, p.plant_id, ps.size_id, 7
FROM users u JOIN plants p ON p.name = 'Bottle Gourd' JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Small'
WHERE u.username = 'cust_fatima';

INSERT INTO carts (user_id, plant_id, size_id, quantity)
SELECT u.user_id, p.plant_id, ps.size_id, 8
FROM users u JOIN plants p ON p.name = 'Rose' JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Medium'
WHERE u.username = 'cust_mahmud';

INSERT INTO carts (user_id, plant_id, size_id, quantity)
SELECT u.user_id, p.plant_id, ps.size_id, 9
FROM users u JOIN plants p ON p.name = 'Cactus' JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Small'
WHERE u.username = 'cust_sadia';

INSERT INTO carts (user_id, plant_id, size_id, quantity)
SELECT u.user_id, p.plant_id, ps.size_id, 10
FROM users u JOIN plants p ON p.name = 'Bamboo' JOIN plant_sizes ps ON ps.plant_id = p.plant_id AND ps.size_name = 'Medium'
WHERE u.username = 'cust_fatima';

-- Insert into delivery_confirmations
INSERT INTO delivery_confirmations (order_id, user_id, agent_id)
SELECT o.order_id, o.user_id, da.agent_id FROM orders o JOIN users au ON au.username = 'agent_kamrul' JOIN delivery_agents da ON da.user_id = au.user_id WHERE o.order_number = 'ORD1';

INSERT INTO delivery_confirmations (order_id, user_id, agent_id)
SELECT o.order_id, o.user_id, da.agent_id FROM orders o JOIN users au ON au.username = 'agent_kamrul' JOIN delivery_agents da ON da.user_id = au.user_id WHERE o.order_number = 'ORD2';

INSERT INTO delivery_confirmations (order_id, user_id, agent_id)
SELECT o.order_id, o.user_id, da.agent_id FROM orders o JOIN users au ON au.username = 'agent_sumon' JOIN delivery_agents da ON da.user_id = au.user_id WHERE o.order_number = 'ORD3';

INSERT INTO delivery_confirmations (order_id, user_id, agent_id)
SELECT o.order_id, o.user_id, da.agent_id FROM orders o JOIN users au ON au.username = 'agent_sumon' JOIN delivery_agents da ON da.user_id = au.user_id WHERE o.order_number = 'ORD4';

INSERT INTO delivery_confirmations (order_id, user_id, agent_id)
SELECT o.order_id, o.user_id, da.agent_id FROM orders o JOIN users au ON au.username = 'agent_ayesha' JOIN delivery_agents da ON da.user_id = au.user_id WHERE o.order_number = 'ORD5';

INSERT INTO delivery_confirmations (order_id, user_id, agent_id)
SELECT o.order_id, o.user_id, da.agent_id FROM orders o JOIN users au ON au.username = 'agent_ayesha' JOIN delivery_agents da ON da.user_id = au.user_id WHERE o.order_number = 'ORD6';

INSERT INTO delivery_confirmations (order_id, user_id, agent_id)
SELECT o.order_id, o.user_id, da.agent_id FROM orders o JOIN users au ON au.username = 'agent_kamrul' JOIN delivery_agents da ON da.user_id = au.user_id WHERE o.order_number = 'ORD7';

INSERT INTO delivery_confirmations (order_id, user_id, agent_id)
SELECT o.order_id, o.user_id, da.agent_id FROM orders o JOIN users au ON au.username = 'agent_sumon' JOIN delivery_agents da ON da.user_id = au.user_id WHERE o.order_number = 'ORD8';

INSERT INTO delivery_confirmations (order_id, user_id, agent_id)
SELECT o.order_id, o.user_id, da.agent_id FROM orders o JOIN users au ON au.username = 'agent_ayesha' JOIN delivery_agents da ON da.user_id = au.user_id WHERE o.order_number = 'ORD9';

INSERT INTO delivery_confirmations (order_id, user_id, agent_id)
SELECT o.order_id, o.user_id, da.agent_id FROM orders o JOIN users au ON au.username = 'agent_kamrul' JOIN delivery_agents da ON da.user_id = au.user_id WHERE o.order_number = 'ORD10';

-- Insert into delivery_slots
INSERT INTO delivery_slots (agent_id, slot_date, slot_time)
SELECT da.agent_id, SYSDATE, 'morning' FROM users u JOIN delivery_agents da ON da.user_id = u.user_id WHERE u.username = 'agent_kamrul';

INSERT INTO delivery_slots (agent_id, slot_date, slot_time)
SELECT da.agent_id, SYSDATE, 'afternoon' FROM users u JOIN delivery_agents da ON da.user_id = u.user_id WHERE u.username = 'agent_kamrul';

INSERT INTO delivery_slots (agent_id, slot_date, slot_time)
SELECT da.agent_id, SYSDATE, 'morning' FROM users u JOIN delivery_agents da ON da.user_id = u.user_id WHERE u.username = 'agent_sumon';

INSERT INTO delivery_slots (agent_id, slot_date, slot_time)
SELECT da.agent_id, SYSDATE, 'afternoon' FROM users u JOIN delivery_agents da ON da.user_id = u.user_id WHERE u.username = 'agent_sumon';

INSERT INTO delivery_slots (agent_id, slot_date, slot_time)
SELECT da.agent_id, SYSDATE, 'morning' FROM users u JOIN delivery_agents da ON da.user_id = u.user_id WHERE u.username = 'agent_ayesha';

INSERT INTO delivery_slots (agent_id, slot_date, slot_time)
SELECT da.agent_id, SYSDATE, 'afternoon' FROM users u JOIN delivery_agents da ON da.user_id = u.user_id WHERE u.username = 'agent_ayesha';

INSERT INTO delivery_slots (agent_id, slot_date, slot_time)
SELECT da.agent_id, SYSDATE + 1, 'morning' FROM users u JOIN delivery_agents da ON da.user_id = u.user_id WHERE u.username = 'agent_kamrul';

INSERT INTO delivery_slots (agent_id, slot_date, slot_time)
SELECT da.agent_id, SYSDATE + 1, 'morning' FROM users u JOIN delivery_agents da ON da.user_id = u.user_id WHERE u.username = 'agent_sumon';

INSERT INTO delivery_slots (agent_id, slot_date, slot_time)
SELECT da.agent_id, SYSDATE + 1, 'morning' FROM users u JOIN delivery_agents da ON da.user_id = u.user_id WHERE u.username = 'agent_ayesha';

INSERT INTO delivery_slots (agent_id, slot_date, slot_time)
SELECT da.agent_id, SYSDATE + 2, 'morning' FROM users u JOIN delivery_agents da ON da.user_id = u.user_id WHERE u.username = 'agent_kamrul';

-- Insert into activity_log
INSERT INTO activity_log (user_id, activity_type, activity_details)
SELECT u.user_id, 'login', 'User successfully logged into the platform from Dhanmondi, Dhaka.' FROM users u WHERE u.username = 'cust_fatima';

INSERT INTO activity_log (user_id, activity_type, activity_details)
SELECT u.user_id, 'order', 'User placed an order for multiple plants with standard delivery to Dhanmondi.' FROM users u WHERE u.username = 'cust_fatima';

INSERT INTO activity_log (user_id, activity_type, activity_details)
SELECT u.user_id, 'login', 'User successfully logged into the platform from Gulshan, Dhaka.' FROM users u WHERE u.username = 'cust_mahmud';

INSERT INTO activity_log (user_id, activity_type, activity_details)
SELECT u.user_id, 'order', 'User placed an order for plants with express delivery to Gulshan.' FROM users u WHERE u.username = 'cust_mahmud';

INSERT INTO activity_log (user_id, activity_type, activity_details)
SELECT u.user_id, 'login', 'User successfully logged into the platform from Baridhara, Dhaka.' FROM users u WHERE u.username = 'cust_sadia';

INSERT INTO activity_log (user_id, activity_type, activity_details)
SELECT u.user_id, 'order', 'User placed an order for plants with pickup option from Baridhara.' FROM users u WHERE u.username = 'cust_sadia';

INSERT INTO activity_log (user_id, activity_type, activity_details)
SELECT u.user_id, 'add_plant', 'Seller added a new batch of neem trees and bottle gourds to the inventory from Uttara.' FROM users u WHERE u.username = 'seller_tanvir';

INSERT INTO activity_log (user_id, activity_type, activity_details)
SELECT u.user_id, 'add_plant', 'Seller added a new batch of marigolds and roses to the inventory from Khilkhet.' FROM users u WHERE u.username = 'seller_nusrat';

INSERT INTO activity_log (user_id, activity_type, activity_details)
SELECT u.user_id, 'add_plant', 'Seller added a new batch of tulsi and cacti to the inventory from Mirpur.' FROM users u WHERE u.username = 'seller_arif';

INSERT INTO activity_log (user_id, activity_type, activity_details)
SELECT u.user_id, 'admin_action', 'Admin performed system maintenance and updated discount settings from Banani.' FROM users u WHERE u.username = 'admin_raihan';

-- Insert into low_stock_alerts
INSERT INTO low_stock_alerts (plant_id, current_stock)
SELECT p.plant_id, 5 FROM plants p WHERE p.name = 'Neem Tree';

INSERT INTO low_stock_alerts (plant_id, current_stock)
SELECT p.plant_id, 6 FROM plants p WHERE p.name = 'Money Plant';

INSERT INTO low_stock_alerts (plant_id, current_stock)
SELECT p.plant_id, 7 FROM plants p WHERE p.name = 'Aloe Vera';

INSERT INTO low_stock_alerts (plant_id, current_stock)
SELECT p.plant_id, 8 FROM plants p WHERE p.name = 'Marigold';

INSERT INTO low_stock_alerts (plant_id, current_stock)
SELECT p.plant_id, 9 FROM plants p WHERE p.name = 'Tulsi';

INSERT INTO low_stock_alerts (plant_id, current_stock)
SELECT p.plant_id, 4 FROM plants p WHERE p.name = 'Mango Tree';

INSERT INTO low_stock_alerts (plant_id, current_stock)
SELECT p.plant_id, 3 FROM plants p WHERE p.name = 'Bottle Gourd';

INSERT INTO low_stock_alerts (plant_id, current_stock)
SELECT p.plant_id, 2 FROM plants p WHERE p.name = 'Rose';

INSERT INTO low_stock_alerts (plant_id, current_stock)
SELECT p.plant_id, 1 FROM plants p WHERE p.name = 'Cactus';

INSERT INTO low_stock_alerts (plant_id, current_stock)
SELECT p.plant_id, 0 FROM plants p WHERE p.name = 'Bamboo';

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
