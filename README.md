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