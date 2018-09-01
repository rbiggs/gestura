# gestura
Cross-platform gesture library for desktop and mobile

## Event Aliases

Gestura provides normals events and gestures for desktop and mobile. To facility easier cross-platform event handle, Gestura provides the following four event aliases:

1. eventStart
2. eventEnd
3. eventMove
4. eventCancel

On desktop these resolve to `mousedown`, `mouseup` (click), `mousemove` and `mouseout`. On a device with support for pointer events, these become: `pointerdown`, `pointerup`, `pointermove` and `pointercancel`. On a device that supports touch events these become: `touchstart`, `touchend`, `touchmove` and `touchcancel`. You can use these event aliases just like you would any other events, with the assurance that they will work the same everywhere:

```javascript
import { eventStart, eventEnd, eventMove, eventCancel } from 'gestura'

document.querySelector('button').addEventListener(eventEnd, (e) => {
  e.target.classList.toggle('selected')
})
```

## Gestures

On mobile devices users expect to be able to tap and swipe. Gestura provides taps and swipes that work on both mobile and desktop, ensuring an consitent user experience across platforms. With Gestura you don't have to have separate events for desktop and mobile. 

Gestura provides the following gestures:

1. tap
2. longtap
3. dbltap
4. swipe
5. swipeleft
6. swiperight
7. swipeup
8. swipedown

## Using Gestures

There are two ways you can use gestures, as inline events or as event listeners.

### Inline Events

Depending on the library/framework you are using, you can use "on" gestures camel cased or lowercase:

```javascript
import { gestures } from 'gestura'

// Define event callbacks:
function announceTap() {
  alert('You just tapped!')
}

function announceSwipe() {
  alert('You just swiped!')
}

// Define inline events:
function TappableButton(props) {
  return (
    <button onTap={() => announceTap()}>Tap</button>
  )
},

function SwipableButton(props) {
  return (
    <button onSwipe={() => announceSwipe()}>Swipe</button>
  )
}
```

### Event Listeners

You can also use gestures with event listeners:

```javascript
import { gestures } from 'gestura'

const tappableBtn = document.querySelector('#tappableBtn')
tappableBtn.addEventListener('tap', function() {
  alert('You just tapped the button!')
})
```




