import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let modalScene, modalCamera, modalRenderer, modalISS, modalControls, earthMesh;
let zoomCanvas, zoomModal;

export function initZoomModal() {
    zoomCanvas = document.getElementById('zoomCanvas');
    zoomModal = document.getElementById('zoomModal');

    modalScene = new THREE.Scene();
    modalCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.001, 10);

    modalRenderer = new THREE.WebGLRenderer({ canvas: zoomCanvas, antialias: true });
    modalRenderer.setSize(window.innerWidth, window.innerHeight);
    modalRenderer.setPixelRatio(window.devicePixelRatio);

    modalControls = new OrbitControls(modalCamera, zoomCanvas);
    modalControls.enableDamping = true;
    modalControls.enableZoom = true;

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0.5, 0.5, 1);
    modalScene.add(light);

    const ambient = new THREE.AmbientLight(0x404040, 0.5);
    modalScene.add(ambient);

    const issGeometry = new THREE.SphereGeometry(0.005, 8, 8);
    const issMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    modalISS = new THREE.Mesh(issGeometry, issMaterial);
    modalScene.add(modalISS);

    const earthGeo = new THREE.SphereGeometry(1, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({ color: 0x0033ff });
    earthMesh = new THREE.Mesh(earthGeo, earthMat);
    modalScene.add(earthMesh);

    const grid = new THREE.GridHelper(2, 10);
    modalScene.add(grid);

    document.getElementById('closeZoom').addEventListener('click', () => {
        zoomModal.style.display = 'none';
    });

    zoomModal.addEventListener('mousedown', e => e.stopPropagation());
    zoomModal.addEventListener('mouseup', e => e.stopPropagation());
    zoomCanvas.addEventListener('mousedown', e => e.stopPropagation());
    zoomCanvas.addEventListener('mouseup', e => e.stopPropagation());

    window.addEventListener('resize', onModalResize);
    onModalResize();

    animateZoomModal();
}

function animateZoomModal() {
    requestAnimationFrame(animateZoomModal);
    modalControls.update();
    modalRenderer.render(modalScene, modalCamera);
}

function onModalResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    modalCamera.aspect = width / height;
    modalCamera.updateProjectionMatrix();
    modalRenderer.setSize(width, height);
}

export function updateModalISSPosition(position) {
    if (modalISS) {
        modalISS.position.copy(position);
        earthMesh.position.set(0, 0, 0);

        const camOffset = new THREE.Vector3(0.1, 0.05, 0.1);
        modalCamera.position.copy(position.clone().add(camOffset));

        modalControls.target.copy(position);
        // modalCamera.lookAt(position);
    }
}


export function openZoomModal() {
    zoomModal.style.display = 'block';
}

export function closeZoomModal() {
    zoomModal.style.display = 'none';
}
