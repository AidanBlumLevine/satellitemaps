$(document).ready(function () {
    start();
});

var model = null;
async function start() {
    model = await tf.loadLayersModel('model/model.json');
    var out = model.predict(tf.zeros([1, 256, 256, 3]));
    tf.browser.toPixels(out.reshape([256, 256, 3]), $('.outImg').get(0));
    $('input').show();
}

function run() {
    $('.outImg')[0].getContext('2d').clearRect(0,0,256,256);

    let tensor = tf.browser.fromPixels($('.inImg').get(0)).reshape([1, 256, 256, 3]);
    var out = model.predict(tensor.add(tf.scalar(-127.5)).div(tf.scalar(127.5)));

    tf.browser.toPixels(out.squeeze().add(tf.scalar(1)).div(tf.scalar(2)), $('.outImg').get(0));
}

function upload() {
    let inImg = $('.inImg')[0].getContext('2d');
    inImg.clearRect(0,0,256,256);
    let file = $('input')[0].files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
        var img = new Image()
        img.src = reader.result;
        img.onload = function () {
            inImg.drawImage(img, 0, 0);
            run();
        };
    }
    reader.readAsDataURL(file);
}