import * as THREE from 'three'; // Import Three.js
import 'leaflet'; // Import Leaflet.js

// Initialize the Leaflet map, centered on Surabaya
const map = L.map('map').setView([-7.2575, 112.7521], 13); // Surabaya coordinates, zoom level 13

// Add OpenStreetMap tiles (free and open-source)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// Create a WebGL Renderer for Three.js
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Add the Three.js canvas to the map container
const mapContainer = document.getElementById('map');
mapContainer.appendChild(renderer.domElement);

// Create a Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// Set the camera position (adjust altitude for the view)
camera.position.set(0, 0, 500);

// Add light to the scene
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 0, 500).normalize();
scene.add(light);

// GeoJSON for agricultural land in Surabaya
const geojson = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [112.7468, -7.2596],
                        [112.7480, -7.2596],
                        [112.7480, -7.2610],
                        [112.7468, -7.2610],
                        [112.7468, -7.2596],
                    ],
                ],
            },
            properties: {
                crop: 'Rice',
                soil_quality: 'High',
                water_availability: 'Adequate',
            },
        },
        {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [112.7490, -7.2590],
                        [112.7502, -7.2590],
                        [112.7502, -7.2604],
                        [112.7490, -7.2604],
                        [112.7490, -7.2590],
                    ],
                ],
            },
            properties: {
                crop: 'Corn',
                soil_quality: 'Medium',
                water_availability: 'Low',
            },
        },
    ],
};

// Convert geographic coordinates to Three.js coordinates
function latLngToXYZ(lat, lng) {
    const x = (lng - 112.7521) * 5000; // Adjust scale
    const y = (-lat + 7.2575) * 5000;
    return { x, y };
}

// Render 3D agricultural plots
geojson.features.forEach((feature) => {
    const coordinates = feature.geometry.coordinates[0];
    const [lng, lat] = coordinates[0]; // Use the first coordinate

    const { x, y } = latLngToXYZ(lat, lng);

    // Create a 3D object for the plot
    const geometry = new THREE.BoxGeometry(100, 100, 50); // Adjust size
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Green color
    const box = new THREE.Mesh(geometry, material);

    box.position.set(x, y, 25); // Center and altitude
    scene.add(box);

    // Add interactivity: Log properties on click
    box.userData = feature.properties; // Attach data
    box.callback = () => {
        alert(
            `Crop: ${box.userData.crop}\nSoil Quality: ${box.userData.soil_quality}\nWater Availability: ${box.userData.water_availability}`
        );
    };

    // Event listener for clicking the box
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    window.addEventListener('click', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children);
        if (intersects.length > 0 && intersects[0].object.callback) {
            intersects[0].object.callback();
        }
    });
});

// Animation loop to render Three.js scene
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
