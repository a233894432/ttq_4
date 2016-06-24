/**
 * Created by diogoxiang on 2016/6/23.
 */
define(['text!html/default/header.html', 'text!html/recommendMode/index.html'], function (header_tpl, index_tpl) {

    var cnmae,
        headHtml,
        mainHtml;


    var controller = function () {

        headHtml = _.template(header_tpl);
        mainHtml = _.template(index_tpl);
        var data = {
            token: 'Y2sxNDY2NjcwMDk2NTUz'
        };
        $app.getAjax($url.service.recommend_main, data, successF);

        appView.html(headHtml() + mainHtml());

        var imga = document.createElement('img');
        imga.src = 'upload/CoolShow_Z000010.jpg';
        var imgb = document.createElement('img');
        var ndata;
        imga.onload = function () {
            ndata = $app.getBase64Image(imga);
            imgb.id = 'img-buffer';
            imgb.src = ndata;
            $('#imgDiv').append(imgb);
            console.log(ndata);

            $('.qcrode').empty().qrcode({
                render: 'image',
                mode: 4,
                size: 240,
                fill: '#000',
                background: '#ffffff',
                text: 'no textSSS',
                ecLevel: 'H',
                minVersion: 5,
                quiet: 2,
                mSize: 0.2,
                mPosX: 0.5,
                mPosY: 0.5,
                image: $('#img-buffer')[0]
            });
        };


    };

    function successF(data) {
        console.log(data)
    }

    return controller
});