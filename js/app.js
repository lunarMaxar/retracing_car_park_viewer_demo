import * as THREE from 'three';
import { PCDLoader } from 'three/addons/loaders/PCDLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

const aspect = window.innerWidth / (window.innerHeight * 0.6);
const frustumSize = 0.14;
const camera = new THREE.OrthographicCamera(
    (frustumSize * aspect) / -2,
    (frustumSize * aspect) / 2,
    frustumSize / 2,
    frustumSize / -2,
    0.01,
    1000
);

camera.position.set(1, 1, 1);

const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight * 0.6);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

const loader = new PCDLoader();

fetch('models/model.pcd')
    .then(response => response.blob())
    .then(blob => {
        const objectURL = URL.createObjectURL(blob);
        loader.load(objectURL, function (points) {
            points.geometry.center();
            points.rotation.x = -Math.PI / 2;
            points.material.size = 0.002;
            points.material.color.setHex(0xffffff);
            scene.add(points);
            URL.revokeObjectURL(objectURL);
        });
    });

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

const toggleBtn = document.getElementById('toggle-button');
const videoPlayer = document.getElementById('video-player');
let showingVideo = false;

toggleBtn.addEventListener('click', () => {
    showingVideo = !showingVideo;
    if (showingVideo) {
        container.style.opacity = '0';
        container.style.visibility = 'hidden';

        videoPlayer.style.opacity = '1';
        videoPlayer.style.visibility = 'visible';
        videoPlayer.style.pointerEvents = 'auto';

        if (videoPlayer.readyState === 0) {
            videoPlayer.load();
        }

        const playPromise = videoPlayer.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Playback prevented by browser.");
            });
        }

        toggleBtn.textContent = 'Switch to 3D';
    } else {
        container.style.opacity = '1';
        container.style.visibility = 'visible';

        videoPlayer.style.opacity = '0';
        videoPlayer.style.visibility = 'hidden';
        videoPlayer.style.pointerEvents = 'none';

        videoPlayer.pause();
        toggleBtn.textContent = 'Switch to Video';
    }
});

window.addEventListener('resize', () => {
    const newAspect = window.innerWidth / (window.innerHeight * 0.6);
    camera.left = (frustumSize * newAspect) / -2;
    camera.right = (frustumSize * newAspect) / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight * 0.6);
});

const gisToggleBtn = document.getElementById('gis-toggle-btn');
const gisInfoPanel = document.getElementById('gis-info-panel');
let showingGis = false;

gisToggleBtn.addEventListener('click', () => {
    showingGis = !showingGis;
    if (showingGis) {
        gisInfoPanel.style.display = 'block';
    } else {
        gisInfoPanel.style.display = 'none';
    }
});

document.addEventListener('contextmenu', event => event.preventDefault());

document.addEventListener('keydown', event => {
    if (event.ctrlKey && (event.key === 's' || event.key === 'u')) {
        event.preventDefault();
    }
    if (event.key === 'F12') {
        event.preventDefault();
    }
});