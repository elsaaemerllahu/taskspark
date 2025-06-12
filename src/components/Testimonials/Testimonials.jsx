import './Testimonials.css';
import t1 from '../../assets/t1.jpg';
import t2 from '../../assets/t2.jpg';
import t3 from '../../assets/t3.jpg';

const Testimonials = () => {
  const reviews = [
    {
      name: 'Alice Johnson',
      role: 'Marketing Manager',
      image: t1,
      comment: 'This task manager completely changed the way our team works. Simple, fast, and super effective!',
    },
    {
      name: 'Mark Davis',
      role: 'Freelancer',
      image: t3,
      comment: 'The UI is intuitive and the time tracking helps me stay productive. Highly recommended!',
    },
    {
      name: 'Sophia Lee',
      role: 'Product Designer',
      image: t2,
      comment: 'I love how organized everything feels. Assigning tasks and tracking progress has never been easier.',
    },
  ];

  return (
    <section className="testimonials">
      <h2>What Our Users Say</h2>
      <div className="testimonial-cards">
        {reviews.map((review, index) => (
          <div className="card" key={index}>
            <img src={review.image} alt={review.name} />
            <p>"{review.comment}"</p>
            <h4>{review.name}</h4>
            <span>{review.role}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
