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
        this.colapsedPosition = {x: 0, y: 0, z: 0};
        this.expandedPosition = {x: 0, y: 0, z: 0};
        this.width = 0;
        this.height = 0;
        this.pushElement;
        this.activeSubmenu = {};
        console.log( this );
    };


    tyPushMenu.prototype.expandedMenus = [];

    tyPushMenu.prototype.hideAll = function () {

        for ( var i = 0; i < tyPushMenu.prototype.expandedMenus.length; i++ ) {
            tyPushMenu.prototype.expandedMenus[i].hideMenu();
        }
    };

    /**
     * Default settings
     */
    tyPushMenu.prototype.defaults = {
        menuTrigger: '.ty-pushmenu-trigger',
        animationEngine: 'css', // css or js
        position: 'left',
        pushElement: 'body',
        overlay: true
    };

    tyPushMenu.prototype.initContentWrapper = function () {
        /** 
         * @todo может по-другому?
         */
        if ( !$( '.ty-pm-content-wrapper' ).length ) {
            var contenWrapper = $( '<div>' )
                    .addClass( 'ty-pm-content-wrapper' )
                    .addClass( 'ty-pm-push-element' );
            $( this.config.pushElement ).children().appendTo( contenWrapper );
            contenWrapper.appendTo( $( 'body' ) );
        }
        this.pushElement = '.ty-pm-content-wrapper';
    };

    /**
     * init menu
     * @returns {this}
     */
    tyPushMenu.prototype.init = function () {

        var tyPM = this;
        this.config = $.extend( {}, this.defaults, this.options, this.metaData );


        if ( this.config.pushElement === 'body' )
            this.initContentWrapper();

        var wrapper = $( '<div>' )
                .addClass( 'ty-pushmenu-wrapper' )
                .addClass( 'ty-pm-' + this.config.position )
                .appendTo( $( 'body' ) )
                .append( this.$elem );

        this.$elem.addClass( 'ty-pushmenu-container' );



        var width = wrapper.outerWidth() * 1;
        var height = wrapper.outerHeight() * 1;

//        var displayX = $( window ).width() * 1;
//        var displayY = $( window ).height() * 1;
        var displayX = $( document ).outerWidth() * 1;
        var displayY = $( document ).outerHeight() * 1;

        //alert( 'x:' + displayX );
        //alert( 'y:' + displayY );


        this.height = height;
        this.width = width;

        if ( this.config.position === 'left' ) {
            this.colapsedPosition.x = -width;
            this.expandedPosition.x = 0;
        }
        if ( this.config.position === 'right' ) {
            this.colapsedPosition.x = width;
            this.expandedPosition.x = 0;
        }
        if ( this.config.position === 'top' ) {
            this.colapsedPosition.y = -height;
            this.expandedPosition.y = 0;
        }
        if ( this.config.position === 'bottom' ) {
            this.colapsedPosition.y = height;
            this.expandedPosition.y = 0;
        }


        wrapper.css( {'transform': 'translate3d('
                    + this.colapsedPosition.x + 'px,'
                    + this.colapsedPosition.y + 'px,'
                    + this.colapsedPosition.z + 'px)'} );

        wrapper.find( '.inner-menu' ).css( {'transform': 'translate3d('
                    + this.colapsedPosition.x + 'px,'
                    + this.colapsedPosition.y + 'px,'
                    + this.colapsedPosition.z + 'px)'} );



        //$( 'body' ).addClass( 'ty-pm-push-element' );
        this.registrTrigger();
        if ( this.config.overlay ) {
            this.initOverlay();
        }

        this.$elem.find( 'li>a, li>span' ).click( function () {
            tyPM.showInner( $( this ).parent() );
        } );

        /**/
        return this;
    };

    tyPushMenu.prototype.moveTo = function ( $elm, pos ) {
        if ( $elm )
            $elm.css( {'transform': 'translate3d(' + pos.x + 'px,' + pos.y + 'px,' + pos.z + 'px)'} );
    };

    tyPushMenu.prototype.showInner = function ( $this ) {
        var subMenu = $this.children( '.inner-menu' );
        if ( subMenu.length ) {

            this.createBackLink( subMenu );

            var titleTag = this.getTitleTag( subMenu );
            titleTag.html( $this.children( 'a,span' ).html() );

            this.moveTo( subMenu, {x: 0, y: 0, z: 0} );
        }
    };

    tyPushMenu.prototype.createBackLink = function ( $submenu ) {
        var tyPM = this;
        if ( !$submenu.children( '.back-link' ).length ) {
            $( '<span>' ).addClass( 'back-link' ).html( '<<' )
                    .prependTo( $submenu )
                    .click( function () {
                        tyPM.goBack( $submenu );
                    } );
        }

    };

    tyPushMenu.prototype.goBack = function ( element ) {
        this.moveTo( $( element ), this.colapsedPosition );
    };



    tyPushMenu.prototype.getTitleTag = function ( $elm ) {
        var titleTag = $elm.children( '.title' );
        if ( !titleTag.length ) {
            titleTag = $( '<span>' ).addClass( 'title' ).prependTo( $elm );
        }
        return titleTag;
    };


    /**
     * show menu
     * @returns {this}
     */
    tyPushMenu.prototype.showMenu = function () {
        var wrapper = this.$elem.parent( '.ty-pushmenu-wrapper' );
        wrapper.addClass( 'animated' );
        if ( !this.isVisiable ) {

            this.isVisiable = true;

            var pushedElm = $( this.pushElement );

            var pElmPosition = Object.create( this.colapsedPosition );
            if ( this.config.position === 'left' ) {
                pElmPosition.x = this.width;
            }
            if ( this.config.position === 'right' ) {
                pElmPosition.x = -this.width;
            }
            if ( this.config.position === 'top' ) {
                pElmPosition.y = this.height;
            }
            if ( this.config.position === 'bottom' ) {
                pElmPosition.y = -this.height;
            }




            this.moveTo( pushedElm, pElmPosition );

            this.$elem.show();
            this.moveTo( wrapper, this.expandedPosition );

            this.showOverlay();
            this.expandedMenus.push( this );
            //alert( this.expandedMenus.length );
        }

        return this;
    };

    tyPushMenu.prototype.hideMenu = function () {
        if ( this.isVisiable ) {
            this.isVisiable = false;
            var pushedElm = $( this.pushElement );
            var pElmPosition = this.colapsedPosition;

            this.moveTo( pushedElm, {x: 0, y: 0, z: 0} );
            this.moveTo( this.$elem.parent( '.ty-pushmenu-wrapper' ), pElmPosition );
            this.hideOverlay();
        }
        return this;
    };

    tyPushMenu.prototype.toggle = function () {
        return (this.isVisiable) ? this.hideMenu() : this.showMenu();
    };



    tyPushMenu.prototype.initOverlay = function () {
        var overlay = $( '#ty-overlay' );
        var tyPushMenu = this;
        if ( !overlay.length ) {
            overlay = $( '<div>' )
                    .attr( 'id', 'ty-overlay' )
                    .click( tyPushMenu.hideAll )
                    .appendTo( $( 'body' ) );
        }
    };

    tyPushMenu.prototype.hideOverlay = function () {
        var overlay = $( '#ty-overlay' );
        if ( overlay.length ) {
            overlay.removeClass( 'show' );
        }
    };

    tyPushMenu.prototype.showOverlay = function () {
        var overlay = $( '#ty-overlay' );
        if ( overlay.length ) {
            overlay.addClass( 'show' );
        }
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
            tyPushMenu.toggle();
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





