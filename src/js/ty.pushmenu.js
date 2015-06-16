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
        this.parent = $( elem ).parent();
        this.options = options;
        this.metaData = this.$elem.data( 'tyPushMenu' );
    };


    tyPushMenu.prototype.defaults = {
        menuTrigger: '.ty-pushmenu-trigger',
        animationEngine: 'css', // css or js
        position: 'left',
        pushElement: 'parent',
    };

    tyPushMenu.prototype.init = function () {
        this.config = $.extend( {}, this.defaults, this.options, this.metaData );
        this.$elem.addClass( 'ty-pushmenu-wrapper-ul' )
                .addClass( 'ty-pushmenu-' + this.config.position )
                ;
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
        var tyPushMenu = this;
        $( document ).on( 'click', this.config.menuTrigger, function () {
            (tyPushMenu.config.animationEngine === 'css') ? tyPushMenu.$elem.toggleClass( 'ty-pushmenu-show' ) : tyPushMenu.toggleMenu();
        } );
    };








    $.fn.tyPushMenu = function ( options ) {
        return this.each( function () {
            new tyPushMenu( this, options ).init();
        } );

    };



})( jQuery, window, document );





