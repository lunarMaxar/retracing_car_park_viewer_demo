import * as THREE from 'three';
import { PCDLoader } from 'three/addons/loaders/PCDLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

const getContainerHeight = () => {
    return window.innerHeight > window.innerWidth ? window.innerHeight : window.innerHeight * 0.6;
};

let currentHeight = getContainerHeight();
const aspect = window.innerWidth / currentHeight;
const frustumSize = 0.1; 
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
renderer.setSize(window.innerWidth, currentHeight);
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
        container.classList.add('hidden-canvas');
        videoPlayer.classList.add('active-video');
        
        videoPlayer.load();
        const playPromise = videoPlayer.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Playback blocked");
            });
        }
        
        toggleBtn.textContent = 'Switch to 3D';
    } else {
        container.classList.remove('hidden-canvas');
        videoPlayer.classList.remove('active-video');
        videoPlayer.pause();
        toggleBtn.textContent = 'Switch to Video';
    }
});

window.addEventListener('resize', () => {
    currentHeight = getContainerHeight();
    const newAspect = window.innerWidth / currentHeight;
    camera.left = (frustumSize * newAspect) / -2;
    camera.right = (frustumSize * newAspect) / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, currentHeight);
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
