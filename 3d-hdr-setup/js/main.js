import * as THREE from '../node_modules/three/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/RGBELoader.js';
import { DRACOLoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/DRACOLoader';
import { DataTextureLoader } from 'https://cdn.skypack.dev/three/src/loaders/DataTextureLoader';
import { EffectComposer } from 'https://cdn.skypack.dev/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'https://cdn.skypack.dev/three/examples/jsm/postprocessing/ShaderPass.js';
import { LUTPass } from 'https://cdn.skypack.dev/three/examples/jsm/postprocessing/LUTPass.js';
import { LUTCubeLoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/LUTCubeLoader.js';
import { GammaCorrectionShader } from 'https://cdn.skypack.dev/three/examples/jsm/shaders/GammaCorrectionShader.js';
import Stats from '../node_modules/three/examples/jsm/libs/stats.module.js';
import { GUI } from '../node_modules/three/examples/jsm/libs/lil-gui.module.min.js';

const stats = Stats();
document.body.appendChild(stats.dom);

const params = {
    fov: 45,
    enabled: true,
    lut: 'Remy 24.CUBE',
    intensity: 0.4,
    use2DLut: false,
    exposure: 0.98,
    bloomStrength: 0.45,
    bloomThreshold: 0.75,
    bloomRadius: 0.1,
    positionX: 0,
    positionY: 0,
    positionZ: 0 
};

const lutMap = {
    'Bourbon 64.CUBE': null,
    'Chemical 168.CUBE': null,
    'Clayton 33.CUBE': null,
    'Cubicle 99.CUBE': null,
    'Remy 24.CUBE': null,

    'Arabica 12.CUBE': null,
    'Ava 614.CUBE': null,
    'Azrael 93.CUBE': null,
    'Byers 11.CUBE': null,
    'Clouseau 54.CUBE': null,
    'Cobi 3.CUBE': null,
    'Contrail 35.CUBE': null,
    'Django 25.CUBE': null,
    'Domingo 145.CUBE': null,
    'Faded 47.CUBE': null,
    'Folger 50.CUBE': null,
    'Fusion 88.CUBE': null,
    'Hyla 68.CUBE': null,
    'Korben 214.CUBE': null,

    'Lenox 340.CUBE': null,
    'Lucky 64.CUBE': null,
    'McKinnon 75.CUBE': null,
    'Milo 5.CUBE': null,
    'Neon 770.CUBE': null,
};

let gui;
// let camera, scene, renderer;
let composer, lutPass;

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdddddd);

// Camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.6, 1200);
camera.position.z = 5; // Set camera position

// Renderer
const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
// const renderer = new THREE.WebGLRenderer({antialias: true});
// renderer.toneMapping = THREE.LinearToneMapping;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 2.3;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.physicallyCorrectLights = true
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement); // Add renderer to HTML as a canvas element

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
    

class Main {
    constructor() {
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;
        this.objects = [];
        this.lights = [];
        this.spotLight = new THREE.SpotLight(0xffa95c, 5);

        // Light Values
        this.lightValues = [
            {colour: 0xFFFFFF, intensity: 1, dist: 12, x: 1, y: 0, z: 8},
            {colour: 0xFFFFFF, intensity: 1, dist: 12, x: -2, y: 1, z: -10},
            {colour: 0xFFFFFF, intensity: 1, dist: 10, x: 0, y: 10, z: 1},
            {colour: 0xFFFFFF, intensity: 1, dist: 12, x: 0, y: -10, z: -1},
            {colour: 0xFFFFFF, intensity: 1, dist: 12, x: 10, y: 3, z: 0},
            {colour: 0xFFFFFF, intensity: 1, dist: 12, x: -10, y: -1, z: 0}
        ];

        // Lights
        this.lightHelpers = [];

        // Controlls
        this.controls = controls;
    }

