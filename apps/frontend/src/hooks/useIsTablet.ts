import { useState, useEffect } from "react";

export const useIsTablet = (): boolean => {
  const [isTablet, setIsTablet] = useState<boolean>(
    window.innerWidth >= 768 && window.innerWidth <= 1024
  );

  useEffect(() => {
    const handleResize = () => {
      setIsTablet(window.innerWidth >= 768 && window.innerWidth <= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isTablet;
};