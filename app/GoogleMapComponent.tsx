import React, { useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Autocomplete } from '@react-google-maps/api';
import { TravelItem } from './types';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

interface GoogleMapComponentProps {
  travelItems: TravelItem[];
  setPlaces: React.Dispatch<React.SetStateAction<TravelItem[]>>;
}

export default function GoogleMapComponent({ travelItems, setPlaces }: GoogleMapComponentProps) {
  const [directions, setDirections] = React.useState(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  const onLoad = useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds();
    travelItems.forEach(item => bounds.extend(item.location));
    map.fitBounds(bounds);
  }, [travelItems]);

  useEffect(() => {
    if (isLoaded && travelItems.length > 1) {
      const directionsService = new window.google.maps.DirectionsService();

      const origin = travelItems[0].location;
      const destination = travelItems[travelItems.length - 1].location;
      const waypoints = travelItems.slice(1, -1).map(item => ({
        location: item.location,
        stopover: true
      }));

      directionsService.route(
        {
          origin: origin,
          destination: destination,
          waypoints: waypoints,
          travelMode: window.google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error(`経路の取得中にエラーが発生しました ${result}`);
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
          id: place.place_id || '',
          title: place.name,
          date: '未定',
          description: place.formatted_address || '',
          icon: 'mapPin',
          location: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          }
        };
        setPlaces(prevPlaces => [...prevPlaces, newPlace]);
      }
    }
  };

  if (!isLoaded) return <div>読み込み中...</div>;

  return (
    <div className="h-full flex flex-col">
      <Autocomplete
        onLoad={(autocomplete) => {
          autocompleteRef.current = autocomplete;
        }}
        onPlaceChanged={onPlaceChanged}
      >
        <input
          type="text"
          placeholder="場所を検索"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        />
      </Autocomplete>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={travelItems[0].location}
        zoom={12}
        onLoad={onLoad}
      >
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 3,
              },
              markerOptions: {
                icon: {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 7,
                  fillColor: '#FF0000',
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: '#FFFFFF',
                }
              }
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}