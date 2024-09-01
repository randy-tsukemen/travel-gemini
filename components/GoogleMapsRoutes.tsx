"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plane, Train, Car, Ship, MapPin, Plus } from "lucide-react";
import {
  GoogleMap,
  useJsApiLoader,
  DirectionsRenderer,
  Autocomplete,
} from "@react-google-maps/api";

// You need to replace this with your actual Google Maps API key
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

interface TravelItem {
  id: string;
  title: string;
  date: string;
  description: string;
  icon: "plane" | "train" | "car" | "ship" | "mapPin";
  location: { lat: number; lng: number };
}

const initialTravelItems: TravelItem[] = [
  {
    id: "item1",
    title: "Visit Shibuya Crossing",
    date: "June 1, 2024",
    description: "Experience the famous Shibuya Crossing",
    icon: "mapPin",
    location: { lat: 35.6595, lng: 139.7005 }, // Shibuya Crossing coordinates
  },
  {
    id: "item2",
    title: "Tour Tokyo Tower",
    date: "June 2, 2024",
    description: "Visit the iconic Tokyo Tower",
    icon: "mapPin",
    location: { lat: 35.6586, lng: 139.7454 }, // Tokyo Tower coordinates
  },
];

const initialAvailablePlaces: TravelItem[] = [
  {
    id: "place1",
    title: "Explore Asakusa",
    date: "TBD",
    description: "Visit the historic Asakusa district",
    icon: "mapPin",
    location: { lat: 35.7148, lng: 139.7967 }, // Asakusa coordinates
  },
  {
    id: "place2",
    title: "Walk around Ueno Park",
    date: "TBD",
    description: "Enjoy a stroll in Ueno Park",
    icon: "mapPin",
    location: { lat: 35.717, lng: 139.7745 }, // Ueno Park coordinates
  },
  {
    id: "place3",
    title: "Shop in Ginza",
    date: "TBD",
    description: "Experience shopping in Ginza",
    icon: "mapPin",
    location: { lat: 35.6717, lng: 139.764 }, // Ginza coordinates
  },
];

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  background: isDragging ? "rgb(243 244 246)" : "white",
  ...draggableStyle,
});

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

export default function TravelItineraryPlanner() {
  const [travelItems, setTravelItems] = useState(initialTravelItems);
  const [places, setPlaces] = useState(initialAvailablePlaces);
  const [directions, setDirections] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const onLoad = useCallback(
    function callback(map) {
      const bounds = new window.google.maps.LatLngBounds();
      travelItems.forEach((item) => bounds.extend(item.location));
      map.fitBounds(bounds);
    },
    [travelItems]
  );

  useEffect(() => {
    if (isLoaded && travelItems.length > 1) {
      const directionsService = new window.google.maps.DirectionsService();

      const origin = travelItems[0].location;
      const destination = travelItems[travelItems.length - 1].location;
      const waypoints = travelItems.slice(1, -1).map((item) => ({
        location: item.location,
        stopover: true,
      }));

      directionsService.route(
        {
          origin: origin,
          destination: destination,
          waypoints: waypoints,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error(`error fetching directions ${result}`);
          }
        }
      );
    }
  }, [isLoaded, travelItems]);

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const newPlace: TravelItem = {
          id: place.place_id || "",
          title: place.name,
          date: "TBD",
          description: place.formatted_address || "",
          icon: "mapPin",
          location: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          },
        };
        setPlaces([...places, newPlace]);
        setSearchResult(null);
      }
    }
  };

  const onDragEnd = (result: any) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      const items = reorder(
        source.droppableId === "travelTimeline" ? travelItems : places,
        source.index,
        destination.index
      );

      if (source.droppableId === "travelTimeline") {
        setTravelItems(items);
      } else {
        setPlaces(items);
      }
    } else {
      const result = move(
        source.droppableId === "travelTimeline" ? travelItems : places,
        source.droppableId === "travelTimeline" ? places : travelItems,
        source,
        destination
      );

      setTravelItems(result.travelTimeline);
      setPlaces(result.availablePlaces);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Travel Itinerary</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col lg:flex-row gap-6">
          <Droppable droppableId="travelTimeline">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="w-full lg:w-1/2 bg-gray-100 p-4 rounded-lg"
              >
                <h2 className="text-xl font-semibold mb-4">Travel Timeline</h2>
                <div className="relative">
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                  {travelItems.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
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
                              <h3 className="text-lg font-semibold">
                                {item.title}
                              </h3>
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
          <Droppable droppableId="availablePlaces">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="w-full lg:w-1/4 bg-gray-100 p-4 rounded-lg"
              >
                <h2 className="text-xl font-semibold mb-4">Available Places</h2>
                {places.map((place, index) => (
                  <Draggable
                    key={place.id}
                    draggableId={place.id}
                    index={index}
                  >
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
                            <h3 className="text-lg font-semibold">
                              {place.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-2">
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
          <div className="w-full lg:w-1/4 h-[600px] flex flex-col">
            {isLoaded ? (
              <>
                <Autocomplete
                  onLoad={(autocomplete) => {
                    autocompleteRef.current = autocomplete;
                  }}
                  onPlaceChanged={onPlaceChanged}
                >
                  <input
                    type="text"
                    placeholder="Search for a place"
                    className="w-full p-2 mb-4 border border-gray-300 rounded"
                  />
                </Autocomplete>
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={travelItems[0].location} // This will now be Shibuya Crossing
                  zoom={12}
                  onLoad={onLoad}
                >
                  {directions && (
                    <DirectionsRenderer
                      directions={directions}
                      options={{
                        polylineOptions: {
                          strokeColor: "#FF0000",
                          strokeOpacity: 0.8,
                          strokeWeight: 3,
                        },
                        markerOptions: {
                          icon: {
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 7,
                            fillColor: "#FF0000",
                            fillOpacity: 1,
                            strokeWeight: 2,
                            strokeColor: "#FFFFFF",
                          },
                        },
                      }}
                    />
                  )}
                </GoogleMap>
              </>
            ) : (
              <div>Loading...</div>
            )}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}

const reorder = (list: TravelItem[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const move = (
  source: TravelItem[],
  destination: TravelItem[],
  droppableSource: any,
  droppableDestination: any
) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result: { [key: string]: TravelItem[] } = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return {
    travelTimeline:
      droppableSource.droppableId === "travelTimeline"
        ? sourceClone
        : destClone,
    availablePlaces:
      droppableSource.droppableId === "availablePlaces"
        ? sourceClone
        : destClone,
  };
};
