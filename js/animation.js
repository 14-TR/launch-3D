import { rotationSpeed, rotateEnabled } from './controls.js';

export function animateWithOrbit(earthGroup, controls, camera, renderer, updateOrbit) {
    function loop() {
        requestAnimationFrame(loop);
        if (rotateEnabled) earthGroup.rotation.y += rotationSpeed;
        updateOrbit(earthGroup); // ⬅️ Update satellite position + orbit
        controls.update();
        renderer.render(camera.parent || camera.scene || earthGroup.parent, camera);
    }
    loop();
}
