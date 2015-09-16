import THREE        from 'three'; 
import css          from 'dom-css';
import Stats        from 'stats-js' ;

import SceneHome    from './SceneHome';
import SceneGallery from './SceneGallery';

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
        display: 'none'
    });

    document.body.appendChild(this.stats.domElement);
  }

  showArtist(direction)
  {
    this.sceneGallery.showArtist(direction);
    this.sceneHome.transitionGallery( true,  ()=> {
      this.state = 1;
    });
  }

  showLanding()
  {
    this.state = 0;
    this.sceneHome.transitionGallery( false, () => {
      window.APP.ui.animateLanding(false);
    });
  }

  createRender()
  {
    this.renderer = new THREE.WebGLRenderer( {
        antialias : true,
        clearColor: 0,
        alpha: false,
        gammaInput : true,
        gammeOutput : true,
        devicePixelRatio : window.devicePixelRatio
    } );

    // this.renderer.setClearColor(0xFFFFFF, 1);
    this.container.appendChild(this.renderer.domElement)
  }

  createScenes()
  {
    this.clock = new THREE.Clock();
    this.sceneHome = new SceneHome(this.renderer, this.clock);
    this.sceneGallery = new SceneGallery(this.renderer, this.clock);
  }

  update()
  {
    this.stats.begin();

    // this.renderer.render(this.scene, this.camera);

    if(this.state == 0)
    {
        this.sceneHome.render();
    } else {
        this.sceneGallery.render();
    }

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
    
    this.sceneHome.onResize();
    this.sceneGallery.onResize();
  }
}

export default LandingPage;