import JSZip from "jszip";
import { saveAs } from 'file-saver';
var zip, folder, canvas, ctx, zoom;
$(document).ready(function () {
    zip = new JSZip();
    folder = zip.folder('collection');
    canvas = $('canvas')[0];
    ctx = canvas.getContext('2d');
    zoom = 16;
    var lat = 40.7182;
    var lon = -74.0060;
    var n = Math.pow(2, zoom);
    var x = Math.floor((lon + 180) / 360 * n);
    var y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n);
    console.log(x + "," + y);
    getImages(x, y, 25, 500);
})

async function getImages(x, y, range, count) {

    for (var i = 0; i < count; i++) {
        var ranX = Math.floor(Math.random() * range * 2) - range + x;
        var ranY = Math.floor(Math.random() * range * 2) - range + y; 
        var sat = 'http://mt0.google.com/vt/lyrs=s&x=' + ranX + '&y=' + ranY + '&z=' + zoom;
        ctx.drawImage(await image(sat),0,0);
        var str = 'https://a.basemaps.cartocdn.com/rastertiles/voyager_nolabels/' + zoom + '/' + ranX + '/' + ranY + '.png';
        ctx.drawImage(await image(str),256,0);
        folder.file(i+'.png', canvas.toDataURL().split('base64,')[1], {base64: true});
    }
    folder.generateAsync({ type: "blob" }).then(content => saveAs(content, "maps"));
}

function image(src){
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = src;
        img.onload = () => resolve(img);
    });
}
