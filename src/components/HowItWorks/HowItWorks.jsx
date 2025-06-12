import './HowItWorks.css';
import { FaUserPlus, FaTasks, FaChartLine } from 'react-icons/fa';

const HowItWorks = () => {
  const steps = [
    {
      icon: <FaUserPlus />,
      title: '1. Sign Up',
      description: 'Create your free account in seconds to get started.',
    },
    {
      icon: <FaTasks />,
      title: '2. Create Tasks',
      description: 'Add tasks, set deadlines, and assign them to your team.',
    },
    {
      icon: <FaChartLine />,
      title: '3. Track Progress',
      description: 'Monitor your work, productivity, and overall project status.',
    },
  ];

  return (
    <section className="how-it-works">
      <h2>How It Works</h2>
      <div className="steps">
        {steps.map((step, index) => (
          <div className="step" key={index}>
            <div className="icon">{step.icon}</div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
