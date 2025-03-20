import * as THREE from 'three';

export function initEarthGroup() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    const loader = new THREE.TextureLoader();
    const texture = loader.load('./assets/img/earthmap1k.jpg');
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), new THREE.MeshStandardMaterial({ map: texture, roughness: 0.5 }));
    earthGroup.add(sphere);

    const latLongGroup = new THREE.Group();
    const latSeg = 9, lonSeg = 18, segments = 64;

    for (let i = 1; i < latSeg; i++) {
        const latAngle = (i / latSeg) * Math.PI - Math.PI / 2;
        const r = Math.cos(latAngle), y = Math.sin(latAngle);
        const points = Array.from({ length: segments+1 }, (_, k) => {
            const theta = (k / segments) * 2 * Math.PI;
            return new THREE.Vector3(Math.cos(theta)*r, y, Math.sin(theta)*r);
        });
        latLongGroup.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: 0x4444ff })));
    }

    for (let j = 0; j < lonSeg; j++) {
        const lonAngle = (j / lonSeg) * 2 * Math.PI;
        const points = Array.from({ length: segments+1 }, (_, k) => {
            const phi = (k / segments) * Math.PI - Math.PI / 2;
            return new THREE.Vector3(Math.cos(phi)*Math.cos(lonAngle), Math.sin(phi), Math.cos(phi)*Math.sin(lonAngle));
        });
        latLongGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: 0x44ff44 })));
    }

    earthGroup.add(latLongGroup);
    scene.add(new THREE.AxesHelper(2));

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    const directional = new THREE.DirectionalLight(0xffffff, 1);
    directional.position.set(5, 5, 5);
    scene.add(ambient, directional);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return { earthGroup, scene, camera, renderer };
}
