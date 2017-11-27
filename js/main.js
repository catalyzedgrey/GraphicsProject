document.addEventListener("DOMContentLoaded", init);
var container, stats;
var camera, delta, scene, renderer, light;
var controls, water, sphere, cubeMap;

var currentlyPressedKeys = {};

var parameters = {
    oceanSide: 1000,
    size: 0.5,
    distortionScale: 3.7,
    alpha: 1.0
};

//init();

function init() {

    delta = 1;

    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
    //camera.position.set( 30, 30, 100 );
    camera.position.y = 100;
    camera.position.z = 250;

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
    // texture

    var manager = new THREE.LoadingManager();
    manager.onProgress = function (item, loaded, total) {

        console.log(item, loaded, total);

    };

    var textureLoader = new THREE.TextureLoader(manager);
    var texture = textureLoader.load('textures/UV_Grid_Sm.jpg');

    // model

    var onProgress = function (xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log(Math.round(percentComplete, 2) + '% downloaded');
        }
    };

    var onError = function (xhr) { };

    var loader = new THREE.OBJLoader(manager);
    loader.load('obj/MansionAuditore.obj', function (object) {

        object.rotateY(-184);
        object.position.x = 500;
        object.position.y = 50;
        xScale = 20;
        object.scale.x = object.scale.y = object.scale.z = xScale;
        object.traverse(function (child) {

            if (child instanceof THREE.Mesh) {

                child.material.map = texture;

            }

        });


        scene.add(object);

    }, onProgress, onError);

    //

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    controls = new THREE.FirstPersonControls(camera, renderer.domElement);
    controls.movementSpeed = 70;
    controls.lookSpeed = 0.05;
    controls.noFly = true;

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

    renderer.domElement.onmousedown = handleMouseDown;
    renderer.domElement.onmouseup = handleMouseUp;

    // gui = new dat.GUI();
    // gui.add( parameters, 'distortionScale', 0, 8, 0.1 );
    // gui.add( parameters, 'size', 0.1, 10, 0.1 );
    // gui.add( parameters, 'alpha', 0.9, 1, .001 );




    //document.addEventListener( 'mousemove', onDocumentMouseMove, false );

    //

    //window.addEventListener( 'resize', onWindowResize, false );
    animate();

    // renderer = new THREE.WebGLRenderer();
    // renderer.setSize(window.innerWidth, window.innerHeight);
    // document.body.appendChild(renderer.domElement);


    // // camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
    // // camera.position.set(0, 0, 100);
    // camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
    // camera.position.z = 250;
    // //camera.lookAt(new THREE.Vector3(0, 0, 0));

    // scene = new THREE.Scene();


    // var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    // scene.add(ambientLight);

    // var pointLight = new THREE.PointLight(0xffffff, 0.8);
    // camera.add(pointLight);
    // scene.add( camera );

    // // texture

    // var manager = new THREE.LoadingManager();
    // manager.onProgress = function (item, loaded, total) {

    //     console.log(item, loaded, total);

    // };



    // var textureLoader = new THREE.TextureLoader(manager);
    // var texture = textureLoader.load('textures/UV_Grid_Sm.jpg');


    // // model

    // var onProgress = function (xhr) {
    //     if (xhr.lengthComputable) {
    //         var percentComplete = xhr.loaded / xhr.total * 100;
    //         console.log(Math.round(percentComplete, 2) + '% downloaded');
    //     }
    // };

    // var onError = function (xhr) {};
    // var loader = new THREE.OBJLoader(manager);
    // loader.load('obj/male02/male02.obj', function (object) {

    //     object.traverse(function (child) {

    //         if (child instanceof THREE.Mesh) {

    //             child.material.map = texture;

    //         }

    //     });

    //     object.position.y = -95;
    //     scene.add(object);

    // }, onProgress, onError);



    // // var material = new THREE.LineBasicMaterial({
    // //     color: 0x0000ff
    // // });
    // // //var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    // // //var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

    // // var geometry = new THREE.Geometry();
    // // geometry.vertices.push(new THREE.Vector3(-10, 0, 0));
    // // geometry.vertices.push(new THREE.Vector3(0, 10, 0));
    // // geometry.vertices.push(new THREE.Vector3(10, 0, 0));
    // // cube = new THREE.Line(geometry, material);
    // // scene.add(cube);

    // // loadObject();

    // animate();

}


var loadObject = function () {

    // //Manager from ThreeJs to track a loader and its status
    // var manager = new THREE.LoadingManager();
    //Loader for Obj from Three.js
    var loader = new THREE.OBJLoader();
    //Launch loading of the obj file, addBananaInScene is the callback when it's ready 
    loader.load('models/farmhouse_obj.obj', addBananaInScene);

};

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
    requestAnimationFrame(animate);
    render();

    //stats.update();



};


function setWater() {


    //scene.fog(0x3d0f32, 50, 100);

    var waterGeometry = new THREE.PlaneBufferGeometry(3000, 5000);


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
            fog: scene.fog = new THREE.FogExp2(0x7c877c)
        }
    );

    water.position.x = -1050;
    water.rotation.x = -Math.PI / 2;
    water.receiveShadow = true;

    scene.add(water);

}

function setSkybox() {

    var cubeTextureLoader = new THREE.CubeTextureLoader();
    //cubeTextureLoader.setPath('textures/cube/skyboxsun25deg/');
    cubeTextureLoader.setPath('textures/cube/skybox1/');

    // cubeMap = cubeTextureLoader.load([
    //     'px.jpg', 'nx.jpg',
    //     'py.jpg', 'ny.jpg',
    //     'pz.jpg', 'nz.jpg',
    // ]);
    cubeMap = cubeTextureLoader.load([
        '1.png', '2.png',
        '2.png', '4.png',
        '5.png', '6.png',
    ]);

    var cubeShader = THREE.ShaderLib['cube'];
    cubeShader.uniforms['tCube'].value = cubeMap;

    var skyBoxMaterial = new THREE.ShaderMaterial({
        fragmentShader: cubeShader.fragmentShader,
        vertexShader: cubeShader.vertexShader,
        uniforms: cubeShader.uniforms,
        side: THREE.BackSide
    });

    var skyBoxGeometry = new THREE.BoxBufferGeometry(
        parameters.oceanSide * 5 + 100,
        parameters.oceanSide * 5 + 100,
        parameters.oceanSide * 5 + 100);

    var skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);

    scene.add(skyBox);
}


function render() {
    water.material.uniforms.time.value += 1.0 / 60.0;
    water.material.uniforms.size.value = parameters.size;
    water.material.uniforms.distortionScale.value = parameters.distortionScale;
    water.material.uniforms.alpha.value = parameters.alpha;

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
    if(!aKeyIsPressed)
    delta = 0;
}
function handleKeys() {
    if (currentlyPressedKeys[37] || currentlyPressedKeys[65] || currentlyPressedKeys[39] || currentlyPressedKeys[68]
        || currentlyPressedKeys[38] || currentlyPressedKeys[87] || currentlyPressedKeys[40] || currentlyPressedKeys[83]
        || currentlyPressedKeys[32] || currentlyPressedKeys[16]) {
        delta = 0.1;
        aKeyIsPressed = true;
    }
    else {
        delta = 0;
        aKeyIsPressed = false;
    }
}