import React from "react";
import { MapPin } from "lucide-react";

interface RecommendedPlaceProps {
  place: string;
  onSelect: (place: string) => void;
}

export default function RecommendedPlace({
  place,
  onSelect,
}: RecommendedPlaceProps) {
  return (
    <button
      onClick={() => onSelect(place)}
      className="flex items-center space-x-2 px-3 py-2 bg-white text-blue-500 rounded-full shadow-md hover:bg-blue-50 transition-colors duration-200"
    >
      <MapPin size={16} />
      <span>{place}</span>
    </button>
  );
}
