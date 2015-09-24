import Tabletop       from "tabletop";
import ee             from 'event-emitter';
import TweenMax       from 'gsap';

import LandingPage    from './view/LandingPage';
import UI             from './view/UI';
import VideoOverlay   from './view/VideoOverlay';
import MobileFallback from './view/MobileFallback';

import ajax from 'ajax-request'

class App {
  constructor(data) {

    ajax({url: window.location.href + 'data/data.json', method: 'get'}, (err, res, body) => {
      let e = JSON.parse(body);
      TweenMax.to(document.querySelector('.preloader'), .4, {autoAlpha: 0, onComplete: this.init.bind(this), onCompleteParams: [e]});
    })

    // Tabletop.init({
    //     key: "1iYhvt8m8VNK4TMv6UAHt1IjG0DFksGw0GkpDhAke_FI",
    //     callback: (data, tabletop) =>{

    //       let e = {};
    //       e.artists         = data['artists'].elements
    //       e['general-copy'] = data['general-copy'].elements

    //       // console.log(data);

    //       // var a = document.createElement('a');
    //       // a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(e));
    //       // a.click();
    //       // console.log(data);
    //       TweenMax.to(document.querySelector('.preloader'), .4, {autoAlpha: 0, onComplete: this.init.bind(this), onCompleteParams: [e]});
    //     } 
    // });

  }

  init(data)
  {
    this.browser = require('browser-detection/src/browser-detection')();
    this.mobile  = !(this.browser.os == 'osx' || this.browser.os == 'win')

    if(this.mobile)
    {
      this.initMobile(data);
      return;
    }

    this.emitter       = ee({});
    this.artists       = data['artists'];
    this.currentArtist = 0;
    this.ui            = new UI(data['general-copy']);
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
    this.mobile = new MobileFallback(data['general-copy']);
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