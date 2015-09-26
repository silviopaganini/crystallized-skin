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
    this.minDelay = .3;
    this.maxDelay = 1;

    window.onscroll = this.onScroll.bind(this);
    window.onkeydown = this.onKeyDown.bind(this);
  }

  calculateDelay(target)
  {
    let a = Math.abs(((target - window.pageYOffset) * this.delay) / window.innerHeight) / 1000;
    return Math.min(this.maxDelay, Math.max(this.minDelay, a));
  }

  onKeyDown(e)
  {
    this.preventDefaultForScrollKeys(e);
    if(!window.APP.landing) return;

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

  getSectionHeight(section)
  {
    if(window.APP.ui) return window.APP.ui[section].offsetHeight;
    return 0;
  }

  scrollToHeader()
  {
    this.scrollTo(this.getSectionHeight('sectionVideo') + this.getSectionHeight('header'), null);
  }

  onScroll(e)
  {
    if(this.scrolling) {
      e.preventDefault();
      return;
    }

    clearTimeout(this.timerToScroll);
    this.timerToScroll = 0;

    if(Math.abs((window.pageYOffset - this.getSectionHeight('sectionVideo')) - this.getSectionHeight('header')) < window.innerHeight / 4)
    {
      this.timerToScroll = setTimeout(this.scrollToHeader.bind(this), this.delay);
    }

    for (var i = 0; i < this.offsets.length; i++) {
      // console.log(window.pageYOffset, window.pageYOffset - this.offsets[i])
      if(Math.abs(window.pageYOffset - this.offsets[i].offsetTop) < window.innerHeight / 2)
      {
        this.timerToScroll = setTimeout((a) =>{
          this.scrollTo(this.offsets[a].offsetTop);
        }.bind(this), this.delay, [i]);
      }
    };
  }

  listArtistsOffsetY(of)
  {
    this.offsets = of
    // this.offsets = [];
    // for (var i = 0; i < window.APP.mobile.artistsUL.length; i++) {
    //   window.APP.mobile.artistsUL[i]
    // };
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