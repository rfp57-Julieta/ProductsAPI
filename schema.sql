
DROP TABLE IF EXISTS product, styles, skus, features, cart;

CREATE TABLE IF NOT EXISTS product(
   product_id serial NOT NULL PRIMARY KEY,
   name VARCHAR NOT NULL,
   slogan VARCHAR NOT NULL,
   description VARCHAR NOT NULL,
   category VARCHAR NOT NULL,
   default_price INT NOT NULL
);

CREATE TABLE IF NOT EXISTS styles(
   styles_id serial NOT NULL PRIMARY KEY,
   productId INT NOT NULL,
   name VARCHAR NOT NULL,
   sale_price INT,
   original_price INT,
   default_style INT NOT NULL,
   FOREIGN KEY (productId) REFERENCES product (product_id)
);

CREATE TABLE IF NOT EXISTS skus(
   skus_id serial NOT NULL PRIMARY KEY,
   styleId INT NOT NULL REFERENCES styles (styles_id),
   size VARCHAR NOT NULL,
   quantity INT NOT NULL
);

CREATE TABLE IF NOT EXISTS features(
   features_id serial NOT NULL PRIMARY KEY,
   product_id INT NOT NULL REFERENCES product (product_id),
   feature VARCHAR NOT NULL,
   value VARCHAR
);

CREATE TABLE IF NOT EXISTS cart(
   cart_id serial NOT NULL PRIMARY KEY,
   user_session VARCHAR NOT NULL,
   product_id INT NOT NULL REFERENCES product (product_id),
   active INT
);