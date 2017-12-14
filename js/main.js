document.addEventListener("DOMContentLoaded", init);

var container, stats;
var camera, delta, scene, renderer, light;
var controls, water, sphere, cubeMap;

var worlSize = 30000;

var houseX; var houseY; var houseZ;

//birds
var SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = window.innerHeight,
    SCREEN_WIDTH_HALF = SCREEN_WIDTH / 2,
    SCREEN_HEIGHT_HALF = SCREEN_HEIGHT / 2;
var birds, bird;
var boid, boids;
//////////

var currentlyPressedKeys = {};
var parameters = {
    size: 0.5,
    distortionScale: 3.7,
    alpha: 1.0
};

function init() {

    delta = 0;

    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.set(0, -2300, 250);

    // scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xaabbbb, 0.001);

    var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    scene.add(ambientLight);

    var pointLight = new THREE.PointLight(0xffffff, 0.8);
    camera.add(pointLight);
    scene.add(camera);

    light = new THREE.DirectionalLight(0xff0000, 0.8);
    light.position.set(-30, 30, 30);
    light.castShadow = true;
    light.shadow.camera.top = 45;
    light.shadow.camera.right = 40;
    light.shadow.camera.left = light.shadow.camera.bottom = -40;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 200;
    scene.add(light);


    var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    scene.add(ambientLight);

    setWater();

    setSkybox();

    //birds/////////////////////////////////////////////////////
    birds = [];
    boids = [];

    for (var i = 0; i < 200; i++) {
        boid = boids[i] = new Boid();
        boid.position.x = Math.random() * 400 - 200;
        boid.position.y = Math.random() * 400 - 200;
        boid.position.z = Math.random() * 400 - 200;
        boid.velocity.x = Math.random() * 2 - 1;
        boid.velocity.y = Math.random() * 2 - 1;
        boid.velocity.z = Math.random() * 2 - 1;
        boid.setAvoidWalls(true);
        boid.setWorldSize(1000, 400, 400);
        bird = birds[i] = new THREE.Mesh(new Bird(), new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff, side: THREE.DoubleSide }));
        bird.phase = Math.floor(Math.random() * 62.83);
        scene.add(bird);
    }
    /////////////////////////////////////////////////////////////

    houseX = camera.position.x + 100;
    houseY = camera.position.y;
    houseZ = camera.position.z;
    addObj('WoodenCabinObj', houseX, houseY, houseZ);

    addCloth();

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    //CONTROLS
    controls = new THREE.FirstPersonControls(camera, renderer.domElement);
    controls.movementSpeed = 70;
    controls.lookSpeed = 0.05;
    controls.noFly = true;

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

    renderer.domElement.onmousedown = handleMouseDown;
    renderer.domElement.onmouseup = handleMouseUp;

    animate();

    // renderer = new THREE.WebGLRenderer();
    // renderer.setSize(window.innerWidth, window.innerHeight);
    // document.body.appendChild(renderer.domElement);

    // var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    // scene.add(ambientLight);

}
var addBananaInScene = function (object) {
    banana = object;
    //Move the banana in the scene
    banana.rotation.x = Math.PI / 2;
    banana.position.y = -50;
    banana.position.z = 50;
    banana.scale(5000, 5000, 5000);
    //Go through all children of the loaded object and search for a Mesh
    object.traverse(function (child) {
        //This allow us to check if the children is an instance of the Mesh constructor
        if (child instanceof THREE.Mesh) {
            child.material.color = new THREE.Color(0X00FF00);
            //Sometimes there are some vertex normals missing in the .obj files, ThreeJs will compute them
            child.geometry.computeVertexNormals();
        }
    });
    //Add the 3D object in the scene
    scene.add(banana);
    animate();
};

var animate = function () {

    //Wind
    var time = Date.now();
    var windStrength = Math.cos(time / 7000) * 20 + 40;
    windForce.set(Math.sin(time / 2000), Math.cos(time / 3000), Math.sin(time / 1000))
    windForce.normalize()
    windForce.multiplyScalar(windStrength);
    simulate(time);
    //////

    requestAnimationFrame(animate);
    render();
};

var clothGeometry;

var pinsFormation = [];
var pins = [6];
pinsFormation.push(pins);
pins = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
pinsFormation.push(pins);
pins = [0];
pinsFormation.push(pins);
pins = []; // cut the rope ;)
pinsFormation.push(pins);
pins = [0, cloth.w]; // classic 2 pins
pinsFormation.push(pins);
pins = pinsFormation[1];
function togglePins() {
    pins = pinsFormation[~~(Math.random() * pinsFormation.length)];
}

function addCloth() {
    // cloth material
    var loader = new THREE.TextureLoader();
    var clothTexture = loader.load('textures/circuit_pattern.png');
    clothTexture.anisotropy = 16;
    var clothMaterial = new THREE.MeshLambertMaterial({
        map: clothTexture,
        side: THREE.DoubleSide,
        alphaTest: 0.5
    });
    // cloth geometry
    clothGeometry = new THREE.ParametricGeometry(clothFunction, cloth.w, cloth.h);
    // cloth mesh
    object = new THREE.Mesh(clothGeometry, clothMaterial);
    object.position.set(houseX+12, houseY+20, houseZ+33);
    var scaleN = 0.024;
    object.scale.set(scaleN, scaleN, scaleN);
    object.castShadow = true;
    scene.add(object);
    object.customDepthMaterial = new THREE.MeshDepthMaterial({
        depthPacking: THREE.RGBADepthPacking,
        map: clothTexture,
        alphaTest: 0.5
    });
}

