import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Footer from "../components/Footer";
import CursorGlow from "../components/CursorGlow";
import Particles from "../components/Particles";

export default function Landing() {
  return (
    <div className="relative bg-ink text-fg font-body min-h-screen">
      <Particles />
      <CursorGlow />
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Footer />
    </div>
  );
}
