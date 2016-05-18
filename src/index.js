/**
 * core animation
 * @author ydr.me
 * @create 2016-04-08 21:13
 */


    /**
     * @module core/animation
     * @requires utils/access
     * @requires utils/easing
     * @requires utils/typeis
     * @requires utils/object
     * @requires utils/time
     * @requires utils/date
     * @requires utils/function
     * @requires core/attribute
     */

    'use strict';

    var access = require('../utils/access.js');
    var easing = require('../utils/easing.js');
    var typeis = require('../utils/typeis.js');
    var object = require('../utils/object.js');
    var time = require('../utils/time.js');
    var date = require('../utils/date.js');
    var fun = require('../utils/function.js');
    var attribute = require('./attribute.js');

    var defaults = exports.defaults = {
        easing: 'linear',
        duration: 345
    };

    /**
     * 获取样式
     * @param el
     * @param cssKey
     * @returns {Number}
     */
    var getStyle = function (el, cssKey) {
        return parseFloat(attribute.style(el, cssKey));
    };


    /**
     * 设置样式
     * @param el
     * @param styles
     */
    var setStyles = function (el, styles) {
        attribute.style(el, styles);
    };


    var animation = function (el, options, onTransition, onTransitionEnd) {
        options = object.assign({}, defaults, options);

        var optEasing = options.easing;
        var ease = easing[optEasing] || easing[defaults.easing];
        var startTime = date.now();
        var duration = options.duration;

        var flash = function () {
            time.nextFrame(function () {
                var past = date.now() - startTime;

                if (past >= duration) {
                    onTransitionEnd();
                    return;
                }

                var timeRatio = past / duration;

                onTransition(ease(timeRatio));

                flash();
            });
        };

        flash();
    };


    /**
     * 动画
     * @param el {HTMLElement} 元素
     * @param to {Object} 终点
     * @param [options] {Object} 配置
     * @param [options.duration] {Number} 动画时间
     * @param [options.easing] {Number} 动画缓冲
     * @param [callback] {Function} 回调
     */
    exports.animate = function (el, to, options, callback) {
        var args = access.args(arguments);
        var argLen = args.length;
        // 最后一个参数是否为 Function
        var hasCallback = typeis.Function(args[argLen - 1]);

        switch (argLen) {
            case 3:
                // .animate(el, to, callback);
                if (hasCallback) {
                    options = args[3];
                    callback = args[2];
                }
                //  .animate(el, to, options);

                break;

            case 2:
                // .animate(el, to);
                options = args[2];
                break;
        }

        callback = fun.noop(callback);
        var animateMap = {};

        object.each(to, function (cssKey, cssVal) {
            var start = getStyle(el, cssKey);
            var end = parseFloat(cssVal);

            animateMap[cssKey] = {
                s: start,
                l: end - start
            };
        });

        animation(el, options, function (ratio) {
            var styles = {};

            object.each(animateMap, function (cssKey, meta) {
                styles[cssKey] = meta.l * ratio + meta.s;
            });

            setStyles(el, styles);
        }, function () {
            setStyles(el, to);
            callback();
        });
    };