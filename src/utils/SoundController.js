import URL   from 'url';
import buzz  from '../libs/buzz';
import MathP from 'utils-perf';
import eve   from 'dom-events';

class SoundController 
{
  constructor(args) {

    this.sounds = [
        'https://drive.google.com/open?id=0B0uHwEQ4FBZxUlE2RmtHRDZfY1E',
        'https://drive.google.com/open?id=0B0uHwEQ4FBZxb3hWRzVFNHVIUTQ',
        'https://drive.google.com/open?id=0B0uHwEQ4FBZxdHE3dm1FMWplLWs'
    ]

    this.playing = false;
    this.wasPlaying = false;

    this.soundButton = document.querySelector('.sound-container');
    eve.on(this.soundButton, 'click', this.toggleSound.bind(this));

    this.zoomSound = new buzz.sound('assets/zoom.mp3', {
        autoplay : false,
        volume: 40
    } );

    this.zoomSound.load();

    this.currentSound = 0;
    this.sounds = MathP.randomArray(this.sounds);
    this.playSound();
  }

  flickPlay()
  {
    if(!this.playing) return;

    let flickSound = new buzz.sound('assets/flick.mp3', {
        autoplay : true,
        volume: 1
    } );
  }

  zoomPlay(zoom)
  {
    if(zoom)
    {
      if(!this.zoomSound.isPaused()) return;
      this.zoomSound.play().fadeTo(60, 500);
      return;
    }

    this.zoomSound.fadeTo(0, 500, ()=>{
      this.zoomSound.stop();
    });
  }

  toggleSoundVideo(pause = true)
  {
    if(this.wasPlaying) this.resumeSound();
    if(!this.playing) return;
    if(pause) {this.pauseSound(); return;}
  }

  toggleSound()
  {
    if(this.playing)
    {
      this.wasPlaying = false;
      this.pauseSound();
    } else {
      this.resumeSound();
    }
  }

  pauseSound()
  {
    this.soundButton.dataset.state = 'off';
    this.sound.fadeTo(0, 1000, ()=>{
      this.sound.pause();
      this.playing = false;
    });
  }

  resumeSound()
  {
    this.wasPlaying = true;
    this.soundButton.dataset.state = 'on';
    this.sound.play().fadeTo(5, 1000, ()=>{
      this.playing = true;
    });
  }

  playSound()
  {
    if(this.sound) this.sound.stop();

    this.playing = true;
    this.wasPlaying = true;

    this.sound = new buzz.sound( this.getURL(this.sounds[this.currentSound]), {
        autoplay : false,
        loop: false,
        volume: 0
    } );

    this.sound.bindOnce('ended', this.playSound.bind(this));
    this.sound.load().play().fadeTo(5, 1000);

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