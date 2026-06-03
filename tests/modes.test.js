import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { MODES, DEFAULT_MODE_ID, getMode, modeIds, isModeComplete } from '../js/modes.js';

describe('MODES data', () => {
  test('includes the zen and sprint modes', () => {
    assert.ok(modeIds().includes('zen'));
    assert.ok(modeIds().includes('sprint'));
  });

  test('every mode carries the fields the orchestrator reads', () => {
    for (const id of modeIds()) {
      const mode = MODES[id];
      assert.equal(mode.id, id);
      assert.equal(typeof mode.name, 'string');
      assert.ok(mode.name.length > 0);
      assert.equal(typeof mode.description, 'string');
      assert.equal(typeof mode.timed, 'boolean');
      assert.equal(typeof mode.levelProgression, 'boolean');
      assert.equal(typeof mode.startLevel, 'number');
      // goalLines is either null (endless) or a positive integer.
      assert.ok(
        mode.goalLines === null || (Number.isInteger(mode.goalLines) && mode.goalLines > 0),
        `${id}.goalLines must be null or a positive integer`,
      );
    }
  });

  test('zen is the endless, level-progressing mode with no goal', () => {
    assert.equal(MODES.zen.goalLines, null);
    assert.equal(MODES.zen.timed, false);
    assert.equal(MODES.zen.levelProgression, true);
  });

  test('sprint is the timed 40-line mode with a fixed speed', () => {
    assert.equal(MODES.sprint.goalLines, 40);
    assert.equal(MODES.sprint.timed, true);
    assert.equal(MODES.sprint.levelProgression, false);
  });

  test('the default mode id resolves to an existing mode', () => {
    assert.ok(MODES[DEFAULT_MODE_ID]);
  });
});

describe('getMode', () => {
  test('returns the requested mode', () => {
    assert.equal(getMode('sprint'), MODES.sprint);
  });

  test('falls back to the default mode for an unknown or missing id', () => {
    assert.equal(getMode('does-not-exist'), MODES[DEFAULT_MODE_ID]);
    assert.equal(getMode(undefined), MODES[DEFAULT_MODE_ID]);
  });
});

describe('isModeComplete', () => {
  test('an endless mode (goalLines null) is never complete', () => {
    assert.equal(isModeComplete(MODES.zen, 0), false);
    assert.equal(isModeComplete(MODES.zen, 999), false);
  });

  test('a goal mode is incomplete below the goal', () => {
    assert.equal(isModeComplete(MODES.sprint, 0), false);
    assert.equal(isModeComplete(MODES.sprint, 39), false);
  });

  test('a goal mode is complete at or beyond the goal', () => {
    assert.equal(isModeComplete(MODES.sprint, 40), true);
    assert.equal(isModeComplete(MODES.sprint, 42), true);
  });
});
