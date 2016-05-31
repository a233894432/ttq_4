/**
 * Created by diogoxiang on 2016/5/30.
 */
define(['text!html/index/index.html'], function (tpl) {

    var controller = function () {
        var shtml = _.template(tpl);
        appView.html(shtml({name: 'kenkso'}));

    };

    return controller
});