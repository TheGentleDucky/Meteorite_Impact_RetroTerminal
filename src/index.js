import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const getSize = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

const { width, height } = getSize();

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width, height);

const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
const scene = new THREE.Scene();

const raycaster = new THREE.Raycaster();
const markerColor = 0x22420e;
const selectedColor = 0xffffed;

let selectedMarker = null;
const mouse = new THREE.Vector2();

const backgrnd = new THREE.TextureLoader().load("/src/Outer Space.png");
const earth = new THREE.TextureLoader().load("/src/Earth2.jpg");
const bump = new THREE.TextureLoader().load("/src/bump earth.jpeg");

camera.position.z = 65;
scene.background = backgrnd;

const ambientLight = new THREE.AmbientLight(0x33ff85, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xd4ffea, 0.9);
scene.add(directionalLight);
scene.add(directionalLight.target);

const ambientSound = new Audio("/src/Terminal Room.mp3");
ambientSound.loop = true;
ambientSound.volume = 0.3;

const clickSound = new Audio("/src/Click.mp3");
clickSound.volume = 1.0;

const typeSound = new Audio("/src/type.mp3");
typeSound.volume = 0.3;

const tierra = Tierra(20, 0xffffff, earth, bump);
let markers = [];

loadCraters().then((result) => {
  markers = result;
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.2;
controls.enablePan = false;
controls.minDistance = 32;
controls.maxDistance = 80;

const update = () => {
  controls.update();
  directionalLight.position.copy(camera.position);
  camera.getWorldDirection(directionalLight.target.position);
  directionalLight.target.position.add(camera.position);

  renderer.render(scene, camera);
  requestAnimationFrame(update);
};

renderer.domElement.addEventListener("click", onMouseClick);

function onMouseClick(event) {
  const rect = renderer.domElement.getBoundingClientRect();

  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(markers);

  if (intersects.length > 0) {
    const marker = intersects[0].object;

    if (selectedMarker !== null && selectedMarker !== marker) {
      selectedMarker.material.color.set(markerColor);
    }

    selectedMarker = marker;
    selectedMarker.material.color.set(selectedColor);
    clickSound.currentTime = 0;
    clickSound.play().catch((e) => {});

    showCraterInfo(marker.userData);
  } else {
    closeInfoWindow();
  }
}

function Tierra(rad, col, texture = undefined, bump = undefined) {
  const geometry = new THREE.SphereGeometry(rad, 64, 64);

  const material = new THREE.MeshStandardMaterial({
    color: col,
    map: texture,
    bumpMap: bump,
    bumpScale: 0.15,
    roughness: 0.9,
    metalness: 0.1,
    emissive: 0x0a2212,
    emissiveIntensity: 0.35,
  });

  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  return sphere;
}

function coordsToVector(latitude, longitude, radius) {
  const phi = ((90 - latitude) * Math.PI) / 180;
  const theta = ((180 + longitude) * Math.PI) / 180;

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

function createImpactMarker(latitude, longitude) {
  const position = coordsToVector(latitude, longitude, 20.05);
  const geometry = new THREE.SphereGeometry(0.2, 16, 16);

  const material = new THREE.MeshBasicMaterial({ color: markerColor });
  const marker = new THREE.Mesh(geometry, material);
  marker.position.copy(position);
  tierra.add(marker);

  return marker;
}

async function loadCraters() {
  const response = await fetch("/src/earth-impact-craters.csv");
  const content = await response.text();

  return craterProcessor(content);
}

function craterProcessor(content) {
  const sep = ",";
  const filas = content.split(/\r?\n/);
  const encabezados = filas[0].split(sep);

  const indices = {
    nombre: encabezados.indexOf("crater_name"),
    estado: encabezados.indexOf("state"),
    pais: encabezados.indexOf("country"),
    tipo_roca: encabezados.indexOf("target_rock"),
    diametro: encabezados.indexOf("diameter_km"),
    edad: encabezados.indexOf("age_millions_years_ago"),
    lat: encabezados.indexOf("latitude"),
    lon: encabezados.indexOf("longitude"),
    bolid: encabezados.indexOf("bolid_type"),
  };

  const marcadores = [];

  for (let i = 1; i < filas.length; i++) {
    if (!filas[i].trim()) continue;

    const columna = filas[i].split(sep);
    const latitude = Number(columna[indices.lat]);
    const longitude = Number(columna[indices.lon]);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      continue;
    }

    const crater = {
      nombre: columna[indices.nombre],
      pais: columna[indices.pais],
      estado: columna[indices.estado],
      sedimento: columna[indices.tipo_roca],
      diametro: columna[indices.diametro],
      edad: columna[indices.edad],
      latitude,
      longitude,
      bolid: columna[indices.bolid],
    };

    const marker = createImpactMarker(latitude, longitude);
    marker.userData = crater;
    marcadores.push(marker);
  }

  console.log(`Cargados ${marcadores.length} cráteres`);
  return marcadores;
}

let typingTimeout = null;

function typeWriterEffect(element, text, speed = 10) {
  if (typingTimeout) clearTimeout(typingTimeout);
  element.innerHTML = "";
  let i = 0;

  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      if (text.charAt(i) !== " " && text.charAt(i) !== "\n") {
        typeSound.currentTime = 0;
        typeSound.play().catch((e) => {});
      }
      i++;
      typingTimeout = setTimeout(type, speed);
    }
  }
  type();
}

