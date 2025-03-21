import * as THREE from 'three';
const TWEEN = window.TWEEN;

export function zoomToSatellite(camera, targetPosition) {
    const zoomDistance = 0.01;  // Tight zoom
    const camDir = new THREE.Vector3().subVectors(camera.position, targetPosition).normalize();
    const zoomTarget = targetPosition.clone().add(camDir.multiplyScalar(zoomDistance));

    new TWEEN.Tween(camera.position)
        .to({ x: zoomTarget.x, y: zoomTarget.y, z: zoomTarget.z }, 800)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

    new TWEEN.Tween({})
        .to({}, 800)
        .onUpdate(() => {
            camera.lookAt(targetPosition);
        })
        .start();
}
