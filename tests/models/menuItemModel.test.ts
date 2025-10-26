import mongoose from 'mongoose';
import MenuItem from '../../src/models/menuItemModel';
import Restaurant from '../../src/models/restaurantModel';

describe('MenuItem Model', () => {
  let restaurantId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    const restaurant = new Restaurant({
      name: 'Test Restaurant',
      address: '123 Test Street',
      phone: '1234567890',
      opening_hours: '9 AM - 9 PM'
    });
    const savedRestaurant = await restaurant.save();
    restaurantId = savedRestaurant._id;
  });

  it('should create a menu item successfully', async () => {
    const menuItemData = {
      restaurant_id: restaurantId,
      name: 'Test Dish',
      description: 'A delicious test dish',
      price: 15.99,
      category: 'main course'
    };

    const menuItem = new MenuItem(menuItemData);
    const savedMenuItem = await menuItem.save();

    expect(savedMenuItem._id).toBeDefined();
    expect(savedMenuItem.restaurant_id.toString()).toBe(restaurantId.toString());
    expect(savedMenuItem.name).toBe(menuItemData.name);
    expect(savedMenuItem.description).toBe(menuItemData.description);
    expect(savedMenuItem.price).toBe(menuItemData.price);
    expect(savedMenuItem.category).toBe(menuItemData.category);
  });

  it('should require restaurant_id, name, description, price, and category', async () => {
    const menuItem = new MenuItem({});
    await expect(menuItem.save()).rejects.toThrow();
  });
});
