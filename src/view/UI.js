import _ from 'underscore';

class UI  {
  constructor(copy) 
  {
    this.copy = copy;
    this.h1 = document.querySelector('h1');
    this.h2 = document.querySelector('h2');
    this.h3 = document.querySelector('h3');

    this.button = document.querySelector('button');
    this.copyContainer = document.querySelector('.about');

    this.setCopy();
  }

  setCopy()
  {
    this.setString( this.h1, 'title' );
    this.setString( this.h2, 'about_label' );
    this.setString( this.h3, 'sub_header' );
    this.setString( this.button, 'launch_button' );

    this.setString( this.copyContainer, 'about_copy' );
    
  }

  setString(el, key)
  {
    el.innerHTML = _.findWhere(this.copy, {label : key}).copy
  }

  // methods
}

export default UI;