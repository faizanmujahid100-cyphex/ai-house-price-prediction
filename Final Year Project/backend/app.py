import os
import math
import joblib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'property_price_model.pkl')
model = joblib.load(MODEL_PATH)

MARLA_TO_SQFT = 272.25
CURRENT_YEAR = 2026

LOCATION_FACTORS = {
    'DHA Phase 1':        1.38,
    'DHA Phase 2':        1.32,
    'DHA Phase 3':        1.27,
    'DHA Phase 4':        1.21,
    'DHA Phase 5':        1.43,
    'DHA Phase 6':        1.32,
    'DHA Phase 7':        1.16,
    'DHA Phase 8':        1.10,
    'Bahria Town':        0.98,
    'Bahria Orchard':     0.82,
    'Johar Town':         1.05,
    'Gulberg':            1.47,
    'Model Town':         1.26,
    'Garden Town':        1.21,
    'Faisal Town':        0.77,
    'Wapda Town':         0.93,
    'Cantt':              1.38,
    'Iqbal Town':         0.72,
    'Allama Iqbal Town':  0.66,
    'Township':           0.59,
}

FEATURE_COLS = [
    'Area_SqFt', 'Bedrooms', 'Bathrooms', 'Kitchens', 'House_Age',
    'Num_Floors', 'Servant Quarters', 'Store Rooms', 'Furnished',
    'Gym', 'Study Room', 'Drawing Room', 'Dining Room', 'Lawn/Garden',
    'Swimming Pool', 'Electricity Backup', 'Lounge/Sitting Room',
    'Total_Amenities', 'Is_Corner', 'Facing_Park',
    'Area_per_Bedroom', 'Bathroom_Ratio', 'Beds_x_Floors', 'Age_x_Amenities',
]


def run_model(marla, bedrooms, bathrooms, kitchens, year_built, num_floors,
              servant_quarters, store_rooms, furnished, gym, study_room,
              drawing_room, dining_room, lawn_garden, swimming_pool,
              electricity_backup, lounge_sitting, is_corner, facing_park, location):
    area_sqft = marla * MARLA_TO_SQFT
    house_age = max(0, CURRENT_YEAR - year_built)

    total_amenities = (
        furnished + gym + study_room + drawing_room + dining_room +
        lawn_garden + swimming_pool + electricity_backup + lounge_sitting
    )

    row = {
        'Area_SqFt':              area_sqft,
        'Bedrooms':               bedrooms,
        'Bathrooms':              bathrooms,
        'Kitchens':               kitchens,
        'House_Age':              house_age,
        'Num_Floors':             num_floors,
        'Servant Quarters':       servant_quarters,
        'Store Rooms':            store_rooms,
        'Furnished':              furnished,
        'Gym':                    gym,
        'Study Room':             study_room,
        'Drawing Room':           drawing_room,
        'Dining Room':            dining_room,
        'Lawn/Garden':            lawn_garden,
        'Swimming Pool':          swimming_pool,
        'Electricity Backup':     electricity_backup,
        'Lounge/Sitting Room':    lounge_sitting,
        'Total_Amenities':        total_amenities,
        'Is_Corner':              is_corner,
        'Facing_Park':            facing_park,
        'Area_per_Bedroom':       area_sqft / max(bedrooms, 1),
        'Bathroom_Ratio':         bathrooms / area_sqft if area_sqft > 0 else 0,
        'Beds_x_Floors':          bedrooms * num_floors,
        'Age_x_Amenities':        house_age * total_amenities,
        'Main_Location':          location,
    }

    df = pd.DataFrame([row])
    log_price = float(model.predict(df)[0])
    base_price = math.exp(log_price)
    location_factor = LOCATION_FACTORS.get(location, 1.0)
    predicted_price = round(max(base_price, 0) * location_factor)
    price_per_marla = round(predicted_price / marla)

    return predicted_price, price_per_marla, location_factor, round(base_price)


