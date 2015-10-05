import EC from '../postprocessing/core/EffectComposer';
import NS from '../postprocessing/Noise';
import RP from '../postprocessing/core/RenderPass';

import THREE    from 'three.js'; 
import noise    from 'perlin-noise';
import TweenMax from 'gsap';
import dat      from 'dat-gui' ;
import URL      from 'url';
import css      from 'dom-css';
import eve      from 'dom-events';

import Gallery from "./Gallery";

const EffectComposer = EC(THREE);
const NoiseShader = NS(THREE);
const RenderPass = RP(THREE);

const SSAOShader     = require('../postprocessing/SSAOShader')(THREE);
const OrbitControls = require('../utils/OrbitControls')(THREE);

class SceneHome 
{
  constructor(renderer, clock) 
  {
    this.camera   = null;
    this.scene    = null;
    this.renderer = renderer;
    this.clock    = clock;
    this.center = new THREE.Vector3(0, 0, -240);

    this.renderPost = window.APP.browser.os == 'osx';

    this.createScene();

    this.startGUI( parseInt(URL.parse(window.location.href, true).query.d) );

    this.addObjects();
  }

  createScene()
  {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000 );
    this.camera.position.set(0, 0, 1);

    this.scene = new THREE.Scene();

    let angleOffset = 20;

    // eve.on(this.renderer.domElement, "mousemove", this.onMouseMove.bind(this));
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target = this.center;
    this.controls.noZoom = true;
    this.controls.noKeys = true;
    this.controls.enabled = false;
    this.controls.rotateSpeed = .35;
    this.controls.minPolarAngle = 30 * Math.PI / 180;
    this.controls.maxPolarAngle = 110 * Math.PI / 180;
    this.controls.minAzimuthAngle= -25 * Math.PI / 180;
    this.controls.maxAzimuthAngle= 25 * Math.PI / 180;
    // this.controls.rotateStart.set( window.innerWidth / 2, window.innerHeight / 2);

