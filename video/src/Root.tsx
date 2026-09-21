import React from "react";
import "./index.css";
import { Composition } from "remotion";
import {
  AgentsAssistLaunch,
  LAUNCH_TOTAL_FRAMES,
} from "./AgentsAssistLaunch";
import { ProductWalkthrough, TOTAL_FRAMES } from "./ProductWalkthrough";
import { fps } from "./theme";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AgentsAssistLaunch"
        component={AgentsAssistLaunch}
        durationInFrames={LAUNCH_TOTAL_FRAMES}
        fps={fps}
        width={1920}
        height={1080}
      />
      <Composition
        id="CyberUwWorkflow"
        component={ProductWalkthrough}
        durationInFrames={TOTAL_FRAMES}
        fps={fps}
        width={1920}
        height={1080}
      />
    </>
  );
};
