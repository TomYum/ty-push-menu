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
        this.isVisiable = false;

    };



    /**
     * Default settings
     */
    tyPushMenu.prototype.defaults = {
        menuTrigger: '.ty-pushmenu-trigger',
        animationEngine: 'css', // css or js
        position: 'left',
        pushElement: 'body',
        defaultPosition: {x: 0, y: 0, z: 0},
        width: 0,
        height: 0,
        overlay: true
    };


    /**
     * init menu
     * @returns {this}
     */
    tyPushMenu.prototype.init = function () {
        this.config = $.extend( {}, this.defaults, this.options, this.metaData );

        var wrapper = $( '<div>' )
                .addClass( 'ty-pushmenu-wrapper' )
                .addClass( 'ty-pm-' + this.config.position )
                .appendTo( $( 'body' ) )
                .append( this.$elem );

        this.$elem.addClass( 'ty-pushmenu-container' );



        var width = wrapper.outerWidth() * 1;
        var height = wrapper.outerHeight() * 1;
        var displayX = $( window ).width() * 1;
        var displayY = $( window ).height() * 1;


        this.config.height = height;
        this.config.width = width;

        if ( this.config.position === 'left' ) {
            this.config.defaultPosition.x = -width;
        }
        if ( this.config.position === 'right' ) {
            this.config.defaultPosition.x = displayX + width;
        }
        if ( this.config.position === 'top' ) {
            this.config.defaultPosition.y = -height;
        }
        if ( this.config.position === 'bottom' ) {
            this.config.defaultPosition.y = displayY + height;
        }


        wrapper.css( {'transform': 'translate3d('
                    + this.config.defaultPosition.x + 'px,'
                    + this.config.defaultPosition.y + 'px,'
                    + this.config.defaultPosition.z + 'px)'} );


        $( 'body' ).addClass( 'ty-pm-push-element' );
        this.registrTrigger();
        if ( this.config.overlay ) {
            this.initOverlay();
        }
        /**/
        return this;
    };

    tyPushMenu.prototype.moveTo = function ( $elm, pos ) {
        if ( $elm )
            $elm.css( {'transform': 'translate3d(' + pos.x + 'px,' + pos.y + 'px,' + pos.z + 'px)'} );
    };

    /**
     * show menu
     * @returns {undefined}
     */
    tyPushMenu.prototype.showMenu = function () {
        if ( !this.isVisiable ) {
            this.isVisiable = true;
            if ( this.config.position === 'left' || this.config.position === 'right' ) {

                var pushedElm = $( this.config.pushElement );

                var pElmPosition = this.config.defaultPosition;
                pElmPosition.x *= -1;
                this.moveTo( pushedElm, pElmPosition );
                //this.$elem.parent( '.ty-pushmenu-wrapper' ).show();
                //this.moveTo( this.$elem.parent( '.ty-pushmenu-wrapper' ), {x: 0, y: 0, z: 0} );


                this.showOverlay();
            }
        }

    };

    tyPushMenu.prototype.hideMenu = function () {
        if ( this.isVisiable ) {
            this.isVisiable = true;
            if ( this.config.position === 'left' || this.config.position === 'right' ) {
                var pushedElm = $( this.config.pushElement );
                var pElmPosition = this.config.defaultPosition;
                pElmPosition.x = 0;
                pushedElm.css( {'transform': 'translate3d(' + pElmPosition.x + 'px,' + pElmPosition.y + 'px,' + pElmPosition.z + 'px)'} );
                this.showOverlay();
            }
        }
    };



    tyPushMenu.prototype.initOverlay = function () {
    };

    tyPushMenu.prototype.showOverlay = function () {
        var overlay = $( '#ty-overlay' );
        overlay.show();
    };

    /**
     * @param {type} trigger
     * @returns {undefined}
     */
    tyPushMenu.prototype.registrTrigger = function ( trigger ) {
        if ( trigger )
            this.config.menuTrigger = trigger;

        var tyPushMenu = this;
        $( document ).on( 'click', this.config.menuTrigger, function () {
            tyPushMenu.showMenu();
        } );
    };



    /**
     * Registr jQuery Plugin
     * @param {type} options
     * @returns {ty.pushmenu_L15.$.fn@call;each}
     */
    $.fn.tyPushMenu = function ( options ) {
        return this.each( function () {
            new tyPushMenu( this, options ).init();
        } );

    };


})( jQuery, window, document );





