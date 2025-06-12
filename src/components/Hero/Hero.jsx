import './Hero.css';
import dashboardImage from '../../assets/taskspark.png';
import dashboardImageMobile from '../../assets/tasksparkM.png';

const Hero = () => {
  return (
    <section className="hero-section">
      <picture>
        <source srcSet={dashboardImageMobile} media="(max-width: 800px)" />
        <img src={dashboardImage} alt="" className="hero-image" />
      </picture>
    </section>
  );
};

export default Hero;
