CREATE DATABASE dist_sys_ev_1;

CREATE TABLE users(
    user_id serial PRIMARY KEY,
    user_name varchar(50),
    user_password varchar(300)
);

CREATE TABLE dogs(
    dog_id serial PRIMARY KEY,
    dog_name varchar(50),
    dog_breed varchar(50),
    dog_age int,
    dog_owner_id int,
    CONSTRAINT fk_owner FOREIGN KEY(dog_owner_id) 
    REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE
);
