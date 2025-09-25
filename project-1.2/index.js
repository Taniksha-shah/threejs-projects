//basic three.js setup
import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js" ;

const w = window.innerWidth;
const h = window.innerHeight;
const renderer = new THREE.WebGLRenderer({ antialias: true});
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

const fov = 75;   //75deg field of view
const aspect = w/h;
const near = 0.1;
const far = 10;
const camera = new THREE.PerspectiveCamera(fov,aspect,near,far);
camera.position.z = 5;
const scene = new THREE.Scene();

//orbit controls to control camera angles n stuff
const controls = new OrbitControls(camera, renderer.domElement);
controls.dampingFactor = 0.03;

//adding elements now...
const geo = new THREE.DodecahedronGeometry(3.0, 0);   //parameters -> (radius, details)
const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    flatShading: true      
});
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

const wireMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true
});
const wireMesh = new THREE.Mesh(geo, wireMat);
wireMesh.scale.setScalar(1.001);
mesh.add(wireMesh);     //adding wireMesh as a child to the mesh instead of whole scene so that wiremesh rotates with geo

//adding lights
const pointLight = new THREE.RectAreaLight(0xaa5500, 10.0, 10.0, 10.0);
pointLight.position.set(3, 3, 3); 
scene.add(pointLight);

//animation
function animate(t=0) {
    requestAnimationFrame(animate);
    mesh.rotation.y = t*0.0001;

    //rendering the scene
    renderer.render(scene, camera);
    controls.update();  //updates controls every frame
}
animate();

