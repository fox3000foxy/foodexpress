import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import User from './models/userModel';
import Restaurant from './models/restaurantModel';
import MenuItem from './models/menuItemModel';

const seedDataPath = path.join(process.cwd(), 'src', 'seedData.json');

export const initializeDatabase = async () => {
  try {
    // Check if database is already seeded by checking if there are any users
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already seeded. Skipping initialization.');
      return;
    }

    console.log('Database not seeded. Initializing with seed data...');

    // Read seed data
    const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));

    // Insert users
    if (seedData.users && seedData.users.length > 0) {
      await User.insertMany(seedData.users);
      console.log(`Inserted ${seedData.users.length} users.`);
    }

    // Insert restaurants
    if (seedData.restaurants && seedData.restaurants.length > 0) {
      await Restaurant.insertMany(seedData.restaurants);
      console.log(`Inserted ${seedData.restaurants.length} restaurants.`);
    }

    // Insert menus (need to link with restaurant_id)
    if (seedData.menus && seedData.menus.length > 0) {
      const restaurants = await Restaurant.find({});
      const restaurantMap = new Map<string, mongoose.Types.ObjectId>();
      restaurants.forEach((restaurant: any) => {
        restaurantMap.set(restaurant.name, restaurant._id);
      });

      const menusWithIds = seedData.menus.map((menu: any) => ({
        ...menu,
        restaurant_id: restaurantMap.get(menu.restaurant_name)
      })).filter((menu: any) => menu.restaurant_id); // Filter out menus without matching restaurant

      if (menusWithIds.length > 0) {
        await MenuItem.insertMany(menusWithIds);
        console.log(`Inserted ${menusWithIds.length} menu items.`);
      }
    }

    console.log('Database initialization completed.');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};
