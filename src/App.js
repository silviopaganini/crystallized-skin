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

    if(parsedURL.port == "" || parsedURL.query.d == '1')
    {

      ajax({url: window.location.origin + window.location.pathname + 'data/data.txt', method: 'get'}, (err, res, body) => {
        let e = JSON.parse(body);
        TweenMax.to(document.querySelector('.preloader'), .4, {autoAlpha: 0, onComplete: this.init.bind(this), onCompleteParams: [e]});
      })

      return;

    }

    Tabletop.init({
        key: "1iYhvt8m8VNK4TMv6UAHt1IjG0DFksGw0GkpDhAke_FI",
        callback: (data, tabletop) =>{

          let e = {};
          e.artists         = data['artists'].elements
          e['general-copy'] = data['general-copy'].elements

          // window.open("data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(e)));
          TweenMax.to(document.querySelector('.preloader'), .4, {autoAlpha: 0, onComplete: this.init.bind(this), onCompleteParams: [e]});
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
      this.initMobile(data);
      return;
    }

    document.querySelector('div.fallback').remove();


    this.emitter       = ee({});
    this.artists       = data['artists'];
    this.currentArtist = ((Math.random() * this.artists.length) + .5) >> 0;
    this.video         = new VideoOverlay();
    this.ui            = new UI(data['general-copy']);
    this.landing       = new LandingPage();

    this.soundManager = new SoundController();

    this.emitter.on('updateArtist', this.updateCurrentArtist.bind(this));
    this.emitter.on('ready', () => {
      window.onresize = this.landing.onResize.bind(this.landing);
      document.querySelector('main').style.display = 'block';
      TweenMax.to(document.querySelector('main'), 1, {autoAlpha: 1});
    });

    this.landing.init();
    this.ui.scroll.init();
  }

  initMobile(data, tabletop)
  {
    this.mobilefb = new MobileFallback(data['general-copy']);
    TweenMax.to(document.querySelector('.preloader'), .4, {autoAlpha: 0});
    document.querySelector('main').remove();
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