import { useState } from "react";
import { LOGO_PATH } from "../utils/constants";

const SIZE_MAP = {
  compact: {
    image: "h-14 w-auto max-w-[180px] object-contain",
    icon: "h-12 w-12 text-base",
    title: "text-lg",
    subtitle: "text-sm",
  },
  default: {
    image: "h-20 w-auto max-w-[260px] object-contain",
    icon: "h-16 w-16 text-xl",
    title: "text-2xl",
    subtitle: "text-base",
  },
  large: {
    image: "h-24 w-auto max-w-[320px] object-contain",
    icon: "h-20 w-20 text-2xl",
    title: "text-3xl",
    subtitle: "text-lg",
  },
};

const BrandLogo = ({ compact = false, size }) => {
  const [logoMissing, setLogoMissing] = useState(false);
  const resolvedSize = size || (compact ? "compact" : "default");
  const currentSize = SIZE_MAP[resolvedSize] || SIZE_MAP.default;

  return (
    <div className="flex items-center gap-4">
      {logoMissing ? (
        <div
          className={`flex items-center justify-center rounded-xl bg-emerald-700 font-display font-semibold text-white ${currentSize.icon}`}
        >
          V
        </div>
      ) : (
        <img
          src={LOGO_PATH}
          alt="Volkschem logo"
          onError={() => setLogoMissing(true)}
          className={currentSize.image}
        />
      )}
      <div>
        <p className={`font-semibold leading-tight ${currentSize.title}`}>
          Volkschem
        </p>
        <p className={`leading-tight ${currentSize.subtitle}`}>Crop Science PVT LTD</p>
      </div>
    </div>
  );
};

export default BrandLogo;
