const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getGuidedSplitConfig,
  buildLinearLayoutFromSegments,
  buildGuidedRootSplit,
  willExceedMaxPanes,
} = require('./tab-merge-layout.js');

test('getGuidedSplitConfig: keeps active side by reversing insertion side', () => {
  assert.deepEqual(getGuidedSplitConfig('left'), {
    splitDirection: 'row',
    side: 'after',
    activeSide: 'left',
  });
  assert.deepEqual(getGuidedSplitConfig('right'), {
    splitDirection: 'row',
    side: 'before',
    activeSide: 'right',
  });
  assert.deepEqual(getGuidedSplitConfig('top'), {
    splitDirection: 'col',
    side: 'after',
    activeSide: 'top',
  });
  assert.deepEqual(getGuidedSplitConfig('bottom'), {
    splitDirection: 'col',
    side: 'before',
    activeSide: 'bottom',
  });
});

test('buildLinearLayoutFromSegments: keeps tab order and pane-count ratio', () => {
  const s1 = { type: 'pane', paneId: 'pane-a' };
  const s2 = { type: 'pane', paneId: 'pane-b' };
  const s3 = { type: 'pane', paneId: 'pane-c' };

  const result = buildLinearLayoutFromSegments([
    { node: s1, paneCount: 1 },
    { node: s2, paneCount: 2 },
    { node: s3, paneCount: 1 },
  ], 'row');

  assert.equal(result.paneCount, 4);
  assert.equal(result.node.direction, 'row');
  assert.equal(result.node.ratio, 0.75);
  assert.equal(result.node.a.direction, 'row');
  assert.equal(result.node.a.ratio, 1 / 3);
  assert.equal(result.node.a.a.paneId, 'pane-a');
  assert.equal(result.node.a.b.paneId, 'pane-b');
  assert.equal(result.node.b.paneId, 'pane-c');
});

test('buildGuidedRootSplit: places active node on requested side', () => {
  const activeNode = { type: 'pane', paneId: 'pane-active' };
  const oppositeNode = { type: 'pane', paneId: 'pane-rest' };

  const activeOnLeft = buildGuidedRootSplit({
    activeNode,
    activePaneCount: 1,
    oppositeNode,
    oppositePaneCount: 2,
    splitDirection: 'row',
    side: 'after',
  });
  assert.equal(activeOnLeft.a.paneId, 'pane-active');
  assert.equal(activeOnLeft.b.paneId, 'pane-rest');
  assert.equal(activeOnLeft.ratio, 1 / 3);

  const activeOnRight = buildGuidedRootSplit({
    activeNode,
    activePaneCount: 1,
    oppositeNode,
    oppositePaneCount: 2,
    splitDirection: 'row',
    side: 'before',
  });
  assert.equal(activeOnRight.a.paneId, 'pane-rest');
  assert.equal(activeOnRight.b.paneId, 'pane-active');
  assert.equal(activeOnRight.ratio, 2 / 3);
});

test('willExceedMaxPanes: respects boundary conditions', () => {
  assert.equal(willExceedMaxPanes({ activePaneCount: 1, oppositePaneCount: 3, maxPanes: 4 }), false);
  assert.equal(willExceedMaxPanes({ activePaneCount: 2, oppositePaneCount: 3, maxPanes: 4 }), true);
});
