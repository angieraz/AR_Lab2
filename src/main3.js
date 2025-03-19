import './style.css';
import * as THREE from "three";
import { ARButton } from "three/addons/webxr/ARButton.js";

let container;
let camera, scene, renderer;
let reticle;
let controller;

let hitTestSource = null;
let localSpace = null;
let hitTestSourceInitialized = false;

init();
animate();

function init() {
    container = document.createElement("div");
    document.body.appendChild(container);

    // Сцена
    scene = new THREE.Scene();
    // Камера
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
    // Рендеринг
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);
    // Світло
    var light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);
    // Контролер додавання об'єкта на сцену
    controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    // Додаємо нашу мітку поверхні на сцену
    addReticleToScene();

    // Тепер для AR-режиму необхідно застосувати режим hit-test
    const button = ARButton.createButton(renderer, {
        requiredFeatures: ["hit-test"]
    });
    document.body.appendChild(button);
    renderer.domElement.style.display = "none";

    window.addEventListener("resize", onWindowResize, false);
}


function addReticleToScene() {
    const geometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
    const material = new THREE.MeshBasicMaterial();
    reticle = new THREE.Mesh(geometry, material);

    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    // Додаємо систему координат для відлагодження
    reticle.add(new THREE.AxesHelper(1));
}

function onSelect() {
    if (reticle.visible) {
        // Створюємо контур для екструдування (можна змінити форму)
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0.2, 0);
        shape.lineTo(0.2, 0.2);
        shape.lineTo(0, 0.2);
        shape.lineTo(0, 0);

        // Створюємо екструзію цієї форми
        const extrudeSettings = { depth: 0.1, bevelEnabled: true, bevelSegments: 5, steps: 10, bevelSize: 0.03, bevelThickness: 0.03 };
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        // Матеріал для 3D-об'єкта
        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff * Math.random(), // Рандомний колір
            metalness: Math.random(),
            roughness: Math.random() * 0.5,
        });
        const mesh = new THREE.Mesh(geometry, material);

        // Позиціонуємо екструдований об'єкт згідно з ретикулом
        mesh.position.setFromMatrixPosition(reticle.matrix);
        mesh.quaternion.setFromRotationMatrix(reticle.matrix);

        // Додаємо його на сцену
        scene.add(mesh);
    }
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

async function initializeHitTestSource() {
    const session = renderer.xr.getSession();
    const viewerSpace = await session.requestReferenceSpace("viewer");
    hitTestSource = await session.requestHitTestSource({ space: viewerSpace });
    localSpace = await session.requestReferenceSpace("local");

    hitTestSourceInitialized = true;

    session.addEventListener("end", () => {
        hitTestSourceInitialized = false;
        hitTestSource = null;
    });
}

function render(timestamp, frame) {
    if (frame) {
        // 1. Створюємо hitTestSource для усіх наших кадрів
        if (!hitTestSourceInitialized) {
            initializeHitTestSource();
        }

        // 2. Отримуємо результати hitResults
        if (hitTestSourceInitialized) {
            const hitTestResults = frame.getHitTestResults(hitTestSource);

            // Перевірка на наявність результатів хіт-тесту
            if (hitTestResults.length > 0) {
                const hit = hitTestResults[0];
                const pose = hit.getPose(localSpace);
                console.log(pose); // Для перевірки

                reticle.visible = true;
                reticle.matrix.fromArray(pose.transform.matrix);
            } else {
                reticle.visible = false;
            }
        }

        renderer.render(scene, camera);
    }
}

function animate() {
    renderer.setAnimationLoop(render);
}
