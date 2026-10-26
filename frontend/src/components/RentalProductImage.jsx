import { useState } from "react";
import { getRentalImage } from "../data/rentalImages";

export default function RentalProductImage({ product }) {
  const [failed, setFailed] = useState(false);
  const imageSource = failed ? "/images/equipment-placeholder.svg" : getRentalImage(product);

  return (
    <div className="rentready-product-image">
      <img
        src={imageSource}
        alt={product.name}
        className="rentready-product-photo"
        loading="lazy"
        onError={(event) => {
          if (!failed) setFailed(true);
          else event.currentTarget.onerror = null;
        }}
      />
      <span className="rentready-product-category">
        {product.category === "dumpster" ? "Dumpster Rental" : "Equipment Rental"}
      </span>
    </div>
  );
}
