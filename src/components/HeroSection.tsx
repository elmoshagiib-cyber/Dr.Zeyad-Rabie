import React from "react";

interface HeroSectionProps {
  image: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ image }) => {
  return (
    <div
      className="w-full h-full min-h-full"
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
};

export default HeroSection;