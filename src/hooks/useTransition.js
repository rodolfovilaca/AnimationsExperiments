import {useRef, useState, useEffect, useMemo} from 'react';
import {timing, delay} from 'react-native-redash';
import Animated from 'react-native-reanimated';
import {State} from 'react-native-gesture-handler';

const {
  Value,
  useCode,
  set,
  Clock,
  clockRunning,
  cond,
  stopClock,
  spring,
  startClock,
  SpringUtils,
  divide,
  diff,
  block,
  eq,
  add,
  sub,
  multiply,
  lessThan,
  abs,
  greaterThan,
  debug,
  not,
  call,
  defined,
  and,
  interpolate,
} = Animated;