import { Heading } from "../lib/heading";
import { Section } from "../lib/section";
import { SECTIONS } from "../sections";
import { VisionGraphic } from "./graphic";

export const VisionSection: React.FC = () => {
  return (
    <Section id={SECTIONS.Vision}>
      <Heading
        title={["Kickstart a", "Self-Funding Repository"]}
        description="We're building monetization features to spark a flywheel of growth for Toolkit"
        badgeText="The Vision"
      />
      <VisionGraphic />
    </Section>
  );
};
