import './style.css';

import * as THREE from "three";
import { ARButton } from "three/addons/webxr/ARButton.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let camera, scene, renderer;
let model;

init();
animate();

function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 40);
    camera.position.set(0, 1, 3); // Камера трохи вище і далі

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);


    document.body.appendChild(ARButton.createButton(renderer));

    window.addEventListener('resize', onWindowResize, false);

    loadModel(); // Завантажуємо модель
}

function loadModel() {
    const modelPath = './models/scene.gltf'; // Відносний шлях до GLTF

    const loader = new GLTFLoader();
    loader.load(
        modelPath,
        function (gltf) {
            model = gltf.scene;
            model.position.set(0, -1, -3); // Розміщуємо модель ближче
            scene.add(model);
            console.log("Model loaded successfully");
        },
        undefined,
        function (error) {
            console.error("Error loading model:", error);
        }
    );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    renderer.setAnimationLoop(render);
}

function render() {
    if (model) {
        model.rotation.y += 0.01; // Обертання моделі
    }
    renderer.render(scene, camera);
}
