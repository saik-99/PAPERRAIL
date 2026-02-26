import pandas as pd
import numpy as np
import json
import os
from sklearn.linear_model import LinearRegression

def safe_float(val):
    try:
        if pd.isna(val) or val == '-' or val == '':
            return np.nan
        if isinstance(val, str):
            val = val.replace(',', '')
        return float(val)
    except:
        return np.nan

def clean_name(name):
    # Remove contents inside parentheses for cleaner matching
    if '(' in name:
        return name.split('(')[0].strip()
    return name.strip()

def analyze_and_predict():
    print("Loading datasets...")
    # Load the datasets
    # Skip the first few header rows to get to the actual column names
    season_df = pd.read_csv('Season_Price_Arrival_27-02-2026_02-37-16_AM.csv', skiprows=2)
    market_df = pd.read_csv('Marketwise_Price_Arrival_27-02-2026_02-37-31_AM.csv', skiprows=2)

    predictions = {}
    
    # Process market data since it has daily timeseries
    print("Training models...")
    for index, row in market_df.iterrows():
        commodity = row['Commodity']
        if pd.isna(commodity):
            continue
            
        clean_commodity = clean_name(commodity)
        
        # Extract features (Arrivals) and targets (Prices)
        # Using the columns provided in the CSV
        prices = [
            safe_float(row['Price on 22 Feb, 2026']),
            safe_float(row['Price on 23 Feb, 2026']),
            safe_float(row['Price on 24 Feb, 2026'])
        ]
        
        arrivals = [
            safe_float(row['Arrival on 22 Feb, 2026']),
            safe_float(row['Arrival on 23 Feb, 2026']),
            safe_float(row['Arrival on 24 Feb, 2026'])
        ]
        
        # We need valid data points to train
        valid_indices = [i for i in range(3) if not np.isnan(prices[i]) and not np.isnan(arrivals[i])]
        
        msp = safe_float(row['MSP (Rs./Quintal) 2026-27'])
        if np.isnan(msp):
            msp = 0
            
        current_price = prices[-1] if not np.isnan(prices[-1]) else (prices[1] if not np.isnan(prices[1]) else prices[0])
        if np.isnan(current_price):
            continue # Skip if we have no price data at all
            
        # Format historical data for the chart (padding if missing)
        history = []
        dates = ['22 Feb', '23 Feb', '24 Feb']
        for i in range(3):
            val = prices[i]
            if np.isnan(val):
                # Fallback to current price so chart doesn't break
                val = current_price
            history.append({"date": dates[i], "price": val})

        prediction = current_price
        justification = ""
        is_rising = False
        ml_model = None

        if len(valid_indices) >= 2:
            # We have enough data to run a basic linear regression
            # X = Arrival volume (feature)
            # Y = Price (target)
            X = np.array([arrivals[i] for i in valid_indices]).reshape(-1, 1)
            y = np.array([prices[i] for i in valid_indices])
            
            model = LinearRegression()
            model.fit(X, y)
            
            # Extract parameters for frontend interactive use
            coef = float(model.coef_[0])
            intercept = float(model.intercept_)
            last_arrival = float(arrivals[valid_indices[-1]])
            
            ml_model = {
                "coefficient": coef,
                "intercept": intercept,
                "lastArrival": last_arrival
            }
            
            # Predict next day based on the trend of arrivals
            # Simple assumption: Arrival trend continues linearly
            if len(valid_indices) == 3:
                arrival_trend = arrivals[2] - arrivals[1]
                next_arrival = max(0, arrivals[2] + arrival_trend)
            else:
                next_arrival = arrivals[valid_indices[-1]] # Fallback
                
            predicted_price = model.predict([[next_arrival]])[0]
            
            # Add some boundaries to the prediction to avoid crazy extrapolation
            max_change = current_price * 0.15 # Max 15% change predicted
            prediction = max(current_price - max_change, min(current_price + max_change, predicted_price))
            
            price_change = prediction - current_price
            is_rising = bool(price_change > 0)
            
            trend_str = "increase" if is_rising else "decrease"
            arrival_str = "dropping" if arrival_trend < 0 else "increasing"
            
            if abs(price_change) < (current_price * 0.01): # Less than 1% change
                justification = f"The ML model predicts stable prices around ₹{int(prediction)} as recent market arrivals and trading volumes show minimal variance."
            else:
                justification = f"The Linear Regression model predicts an {trend_str} in price to ₹{int(prediction)}. This is calculated by factoring the {arrival_str} arrival volume trend against recent historical price points on Agmarknet."
                
        else:
            # Not enough data points to run ML
            justification = "Insufficient historical data points from Agmarknet to run a reliable Linear Regression model. Displaying last traded price."
            
        # Fetch season data if available for extra context
        season_match = season_df[season_df['Commodity'] == commodity]
        kharif_arrival = 0
        rabi_arrival = 0
        if not season_match.empty:
            k_arr = safe_float(season_match.iloc[0]['Kharif Marketing Season Arrival (Metric Tonnes)']) 
            r_arr = safe_float(season_match.iloc[0]['Rabi Marketing Season Arrival (Metric Tonnes)'])
            kharif_arrival = k_arr if not np.isnan(k_arr) else 0
            rabi_arrival = r_arr if not np.isnan(r_arr) else 0
            
        predictions[clean_commodity.lower()] = {
            "name": clean_commodity,
            "msp": msp,
            "currentPrice": current_price,
            "predictedPrice": int(prediction),
            "isRising": is_rising,
            "justification": justification,
            "history": history,
            "mlModel": ml_model,
            "seasonArrivals": {
                "kharif": kharif_arrival,
                "rabi": rabi_arrival
            }
        }

    # Ensure public/data directory exists
    os.makedirs('public/data', exist_ok=True)
    
    output_path = 'public/data/ml_price_predictions.json'
    with open(output_path, 'w') as f:
        json.dump(predictions, f, indent=2)
        
    print(f"Successfully generated ML predictions for {len(predictions)} crops at {output_path}")

if __name__ == "__main__":
    analyze_and_predict()
