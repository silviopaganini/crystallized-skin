import URL        from 'url';
import TweenMax   from 'gsap';
import eve        from 'dom-events';

class VideoOverlay {

    constructor(args) {
        this.el        = document.querySelector('section.video');
        this.container = this.el.querySelector('.container-video');
        this.iframe    = null;
        this.type = '';
        this.vimeo = null;
        this.includeYT();
    }

    includeYT()
    {
      var tag = document.createElement('script');

      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    addVideo(url)
    {
        this.container.innerHTML = "";
        let parsedURL = URL.parse(url, true);

        switch(true)
        {
            case parsedURL.host.indexOf('vimeo') > -1 :
                this.type = 'vimeo';
                this.iframe = `<iframe id="player" src=\"//player.vimeo.com/video/${parsedURL.path.split('/').join('')}\?
                api=1&player_id=player&portrait=0&title=0&byline=0&badge=0&color=6b6b6b" frameborder=\"0\" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>`

                this.container.innerHTML = this.iframe;

                break;

            case parsedURL.host.indexOf('youtube') > -1 :
                this.type = 'youtube';
                let videoID = parsedURL.query.v;

                let el = document.createElement('div');
                el.id = 'ytplayer';

                this.container.appendChild(el);

                this.ytPlayer = new YT.Player('ytplayer', {
                  height: '100%',
                  width: '100%',
                  videoId: videoID,
                  playerVars : {
                    modestbranding: 1,
                    rel : 0,
                    showinfo : 0,
                    theme : 'dark'  
                  }
                });

                break;
        }
    }

    post(action, value) 
    {
        var data = {
          method: action
        };
        
        if (value) {
            data.value = value;
        }
        
        var message = JSON.stringify(data);
        this.player.contentWindow.postMessage(data, "*");
    }

    stop()
    {
        this.player = this.container.querySelector('iframe');

        if(!this.player && !this.ytPlayer) return;

        this.type == "vimeo" ? this.post('pause') : this.ytPlayer.pauseVideo();
    }
}

export default VideoOverlay