import React from 'react';

const Hero = () => {
  return (
    <section className="relative py-16 text-center text-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('plant_bg.jpg')] bg-cover bg-center filter saturate-80 contrast-70 -z-10"></div>
      <div className="container mx-auto px-5 relative z-10">
        <h1 className="text-4xl md:text-5xl mb-5">Plants Make People Happy</h1>
        <p className="text-xl max-w-2xl mx-auto mb-8">
          We've curated the perfect plants for your busy life. Delivered to your door, ready to enjoy.
        </p>
        <a 
          href="#" 
          className="inline-block bg-white text-[#224229] px-7 py-3 text-lg rounded-full font-normal transition-colors duration-300 hover:bg-[#d7c9a9]"
        >
          Shop Plants
        </a>
      </div>
    </section>
  );
};

export default Hero;