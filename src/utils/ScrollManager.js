import TweenMax from 'gsap';
let ScrollToPlugin = require('gsap/src/uncompressed/plugins/ScrollToPlugin');

class ScrollManager  
{
  constructor(args) 
  {
    this.scrolling  = false;
    this.prevScroll = 0;
    this.emitter = window.APP.emitter;

    this.timerToScroll = 0;

    this.delay = 800;

    window.onscroll = this.onScroll.bind(this);
    window.onkeydown = this.onKeyDown.bind(this);
  }

  calculateDelay(target)
  {
    let a = ((target - window.pageYOffset) * this.delay) / window.innerHeight;
    return Math.max(.4, Math.abs(a/1000));
  }

  onKeyDown(e)
  {
    this.preventDefaultForScrollKeys(e);

    if(window.APP.landing.state == 0)
    {
      switch(e.keyCode)
      {
          case 38:
              this.scrollTo(window.APP.ui.header.offsetTop);
              window.APP.video.stop();
              break;
          case 40: 
              this.scrollTo(window.innerHeight);
              break;
      }

      return;

    }

    switch(e.keyCode)
    {
        case 40:
            this.scrollTo(window.APP.ui.sectionAbout.offsetTop);
            window.APP.video.stop();
            break;

        case 38: 
            this.scrollTo(window.innerHeight);
            break;

        case 39:
            // right
            this.emitter.emit('changeArtist', 'right');
            break;
        case 37:
            // left 
            this.emitter.emit('changeArtist', 'left');
            break;
    }
  }

  preventDefaultForScrollKeys(e) 
  {
    var keys = {37: 1, 38: 1, 39: 1, 40: 1};
    if (keys[e.keyCode]) {
        this.preventDefault(e);
        return false;
    }
  }

  preventDefault(e) 
  {
    e = e || window.event;
    if (e.preventDefault)
        e.preventDefault();
    e.returnValue = false;  
  }

  disableScroll() 
  {
    if (window.addEventListener) // older FF
        window.addEventListener('DOMMouseScroll', this.preventDefault.bind(this), false);
    window.onwheel = this.preventDefault.bind(this); // modern standard
    window.onscroll = this.preventDefault.bind(this); // modern standard
    window.onmousewheel = this.preventDefault.bind(this); // older browsers, IE
    window.ontouchmove  = this.preventDefault.bind(this); // mobile
    document.onkeydown  = this.preventDefaultForScrollKeys.bind(this);
  }

  enableScroll() 
  {
      if (window.removeEventListener)
          window.removeEventListener('DOMMouseScroll', this.preventDefault.bind(this), false);
      window.onmousewheel = null; 
      window.onwheel = null; 
      window.ontouchmove = null;  
      document.onkeydown = this.onKeyDown.bind(this);  
      window.onscroll = this.onScroll.bind(this); // modern standard
  }

  scrollToHeader()
  {
    this.scrollTo(window.APP.ui.sectionVideo.offsetHeight + window.APP.ui.header.offsetTop, null);
  }

  onScroll(e)
  {
    if(this.scrolling) {
      e.preventDefault();
      return;
    }

    clearTimeout(this.timerToScroll);
    this.timerToScroll = 0;

    if(Math.abs((window.pageYOffset - window.APP.ui.sectionVideo.offsetHeight) - window.APP.ui.header.offsetTop) < window.innerHeight / 4)
    {
      this.timerToScroll = setTimeout(this.scrollToHeader.bind(this), this.delay);
    }
  }

  scrollTo(Y, callback, immediate = false)
  {
    this.scrolling = true;
    this.disableScroll();

    TweenMax.to(window, immediate ? 0 : this.calculateDelay(Y), {
        scrollTo: {x: 0, y: Y},
        ease: Power2.easeInOut,
        onComplete: () => {
            if(callback) callback();

            this.prevScroll = window.pageYOffset;
            this.enableScroll();
            this.scrolling = false;
        }
    })
  }
}

export default ScrollManager;