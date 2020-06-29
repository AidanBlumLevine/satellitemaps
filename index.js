var zoom = 16;
var sat_cache = [];
var net_cache = [];
$(document).ready(function () {
    var lat = 40.7128;
    var lon = -74.0060;
    n = Math.pow(2, zoom);
    x = Math.floor((lon + 180) / 360 * n);
    y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n);

    m_ctx = $('.map')[0].getContext('2d');
    n_ctx = $('.n_map')[0].getContext('2d');
    n_start();
    createMap();
});

function createMap() {
    for (var xTile = 0; xTile < 4; xTile++) {
        for (var yTile = 0; yTile < 4; yTile++) {
            fetchSatTile(x + xTile, y + yTile).then(cached => {
                m_ctx.drawImage(cached.img, (cached.x - x) * 256, (cached.y - y) * 256);
            });
            fetchNetTile(x + xTile, y + yTile).then(cached => {
                n_ctx.drawImage(cached.img, (cached.x - x) * 256, (cached.y - y) * 256);
            });
        }
    }
}

function fetchSatTile(xTile, yTile) {
    return new Promise((resolve, reject) => {
        var matches = sat_cache.filter(c => c.x == xTile && c.y == yTile);
        if (matches.length > 0) {
            resolve(matches[0]);
        } else {
            var img = new Image();
            img.crossOrigin = "Anonymous"
            img.src = 'http://mt0.google.com/vt/lyrs=s&x=' + xTile + '&y=' + yTile + '&z=' + zoom;
            img.onload = function () {
                var c = { img: img, x: xTile, y: yTile }
                sat_cache.push(c);
                resolve(c);
            }
        }
    });
}

function fetchNetTile(xTile, yTile) {
    return new Promise((resolve, reject) => {
        var matches = net_cache.filter(c => c.x == xTile && c.y == yTile);
        if (matches.length > 0) {
            resolve(matches[0]);
        } else {
            fetchSatTile(xTile, yTile).then(cached => {
                let tensor = tf.browser.fromPixels(cached.img).expandDims(0);
                var out = model.predict(tensor.add(tf.scalar(-127.5)).div(tf.scalar(127.5)));
                out = out.squeeze().add(tf.scalar(1)).div(tf.scalar(2));

                var canvas = document.createElement('canvas');
                canvas.width = 256;
                canvas.height = 256;
                tf.browser.toPixels(out, canvas);
                var img = new Image();
                img.src = canvas.toDataURL("image/png");
                img.onload = function () {
                    var c = { img: img, x: xTile, y: yTile }
                    net_cache.push(c);
                    resolve(c);
                }
                canvas.remove();
            });
        }
    });
}

function n_start() {
    model = tf.loadLayersModel('model/model.json');
    var out = model.predict(tf.zeros([1, 256, 256, 3]));
    tf.browser.toPixels(out.reshape([256, 256, 3]), $('.outImg').get(0));
    $('input').show();
}

document.onkeydown = function (e) {
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
};