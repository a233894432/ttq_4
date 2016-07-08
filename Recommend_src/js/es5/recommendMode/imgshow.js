/**
 * Created by diogoxiang on 2016/6/27.
 */
define(['text!html/default/imgshow.html'], function (img_tpl) {
    var cnmae,
        headHtml,
        mainHtml,
        imgHtml;
    var controller = function () {
        console.log('imgshow');
        imgHtml = _.template(img_tpl);
        appView.html(imgHtml());
        var shareurl = $app.getStorage('shareUrl');
        console.log(shareurl)
        if(apicloud.version=="ios"){
            $app.getNativeQrcode({txturl:shareurl},'#myQcrodeBig')
        }else{
            $app.drawQrcode(shareurl,800,'#myQcrodeBig');

        }


        btnAction();


    };

    var btnAction = function () {
        $('#bigboxAction').on('click', function () {
            window.history.back(-1);
        });

        $('#saveQcrode').on('click', function () {
            console.log(this);
            event.preventDefault();
            event.stopPropagation();
            var imgC64 = $('#myQcrodeBig img').attr('src');
            var imgBase64 = imgC64.substring(imgC64.indexOf(',') + 1);
            //console.log(imgBase64);

            //apicloud.trans.saveImage({
            //    base64Str: imgBase64,
            //    album: true,
            //    //imgPath:api.cacheDir + "/temp/",
            //    imgName: 'ttq-Qcrode.png'
            //}, function (ret, err) {
            //    if (ret.status) {
            //        $app.layer.msg('保存到相册成功')
            //    } else {
            //        console.log(JSON.stringify(err));
            //
            //    }
            //});

        });
    };
    return controller;
});