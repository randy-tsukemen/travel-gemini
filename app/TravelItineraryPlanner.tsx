'use client'

import React, { useState } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import ChatBox from './ChatBox'
import GoogleMapComponent from './GoogleMapComponent'
import TravelTimeline from './TravelTimeline'
import AvailablePlaces from './AvailablePlaces'
import { initialTravelItems, initialAvailablePlaces } from './types'
import { reorder, move } from './utils'

export default function TravelItineraryPlanner() {
  const [travelItems, setTravelItems] = useState(initialTravelItems)
  const [places, setPlaces] = useState(initialAvailablePlaces)

  const onDragEnd = (result: any) => {
    const { source, destination } = result

    if (!destination) {
      return
    }

    if (source.droppableId === destination.droppableId) {
      const items = reorder(
        source.droppableId === 'travelTimeline' ? travelItems : places,
        source.index,
        destination.index
      )

      if (source.droppableId === 'travelTimeline') {
        setTravelItems(items)
      } else {
        setPlaces(items)
      }
    } else {
      const result = move(
        source.droppableId === 'travelTimeline' ? travelItems : places,
        source.droppableId === 'travelTimeline' ? places : travelItems,
        source,
        destination
      )

      setTravelItems(result.travelTimeline)
      setPlaces(result.availablePlaces)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">私の旅行プラン</h1>
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <div className="w-full lg:w-1/2">
          <ChatBox />
        </div>
        <div className="w-full lg:w-1/2 h-[600px]">
          <GoogleMapComponent travelItems={travelItems} setPlaces={setPlaces} />
        </div>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/2">
            <TravelTimeline travelItems={travelItems} />
          </div>
          <div className="w-full lg:w-1/2">
            <AvailablePlaces places={places} />
          </div>
        </div>
      </DragDropContext>
    </div>
  )
}