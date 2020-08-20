var zoom = 16;
var sat_cache = [];
var net_cache = [];
var loading = 0;
$(document).ready(function () {
    start();
});

async function start() {
    var lat = 40.7182;
    var lon = -74.0060;
    n = Math.pow(2, zoom);
    x = Math.floor((lon + 180) / 360 * n);
    y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n);
    var m_canvas = $('.map')[0];
    m_ctx = m_canvas.getContext('2d');
    var n_canvas = $('.n_map')[0];
    n_ctx = n_canvas.getContext('2d');

    model = await tf.loadLayersModel('model/model.json');
    $('.loader').remove();

    var width = Math.min(m_canvas.offsetWidth, 1024);
    var height = Math.min(m_canvas.offsetHeight, 1024);
    m_canvas.width = width;
    m_canvas.height = height;
    n_canvas.width = width;
    n_canvas.height = height;

    console.log(getEncodedStyles([
        {
            "featureType": "all",
            "elementType": "geometry.stroke",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "all",
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "administrative",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "landscape",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#e5e5e5"
                }
            ]
        },
        {
            "featureType": "poi.attraction",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "poi.business",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "poi.government",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "poi.medical",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "poi.place_of_worship",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "poi.school",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "poi.sports_complex",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "road.local",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#ffffff"
                }
            ]
        },
        {
            "featureType": "road.local",
            "elementType": "geometry.stroke",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        }
    ]))
    createMap();
}

function getEncodedStyles(styles) { //converts the readable styles to tile server styles. not my code
    var ret = "";
    var styleparse_types = { "all": "0", "administrative": "1", "administrative.country": "17", "administrative.land_parcel": "21", "administrative.locality": "19", "administrative.neighborhood": "20", "administrative.province": "18", "landscape": "5", "landscape.man_made": "81", "landscape.natural": "82", "poi": "2", "poi.attraction": "37", "poi.business": "33", "poi.government": "34", "poi.medical": "36", "poi.park": "40", "poi.place_of_worship": "38", "poi.school": "35", "poi.sports_complex": "39", "road": "3", "road.arterial": "50", "road.highway": "49", "road.local": "51", "transit": "4", "transit.line": "65", "transit.station": "66", "water": "6" };
    var styleparse_elements = { "all": "a", "geometry": "g", "geometry.fill": "g.f", "geometry.stroke": "g.s", "labels": "l", "labels.icon": "l.i", "labels.text": "l.t", "labels.text.fill": "l.t.f", "labels.text.stroke": "l.t.s" };
    var styleparse_stylers = { "color": "p.c", "gamma": "p.g", "hue": "p.h", "invert_lightness": "p.il", "lightness": "p.l", "saturation": "p.s", "visibility": "p.v", "weight": "p.w" };
    for (i = 0; i < styles.length; i++) {
        if (styles[i].featureType) {
            ret += "s.t:" + styleparse_types[styles[i].featureType] + "|";
        }
        if (styles[i].elementType) {
            if (!styleparse_elements[styles[i].elementType])
                console.log("style element transcription unkown:" + styles[i].elementType);
            ret += "s.e:" + styleparse_elements[styles[i].elementType] + "|";
        }
        if (styles[i].stylers) {
            for (u = 0; u < styles[i].stylers.length; u++) {
                var keys = [];
                var cstyler = styles[i].stylers[u]
                for (var k in cstyler) {
                    if (k == "color") {
                        if (cstyler[k].length == 7)
                            cstyler[k] = "#ff" + cstyler[k].slice(1);
                        else if (cstyler[k].length != 9)
                            console.log("malformed color:" + cstyler[k]);
                    }
                    ret += styleparse_stylers[k] + ":" + cstyler[k] + "|";
                }
            }
        }
        ret = ret.slice(0, ret.length - 1);
        ret += ","
    }
    return encodeURIComponent(ret.slice(0, ret.length - 1));
}

function createMap() {
    loading+=16;
    for (var yTile = 0; yTile < 4; yTile++) {
        for (var xTile = 0; xTile < 4; xTile++) {
            $('.quick-loader').show();
            fetchTile(x + xTile, y + yTile);
        }
    }
}

function fetchTile(xTile, yTile) {
    var matches = sat_cache.filter(c => c.x == xTile && c.y == yTile);
    if (matches.length > 0) {
        m_ctx.drawImage(matches[0].img, (matches[0].x - x) * 256, (matches[0].y - y) * 256);
        var matches2 = net_cache.filter(c => c.x == xTile && c.y == yTile);
        n_ctx.drawImage(matches2[0].img, (matches2[0].x - x) * 256, (matches2[0].y - y) * 256);
        loading--;
        if(loading == 0){
            $('.quick-loader').hide();
        }
    } else {
        var img = new Image();
        img.crossOrigin = "Anonymous"
        img.src = 'http://mt0.google.com/vt/lyrs=s&x=' + xTile + '&y=' + yTile + '&z=' + zoom;
        img.onload = function () {
            var c = { img: img, x: xTile, y: yTile }
            sat_cache.push(c);
            m_ctx.drawImage(c.img, (c.x - x) * 256, (c.y - y) * 256);

            let tensor = tf.browser.fromPixels(c.img).expandDims(0);
            var out = model.predict(tensor.add(tf.scalar(-127.5)).div(tf.scalar(127.5)));
            out = out.squeeze().add(tf.scalar(1)).div(tf.scalar(2));
            var canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            tf.browser.toPixels(out, canvas).then(_ => {
                var c = { img: canvas, x: xTile, y: yTile }
                net_cache.push(c);
                n_ctx.drawImage(c.img, (c.x - x) * 256, (c.y - y) * 256);
                loading--;
                if(loading == 0){
                    $('.quick-loader').hide();
                }
            });
        }
    }
}

document.onkeydown = function (e) {
    if (loading == 0) {
        switch (e.which) {
            case 37:
                x -= 1;
                createMap();
                break;

            case 38:
                y -= 1;
                createMap();
                break;

            case 39:
                x += 1;
                createMap();
                break;

            case 40:
                y += 1;
                createMap();
                break;

            default: return;
        }
        e.preventDefault();
    }
};