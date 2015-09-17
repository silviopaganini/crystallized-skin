import TweenMax from 'gsap';
let ScrollToPlugin = require('gsap/src/uncompressed/plugins/ScrollToPlugin');

class ScrollManager  
{
  constructor(args) 
  {
    this.scrolling  = false;
    this.prevScroll = 0;
    this.emitter = window.APP.emitter;

    this.delay = 700;

    window.onscroll = this.onScroll.bind(this);
    window.onkeydown = this.onKeyDown.bind(this);
  }

  calculateDelay(target)
  {
    let a = ((target - window.pageYOffset) * this.delay) / window.innerHeight;
    return Math.abs(a/1000);
  }

  onKeyDown(e)
  {
    this.preventDefaultForScrollKeys(e);

    switch(e.keyCode)
    {
        case 40:
            this.scrollTo(window.innerHeight);
            break;
        case 38: 
            window.APP.video.stop();
            this.scrollTo(0);
            break;
    }

    if(window.APP.landing.state == 0) return;

    switch(e.keyCode)
    {
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

  onScroll(e)
  {
    if(this.scrolling) {
      e.preventDefault();
      return;
    }

    let down = window.pageYOffset > this.prevScroll;

    this.prevScroll = window.pageYOffset;

    if(down)
    {
      if(window.pageYOffset > window.innerHeight / 3)
      {
        e.preventDefault();
        this.scrollTo(window.innerHeight, null, true);
      }
    } else {

      if(window.pageYOffset < (window.innerHeight / 3) * 2)
      {
        e.preventDefault();
        window.APP.video.stop();
        this.scrollTo(0, null, true);
      }

    }
  }

  scrollTo(Y, callback, scrolling = false)
  {
    this.scrolling = true;
    this.disableScroll();

    TweenMax.to(window, this.calculateDelay(Y), {
        scrollTo: {x: 0, y: Y},
        ease: scrolling ? Power2.easeOut : Power2.easeInOut,
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