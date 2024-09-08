import React, { useCallback, useEffect, useRef, useState } from "react";
import { TravelItem } from "./types";
import { MapPin, Search } from "lucide-react";
import { debounce } from "lodash";
import Toast from "@/app/toast";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

interface GoogleMapComponentProps {
  travelItems: TravelItem[];
  setPlaces: React.Dispatch<React.SetStateAction<TravelItem[]>>;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function GoogleMapComponent({
  travelItems,
  setPlaces,
}: GoogleMapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer | null>(null);
  const [autocompleteService, setAutocompleteService] =
    useState<google.maps.places.AutocompleteService | null>(null);
  const [placesService, setPlacesService] =
    useState<google.maps.places.PlacesService | null>(null);
  const sessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  const initMap = useCallback(async () => {
    if (!mapRef.current) return;

    const { Map } = (await google.maps.importLibrary(
      "maps"
    )) as google.maps.MapsLibrary;
    const { AutocompleteService, AutocompleteSessionToken, PlacesService } =
      (await google.maps.importLibrary("places")) as google.maps.PlacesLibrary;

    const center = new google.maps.LatLng(35.6895, 139.6917); // Tokyo coordinates

    const newMap = new Map(mapRef.current, {
      center: center,
      zoom: 12,
      mapId: "DEMO_MAP_ID",
    });

    setMap(newMap);

    const newDirectionsRenderer = new google.maps.DirectionsRenderer();
    newDirectionsRenderer.setMap(newMap);
    setDirectionsRenderer(newDirectionsRenderer);

    setAutocompleteService(new AutocompleteService());
    setPlacesService(new PlacesService(newMap));
    sessionTokenRef.current = new AutocompleteSessionToken();

    // Add markers for travel items
    travelItems.forEach((item) => {
      new google.maps.Marker({
        map: newMap,
        position: item.location,
        title: item.title,
      });
    });

    // Update route
    updateRoute(newMap, newDirectionsRenderer);
  }, [travelItems]);

  useEffect(() => {
    initMap();
  }, [initMap]);

  useEffect(() => {
    if (map && directionsRenderer) {
      updateRoute(map, directionsRenderer);
    }
  }, [travelItems, map, directionsRenderer]);

  const updateRoute = (
    map: google.maps.Map,
    directionsRenderer: google.maps.DirectionsRenderer
  ) => {
    const validTravelItems = travelItems.filter((item) => item.location);
    if (validTravelItems.length < 2) return;

    const directionsService = new google.maps.DirectionsService();

    const origin = validTravelItems[0].location;
    const destination = validTravelItems[validTravelItems.length - 1].location;
    const waypoints = validTravelItems.slice(1, -1).map((item) => ({
      location: new google.maps.LatLng(item.location.lat, item.location.lng),
      stopover: true,
    }));

    directionsService.route(
      {
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(destination.lat, destination.lng),
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
        } else {
          console.error(`経路の取得中にエラーが発生しました ${status}`);
        }
      }
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedFetchSuggestions(value);
  };

  const debouncedFetchSuggestions = useCallback(
    debounce((input: string) => {
      if (input.length > 0 && autocompleteService) {
        const request = {
          input: input,
          sessionToken: sessionTokenRef.current,
          types: ["establishment"],
          componentRestrictions: { country: "jp" },
        };

        autocompleteService.getPlacePredictions(
          request,
          (predictions, status) => {
            if (
              status === google.maps.places.PlacesServiceStatus.OK &&
              predictions
            ) {
              setSuggestions(predictions);
            } else {
              setSuggestions([]);
            }
          }
        );
      } else {
        setSuggestions([]);
      }
    }, 300),
    [autocompleteService]
  );

  const handleSuggestionClick = (placeId: string) => {
    if (placesService) {
      placesService.getDetails(
        {
          placeId: placeId,
          fields: ["name", "formatted_address", "geometry"],
        },
        (place, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            place &&
            place.geometry &&
            place.geometry.location
          ) {
            const newPlace: TravelItem = {
              id: place.place_id || `place-${Date.now()}`,
              title: place.name || "名称不明",
              date: "未定",
              description: place.formatted_address || "",
              icon: "mapPin",
              location: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              },
            };
            setPlaces((prevPlaces) => [newPlace, ...prevPlaces]);

            setSearchInput("");
            setSuggestions([]);
            sessionTokenRef.current =
              new google.maps.places.AutocompleteSessionToken();

            // Show a popup to inform the user
            Toast.notify({
              type: "success",
              message: `${newPlace.title} が利用可能な場所に追加されました。`,
            });
          }
        }
      );
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 bg-[#fcefee] border-b border-[#d85a6e]">
        <div className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={handleInputChange}
            placeholder="場所を検索"
            className="w-full p-2 pr-10 border border-[#d85a6e] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d85a6e] bg-white"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#d85a6e]" />
        </div>
        {suggestions.length > 0 && (
          <ul className="mt-2 bg-white border border-[#d85a6e] rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.place_id}
                onClick={() => handleSuggestionClick(suggestion.place_id)}
                className="p-2 hover:bg-[#fcefee] cursor-pointer"
              >
                {suggestion.description}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div ref={mapRef} className="flex-grow" />
    </div>
  );
}
