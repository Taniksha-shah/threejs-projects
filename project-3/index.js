//basic three.js setup
import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js" ;
import spline from "./spline.js";
import { UnrealBloomPass } from "jsm/postprocessing/UnrealBloomPass.js";
import { EffectComposer } from "jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "jsm/postprocessing/RenderPass.js";

const w = window.innerWidth;
const h = window.innerHeight;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(w, h);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const fov = 75;   //75deg field of view
const aspect = w/h;
const near = 0.1;
const far = 1000;
const camera = new THREE.PerspectiveCamera(fov,aspect,near,far);
camera.position.z = 5;
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.3);

//orbit controls to control camera angles n stuff
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

//post-processing
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(w,h), 1.5, 0.4, 100);
bloomPass.threshold = 0.02;
bloomPass.strength = 3.5;
bloomPass.radius = 0;
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

//adding elements now...
//a line geometry from the spline
const points = spline.getPoints(100);
const geometry = new THREE.BufferGeometry().setFromPoints(points);
const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
const line = new THREE.Line(geometry, material);
//scene.add(line);

//a tube geometry from the spline
const tubeGeo = new THREE.TubeGeometry(spline, 222, 0.65, 16, true);
const tubeMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    //side: THREE.DoubleSide,
    wireframe: true
});
const tube = new THREE.Mesh(tubeGeo, tubeMat);
//scene.add(tube);

//edge geometry 
const edges = new THREE.EdgesGeometry(tubeGeo, 0.2);
const color = new THREE.Color().setHSL(1.0, 1, 0.8);
const lineMat = new THREE.LineBasicMaterial({ color });
const tubeLines = new THREE.LineSegments(edges, lineMat);
scene.add(tubeLines);


// const wireMat = new THREE.MeshBasicMaterial({
//     color: 0xffffff,
//     wireframe: true
// });
// const wireMesh = new THREE.Mesh(geo, wireMat);
// wireMesh.scale.setScalar(1.001);
// mesh.add(wireMesh);     //adding wireMesh as a child to the mesh instead of whole scene so that wiremesh rotates with geo

//adding lights
// const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
// scene.add(hemiLight);

const numBoxes = 55;
const size = 0.075;
const boxGeo = new THREE.BoxGeometry(size, size, size);
for (let i=0; i<numBoxes; i++) {
    const boxMat = new THREE.MeshBasicMaterial({
        color:0xffffff,
        wireframe: true
    });
    const box = new THREE.Mesh(boxGeo, boxMat);
    const p = (i / numBoxes + Math.random() * 0.1) % 1;
    const pos = tubeGeo.parameters.path.getPointAt(p);
    pos.x += Math.random() - 0.4;
    pos.z += Math.random() - 0.4;
    box.position.copy(pos);
    const rote = new THREE.Vector3(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    );

    const edges = new THREE.EdgesGeometry(boxGeo, 0.2);
    const color = new THREE.Color().setHSL(1.0 - p, 1, 0.5);
    const lineMat = new THREE.LineBasicMaterial({ color });
    const boxLines = new THREE.LineSegments(edges, lineMat);
    boxLines.position.copy(pos);
    boxLines.rotation.set(rote.x, rote.y, rote.z);
    box.rotation.set(rote.x,rote.y,rote.z);
    scene.add(box);
    scene.add(boxLines);

}

function updateCamera(t) {
    const time = t*0.1;
    const looptime = 7*1000;
    const p = (time % looptime) / looptime;
    const pos = tubeGeo.parameters.path.getPointAt(p);
    const lookAt = tubeGeo.parameters.path.getPointAt((p + 0.03) % 1);
    camera.position.copy(pos);
    camera.lookAt(lookAt);
}
//animation
function animate(t=0) {
    requestAnimationFrame(animate);

    //update camera
    updateCamera(t);

    //rendering the scene
    composer.render(scene, camera);
    controls.update();  //updates controls every frame
}
animate();

function handleWindowSize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
}

window.addEventListener('resize', handleWindowSize);