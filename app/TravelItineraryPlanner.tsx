"use client";

import React, { useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import ChatBox from "./ChatBox";
import GoogleMapComponent from "./GoogleMapComponent";
import TravelTimeline from "./TravelTimeline";
import AvailablePlaces from "./AvailablePlaces";
import { initialTravelItems, initialAvailablePlaces } from "./types";
import { reorder, move } from "./utils";

export default function TravelItineraryPlanner() {
  const [travelItems, setTravelItems] = useState(initialTravelItems);
  const [places, setPlaces] = useState(initialAvailablePlaces);

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
    <div className="container mx-auto p-4 bg-white min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center">私の旅行プラン</h1>
      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        <div className="w-full lg:w-1/2 bg-gray-100 rounded-lg shadow-md overflow-hidden">
          <ChatBox />
        </div>
        <div className="w-full lg:w-1/2 h-[600px] bg-gray-100 rounded-lg shadow-md overflow-hidden">
          <GoogleMapComponent travelItems={travelItems} setPlaces={setPlaces} />
        </div>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/2 bg-gray-100 rounded-lg shadow-md overflow-hidden">
            <TravelTimeline travelItems={travelItems} />
          </div>
          <div className="w-full lg:w-1/2 bg-gray-100 rounded-lg shadow-md overflow-hidden">
            <AvailablePlaces places={places} />
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
