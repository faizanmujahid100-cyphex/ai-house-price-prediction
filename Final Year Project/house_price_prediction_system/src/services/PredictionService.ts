import { House, PricePrediction } from '../models/House';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export class PredictionService {

  async predictPrice(house: House): Promise<PricePrediction> {
    const result = await this.callMLAPI(house);
    return this.buildPrediction(house, result.predicted_price, result.price_per_marla, result.confidence, result.location_factor);
  }

  private async callMLAPI(house: House): Promise<{
    predicted_price: number;
    price_per_marla: number;
    confidence: number;
    location_factor: number;
    base_price: number;
  }> {
    const response = await fetch(`${BACKEND_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        marla:              house.marla,
        bedrooms:           house.bedrooms,
        bathrooms:          house.bathrooms,
        kitchens:           house.kitchen,
        year_built:         house.yearBuilt,
        num_floors:         (house as any).num_floors ?? 1,
        location:           house.area,
        servant_quarters:   (house as any).servant_quarters ?? 0,
        store_rooms:        (house as any).store_rooms ?? 0,
        furnished:          house.furnished,
        gym:                (house as any).gym ?? false,
        study_room:         (house as any).study_room ?? false,
        drawing_room:       (house as any).drawing_room ?? false,
        dining_room:        (house as any).dining_room ?? false,
        lawn_garden:        house.hasGarden,
        swimming_pool:      (house as any).swimming_pool ?? false,
        electricity_backup: (house as any).electricity_backup ?? false,
        lounge_sitting:     (house as any).lounge_sitting ?? false,
        is_corner:          (house as any).is_corner ?? false,
        facing_park:        (house as any).facing_park ?? false,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Prediction API error: ${response.status}`);
    }
    return response.json();
  }

  private buildPrediction(
    house: House,
    predictedPrice: number,
    pricePerMarla: number,
    confidence: number,
    locationFactor: number
  ): PricePrediction {
    const currentPrice = house.price || predictedPrice;
    const percentageChange = ((predictedPrice - currentPrice) / currentPrice) * 100;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (percentageChange > 5) trend = 'up';
    else if (percentageChange < -5) trend = 'down';

    const totalAmenities = [
      house.furnished,
      house.hasGarden,
      (house as any).gym,
      (house as any).study_room,
      (house as any).drawing_room,
      (house as any).dining_room,
      (house as any).swimming_pool,
      (house as any).electricity_backup,
      (house as any).lounge_sitting,
    ].filter(Boolean).length;

    const houseAge = new Date().getFullYear() - house.yearBuilt;

    return {
      id: `${house.id}_pred_${Date.now()}`,
      houseId: house.id,
      location: house.location,
      area: house.area,
      marla: house.marla,
      bedrooms: house.bedrooms,
      bathrooms: house.bathrooms,
      kitchen: house.kitchen,
      hasGarage: house.hasGarage,
      hasGarden: house.hasGarden,
      hasRoofAccess: house.hasRoofAccess,
      furnished: house.furnished,
      currentPrice,
      predictedPrice,
      pricePerMarla,
      confidence,
      trend,
      percentageChange,
      date: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      factors: [
        {
          name: 'Location Premium',
          impact: locationFactor >= 1.0 ? 'positive' : 'negative',
          weight: 0.35,
          description: `${house.area} location factor: ${locationFactor.toFixed(2)}x`,
          value: `${locationFactor.toFixed(2)}x`,
        },
        {
          name: 'Property Size',
          impact: 'positive',
          weight: 0.30,
          description: `${house.marla} Marla (${(house.marla * 272.25).toFixed(0)} sq ft)`,
          value: `${house.marla} Marla`,
        },
        {
          name: 'Amenities',
          impact: totalAmenities > 3 ? 'positive' : 'neutral',
          weight: 0.20,
          description: `${totalAmenities} amenities included`,
          value: `${totalAmenities} features`,
        },
        {
          name: 'Property Age',
          impact: houseAge < 5 ? 'positive' : houseAge > 15 ? 'negative' : 'neutral',
          weight: 0.15,
          description: `${houseAge} year${houseAge !== 1 ? 's' : ''} old`,
          value: `${houseAge} yrs`,
        },
      ],
    };
  }

  async predictMultiplePrices(houses: House[]): Promise<Map<string, PricePrediction>> {
    const predictions = new Map<string, PricePrediction>();
    for (const house of houses) {
      const prediction = await this.predictPrice(house);
      predictions.set(house.id, prediction);
    }
    return predictions;
  }
}
