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

    this.currentSound = 0;
    this.sounds = MathP.randomArray(this.sounds);
    this.playSound();
  }

  playSound()
  {
    if(this.sound) this.sound.stop();

    this.sound = new buzz.sound( this.getURL(this.sounds[this.currentSound]), {
        autoplay : false,
        loop: false,
        volume: 0
    } );

    this.sound.bindOnce('ended', this.playSound.bind(this));
    this.sound.load().play().fadeTo(20, 5000);

    this.currentSound++;
    this.currentSound %= this.sounds.length;
  }

  getURL(url)
  {
      let parsed = URL.parse(url, true);
      if(parsed.host === null) return url;
      return "https://googledrive.com/host/" + parsed.query.id + "?r=" + MathP.rrandom(9999);
  }
}

export default SoundController;