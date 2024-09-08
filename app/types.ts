export interface TravelItem {
  id: string;
  title: string;
  date: string;
  description: string;
  icon: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export const initialTravelItems: TravelItem[] = [
  {
    id: "item1",
    title: "渋谷スクランブル交差点を訪れる",
    date: "2024年6月1日",
    description: "有名な渋谷スクランブル交差点を体験する",
    icon: "mapPin",
    location: { lat: 35.6595, lng: 139.7005 },
  },
  {
    id: "item2",
    title: "東京タワーツアー",
    date: "2024年6月2日",
    description: "象徴的な東京タワーを訪れる",
    icon: "mapPin",
    location: { lat: 35.6586, lng: 139.7454 },
  },
];

export const initialAvailablePlaces: TravelItem[] = [
  {
    id: "place1",
    title: "浅草を探索",
    date: "未定",
    description: "歴史ある浅草地区を訪れる",
    icon: "mapPin",
    location: { lat: 35.7148, lng: 139.7967 },
  },
  {
    id: "place2",
    title: "上野公園を散歩",
    date: "未定",
    description: "上野公園でゆっくり散歩を楽しむ",
    icon: "mapPin",
    location: { lat: 35.717, lng: 139.7745 },
  },
  {
    id: "place3",
    title: "銀座でショッピング",
    date: "未定",
    description: "銀座でショッピング体験を楽しむ",
    icon: "mapPin",
    location: { lat: 35.6717, lng: 139.764 },
  },
];
