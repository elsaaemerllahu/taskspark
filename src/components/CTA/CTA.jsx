import "./CTA.css";
import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/signup"); // Change this route to match your app's signup/login path
  };

  return (
    <section className="cta-section">
      <div className="cta-content">
        <h2>Ready to Boost Your Productivity?</h2>
        <p>Start organizing your tasks and stay on top of your goals with our task manager.</p>
        <button className="cta-button" onClick={handleClick}>
          Get Started Now
        </button>
      </div>
    </section>
  );
};

export default CTA;
