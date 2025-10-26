import Restaurant from '../../src/models/restaurantModel';

describe('Restaurant Model', () => {
  it('should create a restaurant successfully', async () => {
    const restaurantData = {
      name: 'Test Restaurant',
      address: '123 Test Street, Test City',
      phone: '1234567890',
      opening_hours: '9 AM - 9 PM'
    };

    const restaurant = new Restaurant(restaurantData);
    const savedRestaurant = await restaurant.save();

    expect(savedRestaurant._id).toBeDefined();
    expect(savedRestaurant.name).toBe(restaurantData.name);
    expect(savedRestaurant.address).toBe(restaurantData.address);
    expect(savedRestaurant.phone).toBe(restaurantData.phone);
    expect(savedRestaurant.opening_hours).toBe(restaurantData.opening_hours);
  });

  it('should require name, address, phone, and opening_hours', async () => {
    const restaurant = new Restaurant({});
    await expect(restaurant.save()).rejects.toThrow();
  });
});
