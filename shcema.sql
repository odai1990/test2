DROP TABLE IF EXISTS makeup;
CREATE TABLE makeup (
	id serial PRIMARY KEY,
	name VARCHAR (255),
	image_link VARCHAR (255),
	price VARCHAR (255),
	description text
	
);