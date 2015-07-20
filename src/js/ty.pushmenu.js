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
        this.enabled = false;

        this.elem = elem;
        this.$elem = $(elem);
        this.wrapper;
        this.menuWrapper;
        this.options = options;
        this.metaData = this.$elem.data('tyPushMenu');
        this.$body = $('body');
        this.$nearElem;

        this.config;
        this.positions = {};
        this.__menuInstances.push(this);
        this.$elem.data('typmId', this.__menuInstances.length - 1);

        this.__activeSubMenu = [];
    }

    tyPushMenu.prototype.__menuInstances = [];
    tyPushMenu.prototype.__expandedMenus = {};
    tyPushMenu.prototype.__pages = {};
    tyPushMenu.prototype.__activePages = [];


    tyPushMenu.prototype.getInstance = function (id) {
        return tyPushMenu.prototype.__menuInstances[id];
    }

    tyPushMenu.prototype.defaults = {
        menuTrigger: '.ty-menu-trigger',
        animationEngine: 'css', // css or js
        position: 'left',
        overlay: true,
        lazyLoad: false,
        isActive: true,
        animation: {
            show: {duration: 500, delay: 0},
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
            tyPM.__initSubmenu();
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
        this.$menuWrapper.find('.menu-page:not(.active,.default), .inner-menu:not(.active,.default)').velocity({
            translateX: this.positions.x,
            translateY: this.positions.y
        }, 0);
    };

    tyPushMenu.prototype._show = function () {
        this.$menuWrapper.show().velocity(
            {translateX: 0, translateY: 0},
            {
                duration: this.config.animation.show.duration,
                delay: this.config.animation.show.delay,
                display: 'block'
            });
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
                translateY: this.positions.y,
            },
            {
                duration: this.config.animation.hide.duration,
                ddelay: this.config.animation.hide.delay,
                display: 'none'
            }
        ).velocity({display: "none"});

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

            var pageId = $(this).data('show-page');
            tyM.showPage(pageId);
        });
        tyM.$menuWrapper.find('.hide-trigger').click(function () {
            tyM.hidePage();
        });


        tyM.$menuWrapper.find('[data-hide-before-index]').click(function () {
            var index = $(this).data('data-hide-before-index') || 0;
            tyM.hidePagesBeforeIndex(index);
        });


        tyM.$menuWrapper.find('.hide-all-trigger').click(function () {
            tyM.hideAllPages();
        });
    };


    tyPushMenu.prototype.__initSubmenu = function () {
        var PWeb = this, $triggers, $menus;

        if (( $menus = this.$elem.find('.inner-menu') ) && $menus.length) {
            $triggers = $menus.siblings('a,span');
            $triggers.click(function (e) {
                e.preventDefault();
                PWeb.showSubmenu(this);
                return false;
            });

            this.$elem.on('click', '.inner-menu .prev', function () {
                PWeb.submenuPrev();
            })
        }
    };
    tyPushMenu.prototype.showSubmenu = function (trigger) {
        var $trigger = $(trigger),
            $inner;

        if (($inner = $trigger.siblings('.inner-menu') ) && $inner.length) {
            this.__showPage($inner);
            this.__activeSubMenu.push($inner);
        }
    };
    tyPushMenu.prototype.submenuPrev = function () {
        var $lastMenu
        if ($lastMenu = this.__activeSubMenu.pop()) {
            this.__hidePage($lastMenu);
        }
    };
    tyPushMenu.prototype.submenuHideAll = function () {
        var $lastMenu
        while ($lastMenu = this.__activeSubMenu.pop()) {
            this.__hidePage($lastMenu);
        }
    };


    tyPushMenu.prototype.__showPage = function ($page) {
        if ($page) {
            $page.show().velocity(
                {
                    translateX: 0,
                    translateY: 0
                },
                {
                    duration: this.config.animation.show.duration,
                    delay: this.config.animation.show.delay,
                    display: "block"
                }
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
        var $page;
        if (this.__activePages.length) {
            $page = this.getPage(this.__activePages.pop());
            this.__hidePage($page);
        }
    };
    tyPushMenu.prototype.hidePagesBeforeIndex = function (PageIndex) {
        var index, pageId, $page;

        if ((PageIndex || PageIndex === 0) && (index = this.__activePages.length)) {
            index--;
            while (pageId = this.__activePages.pop() && index !== PageIndex) {
                $page = this.getPage(pageId);
                this.__hidePage($page);
                index--;
            }
        }
    };


    tyPushMenu.prototype.hideAllPages = function () {
        var pageId, $page;

        if (this.__activePages.length) {
            while (pageId = this.__activePages.pop()) {
                $page = this.getPage(pageId);
                this.__hidePage($page);
            }
        }
    };

    tyPushMenu.prototype.__hidePage = function ($page) {
        if ($page) {

            $page.velocity(
                {
                    translateX: this.positions.x,
                    translateY: this.positions.y
                },
                {
                    duration: this.config.animation.hide.duration,
                    delay: this.config.animation.hide.delay,
                    display: "block"
                }
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

        /* Finding previous element or parent if this element is first. */
        if (!(this.$nearElem = this.$elem.prev()).length) {
            this.$parent = this.$elem.parent();
        }

        //LazyLoad Spinner
        if (this.config.lazyLoad) {
            this.loaded = false;
            this.$elem.append($('<span>').addClass(this.config.lazyLoad.spinnerClass ? this.config.lazyLoad.spinnerClass : 'ty-simple-spinner'));
        }

        this.$menuWrapper = $('<div>').addClass('ty-menu ty-menu-' + this.config.position);
        this.$elem.addClass('ty-menu-inner');
        //this.$menuWrapper.appendTo( $('body') );
        $('html').append(this.$menuWrapper);

        if (this.config.isActive) {
            this.enable();
        }

        //this.$elem.appendTo( this.$menuWrapper );

        this._initOverlay();
        this._createContentWrapper();
        this.registrTrigger();

        this._setPositions();
        this._setPageTrigger();
        this.__initSubmenu();
        //this._calculatePositions();
        //this._setPagePosition();

        this.$menuWrapper.velocity({translateX: this.positions.x, translateY: this.positions.y}, 0);
        //this.$menuWrapper.appendTo($('body'));


        $(this.$elem).resize(function () {
            if (!tym.isVisiable) {
                tym._setPositions();
            } else {
                tym._calculatePositions();
            }
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

    tyPushMenu.prototype.enable = function () {
        this.$menuWrapper.append(this.$elem);
        this._calculatePositions();
        this.enabled = true;
    }

    tyPushMenu.prototype.disable = function () {
        if (this.$nearElem && this.$nearElem.length) {
            this.$elem.after(this.$nearElem);
        } else {
            this.$parent.prepend(this.$elem);
        }
        this.enabled = false;
    }


    /**
     * registr jQuery
     * @param options
     * @return {*}
     */
    $.fn.tyPushMenu = function (options) {
        var typmId, typm;
        if (!( typmId = this.data('typmId')) && typmId !== 0) {
            return new tyPushMenu(this, options).init();
        } else {
            return ( typm = tyPushMenu.prototype.getInstance(typmId) ) ? typm : new tyPushMenu(this, options).init();

        }
        /*
         return this.each(function () {
         new tyPushMenu(this, options).init();
         });
         /**/
    };


})(jQuery, window, document);