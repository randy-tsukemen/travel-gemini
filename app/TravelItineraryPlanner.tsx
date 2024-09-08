"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import ChatBox from "./ChatBox";
import GoogleMapComponent from "./GoogleMapComponent";
import TravelTimeline from "./TravelTimeline";
import AvailablePlaces from "./AvailablePlaces";
import { initialTravelItems, initialAvailablePlaces } from "./types";
import { reorder, move } from "./utils";
import Script from "next/script";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export default function TravelItineraryPlanner() {
  const [travelItems, setTravelItems] = useState(initialTravelItems);
  const [places, setPlaces] = useState(initialAvailablePlaces);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

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

  const handlePlaceSelect = (place: any) => {
    // Implement the logic for handling place selection
    // This might involve updating the places or travelItems state
    console.log("Selected place:", place);
  };

  return (
    <div className="container mx-auto p-4 bg-white min-h-screen">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,marker&v=beta`}
        onLoad={() => setIsGoogleMapsLoaded(true)}
      />
      <h1 className="text-4xl font-bold mb-8 text-center">私の旅行プラン</h1>
      <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-150px)]">
        {/* Chat section on the left */}
        <div className="w-full lg:w-1/3 h-full">
          <div className="bg-gray-100 rounded-lg shadow-md overflow-hidden h-full">
            <div className="h-full overflow-y-auto">
              <ChatBox onPlaceSelect={handlePlaceSelect} />
            </div>
          </div>
        </div>

        {/* Map and Timeline/Available Places on the right */}
        <div className="w-full lg:w-2/3 h-full flex flex-col">
          {/* Map at the top right */}
          <div className="h-[60%] bg-gray-100 rounded-lg shadow-md overflow-hidden mb-8">
            {isGoogleMapsLoaded && (
              <GoogleMapComponent
                travelItems={travelItems}
                setPlaces={setPlaces}
              />
            )}
          </div>

          {/* Timeline and Available Places below the map */}
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[calc(40%-2rem)]">
              <div className="bg-gray-100 rounded-lg shadow-md overflow-hidden flex flex-col">
                <h2 className="text-xl font-semibold p-4 bg-white">
                  旅行タイムライン
                </h2>
                <div className="flex-grow overflow-y-auto">
                  <TravelTimeline travelItems={travelItems} />
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg shadow-md overflow-hidden flex flex-col">
                <h2 className="text-xl font-semibold p-4 bg-white">
                  利用可能な場所
                </h2>
                <div className="flex-grow overflow-y-auto">
                  <AvailablePlaces places={places} />
                </div>
              </div>
            </div>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
}
