import { useState, useEffect } from "react";

export const useIsSmallTablet = (): boolean => {
  const [isSmallTablet, setIsSmallTablet] = useState<boolean>(
    window.innerWidth >= 575 && window.innerWidth <= 767
  );

  useEffect(() => {
    const handleResize = () => {
      setIsSmallTablet(window.innerWidth >= 575 && window.innerWidth <= 767);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isSmallTablet;
};
