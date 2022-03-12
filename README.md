# Evaluacion 1

## 1

Para esta evaluación, lea el código en tres archivos `test1.js`, `test2.js` y `test3.mjs`, análizelos e intente adivinar el orden de las lineas que imprime en pantalla, luego, para cada uno, realice un texto descriptivo que explique el por qué del orden de ejecución observado.

### Puntos a evaluar

* Exactitud en la respuesta
* Calidad del texto descriptivo


## 2

Cree una API compuesta de dos conjuntos de servicios: un servicio de autenticación, y un par de servicios de API. 

El servicio de autenticación debe exponer funcionalidad para registrar e ingresar como usuario, devolviendo algo que demuestre la identidad del usuario (Un JWT, una cookie, es decision de usted). Este algo luego es usado para poder acceder al servicio de API. 

Esta API expondrá objetos de un tipo de entidad de su preferencia, permitiendo realizar operaciones CRUD sobre las instancias de esa entidad, si y solo si el usuario está autenticado. 

La API en sí está compuesta de dos servicios separados: uno que recibe la petición y se la hace llegar a un segundo servicio. El primer servicio es un proxy, actuando de cara a la peticiones, y debe ser capaz de comprimir su respuesta si la petición HTTP que recibe asi lo desea, este servicio hace llegar las peticiones que lleguen al segundo servicio. El segundo servicio recibe las peticiones en sí y realiza las operaciones sobre la base de datos de la entidad, segun la petición del usuario.

Puntos a tomar en cuenta:

