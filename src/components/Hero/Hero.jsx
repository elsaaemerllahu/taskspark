import './Hero.css';
import dashboardImage from '../../assets/taskspark-hero.png';
import dashboardImageMobile from '../../assets/tasksparkMobile.png';

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
