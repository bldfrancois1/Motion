import type {ComponentType} from 'react';
import {AbsoluteFill, Series} from 'remotion';
import {POSITION_DURATION, Position} from '../scenes/Position';
import {color} from '../theme';

/**
 * The film, in order. Add each scene here once it exists:
 * Position → Narratifs → MessagesPreuves → Peso → Influence.
 * Transitions between scenes belong to the scenes themselves (a shape
 * leaving one scene is the shape entering the next), not to generic wipes.
 */
export const SCENES: {id: string; component: ComponentType; duration: number}[] = [
  {id: 'Position', component: Position, duration: POSITION_DURATION},
];

export const DOCTRINE_DURATION = SCENES.reduce((sum, s) => sum + s.duration, 0);

export const Doctrine = () => (
  <AbsoluteFill style={{background: color.paper}}>
    <Series>
      {SCENES.map(({id, component: Scene, duration}) => (
        <Series.Sequence key={id} durationInFrames={duration} name={id}>
          <Scene />
        </Series.Sequence>
      ))}
    </Series>
  </AbsoluteFill>
);
