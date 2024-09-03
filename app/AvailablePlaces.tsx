import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Plane, Train, Car, Ship, MapPin } from 'lucide-react';
import { TravelItem } from './types';
import { getItemStyle } from './utils';

interface AvailablePlacesProps {
  places: TravelItem[];
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'plane': return <Plane className="w-6 h-6" />;
    case 'train': return <Train className="w-6 h-6" />;
    case 'car': return <Car className="w-6 h-6" />;
    case 'ship': return <Ship className="w-6 h-6" />;
    default: return <MapPin className="w-6 h-6" />;
  }
};

export default function AvailablePlaces({ places }: AvailablePlacesProps) {
  return (
    <Droppable droppableId="availablePlaces">
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="bg-gray-100 p-4 rounded-lg"
        >
          <h2 className="text-xl font-semibold mb-4">利用可能な場所</h2>
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
                  className="bg-white p-4 mb-4 rounded-lg shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-200 p-2 rounded-full">
                      {getIcon(place.icon)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{place.title}</h3>
                      <p className="text-sm text-gray-500 mt-2">{place.description}</p>
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