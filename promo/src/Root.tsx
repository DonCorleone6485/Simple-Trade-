import React from 'react';
import { Composition } from 'remotion';
import { Ayna } from './Ayna';
import { Fis } from './Fis';
import { Hic } from './Hic';
import { Mac } from './Mac';
import { MacDikey } from './MacDikey';
import { Reel } from './Reel';
import { Reklam } from './Reklam';
import { ReelFa } from './ReelFa';
// İlk versiyon: tamamen kodla, yapay zekâ çekimi yok. Karşılaştırma için duruyor.
import { MacKod } from './MacKod';
import { MacFa } from './MacFa';
import { AynaFa } from './AynaFa';
import { FisFa } from './FisFa';
import { HicFa } from './HicFa';
import { AynaKod } from './AynaKod';
import { FisKod } from './FisKod';
import { HicKod } from './HicKod';
import { AYNA, FIS, HIC, MAC, REEL, REKLAM, FPS } from './cues';

export const Root: React.FC = () => (
  <>
    <Composition id="Ayna" component={Ayna} width={1080} height={1920} fps={FPS} durationInFrames={AYNA.duration * FPS} defaultProps={{ music: true }} />
    <Composition id="Fis" component={Fis} width={1080} height={1920} fps={FPS} durationInFrames={FIS.duration * FPS} defaultProps={{ music: true }} />
    <Composition id="Hic" component={Hic} width={1080} height={1920} fps={FPS} durationInFrames={HIC.duration * FPS} defaultProps={{ music: true }} />
    <Composition id="Mac" component={Mac} width={1920} height={1080} fps={FPS} durationInFrames={MAC.duration * FPS} defaultProps={{ music: true }} />
    <Composition id="MacKod" component={MacKod} width={1920} height={1080} fps={FPS} durationInFrames={MAC.duration * FPS} defaultProps={{ music: true }} />
    <Composition id="AynaKod" component={AynaKod} width={1080} height={1920} fps={FPS} durationInFrames={AYNA.duration * FPS} defaultProps={{ music: true }} />
    <Composition id="FisKod" component={FisKod} width={1080} height={1920} fps={FPS} durationInFrames={FIS.duration * FPS} defaultProps={{ music: true }} />
    <Composition id="HicKod" component={HicKod} width={1080} height={1920} fps={FPS} durationInFrames={HIC.duration * FPS} defaultProps={{ music: true }} />
    <Composition id="MacFa" component={MacFa} width={1920} height={1080} fps={FPS} durationInFrames={MAC.duration * FPS} defaultProps={{ music: true }} />
    <Composition id="AynaFa" component={AynaFa} width={1080} height={1920} fps={FPS} durationInFrames={AYNA.duration * FPS} defaultProps={{ music: true }} />
    <Composition id="FisFa" component={FisFa} width={1080} height={1920} fps={FPS} durationInFrames={FIS.duration * FPS} defaultProps={{ music: true }} />
    <Composition id="HicFa" component={HicFa} width={1080} height={1920} fps={FPS} durationInFrames={HIC.duration * FPS} defaultProps={{ music: true }} />
    <Composition id="Reel" component={Reel} width={1920} height={1080} fps={FPS} durationInFrames={REEL.duration * FPS} defaultProps={{ music: true }} />
    <Composition id="ReelFa" component={ReelFa} width={1920} height={1080} fps={FPS} durationInFrames={REEL.duration * FPS} defaultProps={{ music: true }} />
    <Composition id="MacDikey" component={MacDikey} width={1080} height={1920} fps={FPS} durationInFrames={MAC.duration * FPS} defaultProps={{ music: true }} />
    <Composition id="Reklam" component={Reklam} width={1080} height={1920} fps={FPS} durationInFrames={REKLAM.duration * FPS} defaultProps={{ music: true }} />
  </>
);
