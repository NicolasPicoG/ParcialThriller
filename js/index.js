import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';


class zombie {
  constructor() {
    this._Initialize();
  }

  _Initialize() {
    this._threejs = new THREE.WebGLRenderer({
      antialias: true,
    });
    this._threejs.shadowMap.enabled = true;
    this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
    this._threejs.setPixelRatio(window.devicePixelRatio);
    this._threejs.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this._threejs.domElement);

    window.addEventListener('resize', () => {
      this._OnWindowResize();
    }, false);

    const fov = 60;
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 1000.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.position.set(0, 5, 100);

    this._scene = new THREE.Scene();

    let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light.position.set(20, 100, 10);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.left = 100;
    light.shadow.camera.right = -100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    this._scene.add(light);

    light = new THREE.AmbientLight(0xFFFFFF, 4.0);
    this._scene.add(light);

    const controls = new OrbitControls(
      this._camera, this._threejs.domElement);
    controls.target.set(0, 15, 0);
    controls.update();

    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
      './recursos/img/frente.png',
      './recursos/img/atras.png',
      './recursos/img/arriba.png',
      './recursos/img/abajo.png',
      './recursos/img/izquierda.png',
      './recursos/img/derecha.png',
    ]);
    this._scene.background = texture;

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 2000, 10, 10),
      new THREE.MeshStandardMaterial({

        color: "#000000",
      }));
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    this._scene.add(plane);

    this._mixers = [];
    this._previousRAF = null;

    this._LoadAnimatedModelAndPlay(
      './recursos/fbx/', 'zombie1.fbx', 'zombie1.fbx', new THREE.Vector3(0, 0, -70));
    this._LoadAnimatedModelAndPlay(
      './recursos/fbx/', 'zombie1.fbx', 'zombie1.fbx', new THREE.Vector3(-20, 0, -110));
    this._LoadAnimatedModelAndPlay(
      './recursos/fbx/', 'zombie1.fbx', 'zombie1.fbx', new THREE.Vector3(20, 0, -110));

     /* Se pueden agregar mas personajes pero queda muy pesado le proyecto parala correcta reproducción*/ 
      /*
    this._LoadAnimatedModelAndPlay(
      './recursos/fbx/', 'zombie1.fbx', 'zombie1.fbx', new THREE.Vector3(20, 0, -90));
    this._LoadAnimatedModelAndPlay(
      './recursos/fbx/', 'zombie1.fbx', 'zombie1.fbx', new THREE.Vector3(-20, 0, -110));
    this._LoadAnimatedModelAndPlay(
      './recursos/fbx/', 'zombie1.fbx', 'zombie1.fbx', new THREE.Vector3(0, 0, -110));
    this._LoadAnimatedModelAndPlay(
      './recursos/fbx/', 'zombie1.fbx', 'zombie1.fbx', new THREE.Vector3(20, 0, -110));
    this._LoadAnimatedModelAndPlay(
      './recursos/fbx/', 'zombie1.fbx', 'zombie1.fbx', new THREE.Vector3(40, 0, -110));
    this._LoadAnimatedModelAndPlay(
      './recursos/fbx/', 'zombie1.fbx', 'zombie1.fbx', new THREE.Vector3(-40, 0, -110));
*/

    this._RAF();
  }

  _LoadAnimatedModelAndPlay(path, modelFile, animFile, offset) {
    const loader = new FBXLoader();
    loader.setPath(path);
    loader.load(modelFile, (fbx) => {
      fbx.scale.setScalar(0.5);
      fbx.traverse(c => {
        c.castShadow = true;
      });
      fbx.position.copy(offset);

      const anim = new FBXLoader();
      anim.setPath(path);
      anim.load(animFile, (anim) => {
        const m = new THREE.AnimationMixer(fbx);
        this._mixers.push(m);
        const idle = m.clipAction(anim.animations[0]);
        idle.play();
      });
      this._scene.add(fbx);
    });
  }

  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
  }

  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }

      this._RAF();

      this._threejs.render(this._scene, this._camera);
      this._Step(t - this._previousRAF);
      this._previousRAF = t;
    });
  }

  _Step(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001;
    if (this._mixers) {
      this._mixers.map(m => m.update(timeElapsedS));
    }
  }
}
window.addEventListener('DOMContentLoaded', () => {
  _APP = new zombie();
});
