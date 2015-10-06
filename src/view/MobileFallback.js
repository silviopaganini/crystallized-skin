import css          from 'dom-css';
import _            from 'underscore';
import eve          from 'dom-events';
import Scroll       from '../utils/ScrollManager';
import ArtistObject from './ArtistObject';

class MobileFallback {
  constructor(copy) {

    this.copy = copy;

    this.scroll  = new Scroll();
    
    this.el           = document.querySelector('div.fallback');
    this.title        = this.el.querySelector('div.content > h2');
    this.h2           = this.el.querySelector('header div.container > h3');
    this.sub          = this.el.querySelector('div.content > h3');
    this.h4           = this.el.querySelector('h4');
    this.p            = this.el.querySelector('p');
    this.content      = this.el.querySelector('.content');
    this.contentCopy  = this.el.querySelector('.content div.about-copy');
    // this.bottomButton = this.el.querySelector('div.bottom > h3');
    this.aboutCreds   = this.el.querySelector('.content div.about-credits');
    this.artistsH3    = this.el.querySelector('div.artists div.container > h3');

    css(this.el, {display: 'block'});

    this.setCopy();
    this.populateArtistsHome();

    this.bottomButton = this.el.querySelector('header div.arrow-bottom');

    this.scroll.init(false);

    eve.on(this.bottomButton, 'click', this.tapDownButton.bind(this));
  }

  tapDownButton(e)
  {
    this.scroll.scrollTo(this.content.offsetTop)
  }

  setCopy()
  {
    this.setString( this.title, 'title' );
    this.setString( this.sub, 'about_label' );
    this.setString( this.h2, 'sub_header' );
    this.setString( this.p, 'mobile_fallback' );
    this.setString( this.contentCopy, 'about_copy' );
    // this.setString( this.bottomButton, 'launch_button' );
    this.setString( this.artistsH3, 'artists_title' );
    this.setString( this.h4, 'about_sumup' );
    this.setString( this.aboutCreds, 'credits' );

  }

  populateArtistsHome()
  {
    this.artistsUL = this.el.querySelector('div.artists div.container > ul');
    let offs = [];

    for (var i = 0; i < window.APP.artists.length; i++) {

      let art = new ArtistObject(
        window.APP.artists[i], 
        i, 
        _.findWhere(this.copy, {label : 'watch_film_button'}).copy, 
        _.findWhere(this.copy, {label : 'new_window'}).copy, 
        true
      );
      
      this.artistsUL.appendChild(art.el);

      art.scale();
      art.accelerometer();

      // let li = document.createElement("li");
      // li.dataset.index = i;
      // li.innerHTML = "<p>" + window.APP.artists[i].artist_name + "</p>";

      eve.on(art.el, 'click', (e)=>{
        let url = window.APP.artists[e.target.dataset.index].video_url;
        window.location.href = url;
      })

      offs.push(art.el);

      // this.artistsUL.appendChild(li);
    };

    this.scroll.listArtistsOffsetY(offs);
  }

  setString(el, key)
  {
    el.innerHTML = _.findWhere(this.copy, {label : key}).copy
  }
}

export default MobileFallback;