import pandas as pd

# Load the Excel file and select the 'artwork' sheet
file_path = "C:\Users\admin\Desktop\prototype\artist_list.xlsx"  # Replace with your actual file path
artwork_data = pd.read_excel(file_path, sheet_name='artwork')

# Split 'artwork_type' and 'artwork_artist' by ',' and expand each unique type and artist
expanded_data = artwork_data.dropna(subset=['artwork_artist', 'artwork_type']).copy()
expanded_data['artwork_artist'] = expanded_data['artwork_artist'].str.split(',')
expanded_data['artwork_type'] = expanded_data['artwork_type'].str.split(',')

# Explode to separate each artist and artwork type into individual rows
expanded_data = expanded_data.explode('artwork_artist').explode('artwork_type')
expanded_data['artwork_artist'] = expanded_data['artwork_artist'].str.strip()  # Remove extra whitespace
expanded_data['artwork_type'] = expanded_data['artwork_type'].str.strip()      # Remove extra whitespace

# Group by artwork type to count the unique number of artists who have created each type
artwork_type_artist_counts = expanded_data.groupby('artwork_type')['artwork_artist'].nunique().reset_index(name='Artist_Count')

# Sort the results by count in descending order
artwork_type_artist_counts_sorted = artwork_type_artist_counts.sort_values(by='Artist_Count', ascending=False)

# Save the result to a CSV file
output_csv_path = 'Artwork_Type_by_Unique_Artist_Count.csv'  # This file will be saved in the current directory
artwork_type_artist_counts_sorted.to_csv(output_csv_path, index=False)

print("CSV file saved as:", output_csv_path)
