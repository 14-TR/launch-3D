import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export let rotationSpeed = 0.001, rotateEnabled = true;

export function initControls(camera, canvas) {
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    return controls;
}

export function handleUIControls() {
    document.getElementById('toggleRotation').addEventListener('click', () => {
        rotateEnabled = !rotateEnabled;
        document.getElementById('toggleRotation').textContent = rotateEnabled ? 'Pause' : 'Start';
    });
    document.getElementById('speedControl').addEventListener('input', (e) => {
        rotationSpeed = parseFloat(e.target.value);
    });
}
