$(function() {
    addEvent();

    function addEvent() {
        $('.show-search').click(() => {
            let reg = /none/g;
            if (reg.test($('.search-wrap').attr('class'))) {
                $('.search-wrap').removeClass('none');
            } else {
                $('.search-wrap').addClass('none');
            }
        })
    }
})