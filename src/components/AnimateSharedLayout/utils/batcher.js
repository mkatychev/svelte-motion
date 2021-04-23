/** 
based on framer-motion@4.0.3,
Copyright (c) 2018 Framer B.V.
*/

import { getFrameData, flushSync } from "framesync"
import { compareByDepth } from '../../../render/utils/compare-by-depth.js';
import { Presence } from '../types.js';

/**
 * Default handlers for batching VisualElements
 */
var defaultHandler = {
    measureLayout: function (child) { return child.updateLayoutMeasurement(); },
    layoutReady: function (child) { return child.notifyLayoutReady(); },
};
/**
 * Create a batcher to process VisualElements
 */
function createBatcher() {
    var queue = new Set();
    return {
        add: function (child) { return queue.add(child); },
        flush: function (_a) {
            
            var _b = _a === void 0 ? defaultHandler : _a, measureLayout = _b.measureLayout, layoutReady = _b.layoutReady, parent = _b.parent;
            var order = Array.from(queue).sort(compareByDepth);
            var resetAndMeasure = function () {
                /**
                 * Write: Reset any transforms on children elements so we can read their actual layout
                 */
                order.forEach(function (child) { return child.resetTransform(); });
                /**
                 * Read: Measure the actual layout
                 */
                order.forEach(measureLayout);
            };
            parent
                ? parent.withoutTransform(resetAndMeasure)
                : resetAndMeasure();
            /**
             * Write: Notify the VisualElements they're ready for further write operations.
             */
            order.forEach(layoutReady);
            /**
             * After all children have started animating, ensure any Entering components are set to Present.
             * If we add deferred animations (set up all animations and then start them in two loops) this
             * could be moved to the start loop. But it needs to happen after all the animations configs
             * are generated in AnimateSharedLayout as this relies on presence data
             */
            order.forEach(function (child) {
                if (child.isPresent)
                    child.presence = Presence.Present;
            });

            flushSync.preRender()
            flushSync.render()
            queue.clear();
        },
    };
}

export { createBatcher };