function setWater() {
    //scene.fog(0x3d0f32, 50, 100);

    var waterGeometry = new THREE.PlaneBufferGeometry(worlSize, worlSize);
    water = new THREE.Water(
        waterGeometry, {
            textureWidth: 20,
            textureHeight: 20,
            waterNormals: new THREE.TextureLoader().load('textures/waternormals.jpg', function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            alpha: parameters.alpha,
            sunDirection: light.position.clone().normalize(),
            sunColor: 0x161616,
            waterColor: 0x0f1e3d,
            distortionScale: parameters.distortionScale,
            //fog: scene.fog = new THREE.FogExp2(0x7c877c)
        }
    );
    // water.position.x = -1050;
    water.position.y = -2500;
    water.rotation.x = -Math.PI / 2;
    water.receiveShadow = true;
    scene.add(water);
}

//obj must be in folder "models", format is .obj, and its .mtl included with the same name
function addObj(name, x, y, z) {
    THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('models/');
    mtlLoader.load((name + '.mtl'), function (materials) {
        materials.preload();
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('models/');
        objLoader.load((name + '.obj'), function (object) {
            object.position.x = x;
            object.position.y = y;
            object.position.z = z;
            scene.add(object);



        });
    });
}

function setSkybox() {

    var cubeTextureLoader = new THREE.CubeTextureLoader();
    cubeTextureLoader.setPath('textures/cube/skybox/');
    cubeMap = cubeTextureLoader.load([
        'px.jpg', 'nx.jpg',
        'py.jpg', 'ny.jpg',
        'pz.jpg', 'nz.jpg',
    ]);
    /* cubeMap = cubeTextureLoader.load([
         '1.png', '2.png',
         '2.png', '4.png',
         '5.png', '6.png',
     ]);*/

    var cubeShader = THREE.ShaderLib['cube'];
    cubeShader.uniforms['tCube'].value = cubeMap;

    var skyBoxMaterial = new THREE.ShaderMaterial({
        fragmentShader: cubeShader.fragmentShader,
        vertexShader: cubeShader.vertexShader,
        uniforms: cubeShader.uniforms,
        side: THREE.BackSide
    });

    var skyBoxGeometry = new THREE.BoxBufferGeometry(
        worlSize,
        worlSize,
        worlSize);

    var skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);

    scene.add(skyBox);
}


function render() {
    //water
    water.material.uniforms.time.value += 1.0 / 60.0;
    water.material.uniforms.size.value = parameters.size;
    water.material.uniforms.distortionScale.value = parameters.distortionScale;
    water.material.uniforms.alpha.value = parameters.alpha;
    //////////////////

    //birds
    for (var i = 0, il = birds.length; i < il; i++) {
        boid = boids[i];
        boid.run(boids);
        bird = birds[i];
        bird.position.copy(boids[i].position);
        var color = bird.material.color;
        color.r = color.g = color.b = (500 - bird.position.z) / 1000;
        bird.rotation.y = Math.atan2(- boid.velocity.z, boid.velocity.x);
        bird.rotation.z = Math.asin(boid.velocity.y / boid.velocity.length());
        bird.phase = (bird.phase + (Math.max(0, bird.rotation.z) + 0.1)) % 62.83;
        bird.geometry.vertices[5].y = bird.geometry.vertices[4].y = Math.sin(bird.phase) * 5;
    }
    //////////////////

    ///CLOTH
    var p = cloth.particles;
    for (var i = 0, il = p.length; i < il; i++) {
        clothGeometry.vertices[i].copy(p[i].position);
    }
    clothGeometry.verticesNeedUpdate = true;
    clothGeometry.computeFaceNormals();
    clothGeometry.computeVertexNormals();
    //////////////////////

    controls.update(delta);
    renderer.render(scene, camera);
}

var aKeyIsPressed = false;

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
    handleKeys();
}
function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
    handleKeys();
}
function handleMouseDown(event) {
    delta = 0.1;
}
function handleMouseUp(event) {
    if (!aKeyIsPressed)
        delta = 0;
}

function handleKeys() {
    if (currentlyPressedKeys[37] || currentlyPressedKeys[65] || currentlyPressedKeys[39] || currentlyPressedKeys[68]
        || currentlyPressedKeys[38] || currentlyPressedKeys[87] || currentlyPressedKeys[40] || currentlyPressedKeys[83]
        || currentlyPressedKeys[32]) {
        delta = 0.1;
        aKeyIsPressed = true;
        //Check if pressing shift
        if (currentlyPressedKeys[16])
            delta = 0.3;
    }
    else {
        delta = 0;
        aKeyIsPressed = false;
    }
}
