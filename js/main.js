var clock = new THREE.Clock();
var camera, scene, render;
var geometry, material, mesh;
var controls, mouse;

window.addEventListener("load", function() {
    if (navigator.getVRDevices) {
        navigator.getVRDevices().then(vrDeviceCallback);
    } else if (navigator.mozGetVRDevices) {
        navigator.mozGetVRDevices(vrDeviceCallback);
    }
}, false);

function vrDeviceCallback(vrdevs) {
    for (var i = 0; i < vrdevs.length; ++i) {
        if (vrdevs[i] instanceof HMDVRDevice) {
            vrHMD = vrdevs[i];
            break;
        }
    }
    for (var i = 0; i < vrdevs.length; ++i) {
        if (vrdevs[i] instanceof PositionSensorVRDevice &&
            vrdevs[i].hardwareUnitId == vrHMD.hardwareUnitId) {
            vrHMDSensor = vrdevs[i];
            break;
        }
    }
    initScene();
    initRenderer();
    render();
}

function initScene() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 2;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0xcccccc, 0.01 );

    lullabot();
    ground();
    lighting();
    //mouse();
    controls();
}

function shape() {
    var geometry = new THREE.IcosahedronGeometry(1, 1);
    var material = new THREE.MeshNormalMaterial();
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
}

function controls() {
    controls = new THREE.FirstPersonControls( camera );
    controls.movementSpeed = 12.5;
    controls.lookSpeed = 0.055;
    controls.lookVertical = true;
}

function mouse() {
    mouse = new THREE.PointerLockControls( camera );
    scene.add( mouse.getObject() );
}

function ground() {
    // material
    var material = new THREE.MeshLambertMaterial({
        map: THREE.ImageUtils.loadTexture('images/2000px-Checkerboard_pattern.svg.png')
    });

    var geometry = new THREE.PlaneBufferGeometry(300, 300, 10, 10);
    var ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI/2;
    ground.position.y = -10;
    ground.overdraw = true;

    scene.add(ground);
}

function lighting() {
    // add subtle ambient lighting
    var ambientLight = new THREE.AmbientLight(0x555555);
    scene.add(ambientLight);

    // add directional light source
    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, -11, 1).normalize();
    scene.add(directionalLight);
}

function lullabot() {
    var loader = new THREE.ObjectLoader();

    loader.load('models/lullabot.json', function ( object ) {
        scene.add( object );
        object.position.set( 50, -17, -60 );
    });
}

function initRenderer() {
    renderCanvas = document.getElementById("render-canvas");
    renderer = new THREE.WebGLRenderer({
        canvas: renderCanvas,
    });
    renderer.setClearColor(0x555555);
    renderer.setSize(1280, 800, false);
    vrrenderer = new THREE.VRRenderer(renderer, vrHMD);
}

function render() {
    requestAnimationFrame(render);
    //mesh.rotation.y += 0.01;
    controls.update( clock.getDelta() );
    //mouse.isOnObject( false );
    var state = vrHMDSensor.getState();
    camera.quaternion.set(state.orientation.x,
        state.orientation.y,
        state.orientation.z,
        state.orientation.w);
    //mouse.update();
    vrrenderer.render(scene, camera);
}

window.addEventListener("keypress", function(e) {
    if (e.charCode == 'f'.charCodeAt(0)) {
        if (renderCanvas.mozRequestFullScreen) {
            renderCanvas.mozRequestFullScreen({
                vrDisplay: vrHMD
            });
        } else if (renderCanvas.webkitRequestFullscreen) {
            renderCanvas.webkitRequestFullscreen({
                vrDisplay: vrHMD,
            });
        }
    }
}, false);

/*var blocker = document.getElementById( 'render-canvas' );

// http://www.html5rocks.com/en/tutorials/pointerlock/intro/

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

if ( havePointerLock ) {

    var element = document.body;

    var pointerlockchange = function ( event ) {
        if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

            controls.enabled = true;

            blocker.style.display = 'none';

        } else {

            controls.enabled = false;

            blocker.style.display = '-webkit-box';
            blocker.style.display = '-moz-box';
            blocker.style.display = 'box';

        }

    }

    // Hook pointer lock state change events
    document.addEventListener( 'pointerlockchange', pointerlockchange, false );
    document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
    document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

    // Ask the browser to lock the pointer
    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

    if ( /Firefox/i.test( navigator.userAgent ) ) {

        var fullscreenchange = function ( event ) {

            if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

                document.removeEventListener( 'fullscreenchange', fullscreenchange );
                document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

                element.requestPointerLock();
            }

        }

        document.addEventListener( 'fullscreenchange', fullscreenchange, false );
        document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

        element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

        element.requestFullscreen();

    } else {

        element.requestPointerLock();
    }
}*/
