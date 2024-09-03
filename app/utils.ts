import { TravelItem } from './types';

export const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  background: isDragging ? 'rgb(243 244 246)' : 'white',
  ...draggableStyle,
});

export const reorder = (list: TravelItem[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export const move = (
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
    travelTimeline: droppableSource.droppableId === 'travelTimeline' ? sourceClone : destClone,
    availablePlaces: droppableSource.droppableId === 'availablePlaces' ? sourceClone : destClone,
  };
};