    init() {
        this.camera.position.set( 0, 0, 0 );
        this.camera.position.x = -2.491410655022273;
        this.camera.position.y = 2;
        this.camera.position.z = 4;
        // this.camera.position.z = 5; // Set camera position
        let count = 0, cubeCamera1, cubeCamera2, cubeRenderTarget1, cubeRenderTarget2;

        // this.renderer.setClearColor("#233143"); // Set background colour
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        document.body.appendChild(this.renderer.domElement); // Add renderer to HTML as a canvas element

        const dLight = new THREE.DirectionalLight( 0xff0000, 1 );
        dLight.castShadow = true;

        const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0x000020, 1);
        // hemiLight.castShadow = true;
        this.scene.add(hemiLight);

        const ambientLight = new THREE.AmbientLight( 0xffffff, 0.3 );
        // ambientLight.castShadow = true;
        scene.add(ambientLight);

        // const spotLight = new THREE.SpotLight (0xffffff, 19, 1, 0, 1, 1);
        // spotLight.position.y -= 5;
        // scene.add( spotLight );

        // const spotLight = new THREE.SpotLight(0xffa95c, 5);
        // this.spotLight.castShadow = true;
        // this.scene.add(this.spotLight);

        // Axes Helper
        // const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(new THREE.AxesHelper(5)); // X == red, Y == green, Z == blue

        // Cube
        // let geometry = new THREE.BoxGeometry( 1,1,1 );
        // let material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
        // let material = new THREE.MeshPhongMaterial( {color: 0xff0000} );
        // let material = new THREE.MeshPhysicalMaterial( {color: 0xff0000, metalness: 0, roughness: 0.5} );
        // let cube = new THREE.Mesh( geometry, material );
        // scene.add(cube);

        // create_hdr();

        const textureLoader = new THREE.TextureLoader();
        textureLoader.load( 'img/hdr/desert/quarry_01_2k.jpg', function ( texture ) {
            texture.encoding = THREE.sRGBEncoding;
            texture.mapping = THREE.EquirectangularReflectionMapping;
            init( texture );
            // animate();
        } );

        function load_model(scene, src, model, pos, scale, material) {
            const loader = new GLTFLoader().setPath( `${src}` );
            loader.load( `${model}`, function ( gltf ) {
                let mesh = gltf.scene.children[0]
                // mesh.material = material;
                mesh.position.x = pos.x;
                mesh.position.y = pos.y;
                mesh.position.z = pos.z;
        
                mesh.scale.x = scale.x;
                mesh.scale.y = scale.y;
                mesh.scale.z = scale.z;

                
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                scene.add( gltf.scene );
                // return gltf.scene.children[0];

                setMaterialsOnGLTF( gltf.scene );
            });
        }

        function setMaterialsOnGLTF(object3D) {
            if (object3D.material) {
              const newMaterial = new THREE.MeshPhysicalMaterial( { map: object3D.material.map } );
              object3D.material = newMaterial;
            }
            if (!object3D.children) {
              return;
            }
            // for (let i = 0; i < object3D.children.length; i++) {
            //   Utilities.setMaterialsOnGLTF(object3D.children[i]);
            // }
          }

        function init( texture ) {
            new RGBELoader()
            .setPath( 'img/hdr/desert/' )
            .load( 'quarry_01_2k.hdr', function ( texture ) {

                texture.mapping = THREE.EquirectangularReflectionMapping;

                scene.background = texture;
                scene.environment = texture;
            } );

            Object.keys( lutMap ).forEach( name => {
                new LUTCubeLoader()
                .load( 'luts/' + name, function ( result ) {
                    lutMap[ name ] = result;
                } );
            } );

            const chromeParams = {
                clearcoat: 1.0,
                metalness: 1,
                roughness:0.3,
                color: 0x8418ca,
                normalMap: scene.background ,
                normalScale: new THREE.Vector2(0.15,0.15),
                envMap: scene.environment
              };

            const chromeMaterial = new THREE.MeshPhysicalMaterial( chromeParams );

            // Load Models
            load_model(scene, 'models/TieFighter/', 'TieFighter.gltf', 
            {x: 0, y: 1.2, z: 0}, 
            {x: 1, y: 1, z: 1}, 
            chromeMaterial);

            load_model(scene, 'models/Floor/', 'Floor.gltf', 
            {x: 0, y: -1.0, z: 0}, 
            {x: 2, y: 1, z: 2}, 
            chromeMaterial);

            cubeRenderTarget1 = new THREE.WebGLCubeRenderTarget( 256, {
                format: THREE.RGBFormat,
                generateMipmaps: true,
                minFilter: THREE.LinearMipmapLinearFilter,
                encoding: THREE.sRGBEncoding // temporary -- to prevent the material's shader from recompiling every frame
            } );

            cubeCamera1 = new THREE.CubeCamera( 1, 1000, cubeRenderTarget1 );

            cubeRenderTarget2 = new THREE.WebGLCubeRenderTarget( 256, {
                format: THREE.RGBFormat,
                generateMipmaps: true,
                minFilter: THREE.LinearMipmapLinearFilter,
                encoding: THREE.sRGBEncoding
            } );

            cubeCamera2 = new THREE.CubeCamera( 1, 1000, cubeRenderTarget2 );

            // material = new THREE.MeshBasicMaterial( {
            //     envMap: cubeRenderTarget2.texture,
            //     combine: THREE.MultiplyOperation,
            //     reflectivity: 1
            // } );
        }





