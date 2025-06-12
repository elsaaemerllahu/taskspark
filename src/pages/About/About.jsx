import './About.css';
import { FaTasks, FaUsers, FaChartLine } from 'react-icons/fa';
import tasks from '../../assets/tasks.jpg';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import headerImg from '../../assets/team.png';
import person1 from '../../assets/person1.png';
import person2 from '../../assets/person2.jpg';
import person3 from '../../assets/person3.jpg';
import person4 from '../../assets/person4.jpg';

const About = () => {
  return (
    <>
      <Navbar />
      <div className="about-page">

        <section className="about-hero-section">
          <div className="about-hero-content">
            <h1>We help you organize tasks and boost productivity</h1>
            <p>At TaskSpark, we build tools that inspire action, clarity, and growth. Our mission is to help you achieve more with less stress.</p>
          </div>
          <div className="about-hero-image">
            <img src={headerImg} alt="Team at work" />
          </div>
        </section>

        <section className="mission-section">
          <h2>
            "We help individuals and teams manage time and tasks effortlessly.
            With a balance of design, functionality, and smart scheduling — TaskSpark simplifies productivity."
          </h2>
          <h3>Grace Lauren</h3>
          <p>Founder of Taskspark</p>
        </section>

        <section className="team-section">
          <div className="team-header">
            <div className="team-left-section">
              <p>Our Team</p>
              <h2>Meet the Team</h2></div>
            <div className="team-right-section">
              <p>We're passionate creators building smarter ways to stay organized. With diverse backgrounds in design, development, and product management, we collaborate to deliver the best experience for our users.</p>
            </div>
          </div>

          <div className="team-grid">
            <div className="team-card">
              <img src={person1} alt="" className='team-image' />
              <p>Miles – Frontend</p>
            </div>
            <div className="team-card">
              <img src={person2} alt="" className='team-image' />
              <p>Emma – Backend</p>
            </div>
            <div className="team-card">
              <img src={person3} alt="" className='team-image' />
              <p>Chris – Design</p></div>
            <div className="team-card">
              <img src={person4} alt="" className='team-image' />
              <p>Tom – Product</p>
            </div>
          </div>
        </section>

        <section className="why-choose-us">
          <div className='h2s'>
            <h2>Why Choose TaskSpark</h2>
            <h3></h3>
          </div>
          <div className="why-choose-container">
            <div className="why-choose-image">
              <img src={tasks} alt="TaskSpark dashboard" />
            </div>
            <div className="why-choose-features">
              <div className='about-feature-item'>
                <div className="about-feature-icon">
                  <FaTasks />
                </div>
                <h4>Effortless Management</h4>
              </div>
              <div className='about-feature-item'>
                <div className="about-feature-icon">
                  <FaUsers />
                </div>
                <h4>Seamless Collaboration</h4>
              </div>
              <div className='about-feature-item'>
                <div className="about-feature-icon">
                  <FaChartLine />
                </div>
                <h4>Productivity Insights</h4>
              </div>
            </div>
          </div>
        </section>

        <section className="awards-section">
          <h2>Achievements</h2>
          <table className="awards-table">
            <thead>
              <tr>
                <th>Name of the Award</th>
                <th>Description</th>
                <th>Year</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Productivity App of the Year – TechSpark Awards</td>
                <td>Recognized for outstanding performance and innovation in task management solutions.</td>
                <td>2025</td>
              </tr>
              <tr>
                <td>UX Excellence in Productivity – Clarity Awards</td>
                <td>Honored for delivering an intuitive and seamless user experience.</td>
                <td>2024</td>
              </tr>
              <tr>
                <td>Best Collaboration Tool – Startup Tools Summit</td>
                <td>Awarded for real-time team sync features and project organization tools.</td>
                <td>2024</td>
              </tr>
              <tr>
                <td>Top Rising App – Future of Work Showcase</td>
                <td>Highlighted as a promising platform changing the way people manage tasks.</td>
                <td>2023</td>
              </tr>
            </tbody>
          </table>
        </section>

      </div>
      <Footer />
    </>
  );
};

export default About;
