/**
 * jquery.tyPushMenu v 0.0.1
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

    tyMenu = function (elem, options) {
        this.elem = elem;
        this.$elem = $(elem);
        this.options = options;
        this.metaData = this.$elem.data('tyMenu');
        this.$body = $('body');

        this.config;
        this.positions = {};

    }

    tyMenu.prototype.__menuInstances = [];
    tyMenu.prototype.__expandedMenus = {};
    tyMenu.prototype.defaults = {
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


    tyMenu.prototype._calculatePositions = function () {

        var width = this.$elem.outerWidth(),
            height = this.$elem.outerHeight();

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

        console.log(this.positions);
    }

    tyMenu.prototype._createContentWrapper = function () {
        var wrapper;

        this.config.contentWrapperId = this.config.contentWrapperId || 'tyMenu-content-wrapper';

        if (!(wrapper = $("#" + this.config.contentWrapperId)).length) {
            wrapper = $('<div>').attr('id', this.config.contentWrapperId);
            $('body').children().appendTo(wrapper);
            wrapper.appendTo($('body'));
        }

        this.$wrapper = wrapper;
    }

    tyMenu.prototype._lazyLoad = function () {

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
            tyPM.loaded = true;
            tyPM._calculatePositions();
            tyPM.show();
        };


        $.ajax(ajaxRequest);


    }


    tyMenu.prototype._show = function () {
        this.$elem.show().velocity({translateX: 0, translateY: 0}, this.config.animation.show);
        this.$wrapper
            .velocity({translateX: -this.positions.x, translateY: -this.positions.y}, this.config.animation.show);
        this.$body.css('overflow', 'hidden');
        this.$overlay.show().velocity({opacity: 0.8}, this.config.animation.show)

        this.__expandedMenus[this.id] = true;

        this.isVisiable = true;
    }

    tyMenu.prototype.show = function () {

        if (!this.loaded && this.config.lazyLoad) {
            this._lazyLoad();
        } else {
            this._show();
        }
        return this;
    }

    tyMenu.prototype.hide = function () {

        this.$elem.velocity(
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
        })

        delete this.__expandedMenus[this.id];
        return this;
    }

    tyMenu.prototype.hideAll = function () {
        console.log(this);
        var index, menu;
        for (index in  this.__expandedMenus) {
            if (menu = this.__menuInstances[index]) menu.hide();
        }
    };


    tyMenu.prototype._initOverlay = function () {
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

    tyMenu.prototype.init = function () {

        var tym = this;

        this.config = $.extend({}, this.defaults, this.options, this.metaData);

        this.__menuInstances.push(this);
        this.id = this.__menuInstances.length - 1;

        //LazyLoad Spinner
        if (this.config.lazyLoad) {
            this.loaded = false;
            this.$elem.append($('<span>').addClass(this.config.lazyLoad.spinnerClass ? this.config.lazyLoad.spinnerClass : 'ty-simple-spinner'));
        }

        this.$elem.addClass('ty-menu ty-menu-' + this.config.position);

        this._initOverlay();
        this._calculatePositions();
        this._createContentWrapper();
        this.registrTrigger();

        this.$elem.velocity({translateX: this.positions.x, translateY: this.positions.y}, 0);
        this.$elem.appendTo($('body'));

        return tym;
    }


    /**
     * @param {type} trigger
     * @returns {undefined}
     */
    tyMenu.prototype.registrTrigger = function (trigger) {
        if (trigger)
            this.config.menuTrigger = trigger;

        var tyM = this;
        $(document).on('click', this.config.menuTrigger, function () {
            tyM.toggle();
        });
    };


    tyMenu.prototype.toggle = function () {
        ( this.isVisiable ) ? this.hide() : this.show();
    }


    /**
     * registr jQuery
     * @param options
     * @return {*}
     */
    $.fn.tyMenu = function (options) {
        return new tyMenu(this, options).init();
        /*
         return this.each(function () {
         new tyPushMenu(this, options).init();
         });
         /**/
    };


})(jQuery, window, document);