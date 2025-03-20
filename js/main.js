import { initEarthGroup } from './earth.js';
import { initMarkers } from './markerManager.js';
import { initControls, handleUIControls } from './controls.js';
import { animateWithOrbit } from './animation.js';
import { initOrbitTracking, updateOrbit } from './orbitTracker.js';

export let earthGroup, scene, camera, renderer, controls;

function init() {
    ({ earthGroup, scene, camera, renderer } = initEarthGroup());
    controls = initControls(camera, renderer.domElement);
    initMarkers(earthGroup, camera);
    initOrbitTracking(earthGroup);
    handleUIControls();
    animateWithOrbit(earthGroup, controls, camera, renderer, updateOrbit);
}

console.log('Satellite global:', window.satellite);

document.addEventListener('DOMContentLoaded', () => {
    if (window.satellite) {
        console.log('Satellite.js loaded successfully. Initializing...');
        init();
    } else {
        console.error('Satellite.js still failed after DOM loaded.');
    }
});