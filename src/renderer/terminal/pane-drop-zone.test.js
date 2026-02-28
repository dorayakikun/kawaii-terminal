const test = require('node:test');
const assert = require('node:assert/strict');

const { getPaneDropZone, getPaneDropZoneWithOutside } = require('./pane-drop-zone.js');

const rect = {
  left: 100,
  top: 200,
  width: 400,
  height: 200,
  right: 500,
  bottom: 400,
};

test('getPaneDropZone: returns right slightly right of center', () => {
  const zone = getPaneDropZone(rect, 301, 300);
  assert.equal(zone.direction, 'right');
  assert.equal(zone.side, 'after');
  assert.equal(zone.splitDirection, 'row');
  assert.equal(zone.inDeadZone, false);
});

test('getPaneDropZone: returns right near right edge', () => {
  const zone = getPaneDropZone(rect, 499, 300);
  assert.equal(zone.direction, 'right');
});

test('getPaneDropZone: returns left/top/bottom with correct mapping', () => {
  const left = getPaneDropZone(rect, 120, 300);
  assert.deepEqual(left, {
    direction: 'left',
    side: 'before',
    splitDirection: 'row',
    inDeadZone: false,
  });

  const top = getPaneDropZone(rect, 300, 220);
  assert.deepEqual(top, {
    direction: 'top',
    side: 'before',
    splitDirection: 'col',
    inDeadZone: false,
  });

  const bottom = getPaneDropZone(rect, 300, 390);
  assert.deepEqual(bottom, {
    direction: 'bottom',
    side: 'after',
    splitDirection: 'col',
    inDeadZone: false,
  });
});

test('getPaneDropZone: returns null direction outside pane', () => {
  const zone = getPaneDropZone(rect, 99, 300);
  assert.deepEqual(zone, {
    direction: null,
    side: null,
    splitDirection: null,
    inDeadZone: false,
  });
});

test('getPaneDropZone: exact center stays neutral', () => {
  const zone = getPaneDropZone(rect, 300, 300);
  assert.deepEqual(zone, {
    direction: null,
    side: null,
    splitDirection: null,
    inDeadZone: false,
  });
});

test('getPaneDropZoneWithOutside: chooses left for point outside left', () => {
  const zone = getPaneDropZoneWithOutside(rect, 40, 300);
  assert.equal(zone.direction, 'left');
  assert.equal(zone.side, 'before');
  assert.equal(zone.splitDirection, 'row');
});

test('getPaneDropZoneWithOutside: chooses right for point outside right', () => {
  const zone = getPaneDropZoneWithOutside(rect, 560, 300);
  assert.equal(zone.direction, 'right');
  assert.equal(zone.side, 'after');
  assert.equal(zone.splitDirection, 'row');
});

test('getPaneDropZoneWithOutside: chooses top for point outside top', () => {
  const zone = getPaneDropZoneWithOutside(rect, 300, 120);
  assert.equal(zone.direction, 'top');
  assert.equal(zone.side, 'before');
  assert.equal(zone.splitDirection, 'col');
});

test('getPaneDropZoneWithOutside: chooses bottom for point outside bottom', () => {
  const zone = getPaneDropZoneWithOutside(rect, 300, 480);
  assert.equal(zone.direction, 'bottom');
  assert.equal(zone.side, 'after');
  assert.equal(zone.splitDirection, 'col');
});
