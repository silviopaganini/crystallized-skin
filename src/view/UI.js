import _        from 'underscore';
import TweenMax from 'gsap';
import eve      from 'dom-events';

class UI  {
  constructor(copy) 
  {
    this.copy          = copy;
    this.h1            = document.querySelector('h1');
    
    this.h2About       = document.querySelector('h2[data-title="about"]');
    this.h2Gallery     = document.querySelector('h2[data-title="gallery"]');
    
    this.h3            = document.querySelector('h3');
    
    this.button        = document.querySelector('button');
    this.copyContainer = document.querySelector('.about-copy');

    this.pieceName = document.querySelector('p.piece-name');
    this.pieceLink = document.querySelector('p.piece-link a');

    this.initObjectsToAnimate();

    this.setCopy();
    this.listen();
  }

  listen()
  {
    eve.on(this.button, 'click', this.showArtist.bind(this));
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

  showArtist()
  {
    this.animateOutLanding( () => {

      this.animateInGallery();
      window.__C.landing.showArtist();

      let data = window.__C.artists[window.__C.currentArtist];
      this.h2Gallery.innerHTML = data.artist_name;
      this.pieceName.innerHTML = data.piece_name;
      this.pieceLink.href = data.video_url;  

    });
  }

  animateOutLanding(callback)
  {
    var timeline = new TimelineMax({autoStart: false, onComplete: callback.bind(this)})
    
    for (var i = 0; i < this.landingEls.length; i++) {
      timeline.add( TweenMax.to( this.landingEls[i], .4, { y: 10, autoAlpha: 0, ease: Power2.easeOut }), i * .1);
    };

    timeline.play();
  }

  initObjectsToAnimate()
  {
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