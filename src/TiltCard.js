import { motion } from "framer-motion";

export default function TiltCard({ children }) {

  return (

    <motion.div

      whileHover={{
        rotateX: 10,
        rotateY: -10,
        y: -10,
        scale: 1.03,
      }}

      transition={{
        type: "spring",
        stiffness: 220,
        damping: 18,
      }}

      style={{
        transformStyle: "preserve-3d",
        width: "100%",
      }}

    >
      {children}
    </motion.div>

  );
}