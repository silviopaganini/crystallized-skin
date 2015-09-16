import THREE        from 'three'; 
import css          from 'dom-css';
import Stats        from 'stats-js' ;

import SceneHome    from './SceneHome';
import SceneGallery from './SceneGallery';

class LandingPage {
  constructor() 
  {
    this.startStats();

    this.renderer = null;
    this.container = document.getElementById('container-canvas');

    this.createRender();
    this.createScenes();

    this.state = 0; // shows homepage : 1 shows gallery element

    this.onResize();
    this.update();
  }

  startStats()
  {
    this.stats = new Stats(); 
    css(this.stats.domElement, {
        position: 'absolute',
        top: 0,
        left: 0
    });

    document.body.appendChild(this.stats.domElement);
  }

  showArtist(direction)
  {
    this.sceneGallery.showArtist(direction);
    this.sceneHome.transitionGallery( ()=> {
      this.state = 1;
    });
  }

  createRender()
  {
    this.renderer = new THREE.WebGLRenderer( {
        antialias : true,
        clearColor: 0,
        gammaInput : true,
        gammeOutput : true
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