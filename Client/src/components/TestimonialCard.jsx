const TestimonialCard = ({ testimonial }) => {
  return (
    <div className="bg-white p-6 shadow-md">
      <img 
        src={testimonial.image} 
        alt={testimonial.name} 
        className="w-20 h-20 rounded-full mx-auto mb-5 object-cover"
      />
      <h3 className="text-lg font-semibold text-[#224229] mb-2">{testimonial.name}</h3>
      <p className="text-[#224229] italic">"{testimonial.quote}"</p>
    </div>
  )
}

export default TestimonialCard