import Dropzone from "./Dropzone";
import { Hero } from "../components/Hero";
import { Section } from "@/components/Section"; 
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <main>
      {/* HEADER */}
      <Header />
      {/* HERO */}
      <Hero />
      {/* UPLOAD BOX */}
      <Section className="pb-24">
        <Dropzone />
      </Section>
      
    </main>
  );
}
