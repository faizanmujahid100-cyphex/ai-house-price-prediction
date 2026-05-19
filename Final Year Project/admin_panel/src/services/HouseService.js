const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export class HouseService {
  async getHouses() {
    const res = await fetch(`${BACKEND_URL}/houses`);
    if (!res.ok) throw new Error('Failed to fetch houses');
    return res.json();
  }

  async getHouseById(id) {
    const res = await fetch(`${BACKEND_URL}/house/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch house');
    return res.json();
  }

  async addHouse(houseData) {
    const res = await fetch(`${BACKEND_URL}/houses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(houseData),
    });
    if (!res.ok) throw new Error('Failed to add house');
    const result = await res.json();
    return result.house;
  }

  async updateHouse(id, updatedData) {
    const res = await fetch(`${BACKEND_URL}/house/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });
    if (!res.ok) throw new Error('Failed to update house');
    return res.json();
  }

  async deleteHouse(id) {
    const res = await fetch(`${BACKEND_URL}/house/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete house');
    return res.json();
  }

  async predictPrice(houseData) {
    const res = await fetch(`${BACKEND_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(houseData),
    });
    if (!res.ok) throw new Error('Prediction failed');
    return res.json();
  }

  async getDashboardStats() {
    const res = await fetch(`${BACKEND_URL}/market-stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    const stats = await res.json();
    const houses = await this.getHouses();
    const newListings = houses.filter(h => {
      const status = (h.status || '').toLowerCase();
      return status === 'available';
    }).length;
    const pendingRequests = houses.filter(h => {
      const status = (h.status || '').toLowerCase();
      return status === 'pending';
    }).length;
    return {
      totalProperties: stats.totalHouses,
      newListings,
      pendingRequests,
      averagePrice: stats.averagePrice,
      totalValue: stats.totalValue,
    };
  }
}
