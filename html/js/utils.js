var fh = new fhGame();
jQuery(document).ready(function() {
    fh.start();
    jQuery(window).resize(function() {
        fh.draw();
    });
    jQuery('#fh-restart').click(function() {
        fh.restart();
    });
});
