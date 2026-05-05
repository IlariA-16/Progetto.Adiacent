export interface HousingLocation {
    id: number;
    name: string;
    city: string;
    state: string;
    photo: string;
    availableUnits: number;
    wifi: boolean;
    laundry: boolean;
    // ⬇️ AGGIUNGI QUESTI CAMPI MANCANTI ⬇️
    metratura: number;
    piano: number | string;
    description: string;
    lat: number;
    long: number;
}
