import React from 'react';
import SectionTitle from './SectionTitle';
import TestimonialCard from './TestimonialCard';

const Testimonials = ({ testimonials }) => {
  return (
    <section className="py-16 bg-[#f7f0e1] text-center">
      <div className="container mx-auto px-5">
        <SectionTitle>What Our Customers Say</SectionTitle>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          {testimonials.map(testimonial => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;