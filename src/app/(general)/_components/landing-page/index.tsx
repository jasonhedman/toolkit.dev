import React, { Suspense } from "react";

import { Navbar } from "./navbar";
import { Banner } from "./banner";

import { HeroSection } from "./hero";
import { FeaturesSection } from "./features";
import { MeritSection } from "./how-it-works";
import { TopToolkitsSection } from "./top-toolkits";
import { ToolkitCreationSection } from "./toolkit-creation";
import { WorkbenchSection } from "./workbenches";
import { WorkbenchExamplesSection } from "./workbench-examples";
import { DependenciesSection } from "./dependencies";
import { ContributorsSection } from "./contributors";
import { VisionSection } from "./vision";
import { RoadmapSection } from "./roadmap";
import { Footer } from "./footer";

export const LandingPage: React.FC = () => {
  return (
    <div className="relative w-full max-w-full">
      <Navbar />
      <Banner />
      <div className="mx-auto max-w-full divide-y overflow-x-hidden md:max-w-5xl md:border-x">
        <HeroSection />
        <MeritSection />
        <Suspense>
          <ContributorsSection />
        </Suspense>
        <VisionSection />
        <RoadmapSection />
        <FeaturesSection />
        <ToolkitCreationSection />
        <TopToolkitsSection />
        <WorkbenchSection />
        <WorkbenchExamplesSection />
        <DependenciesSection />
      </div>
      <Footer />
    </div>
  );
};

export default LandingPage;
