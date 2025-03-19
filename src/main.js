import './style.css'

import * as THREE from "three"
import { ARButton } from "three/addons/webxr/ARButton.js"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

let camera, scene, renderer;
let coneMesh, coneGeometry, tetrahedronMesh, tetrahedronGeometry, ringGeometry, ringMesh;  
let controls;

init();
animate();

function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    // Сцена
    scene = new THREE.Scene();

    // Камера
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 40);


    // Об'єкт рендерингу
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
            
    renderer.xr.enabled = true; // Життєво важливий рядок коду для вашого застосунку!
    container.appendChild(renderer.domElement);
            
    // Світло
    const directionalLight = new THREE.DirectionalLight(0xffffff, 4); 
    directionalLight.position.set(3, 3, 3);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 10, 10); 
    pointLight.position.set(-2, 2, 2);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2); 
    scene.add(ambientLight);

    
    // 1. Створюємо об'єкт сone
    coneGeometry = new THREE.ConeGeometry(0.5, 1.5, 32);   // радіус 0.5, висота 1.5, 32 сегменти
    const coneMaterial = new THREE.MeshStandardMaterial({
        color: 0xffa700, // оранжевий
        metalness: 0.9,
        roughness: 0.2
    });
    coneMesh = new THREE.Mesh(coneGeometry, coneMaterial);
    coneMesh.position.set(0, 0, 0); 
    coneMesh.scale.set(0.4, 0.4, 0.4); 
    scene.add(coneMesh);

    // 2. Створюємо об'єкт tetrahedron
    tetrahedronGeometry = new THREE.TetrahedronGeometry(0.7);
    const tetrahedronMaterial = new THREE.MeshStandardMaterial({
        color: 0xffff00, 
        metalness: 0.5,
        roughness: 0.3
    });
    tetrahedronMesh = new THREE.Mesh(tetrahedronGeometry, tetrahedronMaterial);
    tetrahedronMesh.position.set(0.5, -0.1, 0); 
    tetrahedronMesh.scale.set(0.4, 0.4, 0.4); 
    scene.add(tetrahedronMesh);

    //3. Створюємо об'єкт Ring
    ringGeometry = new THREE.RingGeometry(0.2, 0.5, 32, 3); 
    const ringMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ffcc, 
        metalness: 0.2,
        roughness: 0.6,
        side: THREE.DoubleSide, 
        wireframe: true 
    });
    ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.position.set(-0.5, 0, 0);
    ringMesh.scale.set(0.5, 0.5, 0.5); // Зменшення розміру
    scene.add(ringMesh);

    // Позиція для камери
    camera.position.z = 3;

    // Контролери для 360 огляду на вебсторінці, але не під час AR-сеансу
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    document.body.appendChild(ARButton.createButton(renderer));

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    renderer.setAnimationLoop(render);
    controls.update();
}

function render() {
    rotateObjects();
    renderer.render(scene, camera);
}
    
function rotateObjects() {
  if (coneMesh) {
    coneMesh.rotation.y -= 0.01;
}
  if (tetrahedronMesh) { 
  tetrahedronMesh.rotation.y += 0.01; 
}
  if (ringMesh) { 
  ringMesh.rotation.y += 0.01;
}
}
