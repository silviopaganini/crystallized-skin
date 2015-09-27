import URL   from 'url';
import buzz  from '../libs/buzz';
import MathP from 'utils-perf';

class SoundController 
{
  constructor(args) {

    this.sounds = [
        'https://drive.google.com/open?id=0B0uHwEQ4FBZxUlE2RmtHRDZfY1E',
        'https://drive.google.com/open?id=0B0uHwEQ4FBZxb3hWRzVFNHVIUTQ',
        'https://drive.google.com/open?id=0B0uHwEQ4FBZxdHE3dm1FMWplLWs'
    ]

    let i = MathP.rrandom(this.sounds.length-1);
    this.sound = new buzz.sound( this.getURL(this.sounds[i]), {
        autoplay : false,
        loop: true,
        volume: 0
    } );

    this.sound.load().play().fadeTo(25, 5000);
  }

  getURL(url)
  {
      let parsed = URL.parse(url, true);
      if(parsed.host === null) return url;
      return "https://googledrive.com/host/" + parsed.query.id + "?r=" + MathP.rrandom(9999);
  }
}

export default SoundController;