import eve from 'dom-events';
import css from 'dom-css';

class ArtistObject {
  constructor(data, index) 
  {
    this.totalFrames = 6;
    this.frameWidth  = 640;
    this.frameHeight = 360;
    this.ratio       = this.frameWidth / this.totalFrames;

    this.image     = data.image;
    this.el        = document.createElement('li');
    this.container = document.createElement('div');
    this.el.dataset.index = index;
    

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

  getFrame(offset)
  {
    return Math.min(this.totalFrames, Math.max(0, (offset / this.ratio + .5) >> 0));
  }

  onMouseMove(e)
  {
    let frame = this.getFrame(e.offsetX);
    let pos = this.frameHeight * frame;
    css(this.container, {
        'background-position' : '0 -' + pos + "px"
    })
  }
}

export default ArtistObject;