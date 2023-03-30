import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js'
import { Object3D, TextureLoader } from 'three';

let texture;

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const colors = {
    red: 0xff0000,
    green: 0x00ff00,
    blue: 0x0000ff,
};

const testTextureURL = new URL('../textures/object_textures/TestPattern.jpg', import.meta.url);
const testTexture = new THREE.TextureLoader().load(testTextureURL.href);

const spaceURL = new URL('../textures/backgrounds/Space.jpg', import.meta.url);
const space = new THREE.TextureLoader().load(spaceURL.href);

scene.background = space;

const textures = {
    pattern1: space,
    pattern2: testTexture
}

const light = new THREE.AmbientLight(0xffffff);
scene.add(light);


const controls = new OrbitControls(camera, renderer.domElement);

controls.panSpeed = 2;
controls.rotateSpeed = 2;
controls.enablePan = true;

const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);

camera.position.set(0, 2, 5);

const loader = new GLTFLoader();
const Tloader = new TextureLoader();
const Dloader = new DRACOLoader();

Dloader.setDecoderPath('/node_modules/three/examples/jsm/libs/draco/');

Dloader.preload();
//Dloader.setDecoderConfig({ type: 'js' });
loader.setDRACOLoader(Dloader);

const testModelURL = new URL('../models/temp.gltf', import.meta.url);

loader.load(testModelURL.href, function(gltf) {
    const tempSkin = new gltf.scene;
    //tempSkin.traverse(function(node) {
        //if(node instanceof THREE.Mesh) {
            //node.material.map = testTexture;
        //}
    //})
    //tempSkin.scale(0.5, 0.5, 0.5);
    //tempSkin.position(-5, 0, 0);
    scene.add(tempSkin);
}, undefined, undefined);

const wraithURL = new URL('../models/wraith/scene.glb', import.meta.url);

loader.load(wraithURL.href, function(gltf) {
    const wraithSkin = gltf.scene;
    wraithSkin.scale.set(0.1, 0.1, 0.1);
    scene.add(wraithSkin);
}, undefined, undefined);

loader.load(wraithURL.href, function(gltf) {
    const wraithMesh = gltf.scene;
    wraithMesh.traverse(function(node) {
        if (node instanceof THREE.Mesh) {
            node.material.map = testTexture;
        }
    });
    wraithMesh.scale.set(0.1, 0.1, 0.1);
    wraithMesh.position.set(5, 0, 0);
    scene.add(wraithMesh);
});

loader.load(wraithURL.href, function(gltf) {
    const wraithMesh = gltf.scene;
    wraithMesh.name = 'wraith';
    material = new THREE.MeshBasicMaterial({ color: colors.red });
    texture = new THREE.TextureLoader().load(testTextureURL.href);
    wraithMesh.traverse(function(node) {
        if (node instanceof THREE.Mesh) {
            node.material = material;
            node.material.map = texture;
        }
    });
    wraithMesh.scale.set(0.1, 0.1, 0.1);
    wraithMesh.position.set(10, 0, 0);
    wraithMesh.name = 'wraith';
    console.log(wraithMesh.name);
    scene.add(wraithMesh);
    var movement = { left: 0, right: 0, up: 0, down: 0 };
});

var wraithModel = scene.getObjectByName("wraith");

console.log(scene.getObjectByName('wraith'));

document.getElementById("red").addEventListener("click", function () {
    material.color.setHex(colors.red);
});
document.getElementById("green").addEventListener("click", function () {
    material.color.setHex(colors.green);
});
document.getElementById("blue").addEventListener("click", function () {
    material.color.setHex(colors.blue);
});
document.getElementById("texture1").addEventListener("click", function () {
    material.map = textures.pattern1;
});
document.getElementById("texture2").addEventListener("click", function () {
    material.map = textures.pattern2;
});
document.addEventListener("keypress", function(event) {
    if(event.key === "r") {
        material.color.setHex(colors.red);
    }
});
document.addEventListener("keypress", function(event) {
    if(event.key === "b") {
        material.color.setHex(colors.blue);
    }
});
document.addEventListener("keypress", function(event) {
    if(event.key === "g") {
        material.color.setHex(colors.green);
    }
});
document.addEventListener("keypress", function(event) {
    if(event.key === "w") {
        document.getElementById("wraith").position.add(1, 0, 0);
    }
})

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();