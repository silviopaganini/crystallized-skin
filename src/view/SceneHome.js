import EC from '../postprocessing/core/EffectComposer';
import NS from '../postprocessing/Noise';
import RP from '../postprocessing/core/RenderPass';
// import OC from 'three-orbit-controls';

import THREE    from 'three'; 
import noise    from 'perlin-noise';
import TweenMax from 'gsap';
import dat      from 'dat-gui' ;
import URL      from 'url';

import Gallery from "./Gallery";

const EffectComposer = EC(THREE);
const NoiseShader = NS(THREE);
const RenderPass = RP(THREE);

class SceneHome 
{
  constructor(renderer, clock) 
  {
    this.camera   = null;
    this.scene    = null;
    this.renderer = renderer;
    this.clock    = clock;

    this.renderPost = window.APP.browser.os == 'osx';

    this.startGUI( parseInt(URL.parse(window.location.href, true).query.d) );
    this.createScene();
    this.addObjects();
  }

  createScene()
  {
    // const OrbitControls = OC(THREE);

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 4000 );
    this.camera.position.set(0, 20, 240);
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.controls.maxDistance = 500;

    this.scene = new THREE.Scene();
  }

  addObjects()
  {
    this.mesh    = null;
    this.perlin  = null;
    this.nodes   = null;
    this.light   = null;
    this.geo     = null;
    
    this.startGallery();

    // var gridHelper = new THREE.GridHelper( 100, 10 );        
    // this.scene.add( gridHelper );

    if(this.renderPost) this.createComposer();
  }

  createComposer()
  {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass( new THREE.RenderPass( this.scene, this.camera ) );

    this.noisePass = new THREE.ShaderPass( NoiseShader );
    this.noisePass.uniforms['amount'].value = .08;
    this.noisePass.uniforms['speed'].value = 1;
    this.noisePass.renderToScreen = true;
    this.composer.addPass( this.noisePass );
  }

  generatePlane()
  {
      if(this.mesh) this.scene.remove(this.mesh);
      if(this.light) this.scene.remove(this.light);

      this.light = new THREE.DirectionalLight(this.p.lightColor, 1);
      this.light.position.set( 0, 0, 100 );
      this.scene.add(this.light);

      // this.light = new THREE.AmbientLight(this.p.lightColor, 1);
      // this.scene.add(this.light);

      this.nodes = this.p.nodes >> (this.mobile ? 2 : 0);

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

      this.mesh.rotation.x = -20 * Math.PI / 180;
      this.generatePerlin();
      this.scene.add(this.mesh);

      for (var i = 0; i < this.mesh.geometry.vertices.length; i++) {
          this.mesh.geometry.vertices[i].z = this.perlin[i] * -(Math.random() * this.p.power);
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
          z: this.perlin[i] * -(Math.random() * this.p.power), 
          delay: .5 + Math.random(),
          yoyo: true,
          ease: Linear.easeNone,
          onRepeat: this.generatePerlin.bind(this),
          repeat: -1
      })
  }

  startGallery()
  {
    this.gallery = new Gallery(this.scene, this.renderer.domElement);
  }

  startGUI(showGUI)
  {
    var Params = function(){
        this.nodes = 20;
        this.power = 100;
        this.lightColor = '#ffffff';
        this.meshColor = '#010101';
        this.meshSpecular = '#181818';
        this.meshEmissive = '#000000';
        this.shininess = 20;
        this.noiseAmount = .05;
        this.noiseSpeed = 1;
    }

    this.p = new Params();

    if(showGUI == 0 || isNaN(showGUI)) return;

    var gui = new dat.GUI()
    gui.add(this.p, 'nodes', 1, 25).onChange(this.generatePlane.bind(this));
    gui.add(this.p, 'power', 0, 200).onChange(this.generatePlane.bind(this));

    var folderColors = gui.addFolder('Colours');
    folderColors.addColor(this.p, 'lightColor').onChange(this.updateColours.bind(this));
    folderColors.addColor(this.p, 'meshColor').onChange(this.updateColours.bind(this));
    folderColors.addColor(this.p, 'meshSpecular').onChange(this.updateColours.bind(this));
    folderColors.addColor(this.p, 'meshEmissive').onChange(this.updateColours.bind(this));
    folderColors.add(this.p, 'shininess', 0, 50).step(1).onChange(this.updateColours.bind(this));
    folderColors.open();

    var folderNoise = gui.addFolder('Postprocessing Noise');
    folderNoise.add(this.p, 'noiseAmount', 0, .2);
    folderNoise.add(this.p, 'noiseSpeed', 0, 10);
    folderNoise.open();

    gui.close();
  }

  updateColours()
  {
      this.mesh.material.color = new THREE.Color(this.p.meshColor);
      this.mesh.material.specular = new THREE.Color(this.p.meshSpecular);
      this.mesh.material.emissive = new THREE.Color(this.p.meshEmissive);
      this.mesh.material.shininess = this.p.shininess;
      this.light.color = new THREE.Color(this.p.lightColor);
      this.mesh.material.needsUpdate = true;
  }

  transitionGallery(out, callback)
  {
    // todo put the gallery here 

    if(!out)
    {
      this.gallery.animateOut();
    }

    callback();
  }

  render()
  {
    if(this.updateColor) this.mesh.material.needsUpdate = true;

    this.mesh.geometry.verticesNeedUpdate = true;

    if(this.renderPost)
    {
      this.noisePass.uniforms['amount'].value = this.p.noiseAmount;
      this.noisePass.uniforms['speed'].value = this.p.noiseSpeed;
      this.noisePass.uniforms['time'].value = this.clock.getElapsedTime();  
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
    this.camera.updateProjectionMatrix();
  }
}

export default SceneHome;