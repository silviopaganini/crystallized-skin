import Tabletop       from "tabletop";
import ee             from 'event-emitter';
import TweenMax       from 'gsap';

import LandingPage    from './view/LandingPage';
import UI             from './view/UI';
import VideoOverlay   from './view/VideoOverlay';
import MobileFallback from './view/MobileFallback';

class App {
  constructor(data) {

    Tabletop.init({
        key: "1iYhvt8m8VNK4TMv6UAHt1IjG0DFksGw0GkpDhAke_FI",
        callback: (data, tabletop)=>{
          TweenMax.to(document.querySelector('.preloader'), .4, {autoAlpha: 0, onComplete: this.init.bind(this), onCompleteParams: [data, tabletop]});
        } 
    });

  }

  init(data, tabletop)
  {
    this.browser = require('browser-detection/src/browser-detection')();
    this.mobile  = !(this.browser.os == 'osx' || this.browser.os == 'win')

    if(this.mobile)
    {
      this.initMobile(data, tabletop);
      return;
    }

    this.emitter       = ee({});
    this.artists       = data['artists'].elements;
    this.currentArtist = 0;
    this.ui            = new UI(data['general-copy'].elements);
    this.landing       = new LandingPage();
    this.video         = new VideoOverlay();

    this.emitter.on('updateArtist', this.updateCurrentArtist.bind(this));
    this.emitter.on('ready', () => {
      window.onresize = this.landing.onResize.bind(this.landing);
      document.querySelector('main').style.display = 'block';
      TweenMax.to(document.querySelector('main'), 1, {autoAlpha: 1});
    });

    this.landing.init();
  }

  initMobile(data, tabletop)
  {
    this.mobile = new MobileFallback(data['general-copy'].elements);
    TweenMax.to(document.querySelector('.preloader'), .4, {autoAlpha: 0});
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

    this.ui.showArtist(dir);
  }
}

export default App;