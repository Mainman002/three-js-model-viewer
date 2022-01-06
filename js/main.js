import * as THREE from '../node_modules/three/build/three.module.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from '../node_modules/three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from '../node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from '../node_modules/three/examples/jsm/postprocessing/ShaderPass.js';
import { LUTPass } from '../node_modules/three/examples/jsm/postprocessing/LUTPass.js';
import { LUTCubeLoader } from '../node_modules/three/examples/jsm/loaders/LUTCubeLoader.js';
import { GammaCorrectionShader } from '../node_modules/three/examples/jsm/shaders/GammaCorrectionShader.js';
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
let camera, scene, renderer;
let composer, lutPass;

init();
render();


function load_model(scene, src, model, pos, scale) {
    const loader = new GLTFLoader().setPath( `${src}` );
    loader.load( `${model}`, function ( gltf ) {
        let mesh = gltf.scene.children[0]
        mesh.position.x = pos.x;
        mesh.position.y = pos.y;
        mesh.position.z = pos.z;

        mesh.scale.x = scale.x;
        mesh.scale.y = scale.y;
        mesh.scale.z = scale.z;
        
        // mesh.castShadow = true;
        // mesh.receiveShadow = false;
        scene.add( gltf.scene );
        // return gltf.scene.children[0];
    });
}


function init() {
    // console.log("Test");

    const container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( params.fov, window.innerWidth / window.innerHeight, 0.25, 20 );
    camera.position.set( 0, 0, 0 );
    camera.position.x = -2.491410655022273;
    camera.position.y = 2;
    camera.position.z = 4;


    // const pointLight = new THREE.PointLight( 0xffffff, 100 );
    // camera.add( pointLight );

    scene = new THREE.Scene();

    // const dLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    // dLight.castShadow = true;
    // dLight.shadowDarkness = 0.5;
    // dLight.shadowCameraVisible = true;

    // dLight.shadowCameraRight    =  5;
    // dLight.shadowCameraLeft     = -5;
    // dLight.shadowCameraTop      =  5;
    // dLight.shadowCameraBottom   = -5;

    // scene.add( dLight );


    // var sLight = new THREE.SpotLight(0xF6F50B, 10); // spotfény segédgeometriával
    // sLight.position.set(-60, -17.5, 0);
    // sLight.castShadow = true;
    // sLight.distance = 100;
    // // sLight.target = obj;
    // sLight.angle = Math.PI * 0.2;
    // sLight.shadow.camera.near = 0.1;
    // sLight.shadow.camera.far = 100;
    // sLight.shadow.mapSize.width = 2048;
    // sLight.shadow.mapSize.height = 2048;

    // scene.add(sLight);

    // const spotLightHelper = new THREE.SpotLightHelper(sLight);
    // scene.add(spotLightHelper);


    // scene.add( new THREE.AmbientLight( 0x404040 ) );

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
        
    // Load Models
    load_model(scene, 'models/TieFighter/', 'TieFighter.gltf', 
    {x: 0, y: 1.2, z: 0}, 
    {x: 1, y: 1, z: 1});

    load_model(scene, 'models/TieFighter/', 'Floor.gltf', 
    {x: 0, y: -1.0, z: 0}, 
    {x: 2, y: 1, z: 2});

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    // renderer.shadowMapEnabled = true;
    // // renderer.shadowMapType = THREE.PCFSoftShadowMap;
    container.appendChild( renderer.domElement );

    const target = new THREE.WebGLRenderTarget( {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        encoding: THREE.sRGBEncoding
    } );

    const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
    bloomPass.threshold = params.bloomThreshold;
    bloomPass.strength = params.bloomStrength;
    bloomPass.radius = params.bloomRadius;

    // composer = new EffectComposer( renderer );
    // composer.addPass( renderScene );
    
    composer = new EffectComposer( renderer, target );
    composer.setPixelRatio( window.devicePixelRatio );
    composer.setSize( window.innerWidth, window.innerHeight );
    composer.addPass( new RenderPass( scene, camera ) );
    composer.addPass( new ShaderPass( GammaCorrectionShader ) );
    composer.addPass( bloomPass );

    lutPass = new LUTPass();
    composer.addPass( lutPass );

    const controls = new OrbitControls( camera, renderer.domElement );
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.target.set( 0, 0, - 0.2 );
    controls.update();

    gui = new GUI();

    // Camera Sub Panel
    const folder_camera = gui.addFolder ( `Camera` );

    folder_camera.add( params, 'fov', 0.1, 100 ).onChange( function ( value ) {
        camera.fov = Number( value );
        camera.updateProjectionMatrix();
    } );

    // Enviroment Sub Panel
    const folder_enviroment = gui.addFolder ( `Enviroment` );

    folder_enviroment.add( params, 'enabled' );
    folder_enviroment.add( params, 'lut', Object.keys( lutMap ) );
    folder_enviroment.add( params, 'intensity' ).min( 0 ).max( 1 );

    if ( renderer.capabilities.isWebGL2 ) {
        folder_enviroment.add( params, 'use2DLut' );
    } else {
        params.use2DLut = true;
    }

    // Bloom Sub Panel
    const folder_bloom = gui.addFolder ( `Bloom` );

    folder_bloom.add( params, 'exposure', 0.1, 2 ).onChange( function ( value ) {
        renderer.toneMappingExposure = Math.pow( value, 4.0 );
    } );

    folder_bloom.add( params, 'bloomThreshold', 0.0, 1.0 ).onChange( function ( value ) {
        bloomPass.threshold = Number( value );
    } );

    folder_bloom.add( params, 'bloomStrength', 0.0, 3.0 ).onChange( function ( value ) {
        bloomPass.strength = Number( value );
    } );

    folder_bloom.add( params, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {
        bloomPass.radius = Number( value );
    } );

    // Transform Sub Panel
    const folder_transform = gui.addFolder ( `Transform` );

    folder_transform.add( params, 'positionX', -10, 10 ).step( 0.01 ).onChange( function ( value ) {
        
    } );

    folder_transform.add( params, 'positionY', -10, 10 ).step( 0.01 ).onChange( function ( value ) {
        
    } );

    folder_transform.add( params, 'positionZ', -10, 10 ).step( 0.01 ).onChange( function ( value ) {
        
    } );

    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {
    const windowHalfX = window.innerWidth;
    const windowHalfY = window.innerHeight;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    // render();
  }

// function onWindowResize() {

//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();

//     renderer.setSize( window.innerWidth, window.innerHeight );
//     composer.setSize( window.innerWidth, window.innerHeight );

    // render();

// }

camera.position.y = camera.position.y + 0.5;

function render() {

    // console.log(`x: ${camera.position.x}, y: ${camera.position.y}, z: ${camera.position.z}`);

    requestAnimationFrame( render );

    lutPass.enabled = params.enabled && Boolean( lutMap[ params.lut ] );
    lutPass.intensity = params.intensity;
    if ( lutMap[ params.lut ] ) {

        const lut = lutMap[ params.lut ];
        lutPass.lut = params.use2DLut ? lut.texture : lut.texture3D;

    }

    composer.render();
    stats.update();

}