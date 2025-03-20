import * as THREE from 'three';

let satrec, issMarker, orbitLine, time = new Date();

export function initOrbitTracking(earthGroup) {
    const tleLine1 = "1 25544U 98067A   24079.50701389  .00002182  00000+0  45713-4 0  9993";
    const tleLine2 = "2 25544  51.6430 305.3977 0001743  60.3531  61.3484 15.50018572443459";
    satrec = satellite.twoline2satrec(tleLine1, tleLine2);

    const markerGeometry = new THREE.SphereGeometry(0.015, 8, 8);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    issMarker = new THREE.Mesh(markerGeometry, markerMaterial);
    earthGroup.add(issMarker);

    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffaa00 });
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(new Array(90).fill(0).map(() => new THREE.Vector3()));
    orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    earthGroup.add(orbitLine);
}

export function updateOrbit(earthGroup) {
    time = new Date();
    const gmst = satellite.gstime(time);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const positionGd = satellite.eciToGeodetic(positionEci, gmst);
    const lat = satellite.degreesLat(positionGd.latitude);
    const lon = satellite.degreesLong(positionGd.longitude);
    const alt = positionGd.height;

    const radius = 1.01 + (alt / 6771); // Normalize altitude
    const phi = (90 - lat) * Math.PI / 180;
    const theta = -lon * Math.PI / 180;
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    issMarker.position.set(x, y, z);

    // Orbit trail prediction
    const points = [];
    for (let i = 0; i <= 90; i++) {
        const future = new Date(time.getTime() + i * 60 * 1000);
        const gmstFuture = satellite.gstime(future);
        const pv = satellite.propagate(satrec, future);
        const eci = pv.position;
        const gd = satellite.eciToGeodetic(eci, gmstFuture);
        const latF = satellite.degreesLat(gd.latitude);
        const lonF = satellite.degreesLong(gd.longitude);
        const altF = gd.height;
        const rF = 1.01 + (altF / 6771);
        const phiF = (90 - latF) * Math.PI / 180;
        const thetaF = -lonF * Math.PI / 180;
        const px = rF * Math.sin(phiF) * Math.cos(thetaF);
        const py = rF * Math.cos(phiF);
        const pz = rF * Math.sin(phiF) * Math.sin(thetaF);
        points.push(new THREE.Vector3(px, py, pz));
    }
    orbitLine.geometry.setFromPoints(points);
}
