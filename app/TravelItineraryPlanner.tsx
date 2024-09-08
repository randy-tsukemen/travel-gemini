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
import Toast from "@/app/toast";

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
    console.log("Selected place:", place);
  };

  return (
    <div className="flex flex-col h-screen bg-[#fcefee] p-4">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,marker&v=beta`}
        onLoad={() => setIsGoogleMapsLoaded(true)}
      />
      <h1 className="text-3xl font-bold mb-6 text-center text-[#d85a6e]">
        私の旅行プラン
      </h1>
      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Chat section on the left */}
        <div className="w-1/3 h-full">
          <div className="h-full rounded-lg shadow-md overflow-hidden">
            <ChatBox onPlaceSelect={handlePlaceSelect} />
          </div>
        </div>

        {/* Map and Timeline/Available Places on the right */}
        <div className="w-2/3 h-full flex flex-col gap-6">
          {/* Map at the top right */}
          <div className="h-3/5 bg-white rounded-lg shadow-md overflow-hidden">
            {isGoogleMapsLoaded && (
              <GoogleMapComponent
                travelItems={travelItems.filter((item) => item.location)}
                setPlaces={setPlaces}
              />
            )}
          </div>

          {/* Timeline and Available Places below the map */}
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex h-2/5 gap-6">
              <div className="w-1/2 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                <h2 className="text-xl font-semibold p-3 bg-[#d85a6e] text-white">
                  旅行タイムライン
                </h2>
                <div className="flex-grow overflow-y-auto">
                  <TravelTimeline travelItems={travelItems} />
                </div>
              </div>
              <div className="w-1/2 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                <h2 className="text-xl font-semibold p-3 bg-[#d85a6e] text-white">
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
      <Toast />
    </div>
  );
}
