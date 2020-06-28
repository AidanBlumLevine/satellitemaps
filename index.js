const size = 256;
$(document).ready(function () {
    $('canvas').width = size;
    $('canvas').height = size;
    start();
});

var model = null;
async function start() {
    $('.outImg')[0].getContext('2d').imageSmoothingEnabled = false;
    model = await tf.loadLayersModel('model/model.json');
    var out = model.predict(tf.zeros([1, size, size, 3]));
    tf.browser.toPixels(out.reshape([size, size, 3]), $('.outImg').get(0));
    $('input').show();
}

function run(img) {
    $('.outImg')[0].getContext('2d').clearRect(0,0,size,size);

    let tensor = tf.browser.fromPixels(img).expandDims(0);
    var out = model.predict(tensor.add(tf.scalar(-127.5)).div(tf.scalar(127.5)));
    out = out.squeeze().add(tf.scalar(1)).div(tf.scalar(2));
    tf.browser.toPixels(out, $('.outImg').get(0));
}

function upload() {
    let inImg = $('.inImg')[0].getContext('2d');
    inImg.clearRect(0,0,size,size);
    let file = $('input')[0].files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
        var img = new Image()
        img.src = reader.result;
        img.onload = function () {
            inImg.width = img.width;
            inImg.height = img.height;
            inImg.drawImage(img, 0, 0);
            run(img);
        };
    }
    reader.readAsDataURL(file);
}