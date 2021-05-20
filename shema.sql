DROP TABLE IF EXISTS makeup;
CREATE TABLE makeup (
 Id serial PRIMARY KEY,
    name varchar(255),
    image_link varchar(255),
    price varchar(255),
    description text
);