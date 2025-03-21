import * as THREE from 'three';
import { zoomToSatellite } from './zoomHandler.js';
import { initZoomModal, updateModalISSPosition, openZoomModal, closeZoomModal } from './zoomModal.js';

const TWEEN = window.TWEEN;

let satrec, issMarker, orbitLine, time = new Date();
let issLabel, lockedISS = false;

export function initOrbitTracking(earthGroup, camera) {
    initZoomModal();

    const tleLine1 = "1 25544U 98067A   24079.50701389  .00002182  00000+0  45713-4 0  9993";
    const tleLine2 = "2 25544  51.6430 305.3977 0001743  60.3531  61.3484 15.50018572443459";
    satrec = satellite.twoline2satrec(tleLine1, tleLine2);

    const markerGeometry = new THREE.SphereGeometry(0.008, 8, 8);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    issMarker = new THREE.Mesh(markerGeometry, markerMaterial);
    issMarker.userData.label = "ISS";
    earthGroup.add(issMarker);

    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffaa00 });
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(new Array(90).fill(0).map(() => new THREE.Vector3()));
    orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    earthGroup.add(orbitLine);

    issLabel = document.createElement('div');
    issLabel.className = 'label';
    issLabel.textContent = 'ISS';
    document.body.appendChild(issLabel);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    window.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('click', () => {
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObject(issMarker);
        if (hits.length > 0) {
            lockedISS = true;
            document.getElementById('hudName').textContent = 'ISS';
            document.getElementById('satHUD').style.display = 'block';
            zoomToSatellite(camera, issMarker.position);
            openZoomModal(); // 🛰️ Open modal view
        } else {
            lockedISS = false;
            document.getElementById('satHUD').style.display = 'none';
            closeZoomModal(); // Close modal if not locked
        }
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
}

export function updateOrbit(earthGroup, camera) {
    time = new Date();
    const gmst = satellite.gstime(time);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const positionGd = satellite.eciToGeodetic(positionEci, gmst);
    const lat = satellite.degreesLat(positionGd.latitude);
    const lon = satellite.degreesLong(positionGd.longitude);
    const altKm = positionGd.height * 6371;

    const normalizedAlt = 1.05;
    const phi = (90 - lat) * Math.PI / 180;
    const theta = -lon * Math.PI / 180;
    const x = normalizedAlt * Math.sin(phi) * Math.cos(theta);
    const y = normalizedAlt * Math.cos(phi);
    const z = normalizedAlt * Math.sin(phi) * Math.sin(theta);
    issMarker.position.set(x, y, z);

    if (lockedISS) {
        document.getElementById('hudLat').textContent = lat.toFixed(2);
        document.getElementById('hudLon').textContent = lon.toFixed(2);
        document.getElementById('hudAlt').textContent = altKm.toFixed(0);
    }

    const vector = issMarker.position.clone().project(camera);
    const screenX = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const screenY = (-vector.y * 0.5 + 0.5) * window.innerHeight;
    issLabel.style.left = `${screenX}px`;
    issLabel.style.top = `${screenY}px`;
    issLabel.style.display = lockedISS ? 'none' : 'block';

    const points = [];
    for (let i = 0; i <= 90; i++) {
        const future = new Date(time.getTime() + i * 60 * 1000);
        const gmstFuture = satellite.gstime(future);
        const pv = satellite.propagate(satrec, future);
        const eci = pv.position;
        const gd = satellite.eciToGeodetic(eci, gmstFuture);
        const latF = satellite.degreesLat(gd.latitude);
        const lonF = satellite.degreesLong(gd.longitude);
        const normAltF = 1.05;
        const phiF = (90 - latF) * Math.PI / 180;
        const thetaF = -lonF * Math.PI / 180;
        const px = normAltF * Math.sin(phiF) * Math.cos(thetaF);
        const py = normAltF * Math.cos(phiF);
        const pz = normAltF * Math.sin(phiF) * Math.sin(thetaF);
        points.push(new THREE.Vector3(px, py, pz));
    }
    orbitLine.geometry.setFromPoints(points);

    updateModalISSPosition(issMarker.position); // Sync position to modal
}
