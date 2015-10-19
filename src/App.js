import Tabletop        from "tabletop";
import ee              from 'event-emitter';
import TweenMax        from 'gsap';

import LandingPage     from './view/LandingPage';
import UI              from './view/UI';
import VideoOverlay    from './view/VideoOverlay';
import MobileFallback  from './view/MobileFallback';
import SoundController from './utils/SoundController';

import ajax           from 'ajax-request'
import URL            from 'url';

class App {
  constructor(data) {

    let parsedURL = URL.parse(window.location.href, true);

    if(parsedURL.port !== "")
    {
      ajax({
          url: window.location.origin + window.location.pathname + 'data/data.txt', 
          encoding: 'utf-8', 
          json: true, 
          method: 'GET'
        }, (err, res, body) => {
        this.init(body);
      })

      return;
    }

    Tabletop.init({
        key: "1iYhvt8m8VNK4TMv6UAHt1IjG0DFksGw0GkpDhAke_FI",
        callback: (data, tabletop) =>{

          let e = {};
          e.artists         = data['artists'].elements
          e['general-copy'] = data['general-copy'].elements

          // window.open("data:text/json;charset=utf-8," + JSON.stringify(e));
          this.init(e);
        } 
    });

  }

  init(data)
  {
    this.browser = require('browser-detection/src/browser-detection')();
    this.mobile  = !(this.browser.os == 'osx' || this.browser.os == 'win')
    
    this.artists = data['artists'];

    if(this.mobile)
    {
      document.querySelector('main').remove();
      this.initMobile(data);
      return;
    }

    document.querySelector('div.fallback').remove();

    this.emitter       = ee({});
    this.artists       = data['artists'];
    this.currentArtist = ((Math.random() * this.artists.length - 1) + .5) >> 0;
    this.video         = new VideoOverlay();
    this.ui            = new UI(data['general-copy']);
    this.landing       = new LandingPage();

    this.soundManager = new SoundController();

    this.emitter.on('updateArtist', this.updateCurrentArtist.bind(this));
    this.emitter.on('ready', () => {
      window.scrollTo(0, 0);
      window.onresize = this.landing.onResize.bind(this.landing);
      TweenMax.to(document.querySelector('.preloader'), 1.5, {autoAlpha: 0});
      TweenMax.to(document.querySelector('main'), 1.5, {autoAlpha: 1});
    });

    this.landing.init();
    this.ui.scroll.init();
  }

  initMobile(data, tabletop)
  {
    window.scrollTo(0, 0);
    this.mobilefb = new MobileFallback(data['general-copy']);
    TweenMax.to(document.querySelector('.preloader'), .4, {autoAlpha: 0});
  }

  updateCurrentArtist(dir)
  {
    this.currentArtist += dir;

    if(this.currentArtist < 0)
    {
      this.currentArtist = this.artists.length - 1;
    } else if(this.currentArtist > this.artists.length - 1)
    {
      this.currentArtist = 0;
    }

    this.ui.showArtist(dir);
  }
}

export default App;