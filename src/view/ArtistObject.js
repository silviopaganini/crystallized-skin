import eve from 'dom-events';
import css from 'dom-css';

class ArtistObject {
  constructor(data) 
  {
    this.totalFrames = 6;
    this.frameWidth  = 640;
    this.frameHeight = 360;
    this.ratio       = this.frameWidth / this.totalFrames;

    this.image     = data.image;
    this.el        = document.createElement('li');
    this.container = document.createElement('div');
    

    css(this.container, {
        'background-repeat' : 'no-repeat',
        'display'           : 'block',
        'width'             : this.frameWidth + 'px',
        'height'            : this.frameHeight + 'px',
        'background-image'  : `url(${this.image})`
    })

    this.el.appendChild(this.container);

    //

    this.p = document.createElement('p');
    this.p.innerHTML = data.artist_name;
    this.el.appendChild(this.p);

    eve.on(this.el, 'mousemove', this.onMouseMove.bind(this));
  }

  onMouseMove(e)
  {
    let frame = (e.offsetX / this.ratio + .5) >> 0;
    let pos = this.frameHeight * frame;
    css(this.container, {
        'background-position' : '0 -' + pos + "px"
    })
  }
}

export default ArtistObject;