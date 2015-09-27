import _            from 'underscore';
import TweenMax     from 'gsap';
import eve          from 'dom-events';
import css          from 'dom-css';
import Scroll       from '../utils/ScrollManager';
import ArtistObject from './ArtistObject';

class UI  {
  constructor(copy) 
  {
    this.loadingOnScreen  = false;

    this.canvas = document.querySelector('#container-canvas');
    
    this.copy             = copy;
    this.h1               = document.querySelector('main header div.container > h1');
    
    this.h3About          = document.querySelector('main section.about div.container > h3');
    this.h2About          = document.querySelector('main section.about div.container > h2');
    this.h4About          = document.querySelector('main section.about div.container > h4');
    
    // this.h2Gallery     = document.querySelector('main header div.container-gallery > h2');
    
    this.h3               = document.querySelector('main header div.container > h3');
    
    this.sectionAbout     = document.querySelector('main section.about');
    this.sectionVideo     = document.querySelector('main section.video');
    this.sectionArtists   = document.querySelector('main section.artists');
    // this.sectionBottom    = document.querySelector('main section.bottom');

    this.artistH3         = document.querySelector('main section.artists div.container > h3');
    
    // this.bottomButton     = document.querySelector('main section.bottom > h3');
    
    this.button           = document.querySelector('button');
    this.copyContainer    = document.querySelector('main section.about div.container > div.about-copy');
    this.aboutCreds       = document.querySelector('main section.about div.container > div.about-credits');
    
    this.containerPiece   = document.querySelector('main header div.container-gallery > div.container');
    this.pieceName        = document.querySelector('p.piece-name');
    this.pieceLinkCont    = document.querySelector('p.piece-link');
    this.pieceLink        = document.querySelector('p.piece-link span');
    
    this.header           = document.querySelector('header');
    
    this.navLeft          = document.querySelector("nav a[data-side='left']");
    this.navRight         = document.querySelector("nav a[data-side='right']");
    this.arrowBottom      = document.querySelector('main header .arrow-bottom > img');
    this.divArrowBottom   = document.querySelector('main header .arrow-bottom');
    this.arrowBottomVideo = this.sectionVideo.querySelector("div.arrow-bottom");
    
    this.spinner          = document.querySelector('.preloader');

    this.scroll           = new Scroll();


    /*
  
    artists list 

    */

    this.artistsUL = this.sectionArtists.querySelector('ul');
    this.populateArtistsHome();

    /*

    list objects to animate
    
    */
    
    this.initObjectsToAnimate();

    this.setCopy();
    this.listen();
  }

  populateArtistsHome()
  {
    for (var i = 0; i < window.APP.artists.length; i++) {

      let art = new ArtistObject(window.APP.artists[i], i);
      this.artistsUL.appendChild(art.el);
      eve.on(art.el, 'click', this.artistClick.bind(this));
    };
  }

  artistClick(e)
  {
    window.APP.currentArtist = Number(e.target.dataset.index);
    this.showArtist();
  }

  showLoading(show)
  {
    this.loadingOnScreen = show;
    TweenMax.to(this.spinner, .4, {autoAlpha: show | 0});
  }

  showAboveTheFold()
  {
    window.APP.video.stop();
    this.scroll.scrollTo(window.innerHeight);
  }

  backHome()
  {
    window.APP.video.stop();
    this.animateOutGallery(this.showAboveTheFold.bind(this));
  }

  scrollToAboutPage()
  {
    this.scroll.scrollTo(this.sectionAbout.offsetTop);
  }

  scrollUp()
  {
    this.scroll.scrollTo(0);
  }

  listen()
  {
    eve.on(this.button, 'click', this.showArtist.bind(this));

    // eve.on(this.h2Gallery, 'click', this.backHome.bind(this));

    // eve.on(this.sectionBottom, 'click', this.showArtist.bind(this));

    eve.on(this.arrowBottom, 'click', this.scrollToAboutPage.bind(this));

    eve.on(this.arrowBottomVideo, 'click', this.showAboveTheFold.bind(this));
    
    eve.on(this.pieceLink, 'click', this.scrollUp.bind(this));

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
    // this.setString( this.h1, 'title' );
    this.setString( this.h3About, 'about_label' );
    this.setString( this.h2About, 'title' );
    this.setString( this.h4About, 'about_sumup' );
    this.setString( this.aboutCreds, 'credits' );

    this.setString( this.artistH3, 'artists_title' );
    // this.setString( this.bottomButton, 'launch_button' );

    this.setString( this.h3, 'sub_header' );
    this.setString( this.button, 'launch_button' );
    // this.setString( this.h2Gallery, 'title' );
    this.setString( this.pieceLink, 'watch_film_button' );
    this.setString( this.copyContainer, 'about_copy' );
    
  }

  setString(el, key)
  {
    el.innerHTML = _.findWhere(this.copy, {label : key}).copy
  }

  showArtist(direction)
  {
    this.scroll.scrollTo(this.sectionVideo.offsetHeight, () => {
      this.animateLanding( true,  () => {

        // css(this.sectionAbout, {display: 'none'});
        // css(this.sectionBottom, {display: 'none'});

        css(this.sectionVideo, {display: 'block'});
        this.scroll.scrollTo(window.innerHeight, null, true);

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
    this.changeCopyArtistField(this.pieceName, data.artist_name + " - " + data.piece_name + ", " + data.year, 0);
    this.changeCopyArtistField(this.pieceLinkCont, null, .2);
    TweenMax.to(this.divArrowBottom, .5, {y: 0, autoAlpha: 1,delay: .3});
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
      this.scroll.enableScroll();
      // css(this.sectionAbout, {display: 'table'});
      // css(this.sectionBottom, {display: 'block'});
      // css(this.sectionArtists, {display: 'table'});

      css(this.sectionVideo, {display: 'none'});
      // css(this.canvas, {
      //   position : 'fixed'
      // });

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
    this.galleryEls = document.querySelectorAll('main header div.container-gallery > *[data-animation]');

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