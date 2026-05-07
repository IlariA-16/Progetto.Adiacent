export interface HousingLocation {
    id: number;
    name: string;
    city: string;
    state: string;
    photo: string;
    photos?: string[]; 
    availableUnits: number;
    wifi: boolean;
    laundry: boolean;
    metratura: number;
    piano: number | string;
    description: string;
    lat: number;
    long: number;
    price: number; 
}