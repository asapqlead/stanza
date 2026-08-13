import { useCallback, useRef } from 'react';

interface UseLongPressOptions {
  isPreventDefault?: boolean;
  delay?: number;
}

export const useLongPress = (
  onLongPress: (e: any) => void,
  onClick?: (e: any) => void,
  { isPreventDefault = true, delay = 500 }: UseLongPressOptions = {}
) => {
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const target = useRef<EventTarget>();
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const start = useCallback(
    (event: React.PointerEvent) => {
      if (isPreventDefault && event.target) {
        event.target.addEventListener('touchend', preventDefault, {
          passive: false
        });
        target.current = event.target;
      }
      
      startPos.current = { x: event.clientX, y: event.clientY };
      
      timeout.current = setTimeout(() => {
        onLongPress(event);
      }, delay);
    },
    [onLongPress, delay, isPreventDefault]
  );

  const clear = useCallback(
    (event: React.PointerEvent, shouldTriggerClick = true) => {
      timeout.current && clearTimeout(timeout.current);
      shouldTriggerClick && onClick && onClick(event);
      
      if (isPreventDefault && target.current) {
        target.current.removeEventListener('touchend', preventDefault);
      }
    },
    [onClick, isPreventDefault]
  );

  const move = useCallback((event: React.PointerEvent) => {
    if (startPos.current && timeout.current) {
      const dx = event.clientX - startPos.current.x;
      const dy = event.clientY - startPos.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // If pointer moved more than 10px, cancel long press
      if (distance > 10) {
        clearTimeout(timeout.current);
      }
    }
  }, []);

  return {
    onPointerDown: (e: React.PointerEvent) => start(e),
    onPointerUp: (e: React.PointerEvent) => clear(e, true),
    onPointerLeave: (e: React.PointerEvent) => clear(e, false),
    onPointerCancel: (e: React.PointerEvent) => clear(e, false),
    onPointerMove: move,
  };
};

const isTouchEvent = (event: Event) => {
  return 'touches' in event;
};

const preventDefault = (event: Event) => {
  if (!isTouchEvent(event)) return;

  if ((event as TouchEvent).touches.length < 2 && event.preventDefault) {
    event.preventDefault();
  }
};
