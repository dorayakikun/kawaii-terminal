/* global module */
(function (root, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    root.KawaiiTabMergeLayout = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const MIN_RATIO = 0.1;
  const MAX_RATIO = 0.9;

  const normalizeDirection = (direction) => {
    if (direction === 'left' || direction === 'right' || direction === 'top' || direction === 'bottom') {
      return direction;
    }
    return null;
  };

  const clampRatio = (ratio) => {
    const value = Number(ratio);
    if (!Number.isFinite(value)) return 0.5;
    return Math.max(MIN_RATIO, Math.min(MAX_RATIO, value));
  };

  const getGuidedSplitConfig = (direction) => {
    const normalized = normalizeDirection(direction);
    if (!normalized) return null;
    if (normalized === 'left') {
      return { splitDirection: 'row', side: 'after', activeSide: 'left' };
    }
    if (normalized === 'right') {
      return { splitDirection: 'row', side: 'before', activeSide: 'right' };
    }
    if (normalized === 'top') {
      return { splitDirection: 'col', side: 'after', activeSide: 'top' };
    }
    return { splitDirection: 'col', side: 'before', activeSide: 'bottom' };
  };

  const normalizeSplitDirection = (direction) => (direction === 'col' ? 'col' : 'row');

  const normalizePaneCount = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num) || num <= 0) return 0;
    return Math.round(num);
  };

  const toSegment = (segment) => {
    if (!segment || typeof segment !== 'object') return null;
    const paneCount = normalizePaneCount(segment.paneCount);
    if (!paneCount) return null;
    const node = segment.node;
    if (!node || typeof node !== 'object') return null;
    return { node, paneCount };
  };

  const buildLinearLayoutFromSegments = (segments, splitDirection) => {
    const list = Array.isArray(segments) ? segments.map(toSegment).filter(Boolean) : [];
    if (!list.length) {
      return { node: null, paneCount: 0 };
    }
    const direction = normalizeSplitDirection(splitDirection);
    let accNode = list[0].node;
    let accPaneCount = list[0].paneCount;
    for (let i = 1; i < list.length; i += 1) {
      const next = list[i];
      const total = accPaneCount + next.paneCount;
      const ratio = clampRatio(accPaneCount / total);
      accNode = {
        type: 'split',
        direction,
        ratio,
        a: accNode,
        b: next.node,
      };
      accPaneCount = total;
    }
    return { node: accNode, paneCount: accPaneCount };
  };

  const buildGuidedRootSplit = ({
    activeNode,
    activePaneCount,
    oppositeNode,
    oppositePaneCount,
    splitDirection,
    side,
  } = {}) => {
    if (!activeNode || !oppositeNode) return null;
    const activeCount = normalizePaneCount(activePaneCount);
    const oppositeCount = normalizePaneCount(oppositePaneCount);
    if (!activeCount || !oppositeCount) return null;
    const direction = normalizeSplitDirection(splitDirection);
    const total = activeCount + oppositeCount;
    const oppositeBefore = side === 'before';
    const a = oppositeBefore ? oppositeNode : activeNode;
    const b = oppositeBefore ? activeNode : oppositeNode;
    const aPaneCount = oppositeBefore ? oppositeCount : activeCount;
    return {
      type: 'split',
      direction,
      ratio: clampRatio(aPaneCount / total),
      a,
      b,
    };
  };

  const sumPaneCounts = (values) => {
    if (!Array.isArray(values)) return 0;
    let total = 0;
    for (let i = 0; i < values.length; i += 1) {
      total += normalizePaneCount(values[i]);
    }
    return total;
  };

  const willExceedMaxPanes = ({ activePaneCount, oppositePaneCount, maxPanes } = {}) => {
    const active = normalizePaneCount(activePaneCount);
    const opposite = normalizePaneCount(oppositePaneCount);
    const max = normalizePaneCount(maxPanes);
    if (!max) return true;
    return active + opposite > max;
  };

  return {
    MIN_RATIO,
    MAX_RATIO,
    clampRatio,
    getGuidedSplitConfig,
    buildLinearLayoutFromSegments,
    buildGuidedRootSplit,
    sumPaneCounts,
    willExceedMaxPanes,
  };
}));