* Cada servicio tiene su base de datos propia.
* La entidad que maneje la API es de su preferencia, puede ser una API de gatos, perros, carros, marcas, etc.
* Los tres servicios (el de autenticación y los dos de API) deben estar hechos en Node.js, usando el framework web de su preferencia ([Fastify](https://www.fastify.io/), [Express](http://expressjs.com/)...).
* Las bases de datos pueden ser relacionales o no relacionales, eso que da igualmente a su preferencia.
* El acceso a las bases de datos desde estos servicios igualmente puede ser a través de la librería u ORM de su preferencia.
* La comunicación entre los servicios

## Puntos a evaluar

* Exactitud del resultado final, que cumpla con las pautas antes descritas
* Calidad del codigo
* La manera en la que se comunican los servicios


La entrega debe ser en un enlace a un repositorio Github público, ordenado en carpetas a su conveniencia


# Solucion
## Parte 1
### test1.js
Output:
```
new promise
async function
nextTick 1
nextTick 2
nextTick 3
then 1
then 2
microtask 1
microtask 2
timeout 1
timeout 2
immediate 1
immediate 2
```
Explicacion:

El script comienza ejecutando la funcion dentro del constructor de la promesa que tiene el output **new promise**, y luego incluye el callback de la promesa creada en la cola de ejecucion.

Luego se ejecuta la funcion asincrona `foo`, que tiene el output **async function** y se incluye el callback de la promesa en la cola de ejecucion.

Luego lee el primer `set immediate`, pero como aun hay funciones pendientes, se incluye en la cola de ejecucion.

Luego se lee el primer `set timeout`, e igualmente, se incluye en la cola de ejecucion al haber callbacks pendientes.

Despues, se lee la funcion `next tick`, que es ejecutada inmediatamente.

Se sigue bajando y se leen las funciones `queueMicrotask`, `setTimeout` y `setImmediate`. Despues de esto, estan otros dos `nextTick`, que se ejecutan inmediatamente.

Al final, se tiene otro `queueMicrotask`, que se incluye en la cola.

Al terminar de leer, empieza la segunda iteracion. Primero se ejecutan los dos callbacks de las funciones asincronas. Primero la de `new Promise` con el output `then 1`, y despues la de `foo`, con el output `then 2`.

Al no haber callbacks pendientes, se ejecutan primero los dos `queueMicrotask` con los outputs `microtask 1` y `microtask 2`.

Al final solo quedan pendiente los `setTimeout` y `setImmediate`. Al ya haber transcurrido el tiempo minimo para ejecutar los `setTimeout` (0 ms), entonces estos ya estan listos para ejecutarse al igual que los `setImmediate`. El orden de ejecucion de estos depende del rendimiento del script.

### test2.js
Output:
```
new promise
async function
nextTick 1
nextTick 2
nextTick 3
then 1
then 2
microtask 1
microtask 2
immediate 1
immediate 2
timeout 1
timeout 2
```

Explicacion:

Es el mismo script que el anterior, solo que ahora el codigo esta dentro de una funcion `readFile`, por lo tanto, el output es CASI el mismo.

La diferencia seria, que al estar dentro del scope de una funcion I/O, `setImmediate` siempre se va a ejecutar primero que `setTimeout`.

### test3.mjs
Output:
```
new promise
async function
then 1
then 2
microtask 1
microtask 2
nextTick 1
nextTick 2
nextTick 3
immediate 1
immediate 2
timeout 1
timeout 2
```

Explicacion:

Este archivo no es un script comun como los otros dos archivos, este es un modulo, denotado por la extension `.mjs`. 

En los modulos se les da prioridad a las promesas y callbacks, y no se ejecutarian las otras funciones hasta que todas las promesas sean completadas. Es por esto que luego de ejecutar las funciones `new promise` y `foo`, se obtienen inmediatamente los outputs `then 1` y `then 2`.

Luego al no tener promesas pendientes, se ejecutan los callbacks `microTask 1` y `microTask 2`, que si. Al ya estar libre de las promesas y callbacks, se procede a la siguiente parte, donde se ejecutan los `nextTick`.

Al haber finalizado la fase actual, se ejecutan los `setImmediate` y `setTimeout`. Al no estar dentro de un ciclo I/O, el orden de ejecucion entre estos dos puede variar.

## Parte 2
> ### Setup
1. Instalar los paquetes necesarios
```shell
1. cd Parte-2
2. npm install
```
2. Crear la base de datos
```sql
CREATE DATABASE dist_sys_ev_1;
```

4. Conectarse a la base de datos `\connect dist_sys_ev_1`

5. Crear los esquemas
```sql
CREATE SCHEMA users;

CREATE SCHEMA dogs;
```

6. Crear las tablas
```sql
CREATE TABLE users.users(
    user_id serial PRIMARY KEY,
    user_name varchar(50),
    user_password varchar(300)
);

CREATE TABLE dogs.dogs(
    dog_id serial PRIMARY KEY,
    dog_name varchar(50),
    dog_breed varchar(50),
    dog_age int,
    dog_owner_id int,
    CONSTRAINT fk_owner FOREIGN KEY(dog_owner_id) 
    REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE
);
```

7. El nombre de usuario y la clave para la base de datos puede ser modificada en el archivo `.env`

> ### Uso

#### Iniciar los servicios
```shell
npm run run-auth
```

```shell
npm run run-proxy
```

```shell
npm run run-service
```

#### Registro:

```shell
curl -X POST -H 'Content-Type: application/json' -d '{"username": "{name}", "password": "{password}"}' http://localhost:{AUTH_PORT}/users
```

Donde `{name}` y `{password}` son reemplazados por el nombre de usuario y la clave deseadas respectivamente. Y `{AUTH_PORT}` es el puerto asignado en el archivo `.env`

#### Login:

```shell
curl -X POST -H 'Content-Type: application/json' -d '{"password": "{password}"}' http://localhost:{AUTH_PORT}/users/{name}
```

Donde `{name}` y `{password}` son reemplazados por el nombre de usuario y la clave deseadas respectivamente. Y `{AUTH_PORT}` es el puerto asignado en el archivo `.env`

#### **CRUD**
#### Create
```shell
curl -X POST -H 'content-type: application/json' -H 'authorization: {token}' -d '{"dog_name": "{name}", "dog_age": {age}, "dog_breed": "{breed}"}' http://localhost:{PROXY_PORT}/dogs
```

Donde `{token}` es el Json Web Token obtenido luego de hacer login, `{name}` es el nombre del perro, `{age}` la edad, `{breed}` la raza y `{PROXY_PORT}` el puerto asignado en el archivo `.env`

#### Read

1. Por ID
```shell
curl -X GET -H 'authorization: {token}' http://localhost:{PROXY_PORT}/dogs/{id}
```

Donde `{token}` es el Json Web Token obtenido luego de hacer login, `{PROXY_PORT}` es el puerto asignado en el archivo `.env` y `{id}` es la id del perro.

2. Lista de perros del usuario
```shell
curl -X GET -H 'authorization: {token}' http://localhost:{PROXY_PORT}/dogs
```

Donde `{token}` es el Json Web Token obtenido luego de hacer login y `{PROXY_PORT}` es el puerto asignado en el archivo `.env`

#### Update
```shell
curl -X PATCH -H 'authorization: {token}' -H 'content-type: application/json' -d '{"dog_name": "{name}", "dog_age": {age}, "dog_breed": "{breed}"}' http://localhost:{PROXY_PORT}/dogs/{dogId}
```

Donde `{token}` es el Json Web Token obtenido luego de hacer login, `{name}` es el nombre del perro, `{age}` la edad, `{breed}` la raza y `{PROXY_PORT}` el puerto asignado en el archivo `.env`

#### Delete
```shell
curl -X DELETE -H 'authorization: {token}' http://localhost:{PROXY_PORT}/dogs/{dogId}
```

Donde `{token}` es el Json Web Token obtenido luego de hacer login, `{dogId}` es la id del perro a borrar.

### Compresion
Para obtener la respuesta comprimida se debe incluir el header `-H 'accept-encoding: gzip'` en el comando curl. Ejemplo:

```shell
curl -X GET -H 'authorization: {token}' -H 'accept-encoding: gzip' http://localhost:{PROXY_PORT}/dogs
```

Dado que la respuesta va a estar comprimida, se debe descomprimir para poder leerla. Para esto, si se esta en linux, se puede utilizar el programa **Gzip**, agregando el comando `| gunzip` luego del comando curl. Ejemplo:

```shell
curl -X GET -H 'authorization: {token}' -H 'accept-encoding: gzip' http://localhost:{PROXY_PORT}/dogs | gunzip
```
