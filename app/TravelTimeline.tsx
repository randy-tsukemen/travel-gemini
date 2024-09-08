import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Plane, Train, Car, Ship, MapPin } from "lucide-react";
import { TravelItem } from "./types";
import { getItemStyle } from "./utils";

interface TravelTimelineProps {
  travelItems: TravelItem[];
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

export default function TravelTimeline({ travelItems }: TravelTimelineProps) {
  return (
    <Droppable droppableId="travelTimeline">
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="bg-gray-100 p-4"
        >
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>
            {travelItems.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={getItemStyle(
                      snapshot.isDragging,
                      provided.draggableProps.style
                    )}
                    className="bg-white p-4 mb-4 rounded-lg shadow relative z-10"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-200 p-2 rounded-full">
                        {getIcon(item.icon)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <p className="text-gray-600">{item.date}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
          </div>
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
