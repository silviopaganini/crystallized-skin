import URL   from 'url';
import buzz  from '../libs/buzz';
import MathP from 'utils-perf';
import eve   from 'dom-events';

class SoundController 
{
  constructor(args) {

    this.soundURL = "http://crystallizedskins.s3.amazonaws.com/v1/CrystallizedSkins_Medley.mp3";

    this.playing = true;
    this.wasPlaying = false;

    this.soundButton = document.querySelector('.sound-container');
    eve.on(this.soundButton, 'click', this.toggleSound.bind(this));

    this.zoomSound = new buzz.sound('assets/zoom.mp3', {
        autoplay : false,
        volume: 40
    } );

    this.zoomSound.load();

    this.currentSound = 0;
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
    if(!this.playing) return;

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
    this.sound.play().fadeTo(4, 1000, ()=>{
      this.playing = true;
    });
  }

  playSound()
  {
    if(this.sound) this.sound.stop();

    this.playing = true;
    this.wasPlaying = true;

    this.sound = new buzz.sound( this.soundURL, {
        autoplay : false,
        loop: true,
        volume: 0
    } );

    // this.sound.bindOnce('ended', this.playSound.bind(this));
    this.sound.load().play().fadeTo(4, 1000);

    // this.currentSound++;
    // this.currentSound %= this.sounds.length;
  }
}

export default SoundController;