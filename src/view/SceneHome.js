import EC       from '../postprocessing/core/EffectComposer';
import NS       from '../postprocessing/Noise';
import RP       from '../postprocessing/core/RenderPass';

import THREE    from 'three'; 
import noise    from 'perlin-noise';
import TweenMax from 'gsap';
import dat      from 'dat-gui' ;

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

    this.startGUI();
    this.createScene();
    this.addObjects();
  }

  createScene()
  {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 4000 );
    this.camera.position.set(0, 45, 240);
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.controls.maxDistance = 500;

    this.scene = new THREE.Scene();
  }

  addObjects()
  {
    this.mesh   = null;
    this.perlin = null;
    this.nodes  = null;
    this.light  = null;
    this.geo    = null;

    // var gridHelper = new THREE.GridHelper( 100, 10 );        
    // this.scene.add( gridHelper );

    this.createComposer();
    this.generatePlane();
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
      if(this.mesh) scene.remove(this.mesh);
      if(this.light) scene.remove(this.light);

      this.light = new THREE.DirectionalLight(this.p.lightColor, 1);
      this.light.position.set( 0, 0, 100 );
      this.scene.add(this.light);

      this.nodes = window.innerWidth / this.p.nodes >> 0;
      this.geo  = new THREE.PlaneGeometry(500, 500, this.nodes, this.nodes);
      this.geo.originalVertices = this.geo.vertices.slice();
      this.mesh = new THREE.Mesh(this.geo, new THREE.MeshPhongMaterial({
          color     : new THREE.Color(this.p.meshColor),
          specular  : new THREE.Color(this.p.meshSpecular),
          emissive  : new THREE.Color(this.p.meshEmissive),
          shininess : new THREE.Color(this.p.shininess),
          shading   : THREE.FlatShading,
          side      : THREE.DoubleSide
      }));

      this.mesh.rotation.x = -20 * Math.PI / 180;
      this.generatePerlin();
      this.scene.add(this.mesh);

      for (var i = 0; i < this.mesh.geometry.vertices.length; i++) {
          this.mesh.geometry.vertices[i].z = this.perlin[i] * -(Math.random() * this.p.power);
          this.animateVertice(this.mesh.geometry.vertices[i], i);
      };

  }

  generatePerlin()
  {
      this.perlin = noise.generatePerlinNoise(this.nodes + 1, this.nodes + 1, {
          octaveCount : 2,
          amplitude: .5,
          persistence: 1
      });

  }

  animateVertice(vert, i)
  {
      TweenMax.to(vert, 1.5 + Math.random() * 3, {
          z: this.perlin[i] * -(Math.random() * this.p.power), 
          delay: .5 + Math.random(),
          yoyo: true,
          ease: Linear.easeNone,
          onRepeat: this.generatePerlin.bind(this),
          repeat: -1
      })
  }

  startGUI()
  {

    var Params = function(){
        this.nodes = 150;
        this.power = 100;
        this.lightColor = '#d7e3ff';
        this.meshColor = '#ebf1ff';
        this.meshSpecular = '#fff3d7';
        this.meshEmissive = '#2d2b26';
        this.shininess = 5;
        this.noiseAmount = .05;
        this.noiseSpeed = 1;
    }

    this.p = new Params();

    var gui = new dat.GUI()
    gui.add(this.p, 'nodes', 100, 200).onChange(this.generatePlane.bind(this));
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
      this.mesh.material.needsUpdate = true;
  }

  render()
  {
    this.noisePass.uniforms['amount'].value = this.p.noiseAmount;
    this.noisePass.uniforms['speed'].value = this.p.noiseSpeed;
    this.noisePass.uniforms['time'].value = this.clock.getElapsedTime();

    this.mesh.geometry.verticesNeedUpdate = true;

    this.composer.render();
  }

  onResize()
  {
    this.composer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }
}

export default SceneHome;