        // this.scene = new THREE.Scene();
        // this.renderer = new THREE.WebGLRenderer({alpha:true,antialias:true});
        // this.renderer.setSize(window.innerWidth,window.innerHeight);
        // document.body.appendChild(this.renderer.domElement);
        // this.camera = new THREE.PerspectiveCamera(50,window.innerWidth/window.innerHeight,1,1000);
        // this.camera.position.set(0,0,500);
        // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        
        // let pointlight = THREE.PointLight(0xffffff,1);
        // pointlight.position.set(200,200,200);
        // this.scene.add(pointlight);

        // let texture = new THREE.CanvasTexture(new FlakesTexture());
        // texture.wrapS = THREE.RepeatWrapping;
        // texture.wrapT = THREE.RepeatWrapping;
        // //repeat the wrapping 10 (x) and 6 (y) times
        // texture.repeat.x = 10;
        // texture.repeat.y = 6;

        // const ballMaterial = {
        //     clearcoat: 1.0,
        //     metalness: 0.9,
        //     roughness:0.5,
        //     color: 0x8418ca,
        //     normalMap: scene.background ,
        //     normalScale: new THREE.Vector2(0.15,0.15),
        //     envMap: scene.environment
        //   };

          // Cube
        // let geometry = new THREE.BoxGeometry( 1,1,1 );
        // let material = new THREE.MeshPhysicalMaterial( {color: 0xff0000, roughness: 0.0, metalness: 1} );
        // let cube = new THREE.Mesh( geometry, material );
        // this.scene.add(cube);

        console.log("Main Started");
    }

    draw() {
        // Don't add objects from process functions

        // Draw Scene
        this.renderer.render(this.scene, this.camera);
    }

    update(dt) {
        // Don't add objects from process functions

        this.spotLight.position.set(
            this.camera.position.x + 10,
            this.camera.position.y + 10,
            this.camera.position.z + 10);
        this.controls.update();
    }
}



window.addEventListener('load', (e) => {
    const main = new(Main);
    main.init();
    
    window.addEventListener('resize', (e) => {

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        canvas.style.width = canvas.width;
        canvas.style.height = canvas.height; 

        main.renderer.setSize(canvas.width, canvas.height); // Update size
        
        // main.camera.aspect = canvas.width / canvas.height; // Update aspect ratio
        main.camera.aspect = canvas.clientWidth / canvas.clientHeight;

        main.camera.updateProjectionMatrix(); // Apply changes
    });

    // window.addEventListener('resize', (e) => {
    //     main.renderer.setSize(window.innerWidth*0.5, window.innerHeight*0.5); // Update size
    //     main.camera.aspect = window.innerWidth / window.innerHeight; // Update aspect ratio
    //     main.camera.updateProjectionMatrix(); // Apply changes
    // });
    
    let lastTime = 1;
    function animate(timeStamp) {
        if (!timeStamp) timeStamp = 0;

        const dt = timeStamp - lastTime;
        lastTime = timeStamp;

        main.update(dt);
        main.draw();
        stats.update();

        requestAnimationFrame(animate);
    }
    animate();
});



