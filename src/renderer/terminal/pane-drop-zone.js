/* global module */
(function (root, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    root.KawaiiPaneDropZone = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const EMPTY_ZONE = Object.freeze({
    direction: null,
    side: null,
    splitDirection: null,
    inDeadZone: false,
  });

  const cloneEmptyZone = () => ({
    direction: null,
    side: null,
    splitDirection: null,
    inDeadZone: false,
  });

  const normalizeRect = (rect) => {
    if (!rect || typeof rect !== 'object') return null;
    const left = Number(rect.left);
    const top = Number(rect.top);
    const width = Number(rect.width);
    const height = Number(rect.height);
    if (!Number.isFinite(left) || !Number.isFinite(top) || !Number.isFinite(width) || !Number.isFinite(height)) {
      return null;
    }
    if (width <= 0 || height <= 0) return null;
    const right = Number.isFinite(rect.right) ? Number(rect.right) : left + width;
    const bottom = Number.isFinite(rect.bottom) ? Number(rect.bottom) : top + height;
    if (!Number.isFinite(right) || !Number.isFinite(bottom)) return null;
    return { left, top, right, bottom, width, height };
  };

  const zoneFromDirection = (direction) => {
    if (direction === 'left') {
      return { direction, side: 'before', splitDirection: 'row', inDeadZone: false };
    }
    if (direction === 'right') {
      return { direction, side: 'after', splitDirection: 'row', inDeadZone: false };
    }
    if (direction === 'top') {
      return { direction, side: 'before', splitDirection: 'col', inDeadZone: false };
    }
    if (direction === 'bottom') {
      return { direction, side: 'after', splitDirection: 'col', inDeadZone: false };
    }
    return cloneEmptyZone();
  };

  const resolveZone = (rect, clientX, clientY, { allowOutside = false } = {}) => {
    const normalized = normalizeRect(rect);
    if (!normalized) return cloneEmptyZone();

    const x = Number(clientX);
    const y = Number(clientY);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return cloneEmptyZone();

    const {
      left, top, right, bottom, width, height,
    } = normalized;

    if (!allowOutside && (x < left || x > right || y < top || y > bottom)) {
      return cloneEmptyZone();
    }

    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const dx = x - centerX;
    const dy = y - centerY;

    // Keep the exact center neutral to avoid flicker between opposing directions.
    if (dx === 0 && dy === 0) return cloneEmptyZone();

    const nx = dx / (width / 2);
    const ny = dy / (height / 2);

    if (Math.abs(nx) >= Math.abs(ny)) {
      return zoneFromDirection(dx < 0 ? 'left' : 'right');
    }
    return zoneFromDirection(dy < 0 ? 'top' : 'bottom');
  };

  const getPaneDropZone = (rect, clientX, clientY) => resolveZone(rect, clientX, clientY, { allowOutside: false });

  const getPaneDropZoneWithOutside = (rect, clientX, clientY) => resolveZone(rect, clientX, clientY, { allowOutside: true });

  return {
    EMPTY_ZONE,
    getPaneDropZone,
    getPaneDropZoneWithOutside,
  };
}));
