import React from 'react';
import SectionTitle from './SectionTitle';
import CategoryCard from './CategoryCard';

const Categories = ({ categories }) => {
  return (
    <section className="py-16 bg-[#f7f0e1]">
      <div className="container mx-auto px-5">
        <SectionTitle>Find Your Perfect Plant</SectionTitle>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map(category => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
        
        <div className="text-center mt-8">
          <a 
            href="#" 
            className="text-[#224229] px-6 py-2 mt-5 rounded-full text-xl underline font-normal transition-colors duration-300"
          >
            Explore All
          </a>
        </div>
      </div>
    </section>
  );
};

export default Categories;