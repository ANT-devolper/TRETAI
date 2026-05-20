import { start } from './game.js';
import { init, armOnFirstGesture } from './audio.js';
import { STREAM_URL } from './constants.js';

init(STREAM_URL);
armOnFirstGesture();
start();
