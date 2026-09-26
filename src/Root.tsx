import {Composition, Folder} from 'remotion';
import {DOCTRINE_DURATION, Doctrine, SCENES} from './compositions/Doctrine';
import {FPS, HEIGHT, WIDTH} from './motion/timing';

export const Root = () => (
  <>
    <Composition id="Doctrine" component={Doctrine} durationInFrames={DOCTRINE_DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
    {/* Each scene on its own, for fast iteration and still renders. */}
    <Folder name="Scenes">
      {SCENES.map(({id, component, duration}) => (
        <Composition key={id} id={`Scene-${id}`} component={component} durationInFrames={duration} fps={FPS} width={WIDTH} height={HEIGHT} />
      ))}
    </Folder>
  </>
);
