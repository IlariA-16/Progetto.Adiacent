export interface HousingLocation {
    id?: number;
    name: string;
    city: string;
    state: string;
    photo: string;
    photos?:string[];
    availableUnits: number;
    wifi: boolean;
    laundry: boolean;
    metratura: number;
    piano: string;
    description: string;
    lati: number;
    long: number;
    price: number;
    isFavorite?: boolean; 
}
