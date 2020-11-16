
//===================================================== add Scene
var scene = new THREE.Scene();
//===================================================== add Camera
var camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  10000
);

//===================================================== add GLow
var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMapEnabled = true; //Shadow
renderer.shadowMapSoft = true; // Shadow
renderer.shadowMapType = THREE.PCFShadowMap; //Shadow
document.body.appendChild(renderer.domElement);

//===================================================== add controls
var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI / 1.5;

//===================================================== add VR
renderer.setPixelRatio(window.devicePixelRatio); //VR
effect = new THREE.StereoEffect(renderer); //VR
effect.setSize(window.innerWidth, window.innerHeight); //VR

var VR = false;
function toggleVR() {
  if (VR) {
    VR = false;
    controls = new THREE.OrbitControls(camera, renderer.domElement);
  } else {
    VR = true;
    controls = new THREE.DeviceOrientationControls(camera);
    requestFullscreen(document.documentElement);
  }
  renderer.setSize(window.innerWidth, window.innerHeight);
}

//===================================================== resize
window.addEventListener("resize", function() {
  let width = window.innerWidth;
  let height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});

//===================================================== add plane
THREE.ImageUtils.crossOrigin = "";
var floorMap = THREE.ImageUtils.loadTexture(
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6fppRs7txb7B69Bb_9BjDx_BSmtEQxSi_JSB98xPiDW1ezyjM"
);
floorMap.wrapS = floorMap.wrapT = THREE.RepeatWrapping;
floorMap.repeat.set(20, 20);

var groundMaterial = new THREE.MeshPhongMaterial({
  color: new THREE.Color("#4d3b29"),
  specular: new THREE.Color("#444"),
  shininess: 10,
  bumpMap: floorMap
});
var groundGeo = new THREE.PlaneGeometry(2000, 2000);
var ground = new THREE.Mesh(groundGeo, groundMaterial);

ground.position.set(0, 0, 0);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

//===================================================== store all fbx animations in array
var mixers = [];

//===================================================== add model
//3d model from https://truebones.com/free-demos
var loader = new THREE.FBXLoader();
loader.load(
  "https://rawcdn.githack.com/NicolasPicoG/ParcialThriller/25c8a0740c10ebbc992fcaacc6a217eab22978dd/models/principal.fbx",
  
  
  function(object) {
    object.mixer = new THREE.AnimationMixer(object);
    mixers.push(object.mixer);

    var action = object.mixer.clipAction(object.animations[0]);
    action.play();

    object.traverse(function(child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.scale.set(3, 3, 3);
      }
    });

    object.position.set(0, 0, 0);
    scene.add(object);
  }
);

//===================================================== add Model

var leafs = [];
var leafGroup = new THREE.Group();
scene.add(leafGroup);
loader = new THREE.LegacyJSONLoader();
loader.load(
  "https://raw.githubusercontent.com/baronwatts/models/master/single-leaf.js",
  function(geometry, materials) {
    //create leafs
    new Array(300).fill(null).map((d, i) => {
      var matt = new THREE.MeshPhongMaterial({
        vertexColors: THREE.FaceColors,
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide
      });
      var particle = new THREE.Mesh(geometry, matt);
   
      particle.scale.set(8, 8, 8);
      particle.rotateY(Math.random() * 180);
      particle.castShadow = true;
      leafGroup.add(particle);
      leafs.push(particle);
    });

    leafs.map((d, i) => {
      //position
      if (i % 2 == 0) {
        leafs[i].position.x = 0;
        leafs[i].position.y = 0;
        leafs[i].position.z = 0;
        TweenMax.to(
          leafs[i].position,
          0,
                   1
        );
      }
      //rotation
      
    }); //end leafs
  }
);




//===================================================== add light to genrerate shadows
var light = new THREE.DirectionalLight(new THREE.Color("white"));
light.position.set(0, 360, 100);
light.castShadow = true;
light.shadow.camera.top = 360;
light.shadow.camera.bottom = -360;
light.shadow.camera.left = -360;
light.shadow.camera.right = 360;
scene.add(light);

//===================================================== add a small sphere simulating the pointlight
var sphereLight = new THREE.SphereGeometry(1);
var sphereLightMaterial = new THREE.MeshBasicMaterial({
  color: new THREE.Color("white")
});
var sphereLightMesh = new THREE.Mesh(sphereLight, sphereLightMaterial);
sphereLightMesh.castShadow = true;

sphereLightMesh.position = new THREE.Vector3(3, 0, 3);
scene.add(sphereLightMesh);

var pointColor = "white";
var pointLight = new THREE.PointLight(pointColor);
pointLight.distance = 2000;
scene.add(pointLight);

//===================================================== animate model
var clock = new THREE.Clock();
function animateFBX() {
  if (mixers.length > 0) {
    for (var i = 0; i < mixers.length; i++) {
      mixers[i].update(clock.getDelta());
    }
  } //end mixer
}

//================================================== add Animation
let phase = 0;
function animate() {
  requestAnimationFrame(animate);
  animateFBX();


  //VR
  if (VR) {
    effect.render(scene, camera);
    camera.position.x = 0;
  } else {
    renderer.render(scene, camera);
    camera.position.x = Math.cos(phase / 4) * 150;
  }

  controls.update();
}

animate();

//===================================================== position camera
camera.position.z = 150;
camera.position.y = 50;
camera.position.x = 0;