import csv

def read_csv(path):
    with open(path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        headers = next(reader)
        rows = list(reader)
    return headers, rows

try:
    h1, r1 = read_csv("dataset/3_3_Balanced_School_Dropout_Prediction_Dataset_3.csv")
    h2, r2 = read_csv("dataset/Balanced_School_Dropout_Prediction_Dataset.csv")
    
    print(f"Dataset 3 shape: {len(r1)} rows, {len(h1)} cols")
    print(f"Balanced Dataset shape: {len(r2)} rows, {len(h2)} cols")
    
    if h1 != h2:
        print("Headers differ!")
        print("h1:", h1)
        print("h2:", h2)
    else:
        print("Headers are identical.")
        
    diffs = 0
    diff_cols = set()
    for idx, (row1, row2) in enumerate(zip(r1, r2)):
        if row1 != row2:
            diffs += 1
            if diffs <= 5:
                print(f"Diff at row {idx+1}:")
                for col_idx, (v1, v2) in enumerate(zip(row1, row2)):
                    if v1 != v2:
                        print(f"  Col {h1[col_idx]}: '{v1}' vs '{v2}'")
                        diff_cols.add(h1[col_idx])
            else:
                for col_idx, (v1, v2) in enumerate(zip(row1, row2)):
                    if v1 != v2:
                        diff_cols.add(h1[col_idx])
                        
    print(f"Total different rows: {diffs}")
    print(f"Columns with differences: {list(diff_cols)}")
except Exception as e:
    print("Error:", e)
