/**
 * jquery.tyPushMenu v 0.0.0
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Created on : 15.06.2015
 * Author     : Tom.Yum. (Artem Khmilevskiy)
 * Site: https://github.com/TomYum/ty-push-menu
 * Issues https://github.com/TomYum/ty-push-menu/issues
 **/


;
(function ( $, window, document, undefined ) {

    var tyPushMenu = function ( elem, options ) {
        this.elem = elem;
        this.$elem = $( elem );
        this.options = options;
        this.metaData = this.$elem.data( 'tyPushMenu' );
    };


    tyPushMenu.prototype.defaults = {
        menuTrigger: '.ty-pushmenu-trigger',
        animationEngine: 'css' // css or js

    };

    tyPushMenu.prototype.init = function () {
        this.config = $.extend( {}, this.defaults, this.options, this.metaData );
        this.registrTrigger();
        return this;
    };

    tyPushMenu.prototype.showMenu = function () {

    };

    tyPushMenu.prototype.hideMenu = function () {
    };

    tyPushMenu.prototype.toggleMenu = function () {
        (this.$elem.is( ':hide' )) ? this.showMenu() : this.hideMenu();
    };

    tyPushMenu.prototype.registrTrigger = function () {
        $( document ).on( 'click', this.config.menuTrigger, function () {
            (this.config.animationEngine === 'css') ? this.$elem.toggleClass( 'ty-pushmenu-show' ) : this.toggleMenu();
        } );
    };








    $.fn.tyPushMenu = function ( options ) {
        return this.each( function () {
            new tyPushMenu( this, options ).init();
        } );

    };



})( jQuery, window, document );





