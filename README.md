# Happy Steps

**Happy Steps** is a mobile application designed to help parents encourage and track their children’s daily habits and progress.  
The app allows parents to create child profiles, assign activities, reward progress, and monitor milestones in a simple and motivating way.

All data is stored locally on the device using a **SQLite database**.  
No data is uploaded, shared, or transmitted outside the app — ensuring complete privacy and safety for your family’s information.

---

## Overview

Happy Steps makes it easier for families to build positive routines together.  
It uses a points-based reward system that encourages consistency while providing parents with a clear overview of each child’s daily achievements.

---

## Features

- **Child Profiles** – Create and manage multiple children, each with their own activities and milestones.
- **Daily Activity Tracking** – Mark off daily habits and automatically record completion.
- **Reward System** – Assign points for completed activities and track total rewards.
- **Milestones** – Set goals for children and celebrate when they reach them.
- **Data Management** – Automatically cleans unused data and supports resetting all app data.
- **Offline Support** – Works entirely offline using local SQLite storage.
- **Simple Interface** – Built for clarity and ease of use, even for new users.

---

## Technology Stack

| Area       | Technology                      |
| ---------- | ------------------------------- |
| Framework  | React Native with Expo          |
| Language   | TypeScript                      |
| Database   | SQLite                          |
| Navigation | React Navigation (Native Stack) |
| Styling    | React Native StyleSheet         |
| Icons      | Icons taken from Icon8          |

---

## Database

Happy Steps uses Expo SQLite for local data storage.
The database is automatically initialized when the app starts.
All required tables (children, activities, daily checks, rewards, milestones, and settings) are created on startup by calling initDB().
