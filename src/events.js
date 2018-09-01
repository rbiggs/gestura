/**
 * @type {string} eventStart
 */
var eventStart
/**
 * @type {string} eventEnd
 */
var eventEnd
/**
 * @type {string} eventMove
 */
var eventMove
/**
 * @type {string} eventCancel
 */
var eventCancel

// Pointer events for IE11 and MSEdge:
if (window.navigator.pointerEnabled) {
  eventStart = 'pointerdown';
  eventEnd = 'pointerup';
  eventMove = 'pointermove';
  eventCancel = 'pointercancel';

// Pointer events for IE10 and WP8:
} else if (window.navigator.msPointerEnabled) {
  eventStart = 'MSPointerDown';
  eventEnd = 'MSPointerUp';
  eventMove = 'MSPointerMove';
  eventCancel = 'MSPointerCancel';

// Touch events for iOS & Android:
} else if ('ontouchstart' in window) {
  eventStart = 'touchstart';
  eventEnd = 'touchend';
  eventMove = 'touchmove';
  eventCancel = 'touchcancel';

// Mouse events for desktop:
} else {
  eventStart = 'mousedown';
  eventEnd = 'mouseup';
  eventMove = 'mousemove';
  eventCancel = 'mouseout';
}
export {eventStart, eventEnd, eventMove, eventCancel}


/**
 * Fire a gesture on an element and pass it some optional data.
 * @param {Element} el 
 * @param {string} event 
 * @param {*} [data] 
 */
export function trigger(el, event, data) {
  if (!event) {
    console.error('No event was provided. You do need to provide one.')
    return
  }
  if (typeof el === 'string') el = document.querySelector(el)
  if (document.createEvent) {
    var evtObj = document.createEvent('Events')
    evtObj.initEvent(event, true, false)
    evtObj['data'] = data
    el.dispatchEvent(evtObj)
  }
}

/**
 * Enable gestures in the browser.
 */
export var gestures = function() {
  var touch = {}
  var touchTimeout
  var swipeTimeout
  var tapTimeout
  var longTapDelay = 750
  var singleTapDelay = 150
  var gestureLength = 20
  if (/android/img.test(navigator.userAgent)) singleTapDelay = 200
  var longTapTimeout

  function parentIfText(node) {
    return 'tagName' in node ? node : node.parentNode
  }

  function swipeDirection(x1, x2, y1, y2) {
    return Math.abs(x1 - x2) >=
      Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'left' : 'right') : (y1 - y2 > 0 ? 'up' : 'down')
  }

  function longTap() {
    longTapTimeout = null
    if (touch.last) {
      try {
        if (touch && touch.el) {
          trigger(touch.el, 'longtap')
          touch = {}
        }
      } catch (err) {}
    }
  }

  function cancelLongTap() {
    if (longTapTimeout) clearTimeout(longTapTimeout)
    longTapTimeout = null
  }

  function cancelAll() {
    if (touchTimeout) clearTimeout(touchTimeout)
    if (tapTimeout) clearTimeout(tapTimeout)
    if (swipeTimeout) clearTimeout(swipeTimeout)
    if (longTapTimeout) clearTimeout(longTapTimeout)
    touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null
    touch = {}
  }

  /**
   * Execute this after DOM loads:
   */
  (function() {
    var now
    var delta
    var body = document.body

    /**
     * Capture start of event:
     */
    body.addEventListener(eventStart, function(e) {
      now = Date.now()
      delta = now - (touch.last || now)

      if (eventStart === 'mousedown') {
        touch.el = parentIfText(e.target)
        if (e.target['nodeName'] === 'ripple') {
          touch.el = e.target['parentNode']
        }
        touchTimeout && clearTimeout(touchTimeout)
        touch.x1 = e['pageX']
        touch.y1 = e['pageY']

      /**
       * Detect two or more finger gestures:
       */
      } else {
        if (e['touches'].length === 1) {
          if (!!e.target['disabled']) return
          touch.el = parentIfText(e['touches'][0].target)
          touchTimeout && clearTimeout(touchTimeout)
          touch.x1 = e['touches'][0]['pageX']
          touch.y1 = e['touches'][0]['pageY']
        }
      }

      if (delta > 0 && delta <= 450) {
        touch.isDoubleTap = true
      }
      touch.last = now
      longTapTimeout = setTimeout(longTap, longTapDelay)
    })

    /**
     * Capture event move:
     */
    body.addEventListener(eventMove, function(e) {
      cancelLongTap()
      if (eventMove === 'mousemove') {
        touch.x2 = e['pageX']
        touch.y2 = e['pageY']
      } else {
        /**
         * One finger gesture:
         */
        if (e['touches'].length === 1) {
          touch.x2 = e['touches'][0]['pageX']
          touch.y2 = e['touches'][0]['pageY']
          touch.move = true
        } else if (e['touches'].length === 2) {
          // TODO: pinch - rotate gestures?
        }
      }
    })

    /**
     * Capture event end:
     */
    body.addEventListener(eventEnd, function(e) {

      cancelLongTap()
      if (!!touch.el) {
        /**
         * Swipe detection:
         */
        if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > gestureLength) ||
          (touch.y2 && Math.abs(touch.y1 - touch.y2) > gestureLength)) {
          swipeTimeout = setTimeout(function() {
            if (touch && touch.el) {
              trigger(touch.el, 'swipe')
              trigger(touch.el, 'swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
              touch = {}
            }
          }, 0)

        /**
         * Normal tap:
         */
        } else if ('last' in touch) {
          /**
           * Delay by one tick so we can cancel the 'tap' event if 'scroll' fires:
           */
          tapTimeout = setTimeout(function() {
            /**
             * Trigger double tap immediately:
             */
            if (touch && touch.isDoubleTap) {
              if (touch && touch.el) {
                trigger(touch.el, 'dbltap')
                e.preventDefault()
                touch = {}
              }

            } else {
              /**
               * Trigger tap after singleTapDelay:
               */
              touchTimeout = setTimeout(function() {
                touchTimeout = null
                if (touch && touch.el && !touch.move) {
                  trigger(touch.el, 'tap')
                  touch = {}

                } else {
                  /**
                   * Touch moved so cancel tap:
                   */
                  cancelAll()
                }
              }, singleTapDelay)
            }
          }, 0)
        }

      } else {
        return
      }
    })
    body.addEventListener('touchcancel', cancelAll)
  })()
}

gestures()
