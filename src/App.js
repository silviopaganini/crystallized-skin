import Tabletop     from "tabletop";
import css          from 'dom-css';
import ee           from 'event-emitter';
import LandingPage  from './view/LandingPage';
import UI           from './view/UI';
import VideoOverlay from './view/VideoOverlay';

const emitter = ee({});

class App {
  constructor(data) {
    
    Tabletop.init({
        key: "1iYhvt8m8VNK4TMv6UAHt1IjG0DFksGw0GkpDhAke_FI",
        callback: this.init.bind(this)
    });

  }

  init(data, tabletop)
  {
    this.artists       = data['artists'].elements;
    this.currentArtist = 0;
    this.ui            = new UI(data['general-copy'].elements);
    this.landing       = new LandingPage();
    this.video         = new VideoOverlay();

    emitter.on('updateArtist', this.updateCurrentArtist.bind(this));

    window.onresize = this.landing.onResize.bind(this.landing);

    css(document.querySelector('main'), {
        display: 'block'
    });
  }

  updateCurrentArtist(dir)
  {
    this.currentArtist += dir;

    if(this.currentArtist < 0)
    {
      this.currentArtist == this.artists.length - 1;
    } else if(this.currentArtist > this.artists.length - 1)
    {
      this.currentArtist = 0;
    }
  }
}

export default App;