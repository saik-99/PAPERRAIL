"""
KhetiWala Data Preprocessor
Converts the Kaggle datasets into lightweight JSON files for the Next.js frontend.
Run this script whenever you want to refresh the data:
  python data_pipelines/preprocess_data.py
"""

import kagglehub
import os
import json
import pandas as pd

# Output directory (Next.js public folder)
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "data")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def load_csv(path):
    """Load CSV with automatic encoding detection."""
    try:
        return pd.read_csv(path, encoding="utf-8")
    except UnicodeDecodeError:
        print("  UTF-8 failed, trying latin1...")
        return pd.read_csv(path, encoding="latin1")

def find_csv(folder):
    """Find the first CSV in a folder."""
    for f in os.listdir(folder):
        if f.lower().endswith(".csv"):
            return os.path.join(folder, f)
    raise FileNotFoundError(f"No CSV found in {folder}")

# ─────────────────────────────────────────────────────────────────────────────
# 1. WPI Dataset → wpi_summary.json
# ─────────────────────────────────────────────────────────────────────────────
def process_wpi():
    print("\n[1/2] Processing WPI Dataset...")
    path = kagglehub.dataset_download("kindasomethin/india-wholesale-price-index-wpi-data-2011-2017")
    df = load_csv(find_csv(path))

    print(f"  Columns: {list(df.columns[:8])}...")
    print(f"  Shape: {df.shape}")

    # The WPI dataset has commodity names in first column and monthly data in others
    # Identify the commodity/name column
    name_col = df.columns[0]
    weight_col = df.columns[1] if len(df.columns) > 1 else None

    # Get month columns (everything after name and weight)
    month_cols = [c for c in df.columns[2:] if str(c).strip()]

    # Build a simplified price series per commodity
    records = []
    for _, row in df.iterrows():
        commodity = str(row[name_col]).strip()
        if not commodity or commodity.startswith("(") or commodity == "nan":
            continue
        
        # Get monthly values
        values = []
        for col in month_cols[:24]:  # limit to ~24 months for chart display
            try:
                val = float(row[col])
                if not pd.isna(val):
                    values.append({"month": str(col).strip(), "index": round(val, 2)})
            except (ValueError, TypeError):
                pass
        
        if values:
            records.append({
                "commodity": commodity,
                "weight": float(row[weight_col]) if weight_col and not pd.isna(row[weight_col]) else None,
                "series": values
            })

    out_path = os.path.join(OUTPUT_DIR, "wpi_summary.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False)
    print(f"  OK: Exported {len(records)} commodities -> public/data/wpi_summary.json")
    return records

# ─────────────────────────────────────────────────────────────────────────────
# 2. Crop Production Dataset → crop_production.json
# ─────────────────────────────────────────────────────────────────────────────
def process_crop_production():
    print("\n[2/2] Processing Crop Production Dataset...")
    path = kagglehub.dataset_download("iamtapendu/crop-production-data-india")
    df = load_csv(find_csv(path))

    print(f"  Columns: {list(df.columns)}")
    print(f"  Shape: {df.shape}")

    # Normalize column names
    df.columns = [c.strip() for c in df.columns]

    # Drop rows with missing production
    df = df.dropna(subset=["Production"])
    df = df.dropna(subset=["State_Name", "Crop"])

    # Build top crops per state
    state_crop = (
        df.groupby(["State_Name", "Crop"])["Production"]
        .sum()
        .reset_index()
        .sort_values(["State_Name", "Production"], ascending=[True, False])
    )

    # Get top 5 crops per state
    top_crops_by_state = {}
    for state, group in state_crop.groupby("State_Name"):
        top = group.head(5)[["Crop", "Production"]].copy()
        top["Production"] = top["Production"].round(0).astype(int)
        top_crops_by_state[state] = top.to_dict(orient="records")

    # Build year-on-year production for top crops (all India)
    top_crops_overall = (
        df.groupby(["Crop", "Crop_Year"])["Production"]
        .sum()
        .reset_index()
    )
    top_crop_names = (
        df.groupby("Crop")["Production"]
        .sum()
        .nlargest(20)
        .index.tolist()
    )
    filtered = top_crops_overall[top_crops_overall["Crop"].isin(top_crop_names)]
    
    crop_trends = {}
    for crop, group in filtered.groupby("Crop"):
        g = group.sort_values("Crop_Year")
        crop_trends[crop] = [
            {"year": int(r["Crop_Year"]), "production": round(float(r["Production"]), 0)}
            for _, r in g.iterrows()
        ]

    output = {
        "top_crops_by_state": top_crops_by_state,
        "crop_trends": crop_trends,
        "top_crop_names": top_crop_names,
        "states": sorted(list(top_crops_by_state.keys()))
    }

    out_path = os.path.join(OUTPUT_DIR, "crop_production.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False)
    print(f"  OK: Exported {len(top_crops_by_state)} states, {len(crop_trends)} crops -> public/data/crop_production.json")
    return output


if __name__ == "__main__":
    print("KhetiWala Data Preprocessor")
    print("=" * 50)
    wpi = process_wpi()
    crops = process_crop_production()
    print("\nAll datasets exported to public/data/")
    print("   Re-run this script to refresh data at any time.")
