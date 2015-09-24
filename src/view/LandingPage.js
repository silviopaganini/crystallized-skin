import THREE from 'three'; 
import css   from 'dom-css';
import Stats from 'stats-js' ;
import URL   from 'url';

import SceneHome    from './SceneHome';

class LandingPage {
  constructor() 
  {
    this.first = true;

    this.renderer = null;
    this.container = document.getElementById('container-canvas');

    this.state = 0; // shows homepage : 1 shows gallery element
  }

  init()
  {
    this.startStats();
    this.createRender();
    this.createScenes();

    this.onResize();
    this.update();
  }

  startStats()
  {
    this.stats = new Stats(); 
    css(this.stats.domElement, {
        position: 'absolute',
        top: 0,
        left: 0,
        display: parseInt(URL.parse(window.location.href, true).query.d) == 1 ? 'block' : 'none'
    });

    document.body.appendChild(this.stats.domElement);
  }

  showArtist(direction)
  {
    this.scene.gallery.showArtist(direction);
    this.scene.transitionGallery( true,  ()=> {
      this.state = 1;
    });
  }

  showLanding(callback)
  {
    this.state = 0;
    this.scene.transitionGallery( false, () => {
      window.APP.ui.animateLanding(false, callback);
    });
  }

  createRender()
  {
    this.renderer = new THREE.WebGLRenderer( {
        antialias : true,
        clearColor: 0x0000,
        alpha: false,
        gammaInput : true,
        gammeOutput : true,
        devicePixelRatio : window.devicePixelRatio
    } );

    this.renderer.setClearColor(0x000000, 1);
    this.container.appendChild(this.renderer.domElement)
  }

  createScenes()
  {
    this.clock = new THREE.Clock();
    this.scene = new SceneHome(this.renderer, this.clock);
  }

  update()
  {
    this.stats.begin();

    // this.renderer.render(this.scene, this.camera);

    this.scene.render();

    this.stats.end()

    if(this.first)
    {
      this.first = false;
      window.APP.emitter.emit('ready');
    }

    requestAnimationFrame(this.update.bind(this));
  }

  onResize()
  {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.scene.onResize();
  }
}

export default LandingPage;