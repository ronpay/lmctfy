/**
 * 原始版本来自 bangbang(http://lmbtfy.cn/)，mengkun(https://mkblog.cn) 在原作的基础上进行了重制，风格变更为新版百度 UI，并适配了移动端
 * 交互效果参考了 不会百度么？(http://buhuibaidu.me/)
 **
 * 转载或使用时，还请保留以上信息，谢谢！
 */ 

/* IE polyfill */ 
if(!window.location.origin) {
    window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
}

/* Extend getUrlParam method */
$.getUrlParam = function(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r !== null) return unescape(r[2]); return null;
};

$(function() {
    var $kw = $('#kw'),
        $searchSubmit = $('#search-submit'),
        $urlOutput = $('#url-output'),
        $tips = $('#tips'),
        $stop = $('#stop'),
        $arrow = $('#arrow');
    
    var stepTimeout, typeInterval;
    
    /* Get and decode query parameter */ 
    var query = $.getUrlParam('q');
    if(!!query) {
        try {
            query = Base64.decode(query);
        } catch(e) {
            console.log(e);
        }
    }
    
    /* Start tutorial if query exists */
    if(!!query) {
        $tips.html('Let me show you how to use ChatGPT');
        $stop.fadeIn();
        
        stepTimeout = setTimeout(function() {
            $tips.html('1. Find and click the input box');
            
            $arrow.removeClass('active').show().animate({
                left: $kw.offset().left + 20 + 'px',
                top: ($kw.offset().top + $kw.outerHeight() / 2) + 'px'
            }, 2000, function () {
                $tips.html('2. Type your question');
                $arrow.addClass('active');
                
                stepTimeout = setTimeout(function() {
                    $arrow.fadeOut();
                    
                    var i = 0;
                    typeInterval = setInterval(function () {
                        $kw.val(query.substr(0, i));
                        if (++i > query.length) {
                            clearInterval(typeInterval);
                            $tips.html('3. Click the "Ask ChatGPT" button');
                            
                            $arrow.removeClass('active').fadeIn().animate({
                                left: $searchSubmit.offset().left + $searchSubmit.width()  / 2 + 'px',
                                top:  $searchSubmit.offset().top  + $searchSubmit.height() / 2 + 'px'
                            }, 1000, function () {
                                $tips.html('<strong>Now you know how to use ChatGPT!</strong>');
                                $arrow.addClass('active');
                                
                                stepTimeout = setTimeout(function () {
                                    window.location = 'https://chat.openai.com/?q=' + encodeURIComponent(query);
                                }, 1000);
                            });
                        }
                    }, 200);
                }, 500);
            });
        }, 1000);
    }
    
    /* Stop button handler */ 
    $stop.click(function() {
        clearTimeout(stepTimeout);
        clearInterval(typeInterval);
        $stop.hide();
        $arrow.stop().hide();
        $kw.val(query);
        query = false;
        $tips.html('Enter a question and click Ask ChatGPT');
    });
    
    /* Form submission */ 
    $('#search-form').submit(function() {
        if(!!query) return false;
        
        var question = $.trim($kw.val());
        if(!question) {
            $tips.html('<span style="color: red">Please enter a question!</span>');
            $kw.val('');
        } else {
            $tips.html('↓↓↓ Copy the link below to share with others');
            $('#output').fadeIn();
            $urlOutput.val(window.location.origin + window.location.pathname + '?q=' + Base64.encode(question)).focus().select();
        }
        return false;
    });
    
    /* Copy functionality */ 
    var clipboard = new ClipboardJS('[data-clipboard-target]');
    clipboard.on('success', function(e) {
        $tips.html('<span style="color: #4caf50">Copied! Share the link with others!</span>');
    });
    clipboard.on('error', function(e) {
        $tips.html('<span style="color: red">Copy failed, please copy manually...</span>');
    });
    
    /* Preview functionality */ 
    $('#preview').click(function() {
        var link = $urlOutput.val();
        if (!!link) {
            window.open(link);
        }
    });
});