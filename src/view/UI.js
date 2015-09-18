import _        from 'underscore';
import TweenMax from 'gsap';
import eve      from 'dom-events';
import css      from 'dom-css';
import Scroll   from '../utils/ScrollManager';

class UI  {
  constructor(copy) 
  {
    this.scroll          = new Scroll();
    this.loadingOnScreen = false;

    this.copy            = copy;
    this.h1              = document.querySelector('main header div.container > h1');
    
    this.h2About         = document.querySelector('section.about div.container > h2[data-title="about"]');
    this.h2Gallery       = document.querySelector('section.gallery > h2[data-title="gallery"]');
    
    this.h3              = document.querySelector('main header div.container > h3');

    console.log(this.h2Gallery, this.h3);

    this.sectionAbout    = document.querySelector('section.about');
    this.sectionVideo    = document.querySelector('section.video');
    
    this.button          = document.querySelector('button');
    this.copyContainer   = document.querySelector('section.about div.container > .about-copy');
    
    this.containerPiece  = document.querySelector('section.gallery > div.container');
    this.pieceName       = document.querySelector('p.piece-name');
    this.pieceLinkCont   = document.querySelector('p.piece-link');
    this.pieceLink       = document.querySelector('p.piece-link span');
    
    this.header          = document.querySelector('header');
    
    this.navLeft         = document.querySelector("nav a[data-side='left']");
    this.navRight        = document.querySelector("nav a[data-side='right']");
    this.arrowBottom     = document.querySelector('main header .arrow-bottom > img');
    this.arrowUp         = document.querySelector(".arrow-up > img");
    
    this.spinner         = document.querySelector('.preloader');
    this.spinnerChildren = document.querySelectorAll('.sk-cube');

    this.initObjectsToAnimate();

    this.setCopy();
    this.listen();
  }

  showLoading(show, white)
  {
    this.loadingOnScreen = show;

    if(white)
    {
      for (var i = 0; i < this.spinnerChildren.length; i++) {
        this.spinnerChildren[i].classList.remove('white-preloader');
        this.spinnerChildren[i].classList.add('white-preloader');
      };
    } else {
      for (var i = 0; i < this.spinnerChildren.length; i++) {
        this.spinnerChildren[i].classList.remove('white-preloader');
      };
    }
    TweenMax.to(this.spinner, .4, {autoAlpha: show | 0});
  }

  showAboveTheFold()
  {
    this.scroll.scrollTo(window.innerHeight);
  }

  backHome()
  {
    window.APP.video.stop();
    this.animateOutGallery(this.showAboveTheFold.bind(this));
  }

  scrollUp()
  {
    window.APP.video.stop();
    this.scroll.scrollTo(0);
  }

  listen()
  {
    eve.on(this.button, 'click', this.showArtist.bind(this));

    eve.on(this.h2Gallery, 'click', this.backHome.bind(this));

    eve.on(this.arrowBottom, 'click', this.showAboveTheFold.bind(this));
    eve.on(this.arrowUp, 'click', this.scrollUp.bind(this));
    
    eve.on(this.pieceLink, 'click', this.showAboveTheFold.bind(this));

    eve.on(this.navLeft, 'click', this.navArtist.bind(this), true);
    eve.on(this.navRight, 'click', this.navArtist.bind(this), true);

    this.scroll.emitter.on('changeArtist', this.navArtist.bind(this));
  }

  navArtist(e)
  {
    if(this.loadingOnScreen) return;
    
    let dir; 
    if(e.target)
    {
      dir = e.target.parentElement.dataset.side == "right" ? 1 : -1;
    } else {
      dir = e == "right" ? 1 : -1;
    }

    window.APP.ui.showLoading(true, true);
    window.APP.emitter.emit('updateArtist', dir);
  }

  setCopy()
  {
    this.setString( this.h1, 'title' );
    this.setString( this.h2About, 'about_label' );
    this.setString( this.h3, 'sub_header' );
    this.setString( this.button, 'launch_button' );
    this.setString( this.h2Gallery, 'title' );
    this.setString( this.pieceLink, 'watch_film_button' );
    this.setString( this.copyContainer, 'about_copy' );
    
  }

  setString(el, key)
  {
    el.innerHTML = _.findWhere(this.copy, {label : key}).copy
  }

  showArtist(direction)
  {
    this.scroll.scrollTo(0, () => {
      this.animateLanding( true,  () => {

        css(this.sectionAbout, {display: 'none'});
        css(this.sectionVideo, {display: 'block'});

        for (var i = 0; i < this.galleryEls.length; i++) {
          TweenMax.to(this.galleryEls[i], .5, {y: 0, autoAlpha: 1});
        };

        window.APP.landing.showArtist(direction);
      });
    })
  }

  changeCopyArtist()
  {
    TweenMax.to(this.containerPiece, 0, {autoAlpha: 1});

    let data = window.APP.artists[window.APP.currentArtist];
    this.changeCopyArtistField(this.pieceName, data.artist_name + " - " + data.piece_name + " - " + data.year, 0);
    this.changeCopyArtistField(this.pieceLinkCont, null, .2);
    window.APP.video.addVideo(data.video_url);
  }

  changeCopyArtistField(field, data, delay)
  {
    TweenMax.to(field, .4, {delay: delay, autoAlpha: 0, y: 15, onComplete: () =>{
      if(data) field.innerHTML = data;
      TweenMax.to(field, 0, {y: -15});
      TweenMax.to(field, .4, {autoAlpha: 1, y: 0});
    }})
  }

  animateLanding(out, callback)
  {
    var timeline = new TimelineMax({paused: true, onComplete: ()=> {
      out ? this.scroll.disableScroll() : this.scroll.enableScroll();

      css(this.sectionAbout, {display: 'table'});
      css(this.sectionVideo, {display: 'none'});

      if(callback) callback();
    }});

    this.button.dataset.disabled = out ? "true" : 'false';

    for (var i = 0; i < this.landingEls.length; i++) {
      timeline.add( TweenMax.to( this.landingEls[i], .4, { y: out ? 15 : 0, autoAlpha: out ? 0 : 1, ease: Power2.easeOut }), i * .1);
    };

    timeline.play();
  }

  initObjectsToAnimate()
  {
    this.galleryEls = document.querySelectorAll('section.gallery > *[data-animation]');

    for (var i = 0; i < this.galleryEls.length; i++) {
      TweenMax.to(this.galleryEls[i], 0, {y: -15, autoAlpha: 0});
    };

    TweenMax.to(this.pieceName, 0, {y: -15, autoAlpha: 0});
    TweenMax.to(this.pieceLinkCont, 0, {y: -15, autoAlpha: 0});

    this.landingEls = document.querySelectorAll('header > div.container > *[data-animation]');
  }

  animateOutGallery(callback)
  {
    for (var i = 0; i < this.galleryEls.length; i++) {
      TweenMax.to(this.galleryEls[i], .4, {y: 15, autoAlpha: 0});
    };

    TweenMax.to(this.pieceName, .4, {y: 15, autoAlpha: 0});
    TweenMax.to(this.pieceLinkCont, .4, {y: 15, autoAlpha: 0});

    this.animateLanding(false);

    window.APP.landing.showLanding(callback);
  }
}

export default UI;