import * as THREE from 'three';

let labels = [], raycaster = new THREE.Raycaster(), mouse = new THREE.Vector2(), lockedMarker = null;

export function initMarkers(earthGroup, camera) {
    fetch('./assets/launch_sites.json')
        .then(res => res.json())
        .then(data => {
            data.forEach(site => addMarker(site.lat, site.lon, site.name, 0x00ff00, earthGroup, camera));
        });

    window.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('click', () => {
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(earthGroup.children);
        for (const hit of hits) {
            if (hit.object.userData.label) {
                lockedMarker = hit.object;
                return;
            }
        }
        lockedMarker = null;
    });

    function addMarker(lat, lon, name, color, group, cam) {
        const phi = (90 - lat) * Math.PI / 180, theta = -lon * Math.PI / 180, r = 1.01;
        const x = r * Math.sin(phi) * Math.cos(theta), y = r * Math.cos(phi), z = r * Math.sin(phi) * Math.sin(theta);
        const marker = new THREE.Mesh(new THREE.SphereGeometry(0.02, 16, 16), new THREE.MeshBasicMaterial({ color }));
        marker.position.set(x, y, z); marker.userData.label = name;
        group.add(marker);

        const lbl = document.createElement('div');
        lbl.className = 'label'; lbl.textContent = name; document.body.appendChild(lbl);
        labels.push({ element: lbl, marker, cam });
    }

    setInterval(() => {
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(earthGroup.children);
        let hover = null;
        for (const hit of hits) {
            if (hit.object.userData.label) { hover = hit.object; break; }
        }
        labels.forEach(({ element, marker, cam }) => {
            const vec = marker.position.clone().applyMatrix4(earthGroup.matrixWorld).project(cam);
            element.style.left = `${(vec.x * 0.5 + 0.5) * window.innerWidth}px`;
            element.style.top = `${(-vec.y * 0.5 + 0.5) * window.innerHeight}px`;
            element.style.display = (marker === hover || marker === lockedMarker) ? 'block' : 'none';
        });
    }, 16);
}
