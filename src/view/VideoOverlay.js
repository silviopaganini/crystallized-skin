import URL      from 'url';
import TweenMax from 'gsap';
import eve      from 'dom-events';

class VideoOverlay {

    constructor(args) {
        this.el        = document.querySelector('section.video-page');
        this.container = this.el.querySelector('.container-video');
        this.closeBtn  = this.el.querySelector('.close-button');
        TweenMax.to(this.el, 0, {autoAlpha: 0});
    }

    addVideo(url)
    {
        let parsedURL = URL.parse(url, true);
        let iframe = '';

        eve.on(document, 'keyup', this.onKeyUp.bind(this));
        eve.on(this.closeBtn, 'click', this.close.bind(this));

        switch(true)
        {
            case parsedURL.host.indexOf('vimeo') > -1 :
                iframe = `<iframe src=\"//player.vimeo.com/video/${parsedURL.path.split('/').join('')}\?portrait=0&title=0&byline=0&badge=0&color=6b6b6b" width=\"100%\" height=\"100%\" frameborder=\"0\" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>`
                break;

            case parsedURL.host.indexOf('youtube') > -1 :
                let videoID = parsedURL.query.v;
                iframe = `<iframe id=\"ytplayer\" type=\"text/html\" width=\"100%\" height=\"100%\"
                    src=\"http://www.youtube.com/embed/${videoID}?autoplay=0\" frameborder=\"0\"/>`;
                break;
        }

        this.container.innerHTML = iframe;

        TweenMax.to(this.el, .5, {autoAlpha: 1});
    }

    onKeyUp(e)
    {
        if(e.which == 27)
        {
            this.close();
        }
    }

    close()
    {
        eve.off(document, 'keyup', this.onKeyUp.bind(this));
        eve.off(this.closeBtn, 'click', this.close.bind(this));
        TweenMax.to(this.el, .5, {autoAlpha: 0, onComplete: () => {
            this.container.innerHTML = "";
        }});
    }
}

export default VideoOverlay