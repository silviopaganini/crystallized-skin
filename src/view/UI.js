import _        from 'underscore';
import TweenMax from 'gsap';
import eve      from 'dom-events';
import css      from 'dom-css';
import Scroll   from 'scroll-js';

class UI  {
  constructor(copy) 
  {
    this.copy            = copy;
    this.h1              = document.querySelector('h1');
    
    this.h2About         = document.querySelector('h2[data-title="about"]');
    this.h2Gallery       = document.querySelector('h2[data-title="gallery"]');
    
    this.h3              = document.querySelector('h3');
    
    this.button          = document.querySelector('button');
    this.copyContainer   = document.querySelector('.about-copy');
    
    this.pieceName       = document.querySelector('p.piece-name');
    this.pieceLink       = document.querySelector('p.piece-link a');
    
    this.header          = document.querySelector('header');
    
    this.navLeft         = document.querySelector("nav a[data-side='left']");
    this.navRight        = document.querySelector("nav a[data-side='right']");
    
    this.spinner         = document.querySelector('.preloader');
    this.spinnerChildren = document.querySelectorAll('.sk-cube');

    this.initObjectsToAnimate();

    this.setCopy();
    this.listen();
  }

  showLoading(show, white)
  {
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

  listen()
  {
    eve.on(this.button, 'click', this.showArtist.bind(this));

    eve.on(this.navLeft, 'click', this.navArtist.bind(this), true);
    eve.on(this.navRight, 'click', this.navArtist.bind(this), true);

    eve.on(this.pieceLink, 'click', (e) => {
      e.preventDefault();
      window.APP.video.addVideo(this.pieceLink.href)
    });
  }

  navArtist(e)
  {
    let dir = e.target.parentElement.dataset.side == "right" ? 1 : -1;
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
    this.button.dataset.disabled = "true";

    this.scroller.to(0,0, {easing: 'easeInOutCubic', duration: 700}).then( () => {
      this.animateOutLanding( () => {

        this.animateInGallery();
        window.APP.landing.showArtist(direction);

        let data = window.APP.artists[window.APP.currentArtist];
        this.h2Gallery.innerHTML = data.artist_name;
        this.pieceName.innerHTML = data.piece_name;
        this.pieceLink.href = data.video_url;  

      });
    });
  }

  animateOutLanding(callback)
  {
    var timeline = new TimelineMax({paused: true, onComplete: callback.bind(this)})

    css(this.header, { 'pointer-events' : 'none' });
    
    for (var i = 0; i < this.landingEls.length; i++) {
      timeline.add( TweenMax.to( this.landingEls[i], .4, { y: 10, autoAlpha: 0, ease: Power2.easeOut }), i * .1);
    };

    timeline.play();
  }

  initObjectsToAnimate()
  {
    this.scroller = new Scroll( {el: document.body} );
    this.galleryEls = document.querySelectorAll('section.gallery > *[data-animation]');

    for (var i = 0; i < this.galleryEls.length; i++) {
      TweenMax.to(this.galleryEls[i], 0, {y: -20, autoAlpha: 0});
    };

    this.landingEls = document.querySelectorAll('header > div.container > *[data-animation]');
  }

  animateInGallery()
  {
    for (var i = 0; i < this.galleryEls.length; i++) {
      TweenMax.to(this.galleryEls[i], 0.4, {delay: i * .1, y: 0, autoAlpha: 1});
    };
  }
}

export default UI;