import React from "react";

interface HeroSectionProps {
  image: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ image }) => {
  return (
    <div className="w-full h-full">
      <img
        src={image}
        alt="Hero"
        className="w-full h-full object-cover block"
      />
    </div>
  );
};

export default HeroSection;