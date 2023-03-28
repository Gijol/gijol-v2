import React, { useCallback } from 'react';
import Particles from 'react-particles';
import { Container, Engine } from 'tsparticles-engine';
import { loadFull } from 'tsparticles';
import { particleOptions } from '../lib/const/particleOptions';

function SnowParticles({ children }: { children: React.ReactNode }) {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {}, []);
  return (
    <div style={{ position: 'relative' }}>
      <Particles
        id={'snowParticles'}
        init={particlesInit}
        loaded={particlesLoaded}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: -1, width: '100%', height: '100%' }}
        options={particleOptions}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}

export default SnowParticles;