    this.gallery = new Gallery(this.scene, this.renderer.domElement, this.camera);
  }


  addObjects()
  {
    this.mesh    = null;
    this.perlin  = null;
    this.nodes   = null;
    this.light   = null;
    this.geo     = null;
    
    // var gridHelper = new THREE.GridHelper( 100, 10 );        
    // this.scene.add( gridHelper );

    if(this.renderPost) this.createComposer();
  }

  createComposer()
  {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass( new THREE.RenderPass( this.scene, this.camera ) );

    var renderPass = new THREE.RenderPass( this.scene, this.camera );
    var depthShader = THREE.ShaderLib[ "depthRGBA" ];
    var depthUniforms = THREE.UniformsUtils.clone( depthShader.uniforms );

    this.depthMaterial = new THREE.ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader,
      uniforms: depthUniforms, blending: THREE.NoBlending } );

    var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter };
    this.depthRenderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, pars );

    // Setup SSAO pass
    this.ssaoPass = new THREE.ShaderPass( THREE.SSAOShader );
    this.ssaoPass.renderToScreen = true;
    //this.ssaoPass.uniforms[ "tDiffuse" ].value will be set by ShaderPass
    this.ssaoPass.uniforms[ "tDepth" ].value = this.depthRenderTarget;
    this.ssaoPass.uniforms[ 'size' ].value.set( window.innerWidth, window.innerHeight );
    this.ssaoPass.uniforms[ 'cameraNear' ].value = this.camera.near;
    this.ssaoPass.uniforms[ 'cameraFar' ].value = this.camera.far;
    this.ssaoPass.uniforms[ 'onlyAO' ].value = false;
    this.ssaoPass.uniforms[ 'aoClamp' ].value = 100.5;
    this.ssaoPass.uniforms[ 'lumInfluence' ].value = 2.5;

    this.composer.addPass( this.ssaoPass );

    // this.noisePass = new THREE.ShaderPass( NoiseShader );
    // this.noisePass.uniforms['amount'].value = .08;
    // this.noisePass.uniforms['speed'].value = 1;
    // this.noisePass.renderToScreen = true;
    // this.composer.addPass( this.noisePass );


  }

  generatePlane()
  {
      if(this.mesh) this.scene.remove(this.mesh);
      if(this.meshWireframe) this.scene.remove(this.meshWireframe);
      if(this.light) this.scene.remove(this.light);

      this.light = new THREE.DirectionalLight(this.p.lightColor, 1);
      this.light.position.set( 0, 0, 100 );
      // this.light.castShadow = true;
      // this.light.shadowCameraNear  = 0.01; 
      // this.light.shadowDarkness = .5;
      // this.light.shadowCameraVisible = true;
      this.scene.add(this.light);

      // this.light = new THREE.AmbientLight(this.p.lightColor, 1);
      // this.scene.add(this.light);

      this.nodes = this.p.nodes >> 0;

      let size = window.innerWidth >= window.innerHeight ? window.innerWidth : window.innerHeight * 1.5;
      this.geo  = new THREE.PlaneGeometry(size / 2, size / 2, this.nodes, this.nodes);

      // this.geo.originalVertices = this.geo.vertices.slice();
      this.mesh = new THREE.Mesh(this.geo, new THREE.MeshPhongMaterial({
          color     : new THREE.Color(this.p.meshColor),
          specular  : new THREE.Color(this.p.meshSpecular),
          emissive  : new THREE.Color(this.p.meshEmissive),
          shininess : new THREE.Color(this.p.shininess),
          shading   : THREE.FlatShading,
      }));

      this.mesh.castShadow = true;
      this.mesh.receiveShadow = false;

      this.meshWireframe = new THREE.Mesh(this.geo, new THREE.MeshPhongMaterial({color: this.p.wireColour, wireframe: true}));
      this.meshWireframe.castShadow = true;
      this.meshWireframe.receiveShadow = false;

      this.mesh.rotation.x = -20 * Math.PI / 180;
      this.meshWireframe.rotation.x = -20 * Math.PI / 180;

      this.mesh.scale.set(2, 2, 2);
      this.meshWireframe.scale.set(2, 2, 2);

      this.mesh.position.z = -400;
      this.meshWireframe.position.z = -399;

      this.generatePerlin();
      this.scene.add(this.mesh);
      this.scene.add(this.meshWireframe);

      for (var i = 0; i < this.mesh.geometry.vertices.length; i++) {
          this.mesh.geometry.vertices[i].z = this.perlin[i] * -(this.p.power / 2 - Math.random() * this.p.power);
          this.meshWireframe.geometry.vertices[i].z = this.mesh.geometry.vertices[i].z;
          this.animateVertice( i );
      };

      this.updateColours();

  }

  generatePerlin()
  {
      this.perlin = noise.generatePerlinNoise(this.nodes + 1, this.nodes + 1, {
          octaveCount : 2,
          amplitude: .5,
          persistence: 1
      });

  }

  animateVertice( i )
  {
      TweenMax.to(this.mesh.geometry.vertices[i], 1.5 + Math.random() * 3, {
          z: this.perlin[i] * -(this.p.power / 2 - Math.random() * this.p.power), 
          ease: Power2.easeInOut,
          onRepeat: this.generatePerlin.bind(this),
          onUpdate: ()=>{this.meshWireframe.geometry.vertices[i].z = this.mesh.geometry.vertices[i].z},
          onComplete: this.animateVertice.bind(this), 
          onCompleteParams: [i]
      })
  }

  startGUI(showGUI)
  {
    var Params = function(){
        this.nodes = 20;
        this.power = 100;
        this.lightColor = '#acacac';
        this.meshColor = '#222222';
        this.meshSpecular = '#1e1e1e';
        this.meshEmissive = '#000000';
        this.wireColour = '#222222';
        this.shininess = 20;

        this.modelMeshColor = '#3b3c3a';
        this.modelMeshSpecular = '#FFFFFF';
        this.modelMeshEmissive = '#3f4138';
        this.modelShininess = 2;        

        this.noiseAmount = .05;
        this.noiseSpeed = 1;
    }

    this.p = new Params();

    if(showGUI == 0 || isNaN(showGUI)) return;

    var gui = new dat.GUI({autoPlace: false});
    var folderParams = gui.addFolder("Params");
    folderParams.add(this.p, 'nodes', 1, 25).onChange(this.generatePlane.bind(this));
    folderParams.add(this.p, 'power', 0, 200).onChange(this.generatePlane.bind(this));

    var folderColors = gui.addFolder('Colours');
    folderColors.addColor(this.p, 'lightColor').onChange(this.updateColours.bind(this));
    folderColors.addColor(this.p, 'meshColor').onChange(this.updateColours.bind(this));
    folderColors.addColor(this.p, 'meshSpecular').onChange(this.updateColours.bind(this));
    folderColors.addColor(this.p, 'meshEmissive').onChange(this.updateColours.bind(this));
    folderColors.addColor(this.p, 'wireColour').onChange(this.updateColours.bind(this));
    folderColors.add(this.p, 'shininess', 0, 50).step(1).onChange(this.updateColours.bind(this));

    var folderModel = gui.addFolder('Model');
    folderModel.addColor(this.p, "modelMeshColor").onChange(this.gallery.updateColours.bind(this.gallery));
    folderModel.addColor(this.p, "modelMeshSpecular").onChange(this.gallery.updateColours.bind(this.gallery));
    folderModel.addColor(this.p, "modelMeshEmissive").onChange(this.gallery.updateColours.bind(this.gallery));
    folderModel.add(this.p, "modelShininess", 0, 50).step(1).onChange(this.gallery.updateColours.bind(this.gallery));
    folderModel.open();

    var folderNoise = gui.addFolder('Postprocessing Noise');
    folderNoise.add(this.p, 'noiseAmount', 0, .2);
    folderNoise.add(this.p, 'noiseSpeed', 0, 10);
    // folderNoise.close();

    var folderCamera = gui.addFolder('Camera');
    // folderCamera.add(this.camera.position, 'x', 0, 1500);
    // folderCamera.add(this.camera.position, 'y', 0, 1500);
    // folderCamera.add(this.camera.position, 'z', -1500, 1500);
    // folderCamera.open();

    css(gui.domElement, {position: 'fixed', top: 0, right: 0, 'z-index': 400});
    document.body.appendChild(gui.domElement);
    // console.log()

    // gui.close();
  }

  updateColours()
  {
      this.mesh.material.color = new THREE.Color(this.p.meshColor);
      this.mesh.material.specular = new THREE.Color(this.p.meshSpecular);
      this.mesh.material.emissive = new THREE.Color(this.p.meshEmissive);
      this.mesh.material.shininess = this.p.shininess;
      this.light.color = new THREE.Color(this.p.lightColor);
      this.meshWireframe.material.color = new THREE.Color(this.p.wireColour);

      this.mesh.material.needsUpdate = true;
      this.meshWireframe.geometry.verticesNeedUpdate = true;
  }

  transitionGallery(out, callback)
  {
    if(!out)
    {
      this.gallery.animateOut();
    }

    callback();
  }

  render()
  {
    this.mesh.geometry.verticesNeedUpdate = true;
    this.meshWireframe.geometry.verticesNeedUpdate = true;
    this.gallery.update();
    // this.controls.update()

    if(this.renderPost)
    {
      this.scene.overrideMaterial = this.depthMaterial;
      this.renderer.render( this.scene, this.camera, this.depthRenderTarget, true );

      // this.noisePass.uniforms['amount'].value = this.p.noiseAmount;
      // this.noisePass.uniforms['speed'].value = this.p.noiseSpeed;
      // this.noisePass.uniforms['time'].value = this.clock.getElapsedTime();  

      this.scene.overrideMaterial = null;
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }

  }

  onResize()
  {
    if(this.renderPost)
    {
      this.composer.setSize(window.innerWidth, window.innerHeight);
    } else {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    this.generatePlane();
    this.camera.aspect = window.innerWidth / window.innerHeight;

    // this.camera.left = window.innerWidth / - 2;
    // this.camera.right = window.innerWidth / 2;
    // this.camera.top = window.innerHeight / 2;
    // this.camera.bottom = window.innerHeight / - 2;

    this.camera.updateProjectionMatrix();
  }
}

export default SceneHome;