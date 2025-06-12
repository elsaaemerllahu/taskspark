import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";  
import Hero from "../components/Hero/Hero";
import Features from "../components/Features/Features";
import CTA from '../components/CTA/CTA';
import Testimonials from "../components/Testimonials/Testimonials";
import HowItWorks from "../components/HowItWorks/HowItWorks";
import AppPreview from "../components/AppPreview/AppPreview";
import FAQ from "../components/FAQ/FAQ";

const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <CTA />
      <Testimonials />
      <AppPreview />
      <HowItWorks />
      <FAQ />
      <Footer />

    </>
  );
};

export default Home;
