import css from 'dom-css';
import _   from 'underscore';

class MobileFallback {
  constructor(copy) {

    console.log(copy)

    this.copy = copy;

    this.el      = document.querySelector('div.fallback');
    this.title   = this.el.querySelector('h1');
    this.h2      = this.el.querySelector('h2');
    this.sub     = this.el.querySelector('h3');
    this.content = this.el.querySelector('.content div.about-copy');

    css(this.el, {display: 'block'});

    this.setCopy();
  }

  setCopy()
  {
    this.setString( this.title, 'title' );
    this.setString( this.sub, 'sub_header' );
    this.setString( this.h2, 'about_label' );
    
    // this.setString( this.button, 'launch_button' );
    // this.setString( this.h2Gallery, 'title' );
    // this.setString( this.pieceLink, 'watch_film_button' );
    this.setString( this.content, 'about_copy' );
    
  }

  setString(el, key)
  {
    el.innerHTML = _.findWhere(this.copy, {label : key}).copy
  }
}

export default MobileFallback;