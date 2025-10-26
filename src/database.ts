import fs from 'fs';
import mongoose from 'mongoose';
import path from 'path';
import MenuItem from './models/menuItemModel';
import Restaurant from './models/restaurantModel';
import User from './models/userModel';

const seedDataPath = path.join(process.cwd(), 'src', 'seedData.json');

export const initializeDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already seeded. Skipping initialization.');
      return;
    }

    console.log('Database not seeded. Initializing with seed data...');
    const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));

    if (seedData.users && seedData.users.length > 0) {
      await User.insertMany(seedData.users);
      console.log(`Inserted ${seedData.users.length} users.`);
    }

    if (seedData.restaurants && seedData.restaurants.length > 0) {
      await Restaurant.insertMany(seedData.restaurants);
      console.log(`Inserted ${seedData.restaurants.length} restaurants.`);
    }

    if (seedData.menus && seedData.menus.length > 0) {
      const restaurants = await Restaurant.find({});
      const restaurantMap = new Map<string, mongoose.Types.ObjectId>();
      restaurants.forEach((restaurant: any) => {
        restaurantMap.set(restaurant.name, restaurant._id);
      });

      const menusWithIds = seedData.menus.map((menu: any) => ({
        ...menu,
        restaurant_id: restaurantMap.get(menu.restaurant_name)
      })).filter((menu: any) => menu.restaurant_id);

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
