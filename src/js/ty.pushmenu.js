/**
 * jquery.tyPushMenu v 0.2.0
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
(function ($, window, document, undefined) {

    tyPushMenu = function (elem, options) {
        this.elem = elem;
        this.$elem = $(elem);
        this.wrapper;
        this.menuWrapper;
        this.options = options;
        this.metaData = this.$elem.data('tyPushMenu');
        this.$body = $('body');

        this.config;
        this.positions = {};

    }

    tyPushMenu.prototype.__menuInstances = [];
    tyPushMenu.prototype.__expandedMenus = {};
    tyPushMenu.prototype.__pages = {};
    tyPushMenu.prototype.__activePages = [];
    tyPushMenu.prototype.defaults = {
        menuTrigger: '.ty-menu-trigger',
        animationEngine: 'css', // css or js
        position: 'left',
        overlay: true,
        lazyLoad: false,
        isActive: true,
        animation: {
            show: {duration: 500, delay: 100},
            hide: {duration: 300, delay: 0}
        }
    };


    tyPushMenu.prototype._calculatePositions = function () {

        var width = this.$menuWrapper.outerWidth(),
            height = this.$menuWrapper.outerHeight();

        if (this.config.position === 'left') {
            this.positions.x = -width - 10;
            this.positions.y = 0;//height;
        }
        if (this.config.position === 'right') {
            this.positions.x = width + 10;
            this.positions.y = 0;//height;
        }
        if (this.config.position === 'top') {
            this.positions.x = 0;//width;
            this.positions.y = -height - 10;
        }
        if (this.config.position === 'bottom') {
            this.positions.x = 0;//width;
            this.positions.y = height + 10;
        }

        //console.log(this.positions);
    };

    tyPushMenu.prototype._createContentWrapper = function () {
        var wrapper;

        this.config.contentWrapperId = this.config.contentWrapperId || 'tyPushMenu-content-wrapper';

        if (!(wrapper = $("#" + this.config.contentWrapperId)).length) {
            wrapper = $('<div>').attr('id', this.config.contentWrapperId);
            $('body').children().appendTo(wrapper);
            wrapper.appendTo($('body'));
        }

        this.$wrapper = wrapper;
    };

    tyPushMenu.prototype._lazyLoad = function () {

        var ajaxRequest = {};
        var lazyLoad = this.config.lazyLoad;
        var tyPM = this;

        ajaxRequest.url = lazyLoad.url;
        ajaxRequest.type = lazyLoad.method || 'POST';
        ajaxRequest.dataType = lazyLoad.dataType || 'json';
        if (lazyLoad.requestData) {
            ajaxRequest.data = lazyLoad.requestData;
        }

        ajaxRequest.success = function (data) {
            var content;

            if (lazyLoad.dataType === 'json') {
                content = data;
                if (lazyLoad.contentMap) {
                    for (var i in lazyLoad.contentMap) {
                        var key = lazyLoad.contentMap[i];
                        if (content[key] || content[key] === '') {
                            content = content[key];
                        } else {
                            return false;
                        }
                    }
                } else {
                    content = data.content;
                }
            }

            tyPM.$elem.html(content);
            tyPM._setPositions();
            tyPM._setPageTrigger();
            tyPM.loaded = true;


            tyPM.show();
        };


        $.ajax(ajaxRequest);


    };

    tyPushMenu.prototype._setPositions = function () {
        this._calculatePositions();
        this._setPagePosition();
        this.$menuWrapper.velocity({translateX: this.positions.x, translateY: this.positions.y}, 0);
    };
    tyPushMenu.prototype._initOverlay = function () {
        var overlay = $('#ty-overlay');
        var tyM = this;
        if (!overlay.length) {
            overlay = $('<div>')
                .attr('id', 'ty-overlay')
                .click(function () {
                    tyM.hideAll();
                })
                .appendTo($('body'));
        }
        this.$overlay = overlay;
    };

    tyPushMenu.prototype._createWrapper = function () {

    }

    tyPushMenu.prototype._setPagePosition = function () {
        this.$menuWrapper.find('.ty-menu-page, .inner-menu').velocity({
            translateX: this.positions.x,
            translateY: this.positions.y
        }, 0);
    };

    tyPushMenu.prototype._show = function () {
        this.$menuWrapper.show().velocity({translateX: 0, translateY: 0}, this.config.animation.show);
        this.$wrapper
            .velocity({translateX: -this.positions.x, translateY: -this.positions.y}, this.config.animation.show);
        this.$body.css('overflow', 'hidden');
        this.$overlay.show().velocity({opacity: 0.8}, this.config.animation.show)

        this.__expandedMenus[this.id] = true;

        this.isVisiable = true;
    };

    tyPushMenu.prototype.show = function () {

        if (!this.loaded && this.config.lazyLoad) {
            this._lazyLoad();
        } else {
            this._show();
        }
        return this;
    };

    tyPushMenu.prototype.hide = function () {

        this.$menuWrapper.velocity(
            {
                translateX: this.positions.x,
                translateY: this.positions.y
            },
            this.config.animation.hide
        );

        this.$wrapper.velocity(
            {
                translateX: 0,
                translateY: 0
            },
            this.config.animation.hide
        );
        this.$body.css('overflow', 'auto');
        this.isVisiable = false;
        this.$overlay.velocity({opacity: 0}, {
                duration: this.config.animation.hide.duration,
                delay: this.config.animation.hide.delay,
                complete: function () {
                    $(this).hide();
                }
            }
        )

        delete this.__expandedMenus[this.id];
        return this;
    };

    tyPushMenu.prototype.hideAll = function () {
        var index, menu;
        for (index in  this.__expandedMenus) {
            if (menu = this.__menuInstances[index]) menu.hide();
        }
    };

    tyPushMenu.prototype._setPageTrigger = function () {
        var tyM = this;
        tyM.$menuWrapper.find('[data-show-page]').click(function () {
            console.log('triggered');
            pageId = $(this).data('show-page');
            tyM.showPage(pageId);
        });
    };


    tyPushMenu.prototype.__showPage = function ($page) {
        if ($page) {
            $page.show().velocity(
                {
                    opacity: 1,
                    translateX: 0,
                    translateY: 0
                },
                this.config.animation.show
            );
        }
    }

    tyPushMenu.prototype.showPage = function (pageId) {
        var $page;
        if ($page = this.getPage(pageId)) {
            this.__activePages.push(pageId);
            this.__showPage($page);
        }
    };

    tyPushMenu.prototype.hidePage = function () {
        if (this.__activePages.length) {
            $page = this.__activePages.pop();
            this.__hidePage($page);
        }
    };

    tyPushMenu.prototype.__hidePage = function ($page) {
        if ($page) {
            $page.show().velocity(
                {
                    opacity: 1,
                    translateX: this.positions.x,
                    translateY: this.positions.y
                },
                this.config.animation.show
            );
        }
    };

    tyPushMenu.prototype.getPage = function (pageId) {
        var $page;
        if (!(($page = this.__pages[pageId]) && $page.length)) {
            $page = this.$menuWrapper.find('#' + pageId);
            this.__pages[pageId] = $page;
        }
        return $page.length ? $page : null;
    };


    tyPushMenu.prototype.init = function () {

        var tym = this;

        this.config = $.extend({}, this.defaults, this.options, this.metaData);

        this.__menuInstances.push(this);
        this.id = this.__menuInstances.length - 1;

        //LazyLoad Spinner
        if (this.config.lazyLoad) {
            this.loaded = false;
            this.$elem.append($('<span>').addClass(this.config.lazyLoad.spinnerClass ? this.config.lazyLoad.spinnerClass : 'ty-simple-spinner'));
        }

        this.$menuWrapper = $('<div>').addClass('ty-menu ty-menu-' + this.config.position);
        this.$elem.addClass('ty-menu-inner');
        //this.$menuWrapper.appendTo( $('body') );
        $('html').append(this.$menuWrapper);

        this.$menuWrapper.append(this.$elem);
        //this.$elem.appendTo( this.$menuWrapper );

        this._initOverlay();
        this._createContentWrapper();
        this.registrTrigger();

        this._setPositions();
        this._setPageTrigger();
        //this._calculatePositions();
        //this._setPagePosition();

        this.$menuWrapper.velocity({translateX: this.positions.x, translateY: this.positions.y}, 0);
        //this.$menuWrapper.appendTo($('body'));


        $(window).resize(function () {
            tym._calculatePositions();
        });

        return tym;
    };


    /**
     * @param {type} trigger
     * @returns {undefined}
     */
    tyPushMenu.prototype.registrTrigger = function (trigger) {
        if (trigger)
            this.config.menuTrigger = trigger;

        var tyM = this;
        $(document).on('click', this.config.menuTrigger, function () {
            tyM.toggle();
        });
    };


    tyPushMenu.prototype.toggle = function () {
        ( this.isVisiable ) ? this.hide() : this.show();
    };


    /**
     * registr jQuery
     * @param options
     * @return {*}
     */
    $.fn.tyPushMenu = function (options) {
        return new tyPushMenu(this, options).init();
        /*
         return this.each(function () {
         new tyPushMenu(this, options).init();
         });
         /**/
    };


})(jQuery, window, document);