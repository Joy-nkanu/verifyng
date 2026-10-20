import { motion } from "framer-motion";
import { Camera, Search, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Scan or Enter",
    description: "Use your phone camera to scan the barcode, or type it in manually.",
  },
  {
    icon: Search,
    title: "We Verify",
    description: "We look up the barcode in a public product catalog.",
  },
  {
    icon: ShieldCheck,
    title: "Get Results",
    description: "See listed product details. Official batch and registration checks need an authorized source.",
  },
];

const HowItWorks = () => (
  <section className="py-16">
    <motion.h2
      initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="text-2xl font-bold text-center mb-10"
    >
      How It Works
    </motion.h2>
    <div className="grid gap-6 sm:grid-cols-3">
      {steps.map((step, i) => (
        <motion.div
          key={step.title}
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="bg-card rounded-2xl p-6 shadow-sm shadow-foreground/5 text-center"
        >
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
            <step.icon className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-display font-semibold mb-1">{step.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

export default HowItWorks;