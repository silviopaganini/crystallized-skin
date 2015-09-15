import Tabletop     from "tabletop";
import css          from 'dom-css';
import LandingPage  from './view/Landing';
import UI           from './view/UI';
import VideoOverlay from './view/VideoOverlay';

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

    window.onresize = this.landing.onResize.bind(this.landing);

    css(document.querySelector('main'), {
        display: 'block'
    });
  }
}

export default App;