# Project README: List and Items App

## Overview

This project is a List and Items web application built using HTML, JavaScript, and IndexedDB. The app allows users to manage a list of categories (lists) with associated items and sub-items. Users can create, edit, and delete lists, manage items within these lists, and track additional data using custom fields for each sub-item.

It offers the following features:
- Add and manage lists with their associated items.
- Optionally set a due date for lists and items.
- Add, edit, and delete items and sub-items within a list.
- Display items and sub-items in an organized table view.

## Technologies Used
- HTML
- CSS
- JavaScript
- IndexedDB
## Features

### 1. List Management
   - Users can create a new list by specifying a name, an "Is Immediate" flag, and an optional due date.
   - Lists are stored in an IndexedDB database to persist across sessions.
   - Users can view a summary of existing lists, including their name, due date, number of items, and actions for editing or deleting the list.

### 2. Item Management
   - Items can be added to any list with a title.
   - Each item can be edited or deleted.
   - Users can also add custom fields (sub-items) for each item, which is saved and displayed in the list.

### 3. Tabs for Navigation
   - The app uses tab navigation with three tabs: 
     - Category Tab: Allows users to create and manage lists.
     - Items Tab: Displays items and their sub-items for a selected list.
     - All Items Tab: Displays a summary of all items across all lists.

### 4. Persistent Data Storage with IndexedDB
   - Data is stored locally in IndexedDB, ensuring that user entries persist even after the page is reloaded.
   - The database stores list entries and items, including their titles, due dates, and sub-item details.

## How to Run

1. Clone the Repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd list-items-app
   ```

3. Open `index.html` in a web browser.

   The app will work locally on your browser without any need for a server since it uses IndexedDB for storage.

## Future Improvements
- User Authentication: Add user login and authentication to allow users to save and manage their lists across devices.
- Enhanced UI: Implement a more refined user interface with additional CSS frameworks like Bootstrap.
- Item Prioritization: Add functionality for prioritizing or categorizing items.
- Export Data: Allow users to export their list and items to a file format (e.g., CSV or JSON).


### Contributing

If you'd like to contribute to the development of this app, feel free to fork the repository and submit a pull request with your improvements!

Thank you for using the List and Items app!
