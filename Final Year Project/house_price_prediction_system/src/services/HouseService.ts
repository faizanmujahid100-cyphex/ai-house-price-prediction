import { House, SearchFilters, PricePrediction, HistoricalRate } from '../models/House';
import { MOCK_HOUSES } from '../data/mock/House';
import { MOCK_HISTORICAL_RATES } from '../data/mock/HistoricalRates';
import { PredictionService } from './PredictionService';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export class HouseService {
  private predictionService = new PredictionService();

  async getAllHouses(): Promise<House[]> {
    try {
      const res = await fetch(`${BACKEND_URL}/houses`);
      if (!res.ok) throw new Error('Backend unavailable');
      return await res.json();
    } catch {
      return [...MOCK_HOUSES];
    }
  }

  async getHouseById(id: string): Promise<House | null> {
    try {
      const res = await fetch(`${BACKEND_URL}/house/${id}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Backend unavailable');
      return await res.json();
    } catch {
      return MOCK_HOUSES.find(h => h.id === id) ?? null;
    }
  }

  async addHouse(data: Partial<House>): Promise<House> {
    const res = await fetch(`${BACKEND_URL}/houses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add house');
    const result = await res.json();
    return result.house;
  }

  async updateHouse(id: string, data: Partial<House>): Promise<House> {
    const res = await fetch(`${BACKEND_URL}/house/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update house');
    return await res.json();
  }

  async deleteHouse(id: string): Promise<void> {
    const res = await fetch(`${BACKEND_URL}/house/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete house');
  }

  async getHousesByFilters(filters: SearchFilters): Promise<House[]> {
    let houses = await this.getAllHouses();
    if (filters.minPrice)    houses = houses.filter(h => h.price >= filters.minPrice!);
    if (filters.maxPrice)    houses = houses.filter(h => h.price <= filters.maxPrice!);
    if (filters.minMarla)    houses = houses.filter(h => h.marla >= filters.minMarla!);
    if (filters.maxMarla)    houses = houses.filter(h => h.marla <= filters.maxMarla!);
    if (filters.bedrooms)    houses = houses.filter(h => h.bedrooms >= filters.bedrooms!);
    if (filters.bathrooms)   houses = houses.filter(h => h.bathrooms >= filters.bathrooms!);
    if (filters.area?.length) houses = houses.filter(h => filters.area!.includes(h.area));
    if (filters.furnished !== undefined) houses = houses.filter(h => h.furnished === filters.furnished);
    if (filters.hasGarage  !== undefined) houses = houses.filter(h => h.hasGarage === filters.hasGarage);
    if (filters.hasGarden  !== undefined) houses = houses.filter(h => h.hasGarden === filters.hasGarden);
    return houses;
  }

  async predictPrice(house: House): Promise<PricePrediction> {
    return this.predictionService.predictPrice(house);
  }

  async getSimilarHouses(houseId: string): Promise<House[]> {
    try {
      const res = await fetch(`${BACKEND_URL}/house/${houseId}/similar`);
      if (!res.ok) throw new Error('Backend unavailable');
      return await res.json();
    } catch {
      const all = await this.getAllHouses();
      const current = all.find(h => h.id === houseId);
      if (!current) return [];
      return all
        .filter(h =>
          h.id !== houseId &&
          h.area === current.area &&
          Math.abs(h.marla - current.marla) <= 3 &&
          Math.abs(h.price - current.price) < current.price * 0.3
        )
        .slice(0, 4);
    }
  }

  async getHistoricalRates(area?: string, marlaSize?: number): Promise<HistoricalRate[]> {
    try {
      const params = new URLSearchParams();
      if (area) params.set('area', area);
      if (marlaSize) params.set('marlaSize', String(marlaSize));
      const res = await fetch(`${BACKEND_URL}/historical-rates?${params}`);
      if (!res.ok) throw new Error('Backend unavailable');
      return await res.json();
    } catch {
      let data = [...MOCK_HISTORICAL_RATES];
      if (area) data = data.filter(r => r.area === area);
      if (marlaSize) data = data.filter(r => r.marlaSize === marlaSize);
      return data;
    }
  }

  async getMarketStats() {
    try {
      const res = await fetch(`${BACKEND_URL}/market-stats`);
      if (!res.ok) throw new Error('Backend unavailable');
      return await res.json();
    } catch {
      const houses = await this.getAllHouses();
      const prices = houses.map(h => h.price);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const areaStats = houses.reduce((acc, house) => {
        if (!acc[house.area]) acc[house.area] = { count: 0, totalPrice: 0 };
        acc[house.area].count++;
        acc[house.area].totalPrice += house.price;
        return acc;
      }, {} as Record<string, { count: number; totalPrice: number }>);
      return {
        totalHouses:  houses.length,
        averagePrice: avgPrice,
        minPrice:     Math.min(...prices),
        maxPrice:     Math.max(...prices),
        averageMarla: houses.reduce((s, h) => s + h.marla, 0) / houses.length,
        avgPriceByArea: Object.entries(areaStats).map(([area, s]) => ({
          area,
          avgPrice: s.totalPrice / s.count,
          count: s.count,
        })),
        totalValue: prices.reduce((a, b) => a + b, 0),
      };
    }
  }
}
