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
    this.createMaterials();

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
    this.controls.target          = this.center;
    this.controls.noZoom          = true;
    this.controls.noKeys          = true;
    this.controls.enabled         = false;
    this.controls.rotateSpeed     = .35;
    this.controls.minPolarAngle   = 30 * Math.PI / 180;
    this.controls.maxPolarAngle   = 110 * Math.PI / 180;
    this.controls.minAzimuthAngle = -25 * Math.PI / 180;
    this.controls.maxAzimuthAngle = 25 * Math.PI / 180;
    // this.controls.rotateStart.set( window.innerWidth / 2, window.innerHeight / 2);


    this.gallery = new Gallery(this.scene, this.renderer.domElement, this.camera, this.clock);
  }

  createMaterials()
  {
    this.noiseMapData = 'data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAABQAAD/4QMtaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MkU4REFCN0Q2QzJFMTFFNTk4QThBQTcwQ0Q2NEQ5M0QiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MkU4REFCN0U2QzJFMTFFNTk4QThBQTcwQ0Q2NEQ5M0QiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoyRThEQUI3QjZDMkUxMUU1OThBOEFBNzBDRDY0RDkzRCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoyRThEQUI3QzZDMkUxMUU1OThBOEFBNzBDRDY0RDkzRCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv/uAA5BZG9iZQBkwAAAAAH/2wCEAAICAgICAgICAgIDAgICAwQD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';

    this.mapTexture = THREE.ImageUtils.loadTexture(this.noiseMapData);
    this.mapTexture.wrapS = this.mapTexture.wrapT = THREE.RepeatWrapping;
    this.mapTexture.repeat.set(2, 2);

    this.planeMaterial = new THREE.MeshPhongMaterial({
          color     : new THREE.Color(this.p.meshColor),
          specular  : new THREE.Color(this.p.meshSpecular),
          emissive  : new THREE.Color(this.p.meshEmissive),
          shininess : new THREE.Color(this.p.shininess),
          shading   : THREE.FlatShading,
      })

    this.wireframeMaterial = new THREE.MeshPhongMaterial({map: this.mapTexture, color: this.p.wireColour, wireframe: true})
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
    // this.ssaoPass.renderToScreen = true;
    this.ssaoPass.uniforms[ "tDepth" ].value = this.depthRenderTarget;
    this.ssaoPass.uniforms[ 'size' ].value.set( window.innerWidth, window.innerHeight );
    this.ssaoPass.uniforms[ 'cameraNear' ].value = this.camera.near;
    this.ssaoPass.uniforms[ 'cameraFar' ].value = this.camera.far;
    this.ssaoPass.uniforms[ 'onlyAO' ].value = false;
    this.ssaoPass.uniforms[ 'aoClamp' ].value = .05;
    this.ssaoPass.uniforms[ 'lumInfluence' ].value = .5;

    this.composer.addPass( this.ssaoPass );

    this.noisePass = new THREE.ShaderPass( NoiseShader );
    this.noisePass.uniforms['amount'].value = .08;
    this.noisePass.uniforms['speed'].value = 1;
    this.noisePass.renderToScreen = true;
    this.composer.addPass( this.noisePass );


  }

  generatePlane()
  {
      if(this.mesh) this.scene.remove(this.mesh);
      if(this.meshWireframe) this.scene.remove(this.meshWireframe);
      if(this.light) this.scene.remove(this.light);

      this.light = new THREE.DirectionalLight(this.p.lightColor, 1);
      this.light.position.set( 0, 0, 1 );
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
      this.mesh = new THREE.Mesh(this.geo, this.planeMaterial);

      // this.mesh.castShadow = true;
      // this.mesh.receiveShadow = false;

      this.meshWireframe = new THREE.Mesh(this.geo, this.wireframeMaterial);
      // this.meshWireframe.castShadow = true;
      // this.meshWireframe.receiveShadow = false;

      this.mesh.rotation.x = -20 * Math.PI / 180;
      this.meshWireframe.rotation.x = -20 * Math.PI / 180;

      this.mesh.scale.set(10, 10, 10);
      this.mesh.initialScale = 10;
      this.meshWireframe.scale.set(10, 10, 10);
      this.meshWireframe.initialScale = 10;

      this.mesh.position.z = -900;
      this.meshWireframe.position.z = -899;

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
      TweenMax.to(this.mesh.geometry.vertices[i], 2 + Math.random() * 3, {
          z: this.perlin[i] * -(this.p.power / 2 - Math.random() * this.p.power), 
          ease: Linear.easeNone,
          onRepeat: this.generatePerlin.bind(this),
          onUpdate: ()=>{this.meshWireframe.geometry.vertices[i].z = this.mesh.geometry.vertices[i].z},
          onComplete: this.animateVertice.bind(this), 
          onCompleteParams: [i]
      })
  }

  startGUI(showGUI)
  {
    var Params = function(){
        this.nodes = 50;
        this.power = 30;
        this.lightColor = '#fffdf2';
        this.meshColor = '#000000';
        this.meshSpecular = '#090909';
        this.meshEmissive = '#000000';
        this.wireColour = '#000000';
        this.shininess = 50;

        this.modelMeshColor = '#555555';
        this.modelMeshSpecular = '#ffffff';
        this.modelMeshEmissive = '#202220';
        this.modelShininess = 2;        

        this.noiseAmount = .05;
        this.noiseSpeed = 1;
        this.clamp = .25;
        this.lumInfluence = -.5;
        this.onlySSAO = false;
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
    folderNoise.add(this.p, 'clamp', 0, 1).step(.005);
    folderNoise.add(this.p, 'lumInfluence', -50, 200).step(.005);
    folderNoise.add(this.p, 'onlySSAO');
    folderNoise.close();

    // var folderCamera = gui.addFolder('Camera');
    // folderCamera.add(this.camera, 'fov', 0, 1500);
    // folderCamera.add(this.camera, 'near', 0, 1500);
    // folderCamera.add(this.camera, 'far', -1500, 1500);
    // folderCamera.open();

    css(gui.domElement, {position: 'fixed', top: 0, right: 0, 'z-index': 400});
    document.body.appendChild(gui.domElement);
    // console.log()

    // gui.close();
  }

  toggleMaterial(page = 'home')
  {
    if(page == 'home')
    {
      this.mesh.material.emissive = new THREE.Color('#1e1e1e');
      this.meshWireframe.material.color = new THREE.Color('#575757');  
    } else {
      this.mesh.material.emissive = new THREE.Color('#000000');
      this.meshWireframe.material.color = new THREE.Color('#000000');  
    }

    this.mesh.material.needsUpdate = true;
    this.meshWireframe.geometry.verticesNeedUpdate = true;
    
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
      this.toggleMaterial('home')
      this.gallery.animateOut();
    } else {
      this.toggleMaterial('gallery')
    }

    callback();
  }

  render()
  {
    this.mesh.geometry.verticesNeedUpdate = true;
    this.meshWireframe.geometry.verticesNeedUpdate = true;
    this.gallery.update();

    if(this.mapTexture.image)
    {
      this.mapTexture.offset.x += .0015;
      this.mapTexture.offset.y += .0015;
      this.mapTexture.offset.x %= 1;
      this.mapTexture.offset.y %= 1;
      this.mapTexture.needsUpdate = true;
    }

    let mov = Math.sin(this.clock.getElapsedTime()) * 3;

    for (var i = 0; i < this.scene.children.length; i++) {
      if(this.scene.children[i].type !== "DirectionalLight")
      {
        // console.log(this.scene.children[i])
        this.scene.children[i].position.y = mov;
      }
    };

    // this.controls.update()

    if(this.renderPost)
    {
      this.scene.overrideMaterial = this.depthMaterial;

      this.ssaoPass.uniforms[ 'aoClamp' ].value = this.p.clamp;
      this.ssaoPass.uniforms[ 'lumInfluence' ].value = this.p.lumInfluence;
      this.ssaoPass.uniforms[ 'onlyAO' ].value = this.p.onlySSAO;

      this.renderer.render( this.scene, this.camera, this.depthRenderTarget, true );

      this.noisePass.uniforms['amount'].value = this.p.noiseAmount;
      this.noisePass.uniforms['speed'].value = this.p.noiseSpeed;
      this.noisePass.uniforms['time'].value = this.clock.getElapsedTime();  

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
      this.ssaoPass.uniforms[ 'size' ].value.set( window.innerWidth, window.innerHeight );
      this.ssaoPass.uniforms[ 'cameraNear' ].value = this.camera.near;
      this.ssaoPass.uniforms[ 'cameraFar' ].value = this.camera.far;

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