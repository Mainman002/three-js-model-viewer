import * as THREE from '../node_modules/three/build/three.module.js';
import { TrackballControls } from 'https://cdn.skypack.dev/three/examples/jsm/controls/TrackballControls';
import { OrbitControls } from 'https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'https://cdn.skypack.dev/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'https://cdn.skypack.dev/three/examples/jsm/postprocessing/ShaderPass.js';
import { LUTPass } from 'https://cdn.skypack.dev/three/examples/jsm/postprocessing/LUTPass.js';
import { LUTCubeLoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/LUTCubeLoader.js';
import { GammaCorrectionShader } from 'https://cdn.skypack.dev/three/examples/jsm/shaders/GammaCorrectionShader.js';
import { GUI } from 'https://cdn.skypack.dev/three/examples/jsm/libs/lil-gui.module.min.js';

const params = {
    fov: 45,
    enabled: true,
    lut: 'Remy 24.CUBE',
    intensity: 0.4,
    use2DLut: false,
    exposure: 0.98,
    bloomStrength: 0.45,
    bloomThreshold: 0.75,
    bloomRadius: 0.1
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


function load_model(scene, src, model, pos) {
    const loader = new GLTFLoader().setPath( `${src}` );
    loader.load( `${model}`, function ( gltf ) {
        let mesh = gltf.scene.children[0]
        mesh.position.x = pos.x;
        mesh.position.y = pos.y;
        mesh.position.z = pos.z;
        scene.add( gltf.scene );
        // return gltf.scene.children[0];
    });
}


function init() {

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

    // scene.add( new THREE.AmbientLight( 0x404040 ) );

    new RGBELoader()
        .setPath( '../img/hdr/desert/' )
        .load( 'quarry_01_2k.hdr', function ( texture ) {

            texture.mapping = THREE.EquirectangularReflectionMapping;

            scene.background = texture;
            scene.environment = texture;

            // model
            // load_model(scene, '../models/TieFighter/', 'TieFighter.gltf');
            // load_model(scene, '../models/TieFighter/', 'Floor.gltf');

            // const loader = new GLTFLoader().setPath( '../models/TieFighter/' );
            // loader.load( 'TieFighter.gltf', function ( gltf ) {

            //     scene.add( gltf.scene );

            // } );

            // const loader = new GLTFLoader().setPath( '../models/TieFighter/' );
            // loader.load( 'TieFighter.gltf', function ( gltf ) {

            //     scene.add( gltf.scene );

            // } );

        } );

        
        Object.keys( lutMap ).forEach( name => {
            
            new LUTCubeLoader()
            .load( '../luts/' + name, function ( result ) {
                
                lutMap[ name ] = result;
                
            } );
            
        } );
        
    load_model(scene, '../models/TieFighter/', 'TieFighter.gltf', {x: 0, y: 1.2, z: 0} );
    load_model(scene, '../models/TieFighter/', 'Floor.gltf', {x: 0, y: 0, z: 0} );

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
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
    gui.width = 350;

    gui.add( params, 'fov', 0.1, 100 ).onChange( function ( value ) {
        camera.fov = Number( value );
        camera.updateProjectionMatrix();
    } );

    gui.add( params, 'enabled' );
    gui.add( params, 'lut', Object.keys( lutMap ) );
    gui.add( params, 'intensity' ).min( 0 ).max( 1 );

    gui.add( params, 'exposure', 0.1, 2 ).onChange( function ( value ) {
        renderer.toneMappingExposure = Math.pow( value, 4.0 );
    } );

    gui.add( params, 'bloomThreshold', 0.0, 1.0 ).onChange( function ( value ) {
        bloomPass.threshold = Number( value );
    } );

    gui.add( params, 'bloomStrength', 0.0, 3.0 ).onChange( function ( value ) {
        bloomPass.strength = Number( value );
    } );

    gui.add( params, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {
        bloomPass.radius = Number( value );
    } );

    if ( renderer.capabilities.isWebGL2 ) {
        gui.add( params, 'use2DLut' );
    } else {
        params.use2DLut = true;
    }

    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    composer.setSize( window.innerWidth, window.innerHeight );

    render();

}

camera.position.y = camera.position.y + 0.5;

function render() {

    console.log(`x: ${camera.position.x}, y: ${camera.position.y}, z: ${camera.position.z}`);

    requestAnimationFrame( render );

    lutPass.enabled = params.enabled && Boolean( lutMap[ params.lut ] );
    lutPass.intensity = params.intensity;
    if ( lutMap[ params.lut ] ) {

        const lut = lutMap[ params.lut ];
        lutPass.lut = params.use2DLut ? lut.texture : lut.texture3D;

    }

    composer.render();

}