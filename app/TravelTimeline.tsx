import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Plane, Train, Car, Ship, MapPin, Calendar, Clock } from "lucide-react";
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
          className="bg-[#fcefee] p-4"
        >
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[#d85a6e]"></div>
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
                    className="bg-white p-4 mb-4 rounded-lg shadow-md relative z-10 border-l-4 border-[#d85a6e]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#fcd5d5] p-2 rounded-full text-[#d85a6e]">
                        {getIcon(item.icon)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#d85a6e]">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" /> {item.date}
                        </p>
                        <p className="text-sm text-gray-500 mt-2 flex items-center">
                          <Clock className="w-4 h-4 mr-1" /> {item.description}
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