let loadingTimeout = null;

function showCraterInfo(crater) {
  const terminalInfo = document.getElementById("crater-info");
  const textElement = document.getElementById("terminal-text");
  const imgElement = document.getElementById("terminal-img");

  if (typingTimeout) clearTimeout(typingTimeout);
  if (loadingTimeout) clearTimeout(loadingTimeout);

  terminalInfo.hidden = false;
  imgElement.src = "/src/Spiral.png";

  textElement.innerHTML = `
    [SYSTEM: ESTABLISHING UPLINK...]
    [LOCATING SECTOR: ${crater.latitude.toFixed(2)}, ${crater.longitude.toFixed(
    2
  )}]
    [DECRYPTING DATA PACKET...]
  `.trim();

  loadingTimeout = setTimeout(() => {
    imgElement.src = "/src/clater.jpg";

    const formattedText = `
      CRATER: ${crater.nombre || "UNKNOWN"}
      COUNTRY: ${crater.pais || "N/A"}
      REGION: ${crater.estado || "N/A"}
      TARGET ROCK: ${crater.sedimento || "NOT LAND"}
      DIAMETER: ${crater.diametro ? crater.diametro + " km" : "N/A"}
      AGE: ${crater.edad ? crater.edad + " Ma" : "N/A"}
      COORDS: ${crater.latitude.toFixed(2)}° N, ${crater.longitude.toFixed(
      2
    )}° E
      ----------------------------------------
      STATUS: IMPACT CONFIRMED.
      MATERIAL TYPE: ${crater.bolid || "UNVERIFIED"}
    `.trim();

    typeWriterEffect(textElement, formattedText, 40);
  }, 700);
}

function closeInfoWindow() {
  if (typingTimeout) clearTimeout(typingTimeout);
  if (loadingTimeout) clearTimeout(loadingTimeout); // <--- LIMPIAR EL DELAY SI CIERRAN ANTES

  if (selectedMarker !== null) {
    selectedMarker.material.color.set(markerColor);
    selectedMarker = null;
  }

  document.getElementById("crater-info").hidden = true;
}
let audioInitialized = false;

function initAudio() {
  if (!audioInitialized) {
    ambientSound
      .play()
      .then(() => {
        audioInitialized = true;
        console.log("Audio ambiental iniciado");
      })
      .catch((e) => {
        console.log("No se pudo iniciar el audio ambiental:", e);
      });
  }
}

requestAnimationFrame(update);

document.getElementById("app").appendChild(renderer.domElement);
document
  .getElementById("close-info")
  .addEventListener("click", closeInfoWindow);
document.addEventListener("click", initAudio, { once: true });
