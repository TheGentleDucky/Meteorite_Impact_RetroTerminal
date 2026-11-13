# Meteorite_Impact_RetroTerminal
Created with CodeSandbox
# Earth Impact Craters – Interactive 3D Visualization

https://codesandbox.io/p/sandbox/ig-s8-cql9zg

## 1. Descripción del proyecto

Este proyecto consiste en una visualización interactiva en 3D del planeta Tierra, desarrollada utilizando **Three.js** y WebGL.

La aplicación representa los cráteres de impacto meteorítico registrados en diferentes partes del mundo mediante marcadores distribuidos sobre la superficie terrestre. El usuario puede explorar el planeta, rotar la cámara y seleccionar individualmente los marcadores para consultar información sobre cada impacto.

El objetivo es ofrecer una representación geográfica e interactiva de los impactos meteoríticos conocidos, combinando visualización tridimensional, tratamiento de datos y elementos de interfaz inspirados en una terminal de exploración espacial.

## 2. Tecnologías utilizadas

- **JavaScript (ES6):** lógica principal de la aplicación.
- **Three.js:** creación y representación de la escena tridimensional.
- **WebGL:** tecnología utilizada para renderizar los elementos gráficos.
- **OrbitControls:** navegación y control interactivo de la cámara.
- **Raycaster:** detección de intersecciones para seleccionar los marcadores.
- **HTML y CSS:** estructura y presentación de la interfaz.
- **CSV:** almacenamiento de los datos geográficos y científicos de los cráteres.

## 3. Funcionalidades principales

### Visualización tridimensional de la Tierra
<img width="760" height="770" alt="image" src="https://github.com/user-attachments/assets/2910d402-a69b-4fec-bf5e-eace092a5df9" />

- Representación del planeta mediante una esfera de geometría tridimensional.
- Aplicación de texturas superficiales y mapas de relieve (*bump mapping*).
- Iluminación ambiental y direccional para mejorar la representación visual.
- Fondo espacial para contextualizar la escena.

### Exploración de los cráteres

- Representación de los cráteres mediante pequeños marcadores distribuidos sobre la superficie terrestre.
- Conversión de coordenadas geográficas (latitud y longitud) a coordenadas cartesianas tridimensionales.
- Selección individual de los marcadores mediante Raycasting.
- Cambio de color para identificar visualmente el cráter seleccionado.

### Información interactiva

Al seleccionar un marcador, se muestra una ventana de información con los datos correspondientes al cráter:
<img width="766" height="581" alt="image" src="https://github.com/user-attachments/assets/ccfd3116-0abd-416e-8097-952c7b281d53" />


- Nombre del cráter.
- País y región.
- Tipo de roca objetivo (*target rock*).
- Diámetro.
- Antigüedad estimada.
- Coordenadas geográficas.
- Tipo de cuerpo impactante (*bolide type*).

La información se presenta mediante una animación de escritura progresiva, acompañada de elementos gráficos que simulan una terminal de exploración.

### Sonido ambiental

La aplicación incorpora diferentes recursos de audio para mejorar la experiencia de exploración:

- Sonido ambiental en bucle durante la navegación.
- Efecto de sonido al seleccionar un cráter.
- Sonido asociado a la animación de escritura de información.

La reproducción del sonido ambiental se inicia tras la primera interacción del usuario, respetando las restricciones de reproducción automática de los navegadores.

## 4. Origen y tratamiento de los datos

El conjunto de datos utilizado procede de la **PASSC Earth Impact Database**, una base de datos especializada en cráteres de impacto meteorítico mantenida por el Planetary and Space Science Centre (PASSC) de la University of New Brunswick (Canadá).

La base de datos contiene información científica y geográfica sobre estructuras de impacto confirmadas en la Tierra.

Para este proyecto se ha preparado un archivo CSV a partir de los registros consultados en dicha base de datos.

**Características del conjunto de datos:**

- 190 registros de cráteres.
- 13 columnas de información.
- Coordenadas geográficas utilizadas para posicionar los marcadores.
- Referencias individuales a las fichas de los cráteres en la base de datos original.

### Estructura del CSV

El archivo `earth-impact-craters.csv` contiene los siguientes campos:

| Campo | Descripción |
|---|---|
| `crater_name` | Nombre del cráter de impacto. |
| `state` | Estado o región administrativa donde se encuentra. |
| `country` | País en el que está localizado. |
| `target_rock` | Tipo de roca sobre la que se produjo el impacto. |
| `diameter_km` | Diámetro del cráter en kilómetros. |
| `age_millions_years_ago` | Antigüedad estimada en millones de años. |
| `exposed` | Indica si la estructura de impacto está expuesta. |
| `drilled` | Indica si se han realizado perforaciones en la estructura. |
| `bolid_type` | Tipo de cuerpo impactante, cuando está disponible. |
| `latitude` | Latitud geográfica del cráter. |
| `longitude` | Longitud geográfica del cráter. |
| `url` | Referencia a la ficha individual del cráter. |
| `notes` | Información adicional y observaciones. |

Los campos que no disponen de información aparecen vacíos o contienen valores descriptivos, dependiendo del registro original.

Es importante señalar que algunos datos de antigüedad pueden incluir intervalos, aproximaciones o símbolos científicos. Por este motivo, no todos los valores deben interpretarse como cantidades numéricas exactas.

### Carga y procesamiento

Los datos se cargan dinámicamente mediante `fetch()` desde el archivo CSV.

El procesamiento se encarga de:

1. Leer el contenido del archivo.
2. Identificar las columnas mediante sus encabezados.
3. Extraer las coordenadas geográficas de cada registro.
4. Comprobar que las coordenadas sean válidas.
5. Crear un marcador tridimensional para cada cráter válido.
6. Asociar los datos originales al marcador mediante `userData`.

De esta manera, cada marcador conserva su propia información y puede recuperarse cuando el usuario lo selecciona.

## 5. Conversión de coordenadas geográficas

Para representar los cráteres sobre la esfera terrestre es necesario transformar las coordenadas geográficas en posiciones tridimensionales.

La aplicación utiliza la latitud, la longitud y el radio de la Tierra para calcular las coordenadas cartesianas X, Y y Z.

Se utilizan las siguientes relaciones:

- φ = (90 − latitud) · π / 180
- θ = (180 + longitud) · π / 180
- X = −R · sin(φ) · cos(θ)
- Y = R · cos(φ)
- Z = R · sin(φ) · sin(θ)

Donde R representa el radio de la esfera.

Los marcadores se sitúan ligeramente por encima de la superficie terrestre para evitar problemas de superposición visual con la geometría del planeta.


## 6. Controles

| Acción | Funcionalidad |
|---|---|
| Arrastrar con el ratón | Rotar la cámara alrededor de la Tierra. |
| Rueda del ratón | Acercar o alejar la cámara. |
| Clic sobre un marcador | Consultar la información del cráter. |
| Clic fuera de un marcador | Cerrar la ventana de información. |
| Botón de cierre | Ocultar la información del cráter seleccionado. |

## 7. Fuentes y atribuciones

**Fuente principal de datos:**

PASSC Earth Impact Database  
Planetary and Space Science Centre (PASSC)  
University of New Brunswick

https://www.passc.net/EarthImpactDatabase/

Los datos del archivo CSV se han recopilado a partir de los registros de esta base de datos científica. Se recomienda consultar las fichas originales para obtener información adicional y verificar los datos de cada estructura de impacto.

Los recursos gráficos y sonoros utilizados en el proyecto son independientes del conjunto de datos científicos.

---

**Desarrollado con JavaScript y Three.js.**
