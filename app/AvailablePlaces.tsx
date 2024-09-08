import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Plane, Train, Car, Ship, MapPin, Info } from "lucide-react";
import { TravelItem } from "./types";
import { getItemStyle } from "./utils";

interface AvailablePlacesProps {
  places: TravelItem[];
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case "plane":
      return <Plane className="w-6 h-6" />;
    case "train":
      return <Train className="w-6 h-6" />;
    case "car":
      return <Car className="w-6 h-6" />;
    case "ship":
      return <Ship className="w-6 h-6" />;
    default:
      return <MapPin className="w-6 h-6" />;
  }
};

export default function AvailablePlaces({ places }: AvailablePlacesProps) {
  return (
    <Droppable droppableId="availablePlaces">
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="bg-[#fcefee] p-4"
        >
          {places.map((place, index) => (
            <Draggable key={place.id} draggableId={place.id} index={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={getItemStyle(
                    snapshot.isDragging,
                    provided.draggableProps.style
                  )}
                  className="bg-white p-4 mb-4 rounded-lg shadow-md border-l-4 border-[#d85a6e]"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-[#fcd5d5] p-2 rounded-full text-[#d85a6e]">
                      {getIcon(place.icon)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#d85a6e]">
                        {place.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-2 flex items-center">
                        <Info className="w-4 h-4 mr-1 text-[#d85a6e]" />
                        {place.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