@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    try:
        marla               = float(data.get('marla', 5))
        bedrooms            = int(data.get('bedrooms', 3))
        bathrooms           = int(data.get('bathrooms', 2))
        kitchens            = int(data.get('kitchens', 1))
        year_built          = int(data.get('year_built', 2015))
        num_floors          = int(data.get('num_floors', 1))
        location            = str(data.get('location', 'DHA Phase 5'))
        servant_quarters    = int(data.get('servant_quarters', 0))
        store_rooms         = int(data.get('store_rooms', 0))
        furnished           = int(bool(data.get('furnished', False)))
        gym                 = int(bool(data.get('gym', False)))
        study_room          = int(bool(data.get('study_room', False)))
        drawing_room        = int(bool(data.get('drawing_room', False)))
        dining_room         = int(bool(data.get('dining_room', False)))
        lawn_garden         = int(bool(data.get('lawn_garden', False)))
        swimming_pool       = int(bool(data.get('swimming_pool', False)))
        electricity_backup  = int(bool(data.get('electricity_backup', False)))
        lounge_sitting      = int(bool(data.get('lounge_sitting', False)))
        is_corner           = int(bool(data.get('is_corner', False)))
        facing_park         = int(bool(data.get('facing_park', False)))

        predicted_price, price_per_marla, location_factor, base_price = run_model(
            marla, bedrooms, bathrooms, kitchens, year_built, num_floors,
            servant_quarters, store_rooms, furnished, gym, study_room,
            drawing_room, dining_room, lawn_garden, swimming_pool,
            electricity_backup, lounge_sitting, is_corner, facing_park, location
        )

        return jsonify({
            'predicted_price':  predicted_price,
            'price_per_marla':  price_per_marla,
            'confidence':       0.87,
            'location_factor':  location_factor,
            'base_price':       base_price,
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


HOUSES = [
    {'id': '1',  'title': 'Luxurious Villa in DHA Phase 5',   'location': 'Lahore', 'area': 'DHA Phase 5',  'marla': 10, 'bedrooms': 5, 'bathrooms': 6, 'kitchen': 1, 'hasGarage': True,  'hasGarden': True,  'hasRoofAccess': True,  'furnished': True,  'price': 65000000,  'pricePerMarla': 6500000,  'description': 'Beautiful modern villa with all amenities, prime location in DHA Phase 5.',         'image': 'https://images.unsplash.com/photo-1622015663381-d2e05ae91b72?w=500', 'yearBuilt': 2020, 'features': ['Swimming Pool', 'Servant Quarter', 'Solar System', 'CCTV Security', 'Smart Home'],          'status': 'available', 'views': 245, 'favorites': 32},
    {'id': '2',  'title': 'Modern House in Bahria Town',       'location': 'Lahore', 'area': 'Bahria Town',  'marla': 8,  'bedrooms': 4, 'bathrooms': 4, 'kitchen': 1, 'hasGarage': True,  'hasGarden': True,  'hasRoofAccess': False, 'furnished': False, 'price': 36000000,  'pricePerMarla': 4500000,  'description': 'Well-maintained house with modern architecture in Bahria Town.',                    'image': 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500', 'yearBuilt': 2019, 'features': ['Marble Flooring', 'Central AC', 'Parking Space', 'Garden'],                         'status': 'available', 'views': 189, 'favorites': 21},
    {'id': '3',  'title': 'Spacious Home in Johar Town',       'location': 'Lahore', 'area': 'Johar Town',  'marla': 7,  'bedrooms': 4, 'bathrooms': 3, 'kitchen': 1, 'hasGarage': True,  'hasGarden': False, 'hasRoofAccess': True,  'furnished': False, 'price': 33250000,  'pricePerMarla': 4750000,  'description': 'Family friendly home near schools and markets in Johar Town.',                     'image': 'https://images.unsplash.com/photo-1668911495278-487418f8f72d?w=500', 'yearBuilt': 2018, 'features': ['Terrace', 'Store Room', 'Powder Room', 'Tiled Flooring'],                           'status': 'available', 'views': 156, 'favorites': 18},
    {'id': '4',  'title': 'Corner House in Gulberg',           'location': 'Lahore', 'area': 'Gulberg',     'marla': 12, 'bedrooms': 6, 'bathrooms': 5, 'kitchen': 2, 'hasGarage': True,  'hasGarden': True,  'hasRoofAccess': True,  'furnished': True,  'price': 81000000,  'pricePerMarla': 6750000,  'description': 'Premium corner house in the heart of Gulberg.',                                     'image': 'https://images.unsplash.com/photo-1721815693498-cc28507c0ba2?w=500', 'yearBuilt': 2021, 'features': ['Gym Room', 'Home Theater', 'Study Room', 'Basement', 'Jacuzzi'],                    'status': 'available', 'views': 423, 'favorites': 67},
    {'id': '5',  'title': 'Affordable House in Wapda Town',    'location': 'Lahore', 'area': 'Wapda Town',  'marla': 5,  'bedrooms': 3, 'bathrooms': 3, 'kitchen': 1, 'hasGarage': False, 'hasGarden': False, 'hasRoofAccess': True,  'furnished': False, 'price': 21250000,  'pricePerMarla': 4250000,  'description': 'Ideal for small families, well-connected location in Wapda Town.',                  'image': 'https://images.unsplash.com/photo-1682357042725-77af1ef2789b?w=500', 'yearBuilt': 2017, 'features': ['Tiled Flooring', 'Water Tank', 'Boundary Wall', 'Roof Access'],                    'status': 'available', 'views': 98,  'favorites': 12},
    {'id': '6',  'title': 'Brand New Villa in DHA Phase 6',    'location': 'Lahore', 'area': 'DHA Phase 6', 'marla': 15, 'bedrooms': 7, 'bathrooms': 7, 'kitchen': 2, 'hasGarage': True,  'hasGarden': True,  'hasRoofAccess': True,  'furnished': True,  'price': 90000000,  'pricePerMarla': 6000000,  'description': 'State-of-the-art villa with smart home features in DHA Phase 6.',                  'image': 'https://images.unsplash.com/photo-1616632821499-61ac29f49ff8?w=500', 'yearBuilt': 2023, 'features': ['Smart Home System', 'Underground Water Tank', 'Generator', 'Jacuzzi', 'Elevator'], 'status': 'available', 'views': 567, 'favorites': 89},
    {'id': '7',  'title': 'Classic House in Model Town',       'location': 'Lahore', 'area': 'Model Town',  'marla': 10, 'bedrooms': 5, 'bathrooms': 4, 'kitchen': 1, 'hasGarage': True,  'hasGarden': True,  'hasRoofAccess': False, 'furnished': False, 'price': 57500000,  'pricePerMarla': 5750000,  'description': 'Traditional architecture with modern facilities in Model Town.',                    'image': 'https://images.unsplash.com/photo-1650059232481-352cd48eb740?w=500', 'yearBuilt': 2016, 'features': ['Lawn', 'Porch', 'Drawing Room', 'Dining Room', 'Fireplace'],                        'status': 'sold',      'views': 234, 'favorites': 45},
    {'id': '8',  'title': 'Budget Home in Township',           'location': 'Lahore', 'area': 'Township',    'marla': 5,  'bedrooms': 3, 'bathrooms': 2, 'kitchen': 1, 'hasGarage': False, 'hasGarden': False, 'hasRoofAccess': True,  'furnished': False, 'price': 13750000,  'pricePerMarla': 2750000,  'description': 'Perfect starter home for young families in Township.',                              'image': 'https://images.unsplash.com/photo-1768637087224-cffa17561c53?w=500', 'yearBuilt': 2015, 'features': ['Separate Entry', 'Gas Connection', 'Electricity Backup', 'Store Room'],           'status': 'pending',   'views': 167, 'favorites': 23},
    {'id': '9',  'title': 'Modern Bungalow in Cantt',          'location': 'Lahore', 'area': 'Cantt',       'marla': 12, 'bedrooms': 5, 'bathrooms': 5, 'kitchen': 1, 'hasGarage': True,  'hasGarden': True,  'hasRoofAccess': False, 'furnished': True,  'price': 72000000,  'pricePerMarla': 6000000,  'description': 'Elegant bungalow in the prestigious Cantt area with premium finishes.',              'image': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500', 'yearBuilt': 2022, 'features': ['Marble Flooring', 'Smart Home', 'Solar System', 'Swimming Pool'],               'status': 'available', 'views': 312, 'favorites': 54},
    {'id': '10', 'title': 'Family Home in Garden Town',        'location': 'Lahore', 'area': 'Garden Town', 'marla': 8,  'bedrooms': 4, 'bathrooms': 4, 'kitchen': 1, 'hasGarage': True,  'hasGarden': True,  'hasRoofAccess': True,  'furnished': False, 'price': 42000000,  'pricePerMarla': 5250000,  'description': 'Charming family home in leafy Garden Town with large garden.',                      'image': 'https://images.unsplash.com/photo-1570129477492-779d43b8b9cd?w=500', 'yearBuilt': 2019, 'features': ['Lawn', 'Servant Quarter', 'Drawing Room', 'Dining Room'],                          'status': 'available', 'views': 198, 'favorites': 31},
]

HISTORICAL_RATES = [
    # DHA Phase 5 - 10 Marla
    {'year': 2019, 'area': 'DHA Phase 5',        'marlaSize': 10, 'averagePrice': 45000000,  'pricePerMarla': 4500000,  'growthRate': 11.1},
    {'year': 2020, 'area': 'DHA Phase 5',        'marlaSize': 10, 'averagePrice': 50000000,  'pricePerMarla': 5000000,  'growthRate': 11.1},
    {'year': 2021, 'area': 'DHA Phase 5',        'marlaSize': 10, 'averagePrice': 55000000,  'pricePerMarla': 5500000,  'growthRate': 10.0},
    {'year': 2022, 'area': 'DHA Phase 5',        'marlaSize': 10, 'averagePrice': 60000000,  'pricePerMarla': 6000000,  'growthRate': 9.1},
    {'year': 2023, 'area': 'DHA Phase 5',        'marlaSize': 10, 'averagePrice': 62000000,  'pricePerMarla': 6200000,  'growthRate': 3.3},
    {'year': 2024, 'area': 'DHA Phase 5',        'marlaSize': 10, 'averagePrice': 65000000,  'pricePerMarla': 6500000,  'growthRate': 4.8},
    {'year': 2025, 'area': 'DHA Phase 5',        'marlaSize': 10, 'averagePrice': 68000000,  'pricePerMarla': 6800000,  'growthRate': 4.6},
    {'year': 2026, 'area': 'DHA Phase 5',        'marlaSize': 10, 'averagePrice': 70000000,  'pricePerMarla': 7000000,  'growthRate': 2.9},
    # DHA Phase 6 - 10 Marla
    {'year': 2019, 'area': 'DHA Phase 6',        'marlaSize': 10, 'averagePrice': 42000000,  'pricePerMarla': 4200000,  'growthRate': 10.5},
    {'year': 2020, 'area': 'DHA Phase 6',        'marlaSize': 10, 'averagePrice': 46000000,  'pricePerMarla': 4600000,  'growthRate': 9.5},
    {'year': 2021, 'area': 'DHA Phase 6',        'marlaSize': 10, 'averagePrice': 51000000,  'pricePerMarla': 5100000,  'growthRate': 10.9},
    {'year': 2022, 'area': 'DHA Phase 6',        'marlaSize': 10, 'averagePrice': 56000000,  'pricePerMarla': 5600000,  'growthRate': 9.8},
    {'year': 2023, 'area': 'DHA Phase 6',        'marlaSize': 10, 'averagePrice': 59000000,  'pricePerMarla': 5900000,  'growthRate': 5.4},
    {'year': 2024, 'area': 'DHA Phase 6',        'marlaSize': 10, 'averagePrice': 62000000,  'pricePerMarla': 6200000,  'growthRate': 5.1},
    {'year': 2025, 'area': 'DHA Phase 6',        'marlaSize': 10, 'averagePrice': 65000000,  'pricePerMarla': 6500000,  'growthRate': 4.8},
    {'year': 2026, 'area': 'DHA Phase 6',        'marlaSize': 10, 'averagePrice': 68000000,  'pricePerMarla': 6800000,  'growthRate': 4.6},
    # Bahria Town - 8 Marla
    {'year': 2019, 'area': 'Bahria Town',        'marlaSize': 8,  'averagePrice': 25000000,  'pricePerMarla': 3125000,  'growthRate': 12.0},
    {'year': 2020, 'area': 'Bahria Town',        'marlaSize': 8,  'averagePrice': 28000000,  'pricePerMarla': 3500000,  'growthRate': 12.0},
    {'year': 2021, 'area': 'Bahria Town',        'marlaSize': 8,  'averagePrice': 30000000,  'pricePerMarla': 3750000,  'growthRate': 7.1},
    {'year': 2022, 'area': 'Bahria Town',        'marlaSize': 8,  'averagePrice': 33000000,  'pricePerMarla': 4125000,  'growthRate': 10.0},
    {'year': 2023, 'area': 'Bahria Town',        'marlaSize': 8,  'averagePrice': 35000000,  'pricePerMarla': 4375000,  'growthRate': 6.1},
    {'year': 2024, 'area': 'Bahria Town',        'marlaSize': 8,  'averagePrice': 36000000,  'pricePerMarla': 4500000,  'growthRate': 2.9},
    {'year': 2025, 'area': 'Bahria Town',        'marlaSize': 8,  'averagePrice': 38000000,  'pricePerMarla': 4750000,  'growthRate': 5.6},
    {'year': 2026, 'area': 'Bahria Town',        'marlaSize': 8,  'averagePrice': 40000000,  'pricePerMarla': 5000000,  'growthRate': 5.3},
    # Gulberg - 12 Marla
    {'year': 2019, 'area': 'Gulberg',            'marlaSize': 12, 'averagePrice': 60000000,  'pricePerMarla': 5000000,  'growthRate': 10.0},
    {'year': 2020, 'area': 'Gulberg',            'marlaSize': 12, 'averagePrice': 66000000,  'pricePerMarla': 5500000,  'growthRate': 10.0},
    {'year': 2021, 'area': 'Gulberg',            'marlaSize': 12, 'averagePrice': 72000000,  'pricePerMarla': 6000000,  'growthRate': 9.1},
    {'year': 2022, 'area': 'Gulberg',            'marlaSize': 12, 'averagePrice': 75000000,  'pricePerMarla': 6250000,  'growthRate': 4.2},
    {'year': 2023, 'area': 'Gulberg',            'marlaSize': 12, 'averagePrice': 78000000,  'pricePerMarla': 6500000,  'growthRate': 4.0},
    {'year': 2024, 'area': 'Gulberg',            'marlaSize': 12, 'averagePrice': 81000000,  'pricePerMarla': 6750000,  'growthRate': 3.8},
    {'year': 2025, 'area': 'Gulberg',            'marlaSize': 12, 'averagePrice': 84000000,  'pricePerMarla': 7000000,  'growthRate': 3.7},
    {'year': 2026, 'area': 'Gulberg',            'marlaSize': 12, 'averagePrice': 87000000,  'pricePerMarla': 7250000,  'growthRate': 3.6},
    # Johar Town - 7 Marla
    {'year': 2019, 'area': 'Johar Town',         'marlaSize': 7,  'averagePrice': 23000000,  'pricePerMarla': 3285714,  'growthRate': 9.6},
    {'year': 2020, 'area': 'Johar Town',         'marlaSize': 7,  'averagePrice': 25200000,  'pricePerMarla': 3600000,  'growthRate': 9.6},
    {'year': 2021, 'area': 'Johar Town',         'marlaSize': 7,  'averagePrice': 28000000,  'pricePerMarla': 4000000,  'growthRate': 11.1},
    {'year': 2022, 'area': 'Johar Town',         'marlaSize': 7,  'averagePrice': 30100000,  'pricePerMarla': 4300000,  'growthRate': 7.5},
    {'year': 2023, 'area': 'Johar Town',         'marlaSize': 7,  'averagePrice': 31500000,  'pricePerMarla': 4500000,  'growthRate': 4.7},
    {'year': 2024, 'area': 'Johar Town',         'marlaSize': 7,  'averagePrice': 33250000,  'pricePerMarla': 4750000,  'growthRate': 5.6},
    {'year': 2025, 'area': 'Johar Town',         'marlaSize': 7,  'averagePrice': 35000000,  'pricePerMarla': 5000000,  'growthRate': 5.3},
    {'year': 2026, 'area': 'Johar Town',         'marlaSize': 7,  'averagePrice': 36750000,  'pricePerMarla': 5250000,  'growthRate': 5.0},
    # Model Town - 10 Marla
    {'year': 2019, 'area': 'Model Town',         'marlaSize': 10, 'averagePrice': 40000000,  'pricePerMarla': 4000000,  'growthRate': 10.0},
    {'year': 2020, 'area': 'Model Town',         'marlaSize': 10, 'averagePrice': 44000000,  'pricePerMarla': 4400000,  'growthRate': 10.0},
    {'year': 2021, 'area': 'Model Town',         'marlaSize': 10, 'averagePrice': 48000000,  'pricePerMarla': 4800000,  'growthRate': 9.1},
    {'year': 2022, 'area': 'Model Town',         'marlaSize': 10, 'averagePrice': 52000000,  'pricePerMarla': 5200000,  'growthRate': 8.3},
    {'year': 2023, 'area': 'Model Town',         'marlaSize': 10, 'averagePrice': 55000000,  'pricePerMarla': 5500000,  'growthRate': 5.8},
    {'year': 2024, 'area': 'Model Town',         'marlaSize': 10, 'averagePrice': 57500000,  'pricePerMarla': 5750000,  'growthRate': 4.5},
    {'year': 2025, 'area': 'Model Town',         'marlaSize': 10, 'averagePrice': 60000000,  'pricePerMarla': 6000000,  'growthRate': 4.3},
    {'year': 2026, 'area': 'Model Town',         'marlaSize': 10, 'averagePrice': 62500000,  'pricePerMarla': 6250000,  'growthRate': 4.2},
    # Township - 5 Marla
    {'year': 2019, 'area': 'Township',           'marlaSize': 5,  'averagePrice': 9000000,   'pricePerMarla': 1800000,  'growthRate': 11.1},
    {'year': 2020, 'area': 'Township',           'marlaSize': 5,  'averagePrice': 10000000,  'pricePerMarla': 2000000,  'growthRate': 11.1},
    {'year': 2021, 'area': 'Township',           'marlaSize': 5,  'averagePrice': 11000000,  'pricePerMarla': 2200000,  'growthRate': 10.0},
    {'year': 2022, 'area': 'Township',           'marlaSize': 5,  'averagePrice': 12000000,  'pricePerMarla': 2400000,  'growthRate': 9.1},
    {'year': 2023, 'area': 'Township',           'marlaSize': 5,  'averagePrice': 12750000,  'pricePerMarla': 2550000,  'growthRate': 6.3},
    {'year': 2024, 'area': 'Township',           'marlaSize': 5,  'averagePrice': 13750000,  'pricePerMarla': 2750000,  'growthRate': 7.8},
    {'year': 2025, 'area': 'Township',           'marlaSize': 5,  'averagePrice': 14500000,  'pricePerMarla': 2900000,  'growthRate': 5.5},
    {'year': 2026, 'area': 'Township',           'marlaSize': 5,  'averagePrice': 15250000,  'pricePerMarla': 3050000,  'growthRate': 5.2},
    # Cantt - 12 Marla
    {'year': 2019, 'area': 'Cantt',              'marlaSize': 12, 'averagePrice': 50000000,  'pricePerMarla': 4166667,  'growthRate': 10.0},
    {'year': 2020, 'area': 'Cantt',              'marlaSize': 12, 'averagePrice': 55000000,  'pricePerMarla': 4583333,  'growthRate': 10.0},
    {'year': 2021, 'area': 'Cantt',              'marlaSize': 12, 'averagePrice': 60000000,  'pricePerMarla': 5000000,  'growthRate': 9.1},
    {'year': 2022, 'area': 'Cantt',              'marlaSize': 12, 'averagePrice': 64000000,  'pricePerMarla': 5333333,  'growthRate': 6.7},
    {'year': 2023, 'area': 'Cantt',              'marlaSize': 12, 'averagePrice': 67000000,  'pricePerMarla': 5583333,  'growthRate': 4.7},
    {'year': 2024, 'area': 'Cantt',              'marlaSize': 12, 'averagePrice': 70000000,  'pricePerMarla': 5833333,  'growthRate': 4.5},
    {'year': 2025, 'area': 'Cantt',              'marlaSize': 12, 'averagePrice': 73000000,  'pricePerMarla': 6083333,  'growthRate': 4.3},
    {'year': 2026, 'area': 'Cantt',              'marlaSize': 12, 'averagePrice': 76000000,  'pricePerMarla': 6333333,  'growthRate': 4.1},
    # Garden Town - 8 Marla
    {'year': 2019, 'area': 'Garden Town',        'marlaSize': 8,  'averagePrice': 28000000,  'pricePerMarla': 3500000,  'growthRate': 9.8},
    {'year': 2020, 'area': 'Garden Town',        'marlaSize': 8,  'averagePrice': 31000000,  'pricePerMarla': 3875000,  'growthRate': 10.7},
    {'year': 2021, 'area': 'Garden Town',        'marlaSize': 8,  'averagePrice': 34000000,  'pricePerMarla': 4250000,  'growthRate': 9.7},
    {'year': 2022, 'area': 'Garden Town',        'marlaSize': 8,  'averagePrice': 37000000,  'pricePerMarla': 4625000,  'growthRate': 8.8},
    {'year': 2023, 'area': 'Garden Town',        'marlaSize': 8,  'averagePrice': 39000000,  'pricePerMarla': 4875000,  'growthRate': 5.4},
    {'year': 2024, 'area': 'Garden Town',        'marlaSize': 8,  'averagePrice': 42000000,  'pricePerMarla': 5250000,  'growthRate': 7.7},
    {'year': 2025, 'area': 'Garden Town',        'marlaSize': 8,  'averagePrice': 44500000,  'pricePerMarla': 5562500,  'growthRate': 6.0},
    {'year': 2026, 'area': 'Garden Town',        'marlaSize': 8,  'averagePrice': 47000000,  'pricePerMarla': 5875000,  'growthRate': 5.6},
    # Wapda Town - 5 Marla
    {'year': 2019, 'area': 'Wapda Town',         'marlaSize': 5,  'averagePrice': 13000000,  'pricePerMarla': 2600000,  'growthRate': 8.5},
    {'year': 2020, 'area': 'Wapda Town',         'marlaSize': 5,  'averagePrice': 14500000,  'pricePerMarla': 2900000,  'growthRate': 11.5},
    {'year': 2021, 'area': 'Wapda Town',         'marlaSize': 5,  'averagePrice': 16000000,  'pricePerMarla': 3200000,  'growthRate': 10.3},
    {'year': 2022, 'area': 'Wapda Town',         'marlaSize': 5,  'averagePrice': 17500000,  'pricePerMarla': 3500000,  'growthRate': 9.4},
    {'year': 2023, 'area': 'Wapda Town',         'marlaSize': 5,  'averagePrice': 18500000,  'pricePerMarla': 3700000,  'growthRate': 5.7},
    {'year': 2024, 'area': 'Wapda Town',         'marlaSize': 5,  'averagePrice': 21250000,  'pricePerMarla': 4250000,  'growthRate': 14.9},
    {'year': 2025, 'area': 'Wapda Town',         'marlaSize': 5,  'averagePrice': 22500000,  'pricePerMarla': 4500000,  'growthRate': 5.9},
    {'year': 2026, 'area': 'Wapda Town',         'marlaSize': 5,  'averagePrice': 24000000,  'pricePerMarla': 4800000,  'growthRate': 6.7},
    # Faisal Town - 5 Marla
    {'year': 2019, 'area': 'Faisal Town',        'marlaSize': 5,  'averagePrice': 10000000,  'pricePerMarla': 2000000,  'growthRate': 8.0},
    {'year': 2020, 'area': 'Faisal Town',        'marlaSize': 5,  'averagePrice': 11000000,  'pricePerMarla': 2200000,  'growthRate': 10.0},
    {'year': 2021, 'area': 'Faisal Town',        'marlaSize': 5,  'averagePrice': 12000000,  'pricePerMarla': 2400000,  'growthRate': 9.1},
    {'year': 2022, 'area': 'Faisal Town',        'marlaSize': 5,  'averagePrice': 13000000,  'pricePerMarla': 2600000,  'growthRate': 8.3},
    {'year': 2023, 'area': 'Faisal Town',        'marlaSize': 5,  'averagePrice': 13750000,  'pricePerMarla': 2750000,  'growthRate': 5.8},
    {'year': 2024, 'area': 'Faisal Town',        'marlaSize': 5,  'averagePrice': 14500000,  'pricePerMarla': 2900000,  'growthRate': 5.5},
    {'year': 2025, 'area': 'Faisal Town',        'marlaSize': 5,  'averagePrice': 15500000,  'pricePerMarla': 3100000,  'growthRate': 6.9},
    {'year': 2026, 'area': 'Faisal Town',        'marlaSize': 5,  'averagePrice': 16500000,  'pricePerMarla': 3300000,  'growthRate': 6.5},
    # Iqbal Town - 5 Marla
    {'year': 2019, 'area': 'Iqbal Town',         'marlaSize': 5,  'averagePrice': 8500000,   'pricePerMarla': 1700000,  'growthRate': 7.5},
    {'year': 2020, 'area': 'Iqbal Town',         'marlaSize': 5,  'averagePrice': 9500000,   'pricePerMarla': 1900000,  'growthRate': 11.8},
    {'year': 2021, 'area': 'Iqbal Town',         'marlaSize': 5,  'averagePrice': 10500000,  'pricePerMarla': 2100000,  'growthRate': 10.5},
    {'year': 2022, 'area': 'Iqbal Town',         'marlaSize': 5,  'averagePrice': 11500000,  'pricePerMarla': 2300000,  'growthRate': 9.5},
    {'year': 2023, 'area': 'Iqbal Town',         'marlaSize': 5,  'averagePrice': 12000000,  'pricePerMarla': 2400000,  'growthRate': 4.3},
    {'year': 2024, 'area': 'Iqbal Town',         'marlaSize': 5,  'averagePrice': 12750000,  'pricePerMarla': 2550000,  'growthRate': 6.3},
    {'year': 2025, 'area': 'Iqbal Town',         'marlaSize': 5,  'averagePrice': 13500000,  'pricePerMarla': 2700000,  'growthRate': 5.9},
    {'year': 2026, 'area': 'Iqbal Town',         'marlaSize': 5,  'averagePrice': 14250000,  'pricePerMarla': 2850000,  'growthRate': 5.6},
    # Bahria Orchard - 5 Marla
    {'year': 2019, 'area': 'Bahria Orchard',     'marlaSize': 5,  'averagePrice': 11000000,  'pricePerMarla': 2200000,  'growthRate': 9.0},
    {'year': 2020, 'area': 'Bahria Orchard',     'marlaSize': 5,  'averagePrice': 12500000,  'pricePerMarla': 2500000,  'growthRate': 13.6},
    {'year': 2021, 'area': 'Bahria Orchard',     'marlaSize': 5,  'averagePrice': 14000000,  'pricePerMarla': 2800000,  'growthRate': 12.0},
    {'year': 2022, 'area': 'Bahria Orchard',     'marlaSize': 5,  'averagePrice': 15500000,  'pricePerMarla': 3100000,  'growthRate': 10.7},
    {'year': 2023, 'area': 'Bahria Orchard',     'marlaSize': 5,  'averagePrice': 16500000,  'pricePerMarla': 3300000,  'growthRate': 6.5},
    {'year': 2024, 'area': 'Bahria Orchard',     'marlaSize': 5,  'averagePrice': 17500000,  'pricePerMarla': 3500000,  'growthRate': 6.1},
    {'year': 2025, 'area': 'Bahria Orchard',     'marlaSize': 5,  'averagePrice': 18500000,  'pricePerMarla': 3700000,  'growthRate': 5.7},
    {'year': 2026, 'area': 'Bahria Orchard',     'marlaSize': 5,  'averagePrice': 19500000,  'pricePerMarla': 3900000,  'growthRate': 5.4},
]


@app.route('/houses', methods=['GET'])
def get_houses():
    area = request.args.get('area')
    result = [h for h in HOUSES if not area or h['area'] == area]
    return jsonify(result)


@app.route('/houses', methods=['POST'])
def add_house():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    new_id = str(max(int(h['id']) for h in HOUSES) + 1)
    new_house = {
        'id':            new_id,
        'title':         data.get('title', ''),
        'location':      'Lahore',
        'area':          data.get('location', data.get('area', '')),
        'marla':         float(data.get('area', data.get('marla', 0))),
        'bedrooms':      int(data.get('beds', data.get('bedrooms', 0))),
        'bathrooms':     int(data.get('baths', data.get('bathrooms', 0))),
        'kitchen':       int(data.get('kitchen', 1)),
        'hasGarage':     bool(data.get('parking', data.get('hasGarage', False))),
        'hasGarden':     bool(data.get('hasGarden', False)),
        'hasRoofAccess': bool(data.get('hasRoofAccess', False)),
        'furnished':     bool(data.get('furnished', False)),
        'price':         float(data.get('price', 0)),
        'pricePerMarla': round(float(data.get('price', 0)) / max(float(data.get('area', data.get('marla', 1))), 1)),
        'description':   data.get('offer', data.get('description', '')),
        'image':         data.get('image', ''),
        'yearBuilt':     int(data.get('yearBuilt', 2024)),
        'features':      data.get('features', []),
        'status':        data.get('status', 'available'),
        'views':         0,
        'favorites':     0,
    }
    HOUSES.append(new_house)
    return jsonify({'id': new_id, 'message': 'Property added', 'house': new_house}), 201


@app.route('/house/<house_id>', methods=['GET'])
def get_house(house_id):
    house = next((h for h in HOUSES if h['id'] == house_id), None)
    if not house:
        return jsonify({'error': 'House not found'}), 404
    return jsonify(house)


@app.route('/house/<house_id>', methods=['PUT'])
def update_house(house_id):
    house = next((h for h in HOUSES if h['id'] == house_id), None)
    if not house:
        return jsonify({'error': 'House not found'}), 404
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    house.update({k: v for k, v in data.items() if k != 'id'})
    if 'price' in data and 'marla' in house:
        house['pricePerMarla'] = round(house['price'] / max(house['marla'], 1))
    return jsonify(house)


@app.route('/house/<house_id>', methods=['DELETE'])
def delete_house(house_id):
    global HOUSES
    house = next((h for h in HOUSES if h['id'] == house_id), None)
    if not house:
        return jsonify({'error': 'House not found'}), 404
    HOUSES = [h for h in HOUSES if h['id'] != house_id]
    return jsonify({'message': 'House deleted', 'id': house_id})


@app.route('/house/<house_id>/similar', methods=['GET'])
def get_similar_houses(house_id):
    house = next((h for h in HOUSES if h['id'] == house_id), None)
    if not house:
        return jsonify([])
    similar = [
        h for h in HOUSES
        if h['id'] != house_id
        and h['area'] == house['area']
        and abs(h['marla'] - house['marla']) <= 3
        and abs(h['price'] - house['price']) < house['price'] * 0.3
    ][:4]
    return jsonify(similar)


@app.route('/historical-rates', methods=['GET'])
def get_historical_rates():
    area = request.args.get('area')
    marla_size = request.args.get('marlaSize', type=int)
    result = HISTORICAL_RATES
    if area:
        result = [r for r in result if r['area'] == area]
    if marla_size:
        result = [r for r in result if r['marlaSize'] == marla_size]
    return jsonify(result)


@app.route('/market-stats', methods=['GET'])
def market_stats():
    prices = [h['price'] for h in HOUSES]
    marlas = [h['marla'] for h in HOUSES]
    area_stats = {}
    for h in HOUSES:
        if h['area'] not in area_stats:
            area_stats[h['area']] = {'count': 0, 'totalPrice': 0}
        area_stats[h['area']]['count'] += 1
        area_stats[h['area']]['totalPrice'] += h['price']

    return jsonify({
        'totalHouses':   len(HOUSES),
        'averagePrice':  round(sum(prices) / len(prices)) if prices else 0,
        'minPrice':      min(prices) if prices else 0,
        'maxPrice':      max(prices) if prices else 0,
        'averageMarla':  round(sum(marlas) / len(marlas), 1) if marlas else 0,
        'totalValue':    sum(prices),
        'avgPriceByArea': [
            {'area': area, 'avgPrice': round(s['totalPrice'] / s['count']), 'count': s['count']}
            for area, s in area_stats.items()
        ],
    })


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model': 'XGBoost property_price_model',
        'houses': len(HOUSES),
        'historical_rates': len(HISTORICAL_RATES),
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
