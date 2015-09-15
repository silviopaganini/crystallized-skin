import Tabletop    from "tabletop";
import LandingPage from './view/landing';
import UI          from './view/UI';

function init(data, tabletop)
{
    const landing = new LandingPage();
    window.onresize = landing.onResize.bind(landing);

    const ui = new UI(data['general-copy'].elements);
}

Tabletop.init({
    key: "1iYhvt8m8VNK4TMv6UAHt1IjG0DFksGw0GkpDhAke_FI",
    callback: init.bind(window)
});