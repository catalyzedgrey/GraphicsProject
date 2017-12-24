document.addEventListener("DOMContentLoaded", init);

var container, stats;
var camera, delta, scene, renderer, light;
var controls, water, sphere, cubeMap;
var mesh, mixer;
var worlSize = 30000;
var house, horse;

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
    camera.position.set(-400, -2400, 0);

    // scene
    scene = new THREE.Scene();
    //scene.fog = new THREE.FogExp2(0xaabbbb, 0.001);

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



    // create the particle variables
    var particleCount = 1800,
        particles = new THREE.Geometry(),
        pMaterial = new THREE.ParticleBasicMaterial({
            color: 0x67c454,
            size: 50
        });

    // now create the individual particles
    for (var p = 0; p < particleCount; p++) {

        // create a particle with random
        // position values, -250 -> 250
        var pX = Math.random() * 500 - 250,
            pY = Math.random() * 500 - 250,
            pZ = Math.random() * 500 - 250,
            particle = new THREE.Vertex(
                new THREE.Vector3(pX, pY, pZ)
            );

        // add it to the geometry
        particles.vertices.push(particle);
    }

    // create the particle system
    var particleSystem = new THREE.ParticleSystem(
        particles,
        pMaterial);

    // add it to the scene
    scene.add(particleSystem);



    setWater();

    setSkybox();

    addHorse();

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
        bird = birds[i] = new THREE.Mesh(new Bird(), new THREE.MeshBasicMaterial({
            color: Math.random() * 0xffffff,
            side: THREE.DoubleSide
        }));
        bird.phase = Math.floor(Math.random() * 62.83);
        scene.add(bird);
    }
    /////////////////////////////////////////////////////////////


    addObj('low-poly-mill', 0, -2500, 0, 3);
    addObj('WoodenCabinObj', 0, -2502, -350, 1);
    addCloth(0, 0, 0);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    //CONTROLS
    controls = new THREE.FirstPersonControls(camera, renderer.domElement);
    controls.movementSpeed = 10;
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


function addHorse() {
    var loader = new THREE.JSONLoader();
    loader.load("models/animated/horse.js", function (geometry) {

        mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
            vertexColors: THREE.FaceColors,
            morphTargets: true
        }));
        horse = mesh;

        mesh.position.setX(-50);
        mesh.position.setY(-2440);
        mesh.position.setZ(-90);

        mesh.scale.set(0.2, 0.2, 0.2);
        scene.add(mesh);

        mixer = new THREE.AnimationMixer(mesh);

        var clip = THREE.AnimationClip.CreateFromMorphTargetSequence('gallop', geometry.morphTargets, 30);
        mixer.clipAction(clip).setDuration(1).play();
    });
}


var animate = function () {

    //Wind
    var time = Date.now();
    var windStrength = Math.cos(time / 7000) * 20 + 40;
    windForce.set(Math.sin(time / 2000), Math.cos(time / 3000), Math.sin(time / 1000))
    windForce.normalize()
    windForce.multiplyScalar(windStrength);
    simulate(time);
    //////


    houseAnim();

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
var cloth1;

function addCloth(x, y, z) {
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
    object.position.set(x, y, z);
    cloth1 = object;

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
function addObj(name, x, y, z, Scale) {
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
            object.scale.x = object.scale.y = object.scale.z = Scale;
            if (name == "WoodenCabinObj")
                house = object
            scene.add(object);
        });
    });
}


function addIsland(name, x, y, z) {
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
            object.scale.x = object.scale.y = object.scale.z = 100;

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

var prevTime = Date.now();

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
        bird.rotation.y = Math.atan2(-boid.velocity.z, boid.velocity.x);
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

    if (mixer) {
        var time = Date.now();
        mixer.update((time - prevTime) * 0.001);
        prevTime = time;
        horse.position.z = Math.cos(angleT) * radius
        horse.position.x = -80 + Math.sin(angleT) * radius
        angleT += 0.02
        horse.rotation.y += 0.02
    }
    controls.update(delta);
    renderer.render(scene, camera);
}

var angleT = 5
var radius = 40

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
    if (currentlyPressedKeys[37] || currentlyPressedKeys[65] || currentlyPressedKeys[39] || currentlyPressedKeys[68] ||
        currentlyPressedKeys[38] || currentlyPressedKeys[87] || currentlyPressedKeys[40] || currentlyPressedKeys[83] ||
        currentlyPressedKeys[32]) {
        delta = 0.1;
        aKeyIsPressed = true;
        //Check if pressing shift
        if (currentlyPressedKeys[16])
            delta = 0.3;
    } else {
        delta = 0;
        aKeyIsPressed = false;
    }
}

var rot = false
var rotspeed = 0.0002

function houseAnim() {

    if (house != null && cloth1 != null) {
        cloth1.position.x = house.position.x + 11.5
        cloth1.position.y = house.position.y + 20.5
        cloth1.position.z = house.position.z + 33

        house.position.z -= 0.1

        if (rot) {
            house.rotation.x += rotspeed
            house.rotation.y += rotspeed
            house.rotation.z += rotspeed
            if (house.rotation.x > 0.01) {
                rot = false
            }

        } else {
            house.rotation.x -= rotspeed
            house.rotation.y -= rotspeed
            house.rotation.z -= rotspeed
            if (house.rotation.x < -0.01) {
                rot = true
            }
        }

    }
}