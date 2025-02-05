import CreateAgentForm from "@/components/createAgentForm";
import Navbar from "@/components/navbar";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { WavyBackground } from "@/components/ui/wavy-background";
import { motion } from "framer-motion";

export default function CreateAgentPage() {
    return (
        <>
            {/* <Navbar/> */}
        <WavyBackground className="w-full mx-auto pb-40">
          <CreateAgentForm contractAddress="0x222BeC22E51ee73363Fde9eB6f4212FA7f9780bc" />
        </WavyBackground>
      </>
    );
}
