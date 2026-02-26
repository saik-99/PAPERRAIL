import kagglehub
import os
import pandas as pd

def get_wholesale_price_index():
    print("Downloading India Wholesale Price Index Data...")
    # Download the latest version
    path = kagglehub.dataset_download("kindasomethin/india-wholesale-price-index-wpi-data-2011-2017")
    
    # Find the CSV file in the downloaded path
    files = [f for f in os.listdir(path) if f.endswith('.csv')]
    if not files:
        raise Exception(f"No CSV found in {path}")
    
    file_path = os.path.join(path, files[0])
    print(f"Loading file: {file_path}")
    try:
        df = pd.read_csv(file_path, encoding='utf-8')
    except UnicodeDecodeError:
        print("UTF-8 decoding failed, trying latin1...")
        df = pd.read_csv(file_path, encoding='latin1')
    
    print("Successfully loaded WPI DataFrame:")
    print(df.head())
    return df

def get_crop_production_data():
    print("Downloading Crop Production Data India...")
    # Download the latest version
    path = kagglehub.dataset_download("iamtapendu/crop-production-data-india")
    
    # Find the CSV file in the downloaded path
    files = [f for f in os.listdir(path) if f.endswith('.csv')]
    if not files:
        raise Exception(f"No CSV found in {path}")
    
    file_path = os.path.join(path, files[0])
    print(f"Loading file: {file_path}")
    try:
        df = pd.read_csv(file_path, encoding='utf-8')
    except UnicodeDecodeError:
        print("UTF-8 decoding failed, trying latin1...")
        df = pd.read_csv(file_path, encoding='latin1')
        
    print("Successfully loaded Crop Production DataFrame:")
    print(df.head())
    return df



if __name__ == "__main__":
    # Ensure kagglehub[pandas-datasets] is installed: `pip install kagglehub[pandas-datasets]`
    try:
        wpi_df = get_wholesale_price_index()
        crop_df = get_crop_production_data()
        print("\nBoth datasets downloaded and ready for ML processing!")
    except Exception as e:
        print(f"Error downloading datasets: {e}")
        print("Please ensure you have kaggle credentials configured if required, and packages installed.")
